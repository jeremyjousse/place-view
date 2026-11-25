//! Tauri application composition root.

pub mod application;
pub mod domain;
pub mod infrastructure;

#[cfg(target_os = "ios")]
mod ios;

/// Builds and runs the Tauri application.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        });

    #[cfg(desktop)]
    let builder = builder
        .manage(application::PlaceAdminService::new(
            infrastructure::JsonPlaceRepository,
        ))
        .manage(infrastructure::HttpClientState::new().expect("failed to build HTTP client"))
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            infrastructure::tauri_commands::load_local_places,
            infrastructure::tauri_commands::create_local_place,
            infrastructure::tauri_commands::update_local_place,
            infrastructure::tauri_commands::delete_local_place,
            infrastructure::tauri_commands::add_local_place_webcam,
            infrastructure::tauri_commands::update_local_place_webcam,
            infrastructure::tauri_commands::remove_local_place_webcam,
            infrastructure::tauri_commands::reorder_local_place_webcam,
            infrastructure::tauri_commands::fetch_external_text,
        ]);

    #[cfg(target_os = "ios")]
    let builder = builder.invoke_handler(tauri::generate_handler![ios::set_webcam_fullscreen]);

    builder
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
