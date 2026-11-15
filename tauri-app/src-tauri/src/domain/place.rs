//! Pure place entities, validation rules, slugification, sorting, and list mutations.

use icu_normalizer::DecomposingNormalizerBorrowed;
use serde::{Deserialize, Serialize};
use url::Url;

use crate::domain::error::DomainError;

/// Geographic coordinates for a place.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Coordinates {
    /// Latitude in decimal degrees `[-90, 90]`.
    pub latitude: f64,
    /// Longitude in decimal degrees `[-180, 180]`.
    pub longitude: f64,
}

/// Webcam metadata attached to a place.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Webcam {
    /// Display name of the webcam.
    pub name: String,
    /// Full-resolution image URL.
    pub large_image: String,
    /// Thumbnail image URL.
    pub thumbnail_image: String,
    /// Optional active status flag.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub is_active: Option<bool>,
}

/// A curated ski/mountain place with coordinates and webcams.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Place {
    /// Unique URL-safe identifier (slug).
    pub id: String,
    /// Human-readable place name.
    pub name: String,
    /// Country name.
    pub country: String,
    /// State, department, or region name.
    pub state: String,
    /// Official website URL (may be empty if unknown).
    pub url: String,
    /// Optional descriptive text.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    /// Geographic coordinates.
    pub coordinates: Coordinates,
    /// Ordered list of webcams for this place.
    #[serde(default)]
    pub webcams: Vec<Webcam>,
}

/// Input payload for creating a new place.
#[derive(Debug, Clone, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePlaceInput {
    /// Optional explicit ID; derived from `name` via [`slugify`] when omitted or blank.
    #[serde(default)]
    pub id: Option<String>,
    /// Human-readable place name.
    pub name: String,
    /// Country name.
    pub country: String,
    /// State, department, or region name.
    pub state: String,
    /// Official website URL.
    pub url: String,
    /// Optional descriptive text.
    #[serde(default)]
    pub description: Option<String>,
    /// Geographic coordinates.
    pub coordinates: Coordinates,
    /// Optional initial webcams.
    #[serde(default)]
    pub webcams: Vec<Webcam>,
}

/// Input payload for updating a place's editable metadata.
#[derive(Debug, Clone, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlaceDetailsUpdate {
    /// Human-readable place name.
    pub name: String,
    /// Country name.
    pub country: String,
    /// State, department, or region name.
    pub state: String,
    /// Official website URL.
    pub url: String,
    /// Optional descriptive text.
    #[serde(default)]
    pub description: Option<String>,
    /// Geographic coordinates.
    pub coordinates: Coordinates,
}

/// Converts arbitrary text into a lowercase ASCII URL slug.
///
/// Matches `packages/core/src/utils/url-state.ts` (`toLowerCase -> NFD -> strip U+0300..=U+036F -> ASCII slug`).
pub fn slugify(text: &str) -> String {
    let lowered = text.to_lowercase();
    let nfd = DecomposingNormalizerBorrowed::new_nfd();
    let mut slug = String::with_capacity(lowered.len());
    let mut pending_dash = false;

    for ch in nfd.normalize_iter(lowered.chars()) {
        if ('\u{0300}'..='\u{036f}').contains(&ch) {
            continue;
        }
        if ch.is_ascii_alphanumeric() {
            if pending_dash && !slug.is_empty() {
                slug.push('-');
            }
            slug.push(ch);
            pending_dash = false;
        } else if !slug.is_empty() {
            pending_dash = true;
        }
    }

    slug
}

/// Returns `true` when `value` trims to a syntactically valid `http://` or `https://` URL.
pub fn is_valid_http_url(value: &str) -> bool {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return false;
    }
    match Url::parse(trimmed) {
        Ok(parsed) => matches!(parsed.scheme(), "http" | "https") && parsed.host_str().is_some(),
        Err(_) => false,
    }
}

/// Validates and normalizes a [`Webcam`].
///
/// # Errors
///
/// Returns [`DomainError::Validation`] if `name` is blank or either image URL is not HTTP(S).
pub fn validate_webcam(webcam: &Webcam) -> Result<Webcam, DomainError> {
    let name = webcam.name.trim();
    let large_image = webcam.large_image.trim();
    let thumbnail_image = webcam.thumbnail_image.trim();

    if name.is_empty() {
        return Err(DomainError::Validation(
            "Webcam name is required.".to_string(),
        ));
    }
    if !is_valid_http_url(large_image) {
        return Err(DomainError::Validation(
            "Large image must be a valid HTTP(S) URL.".to_string(),
        ));
    }
    if !is_valid_http_url(thumbnail_image) {
        return Err(DomainError::Validation(
            "Thumbnail image must be a valid HTTP(S) URL.".to_string(),
        ));
    }

    Ok(Webcam {
        name: name.to_string(),
        large_image: large_image.to_string(),
        thumbnail_image: thumbnail_image.to_string(),
        is_active: webcam.is_active,
    })
}

/// Validates and normalizes a [`Place`], including all attached webcams.
///
/// # Errors
///
/// Returns [`DomainError::Validation`] when required fields, URL syntax, coordinates,
/// or any attached webcam fail validation.
pub fn validate_place(place: &Place) -> Result<Place, DomainError> {
    let id = place.id.trim();
    let name = place.name.trim();
    let country = place.country.trim();
    let state = place.state.trim();
    let url = place.url.trim();
    let description = place
        .description
        .as_deref()
        .map(str::trim)
        .filter(|d| !d.is_empty())
        .map(str::to_string);

    if id.is_empty() {
        return Err(DomainError::Validation("Place ID is required.".to_string()));
    }
    if name.is_empty() {
        return Err(DomainError::Validation(
            "Place name is required.".to_string(),
        ));
    }
    if country.is_empty() {
        return Err(DomainError::Validation("Country is required.".to_string()));
    }
    if state.is_empty() {
        return Err(DomainError::Validation(
            "State / region is required.".to_string(),
        ));
    }
    if !url.is_empty() && !is_valid_http_url(url) {
        return Err(DomainError::Validation(
            "Official URL must be a valid HTTP(S) URL.".to_string(),
        ));
    }

    let latitude = place.coordinates.latitude;
    let longitude = place.coordinates.longitude;
    if !latitude.is_finite() || !(-90.0..=90.0).contains(&latitude) {
        return Err(DomainError::Validation(
            "Latitude must be between -90 and 90.".to_string(),
        ));
    }
    if !longitude.is_finite() || !(-180.0..=180.0).contains(&longitude) {
        return Err(DomainError::Validation(
            "Longitude must be between -180 and 180.".to_string(),
        ));
    }

    let webcams = place
        .webcams
        .iter()
        .map(validate_webcam)
        .collect::<Result<Vec<_>, _>>()?;

    Ok(Place {
        id: id.to_string(),
        name: name.to_string(),
        country: country.to_string(),
        state: state.to_string(),
        url: url.to_string(),
        description,
        coordinates: Coordinates {
            latitude,
            longitude,
        },
        webcams,
    })
}

/// Sorts `places` in ascending alphabetical order by `id` (case-insensitive, exact tie-break).
pub fn sort_places_by_id(places: &mut [Place]) {
    places.sort_by(|a, b| {
        a.id.to_lowercase()
            .cmp(&b.id.to_lowercase())
            .then_with(|| a.id.cmp(&b.id))
    });
}

/// Validates and appends a new place to `places`, returning the updated list and created [`Place`].
///
/// # Errors
///
/// Returns [`DomainError::Validation`] if the derived ID or place fields are invalid, or
/// [`DomainError::Conflict`] if a place with the same ID already exists.
pub fn create_place_in_list(
    mut places: Vec<Place>,
    input: CreatePlaceInput,
) -> Result<(Vec<Place>, Place), DomainError> {
    let explicit_id = input.id.as_deref().map(str::trim).filter(|s| !s.is_empty());
    let id = match explicit_id {
        Some(explicit) => explicit.to_string(),
        None => slugify(&input.name),
    };
    if id.is_empty() {
        return Err(DomainError::Validation(
            "Place name must produce a valid ID.".to_string(),
        ));
    }
    if places.iter().any(|p| p.id == id) {
        return Err(DomainError::Conflict(format!(
            "A place with ID \"{id}\" already exists."
        )));
    }

    let candidate = Place {
        id,
        name: input.name,
        country: input.country,
        state: input.state,
        url: input.url,
        description: input.description,
        coordinates: input.coordinates,
        webcams: input.webcams,
    };

    let created = validate_place(&candidate)?;
    places.push(created.clone());
    Ok((places, created))
}

/// Updates an existing place's details while preserving its ID and webcams.
///
/// # Errors
///
/// Returns [`DomainError::NotFound`] if `id` does not exist or [`DomainError::Validation`]
/// if the updated fields are invalid.
pub fn update_place_in_list(
    mut places: Vec<Place>,
    id: &str,
    details: PlaceDetailsUpdate,
) -> Result<(Vec<Place>, Place), DomainError> {
    let Some(slot) = places.iter_mut().find(|p| p.id == id) else {
        return Err(DomainError::NotFound(format!("Place \"{id}\" not found.")));
    };

    let candidate = Place {
        id: slot.id.clone(),
        name: details.name,
        country: details.country,
        state: details.state,
        url: details.url,
        description: details.description,
        coordinates: details.coordinates,
        webcams: slot.webcams.clone(),
    };

    let updated = validate_place(&candidate)?;
    *slot = updated.clone();
    Ok((places, updated))
}

/// Removes the place matching `id` from `places`.
///
/// # Errors
///
/// Returns [`DomainError::NotFound`] if no place has `id`.
pub fn delete_place_in_list(mut places: Vec<Place>, id: &str) -> Result<Vec<Place>, DomainError> {
    let before_len = places.len();
    places.retain(|p| p.id != id);
    if places.len() == before_len {
        return Err(DomainError::NotFound(format!("Place \"{id}\" not found.")));
    }
    Ok(places)
}

fn mutate_place_webcams<F>(
    mut places: Vec<Place>,
    place_id: &str,
    mutator: F,
) -> Result<(Vec<Place>, Place), DomainError>
where
    F: FnOnce(&mut Vec<Webcam>) -> Result<(), DomainError>,
{
    let Some(slot) = places.iter_mut().find(|p| p.id == place_id) else {
        return Err(DomainError::NotFound(format!(
            "Place \"{place_id}\" not found."
        )));
    };

    mutator(&mut slot.webcams)?;
    let updated = slot.clone();
    Ok((places, updated))
}

/// Validates and appends `webcam` to the place identified by `place_id`.
///
/// # Errors
///
/// Returns [`DomainError::Validation`] if `webcam` is invalid or [`DomainError::NotFound`]
/// if `place_id` does not exist.
pub fn add_place_webcam(
    places: Vec<Place>,
    place_id: &str,
    webcam: Webcam,
) -> Result<(Vec<Place>, Place), DomainError> {
    let validated = validate_webcam(&webcam)?;
    mutate_place_webcams(places, place_id, |webcams| {
        webcams.push(validated);
        Ok(())
    })
}

/// Validates and replaces the webcam at `index` on `place_id`.
///
/// # Errors
///
/// Returns [`DomainError::Validation`] if `webcam` is invalid, [`DomainError::NotFound`] if
/// `place_id` does not exist, or [`DomainError::InvalidIndex`] if `index` is out of bounds.
pub fn update_place_webcam(
    places: Vec<Place>,
    place_id: &str,
    index: usize,
    webcam: Webcam,
) -> Result<(Vec<Place>, Place), DomainError> {
    let validated = validate_webcam(&webcam)?;
    mutate_place_webcams(places, place_id, |webcams| {
        let Some(target) = webcams.get_mut(index) else {
            return Err(DomainError::InvalidIndex(
                "Invalid webcam index.".to_string(),
            ));
        };
        *target = validated;
        Ok(())
    })
}

/// Removes the webcam at `index` from `place_id`.
///
/// # Errors
///
/// Returns [`DomainError::NotFound`] if `place_id` does not exist or
/// [`DomainError::InvalidIndex`] if `index` is out of bounds.
pub fn remove_place_webcam(
    places: Vec<Place>,
    place_id: &str,
    index: usize,
) -> Result<(Vec<Place>, Place), DomainError> {
    mutate_place_webcams(places, place_id, |webcams| {
        if index >= webcams.len() {
            return Err(DomainError::InvalidIndex(
                "Invalid webcam index.".to_string(),
            ));
        }
        webcams.remove(index);
        Ok(())
    })
}

/// Moves a webcam from `from_index` to `to_index` on `place_id`.
///
/// # Errors
///
/// Returns [`DomainError::NotFound`] if `place_id` does not exist or
/// [`DomainError::InvalidIndex`] if either index is out of bounds.
pub fn reorder_place_webcam(
    places: Vec<Place>,
    place_id: &str,
    from_index: usize,
    to_index: usize,
) -> Result<(Vec<Place>, Place), DomainError> {
    mutate_place_webcams(places, place_id, |webcams| {
        if from_index >= webcams.len() || to_index >= webcams.len() {
            return Err(DomainError::InvalidIndex(
                "Invalid webcam reorder index.".to_string(),
            ));
        }
        if from_index != to_index {
            let moved = webcams.remove(from_index);
            webcams.insert(to_index, moved);
        }
        Ok(())
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_place(id: &str, name: &str) -> Place {
        Place {
            id: id.to_string(),
            name: name.to_string(),
            country: "France".to_string(),
            state: "Savoie".to_string(),
            url: "https://example.com".to_string(),
            description: None,
            coordinates: Coordinates {
                latitude: 45.21,
                longitude: 6.34,
            },
            webcams: vec![],
        }
    }

    #[test]
    fn slugifies_names_with_accents_and_punctuation() {
        assert_eq!(slugify("Chamonix Mont-Blanc"), "chamonix-mont-blanc");
        assert_eq!(slugify("Samoëns"), "samoens");
        assert_eq!(slugify("Aillons-Margériaz"), "aillons-margeriaz");
        assert_eq!(slugify("L'Alpe d'Huez"), "l-alpe-d-huez");
        assert_eq!(slugify("e\u{0301}cole"), "ecole");
        assert_eq!(slugify("Špindlerův Mlýn"), "spindleruv-mlyn");
        assert_eq!(slugify("Sølden"), "s-lden");
        assert_eq!(slugify("  ---  "), "");
    }

    #[test]
    fn validates_http_urls_strictly() {
        assert!(is_valid_http_url("https://example.com/cam.jpg"));
        assert!(is_valid_http_url("http://example.com"));
        assert!(!is_valid_http_url("ftp://example.com/file"));
        assert!(!is_valid_http_url("javascript:alert(1)"));
        assert!(!is_valid_http_url("   "));
    }

    #[test]
    fn validates_place_bounds_and_optional_fields() {
        let valid = Place {
            id: " samoens ".to_string(),
            name: " Samoëns ".to_string(),
            country: " France ".to_string(),
            state: " Haute-Savoie ".to_string(),
            url: "  ".to_string(),
            description: Some("   ".to_string()),
            coordinates: Coordinates {
                latitude: 46.08,
                longitude: 6.72,
            },
            webcams: vec![],
        };
        let normalized = validate_place(&valid).expect("valid place should pass");
        assert_eq!(normalized.id, "samoens");
        assert_eq!(normalized.url, "");
        assert_eq!(normalized.description, None);

        let bad = Place {
            url: "ftp://invalid".to_string(),
            coordinates: Coordinates {
                latitude: 120.0,
                longitude: -200.0,
            },
            ..sample_place("bad", "Bad")
        };
        assert!(matches!(
            validate_place(&bad),
            Err(DomainError::Validation(_))
        ));
    }

    #[test]
    fn sorts_places_case_insensitively_by_id() {
        let mut places = vec![
            sample_place("val-thorens", "Val Thorens"),
            sample_place("Orelle", "Orelle"),
            sample_place("abondance", "Abondance"),
            sample_place("oz-en-oisans", "Oz"),
            sample_place("orcieres", "Orcières"),
        ];
        sort_places_by_id(&mut places);
        let ids: Vec<&str> = places.iter().map(|p| p.id.as_str()).collect();
        assert_eq!(
            ids,
            vec![
                "abondance",
                "orcieres",
                "Orelle",
                "oz-en-oisans",
                "val-thorens"
            ]
        );
    }

    #[test]
    fn crud_and_webcam_mutations_work_purely() {
        let initial = vec![sample_place("albiez", "Albiez")];

        let (after_create, created) = create_place_in_list(
            initial,
            CreatePlaceInput {
                id: None,
                name: "Chamonix Mont-Blanc".to_string(),
                country: "France".to_string(),
                state: "Haute-Savoie".to_string(),
                url: "https://www.chamonix.com".to_string(),
                description: None,
                coordinates: Coordinates {
                    latitude: 45.9237,
                    longitude: 6.8694,
                },
                webcams: vec![],
            },
        )
        .expect("create should succeed");
        assert_eq!(created.id, "chamonix-mont-blanc");
        assert_eq!(after_create.len(), 2);

        let dup = create_place_in_list(
            after_create.clone(),
            CreatePlaceInput {
                id: None,
                name: "Chamonix Mont-Blanc".to_string(),
                country: "France".to_string(),
                state: "Haute-Savoie".to_string(),
                url: String::new(),
                description: None,
                coordinates: Coordinates {
                    latitude: 45.92,
                    longitude: 6.86,
                },
                webcams: vec![],
            },
        );
        assert!(matches!(dup, Err(DomainError::Conflict(_))));

        let (after_cam1, _) = add_place_webcam(
            after_create,
            &created.id,
            Webcam {
                name: "Cam A".to_string(),
                large_image: "https://example.com/a-large.jpg".to_string(),
                thumbnail_image: "https://example.com/a-small.jpg".to_string(),
                is_active: None,
            },
        )
        .expect("add cam 1 should succeed");
        let (after_cam2, _) = add_place_webcam(
            after_cam1,
            &created.id,
            Webcam {
                name: "Cam B".to_string(),
                large_image: "https://example.com/b-large.jpg".to_string(),
                thumbnail_image: "https://example.com/b-small.jpg".to_string(),
                is_active: Some(true),
            },
        )
        .expect("add cam 2 should succeed");

        let (after_reorder, reordered) =
            reorder_place_webcam(after_cam2, &created.id, 0, 1).expect("reorder should succeed");
        assert_eq!(
            reordered
                .webcams
                .iter()
                .map(|w| w.name.as_str())
                .collect::<Vec<_>>(),
            vec!["Cam B", "Cam A"]
        );

        let (after_update_cam, updated_cam) = update_place_webcam(
            after_reorder,
            &created.id,
            0,
            Webcam {
                name: "Cam B Updated".to_string(),
                large_image: "https://example.com/b-large.jpg".to_string(),
                thumbnail_image: "https://example.com/b-small.jpg".to_string(),
                is_active: Some(false),
            },
        )
        .expect("update cam should succeed");
        assert_eq!(updated_cam.webcams[0].name, "Cam B Updated");

        let (after_remove, after_rem_place) = remove_place_webcam(after_update_cam, &created.id, 1)
            .expect("remove cam should succeed");
        assert_eq!(after_rem_place.webcams.len(), 1);

        let (after_update, updated_place) = update_place_in_list(
            after_remove,
            &created.id,
            PlaceDetailsUpdate {
                name: "Chamonix".to_string(),
                country: "France".to_string(),
                state: "Haute-Savoie".to_string(),
                url: "https://www.chamonix.com".to_string(),
                description: Some("Valley".to_string()),
                coordinates: Coordinates {
                    latitude: 45.92,
                    longitude: 6.87,
                },
            },
        )
        .expect("update place should succeed");
        assert_eq!(updated_place.name, "Chamonix");
        assert_eq!(updated_place.webcams.len(), 1);

        let after_delete =
            delete_place_in_list(after_update, "albiez").expect("delete should succeed");
        assert_eq!(after_delete.len(), 1);
    }
}
