//! Driven ports defining how the domain/application layers interact with storage.

use std::path::Path;

use crate::domain::error::DomainError;
use crate::domain::place::Place;

/// Driven port for loading and persisting place collections.
pub trait PlaceRepository {
    /// Loads all places from the backing store at `path`.
    ///
    /// # Errors
    ///
    /// Returns [`DomainError::Storage`] when reading or decoding fails.
    fn load(&self, path: &Path) -> Result<Vec<Place>, DomainError>;

    /// Persists `places` to the backing store at `path`.
    ///
    /// # Errors
    ///
    /// Returns [`DomainError::Storage`] when serialization or writing fails.
    fn save(&self, path: &Path, places: &[Place]) -> Result<(), DomainError>;
}
