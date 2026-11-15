//! Thin Tauri IPC command adapters delegating to application services.

use std::path::Path;

use crate::application::{PlaceAdminService, PlaceMutationResult};
use crate::domain::{CreatePlaceInput, Place, PlaceDetailsUpdate, Webcam};
use crate::infrastructure::{HttpClientState, JsonPlaceRepository, reqwest_text_fetcher};

/// Loads and normalizes places from the local JSON file at `path`.
#[tauri::command]
pub fn load_local_places(
    service: tauri::State<'_, PlaceAdminService<JsonPlaceRepository>>,
    path: String,
) -> Result<Vec<Place>, String> {
    service
        .load_places(Path::new(path.trim()))
        .map_err(|err| err.to_string())
}

/// Creates a new place, sorts all places by ID, and persists `path`.
#[tauri::command]
pub fn create_local_place(
    service: tauri::State<'_, PlaceAdminService<JsonPlaceRepository>>,
    path: String,
    input: CreatePlaceInput,
) -> Result<PlaceMutationResult, String> {
    service
        .create_place(Path::new(path.trim()), input)
        .map_err(|err| err.to_string())
}

/// Updates an existing place's details, sorts by ID, and persists `path`.
#[tauri::command]
pub fn update_local_place(
    service: tauri::State<'_, PlaceAdminService<JsonPlaceRepository>>,
    path: String,
    id: String,
    details: PlaceDetailsUpdate,
) -> Result<PlaceMutationResult, String> {
    service
        .update_place(Path::new(path.trim()), &id, details)
        .map_err(|err| err.to_string())
}

/// Deletes a place by ID, sorts remaining places by ID, and persists `path`.
#[tauri::command]
pub fn delete_local_place(
    service: tauri::State<'_, PlaceAdminService<JsonPlaceRepository>>,
    path: String,
    id: String,
) -> Result<Vec<Place>, String> {
    service
        .delete_place(Path::new(path.trim()), &id)
        .map_err(|err| err.to_string())
}

/// Adds a webcam to `place_id`, sorts places by ID, and persists `path`.
#[tauri::command]
pub fn add_local_place_webcam(
    service: tauri::State<'_, PlaceAdminService<JsonPlaceRepository>>,
    path: String,
    place_id: String,
    webcam: Webcam,
) -> Result<PlaceMutationResult, String> {
    service
        .add_webcam(Path::new(path.trim()), &place_id, webcam)
        .map_err(|err| err.to_string())
}

/// Updates the webcam at `index` for `place_id`, sorts places by ID, and persists `path`.
#[tauri::command]
pub fn update_local_place_webcam(
    service: tauri::State<'_, PlaceAdminService<JsonPlaceRepository>>,
    path: String,
    place_id: String,
    index: usize,
    webcam: Webcam,
) -> Result<PlaceMutationResult, String> {
    service
        .update_webcam(Path::new(path.trim()), &place_id, index, webcam)
        .map_err(|err| err.to_string())
}

/// Removes the webcam at `index` from `place_id`, sorts places by ID, and persists `path`.
#[tauri::command]
pub fn remove_local_place_webcam(
    service: tauri::State<'_, PlaceAdminService<JsonPlaceRepository>>,
    path: String,
    place_id: String,
    index: usize,
) -> Result<PlaceMutationResult, String> {
    service
        .remove_webcam(Path::new(path.trim()), &place_id, index)
        .map_err(|err| err.to_string())
}

/// Reorders a webcam on `place_id`, sorts places by ID, and persists `path`.
#[tauri::command]
pub fn reorder_local_place_webcam(
    service: tauri::State<'_, PlaceAdminService<JsonPlaceRepository>>,
    path: String,
    place_id: String,
    from_index: usize,
    to_index: usize,
) -> Result<PlaceMutationResult, String> {
    service
        .reorder_webcam(Path::new(path.trim()), &place_id, from_index, to_index)
        .map_err(|err| err.to_string())
}

/// Fetches external text using the SSRF-guarded desktop HTTP adapter.
#[tauri::command]
pub async fn fetch_external_text(
    state: tauri::State<'_, HttpClientState>,
    url: String,
) -> Result<String, String> {
    reqwest_text_fetcher::fetch_external_text(&state, &url).await
}
