//! Application service coordinating `places.json` operations via [`PlaceRepository`].

use std::path::Path;

use serde::Serialize;

use crate::domain::{
    CreatePlaceInput, DomainError, Place, PlaceDetailsUpdate, PlaceRepository, Webcam,
    add_place_webcam, create_place_in_list, delete_place_in_list, remove_place_webcam,
    reorder_place_webcam, sort_places_by_id, update_place_in_list, update_place_webcam,
};

/// Result returned after mutating a place or its webcams.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlaceMutationResult {
    /// Full list of places sorted by `id` as persisted on disk.
    pub places: Vec<Place>,
    /// The newly created or updated place.
    pub place: Place,
}

/// Application service orchestrating place administration use cases.
#[derive(Debug, Clone)]
pub struct PlaceAdminService<R> {
    repository: R,
}

impl<R: PlaceRepository> PlaceAdminService<R> {
    /// Creates a new [`PlaceAdminService`] backed by `repository`.
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    /// Loads places from `path` without altering disk state.
    ///
    /// # Errors
    ///
    /// Returns [`DomainError`] if the underlying repository fails to read or parse `path`.
    pub fn load_places(&self, path: &Path) -> Result<Vec<Place>, DomainError> {
        self.repository.load(path)
    }

    fn mutate_and_save<F>(&self, path: &Path, mutate: F) -> Result<PlaceMutationResult, DomainError>
    where
        F: FnOnce(Vec<Place>) -> Result<(Vec<Place>, Place), DomainError>,
    {
        let places = self.repository.load(path)?;
        let (mut next_places, place) = mutate(places)?;
        sort_places_by_id(&mut next_places);
        self.repository.save(path, &next_places)?;
        Ok(PlaceMutationResult {
            places: next_places,
            place,
        })
    }

    /// Creates a new place, sorts all places by `id`, and persists the updated list.
    ///
    /// # Errors
    ///
    /// Returns [`DomainError`] if loading, validation, duplicate-ID check, or saving fails.
    pub fn create_place(
        &self,
        path: &Path,
        input: CreatePlaceInput,
    ) -> Result<PlaceMutationResult, DomainError> {
        self.mutate_and_save(path, |places| create_place_in_list(places, input))
    }

    /// Updates an existing place's details, sorts by `id`, and persists the updated list.
    ///
    /// # Errors
    ///
    /// Returns [`DomainError`] if loading, lookup, validation, or saving fails.
    pub fn update_place(
        &self,
        path: &Path,
        id: &str,
        details: PlaceDetailsUpdate,
    ) -> Result<PlaceMutationResult, DomainError> {
        self.mutate_and_save(path, |places| update_place_in_list(places, id, details))
    }

    /// Deletes the place matching `id`, sorts remaining places by `id`, and persists the list.
    ///
    /// # Errors
    ///
    /// Returns [`DomainError`] if loading, lookup, or saving fails.
    pub fn delete_place(&self, path: &Path, id: &str) -> Result<Vec<Place>, DomainError> {
        let places = self.repository.load(path)?;
        let mut next_places = delete_place_in_list(places, id)?;
        sort_places_by_id(&mut next_places);
        self.repository.save(path, &next_places)?;
        Ok(next_places)
    }

    /// Appends a validated webcam to `place_id`, sorts places by `id`, and persists.
    ///
    /// # Errors
    ///
    /// Returns [`DomainError`] if loading, validation, lookup, or saving fails.
    pub fn add_webcam(
        &self,
        path: &Path,
        place_id: &str,
        webcam: Webcam,
    ) -> Result<PlaceMutationResult, DomainError> {
        self.mutate_and_save(path, |places| add_place_webcam(places, place_id, webcam))
    }

    /// Replaces the webcam at `index` for `place_id`, sorts places by `id`, and persists.
    ///
    /// # Errors
    ///
    /// Returns [`DomainError`] if loading, validation, lookup, indexing, or saving fails.
    pub fn update_webcam(
        &self,
        path: &Path,
        place_id: &str,
        index: usize,
        webcam: Webcam,
    ) -> Result<PlaceMutationResult, DomainError> {
        self.mutate_and_save(path, |places| {
            update_place_webcam(places, place_id, index, webcam)
        })
    }

    /// Removes the webcam at `index` from `place_id`, sorts places by `id`, and persists.
    ///
    /// # Errors
    ///
    /// Returns [`DomainError`] if loading, lookup, indexing, or saving fails.
    pub fn remove_webcam(
        &self,
        path: &Path,
        place_id: &str,
        index: usize,
    ) -> Result<PlaceMutationResult, DomainError> {
        self.mutate_and_save(path, |places| remove_place_webcam(places, place_id, index))
    }

    /// Reorders a webcam on `place_id`, sorts places by `id`, and persists.
    ///
    /// # Errors
    ///
    /// Returns [`DomainError`] if loading, lookup, indexing, or saving fails.
    pub fn reorder_webcam(
        &self,
        path: &Path,
        place_id: &str,
        from_index: usize,
        to_index: usize,
    ) -> Result<PlaceMutationResult, DomainError> {
        self.mutate_and_save(path, |places| {
            reorder_place_webcam(places, place_id, from_index, to_index)
        })
    }
}

#[cfg(test)]
mod tests {
    use std::cell::RefCell;

    use super::*;
    use crate::domain::Coordinates;

    struct InMemoryPlaceRepository {
        stored: RefCell<Vec<Place>>,
        save_calls: RefCell<usize>,
    }

    impl InMemoryPlaceRepository {
        fn new(initial: Vec<Place>) -> Self {
            Self {
                stored: RefCell::new(initial),
                save_calls: RefCell::new(0),
            }
        }

        fn saved_ids(&self) -> Vec<String> {
            self.stored.borrow().iter().map(|p| p.id.clone()).collect()
        }

        fn save_count(&self) -> usize {
            *self.save_calls.borrow()
        }
    }

    impl PlaceRepository for InMemoryPlaceRepository {
        fn load(&self, _path: &Path) -> Result<Vec<Place>, DomainError> {
            Ok(self.stored.borrow().clone())
        }

        fn save(&self, _path: &Path, places: &[Place]) -> Result<(), DomainError> {
            *self.save_calls.borrow_mut() += 1;
            *self.stored.borrow_mut() = places.to_vec();
            Ok(())
        }
    }

    fn sample_place(id: &str, name: &str) -> Place {
        Place {
            id: id.to_string(),
            name: name.to_string(),
            country: "France".to_string(),
            state: "Savoie".to_string(),
            url: "https://example.com".to_string(),
            description: None,
            coordinates: Coordinates {
                latitude: 45.5,
                longitude: 6.5,
            },
            webcams: vec![],
        }
    }

    #[test]
    fn create_update_and_delete_always_sort_persisted_places_by_id() {
        let repo = InMemoryPlaceRepository::new(vec![
            sample_place("val-thorens", "Val Thorens"),
            sample_place("abondance", "Abondance"),
        ]);
        let service = PlaceAdminService::new(repo);
        let path = Path::new("/tmp/places.json");

        let created = service
            .create_place(
                path,
                CreatePlaceInput {
                    id: None,
                    name: "Chamonix".to_string(),
                    country: "France".to_string(),
                    state: "Haute-Savoie".to_string(),
                    url: "https://www.chamonix.com".to_string(),
                    description: None,
                    coordinates: Coordinates {
                        latitude: 45.92,
                        longitude: 6.87,
                    },
                    webcams: vec![],
                },
            )
            .expect("create should succeed");

        assert_eq!(
            created
                .places
                .iter()
                .map(|p| p.id.as_str())
                .collect::<Vec<_>>(),
            vec!["abondance", "chamonix", "val-thorens"]
        );
        assert_eq!(
            service.repository.saved_ids(),
            vec!["abondance", "chamonix", "val-thorens"]
        );

        let updated = service
            .update_place(
                path,
                "chamonix",
                PlaceDetailsUpdate {
                    name: "Chamonix Mont-Blanc".to_string(),
                    country: "France".to_string(),
                    state: "Haute-Savoie".to_string(),
                    url: "https://www.chamonix.com".to_string(),
                    description: None,
                    coordinates: Coordinates {
                        latitude: 45.92,
                        longitude: 6.87,
                    },
                },
            )
            .expect("update should succeed");
        assert_eq!(updated.place.name, "Chamonix Mont-Blanc");

        let remaining = service
            .delete_place(path, "abondance")
            .expect("delete should succeed");
        assert_eq!(
            remaining.iter().map(|p| p.id.as_str()).collect::<Vec<_>>(),
            vec!["chamonix", "val-thorens"]
        );
    }

    #[test]
    fn validation_error_does_not_persist_changes() {
        let repo = InMemoryPlaceRepository::new(vec![sample_place("albiez", "Albiez")]);
        let service = PlaceAdminService::new(repo);
        let path = Path::new("/tmp/places.json");

        let res = service.add_webcam(
            path,
            "albiez",
            Webcam {
                name: "Bad".to_string(),
                large_image: "ftp://bad.example.com/a.jpg".to_string(),
                thumbnail_image: "https://example.com/t.jpg".to_string(),
                is_active: None,
            },
        );
        assert!(matches!(res, Err(DomainError::Validation(_))));
        assert_eq!(service.repository.save_count(), 0);
    }
}
