//! Infrastructure adapters for JSON filesystem persistence, HTTP fetching, and Tauri IPC.

pub mod json_place_repository;
#[cfg(desktop)]
pub mod reqwest_text_fetcher;
#[cfg(desktop)]
pub mod tauri_commands;

pub use json_place_repository::JsonPlaceRepository;
#[cfg(desktop)]
pub use reqwest_text_fetcher::HttpClientState;
