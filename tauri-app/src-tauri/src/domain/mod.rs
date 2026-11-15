//! Pure domain models, validation, sorting, and driven ports for places management.

pub mod error;
pub mod place;
pub mod ports;

pub use error::DomainError;
pub use place::{
    Coordinates, CreatePlaceInput, Place, PlaceDetailsUpdate, Webcam, add_place_webcam,
    create_place_in_list, delete_place_in_list, is_valid_http_url, remove_place_webcam,
    reorder_place_webcam, slugify, sort_places_by_id, update_place_in_list, update_place_webcam,
    validate_place, validate_webcam,
};
pub use ports::PlaceRepository;
