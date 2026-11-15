//! Filesystem-backed [`PlaceRepository`] persisting places as pretty-printed JSON.

use std::io::Write;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde_json::Value;

use crate::domain::{Coordinates, DomainError, Place, PlaceRepository, Webcam};

/// Filesystem repository reading and atomically writing `places.json`.
#[derive(Debug, Default, Clone, Copy)]
pub struct JsonPlaceRepository;

/// Validates that `path` is non-empty and targets a `.json` file.
///
/// # Errors
///
/// Returns [`DomainError::Validation`] if `path` is empty or lacks a `.json` extension.
pub fn validate_json_path(path: &Path) -> Result<&Path, DomainError> {
    let raw = path.to_string_lossy();
    if raw.trim().is_empty() {
        return Err(DomainError::Validation(
            "File path cannot be empty.".to_string(),
        ));
    }

    match path.extension().and_then(|ext| ext.to_str()) {
        Some(ext) if ext.eq_ignore_ascii_case("json") => Ok(path),
        _ => Err(DomainError::Validation(
            "Selected file must have a .json extension.".to_string(),
        )),
    }
}

/// Parses and structurally normalizes a raw `places.json` payload.
///
/// # Errors
///
/// Returns [`DomainError::Storage`] for malformed JSON or [`DomainError::Validation`]
/// when the root is not an array or an entry lacks required `id`, `name`, or valid coordinates.
pub fn parse_places_json(raw: &str) -> Result<Vec<Place>, DomainError> {
    let parsed: Value = serde_json::from_str(raw)
        .map_err(|err| DomainError::Storage(format!("Invalid JSON content: {err}")))?;
    let Some(items) = parsed.as_array() else {
        return Err(DomainError::Validation(
            "Selected JSON file must contain a top-level array of places.".to_string(),
        ));
    };

    let mut places = Vec::with_capacity(items.len());
    for (index, item) in items.iter().enumerate() {
        let Some(record) = item.as_object() else {
            return Err(DomainError::Validation(format!(
                "Invalid place entry at index {index}."
            )));
        };

        let id = record
            .get("id")
            .and_then(Value::as_str)
            .map(str::trim)
            .unwrap_or("");
        let name = record
            .get("name")
            .and_then(Value::as_str)
            .map(str::trim)
            .unwrap_or("");
        if id.is_empty() || name.is_empty() {
            return Err(DomainError::Validation(format!(
                "Place at index {index} is missing required \"id\" or \"name\"."
            )));
        }

        let coords = record.get("coordinates").and_then(Value::as_object);
        let latitude = coords
            .and_then(|c| c.get("latitude"))
            .and_then(Value::as_f64);
        let longitude = coords
            .and_then(|c| c.get("longitude"))
            .and_then(Value::as_f64);

        let (Some(latitude), Some(longitude)) = (latitude, longitude) else {
            return Err(DomainError::Validation(format!(
                "Place \"{id}\" at index {index} has invalid or missing coordinates."
            )));
        };
        if !latitude.is_finite()
            || !(-90.0..=90.0).contains(&latitude)
            || !longitude.is_finite()
            || !(-180.0..=180.0).contains(&longitude)
        {
            return Err(DomainError::Validation(format!(
                "Place \"{id}\" at index {index} has invalid or missing coordinates."
            )));
        }

        let webcams = record
            .get("webcams")
            .and_then(Value::as_array)
            .map(|list| {
                list.iter()
                    .filter_map(Value::as_object)
                    .map(|w| Webcam {
                        name: w
                            .get("name")
                            .and_then(Value::as_str)
                            .unwrap_or("")
                            .to_string(),
                        large_image: w
                            .get("largeImage")
                            .and_then(Value::as_str)
                            .unwrap_or("")
                            .to_string(),
                        thumbnail_image: w
                            .get("thumbnailImage")
                            .and_then(Value::as_str)
                            .unwrap_or("")
                            .to_string(),
                        is_active: w.get("isActive").and_then(Value::as_bool),
                    })
                    .collect()
            })
            .unwrap_or_default();

        let description = record
            .get("description")
            .and_then(Value::as_str)
            .filter(|d| !d.trim().is_empty())
            .map(str::to_string);

        places.push(Place {
            id: id.to_string(),
            name: name.to_string(),
            country: record
                .get("country")
                .and_then(Value::as_str)
                .unwrap_or("")
                .to_string(),
            state: record
                .get("state")
                .and_then(Value::as_str)
                .unwrap_or("")
                .to_string(),
            url: record
                .get("url")
                .and_then(Value::as_str)
                .unwrap_or("")
                .to_string(),
            description,
            coordinates: Coordinates {
                latitude,
                longitude,
            },
            webcams,
        });
    }

    Ok(places)
}

/// Serializes `places` as pretty-printed JSON with a trailing newline.
///
/// # Errors
///
/// Returns [`DomainError::Storage`] if serialization fails.
pub fn serialize_places_json(places: &[Place]) -> Result<String, DomainError> {
    let mut serialized = serde_json::to_string_pretty(places)
        .map_err(|err| DomainError::Storage(format!("Failed to serialize places JSON: {err}")))?;
    serialized.push('\n');
    Ok(serialized)
}

fn unique_temp_path(parent: &Path, file_name: &str) -> PathBuf {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    parent.join(format!(".{file_name}.{}.{nanos}.tmp", std::process::id()))
}

impl PlaceRepository for JsonPlaceRepository {
    fn load(&self, path: &Path) -> Result<Vec<Place>, DomainError> {
        let file_path = validate_json_path(path)?;
        let content = std::fs::read_to_string(file_path).map_err(|err| {
            DomainError::Storage(format!("Failed to read {}: {err}", file_path.display()))
        })?;
        parse_places_json(&content)
    }

    fn save(&self, path: &Path, places: &[Place]) -> Result<(), DomainError> {
        let file_path = validate_json_path(path)?;
        let content = serialize_places_json(places)?;

        let parent = file_path.parent().ok_or_else(|| {
            DomainError::Storage("Target file has no parent directory.".to_string())
        })?;
        let file_name = file_path
            .file_name()
            .and_then(|name| name.to_str())
            .ok_or_else(|| DomainError::Storage("Target file name is invalid.".to_string()))?;
        let temp_path = unique_temp_path(parent, file_name);

        let write_result = (|| -> std::io::Result<()> {
            let mut file = std::fs::File::create(&temp_path)?;
            file.write_all(content.as_bytes())?;
            file.sync_all()?;
            Ok(())
        })();

        if let Err(err) = write_result {
            let _ = std::fs::remove_file(&temp_path);
            return Err(DomainError::Storage(format!(
                "Failed to write temporary file: {err}"
            )));
        }

        if let Err(err) = std::fs::rename(&temp_path, file_path) {
            let _ = std::fs::remove_file(&temp_path);
            return Err(DomainError::Storage(format!(
                "Failed to finalize {}: {err}",
                file_path.display()
            )));
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::application::PlaceAdminService;
    use crate::domain::CreatePlaceInput;

    fn temp_file_path(name: &str) -> PathBuf {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system time before epoch")
            .as_nanos();
        std::env::temp_dir().join(format!("place_view_repo_{nanos}_{name}"))
    }

    #[test]
    fn validates_json_extension() {
        assert!(validate_json_path(Path::new("")).is_err());
        assert!(validate_json_path(Path::new("   ")).is_err());
        assert!(validate_json_path(Path::new("/tmp/places.txt")).is_err());
        assert!(validate_json_path(Path::new("/tmp/places.JSON")).is_ok());
    }

    #[test]
    fn parses_and_rejects_malformed_places_json() {
        let parsed = parse_places_json(
			r#"[{"id":" demo ","name":" Demo Resort ","coordinates":{"latitude":45.5,"longitude":6.5}}]"#,
		)
		.expect("valid JSON should parse");
        assert_eq!(parsed.len(), 1);
        assert_eq!(parsed[0].id, "demo");
        assert_eq!(parsed[0].name, "Demo Resort");
        assert_eq!(parsed[0].country, "");

        assert!(parse_places_json(r#"{"id":"not-array"}"#).is_err());
        assert!(parse_places_json("not json").is_err());
        assert!(
            parse_places_json(
                r#"[{"name":"Missing ID","coordinates":{"latitude":45,"longitude":6}}]"#
            )
            .is_err()
        );
        assert!(
            parse_places_json(
                r#"[{"id":"   ","name":"Blank","coordinates":{"latitude":45,"longitude":6}}]"#
            )
            .is_err()
        );
        assert!(parse_places_json(r#"[{"id":"no-coords","name":"No Coords"}]"#).is_err());
    }

    #[test]
    fn writes_sorted_places_atomically_to_disk() {
        let path = temp_file_path("places.json");
        let initial = r#"[
  {
    "id": "val-thorens",
    "name": "Val Thorens",
    "country": "France",
    "state": "Savoie",
    "url": "https://www.valthorens.com",
    "coordinates": {
      "latitude": 45.2979,
      "longitude": 6.5802
    },
    "webcams": []
  }
]
"#;
        std::fs::write(&path, initial).expect("seed file write should succeed");

        let service = PlaceAdminService::new(JsonPlaceRepository);
        let result = service
            .create_place(
                &path,
                CreatePlaceInput {
                    id: None,
                    name: "Abondance".to_string(),
                    country: "France".to_string(),
                    state: "Haute-Savoie".to_string(),
                    url: "https://example.com".to_string(),
                    description: None,
                    coordinates: Coordinates {
                        latitude: 46.28,
                        longitude: 6.72,
                    },
                    webcams: vec![],
                },
            )
            .expect("create_place should succeed");

        assert_eq!(
            result
                .places
                .iter()
                .map(|p| p.id.as_str())
                .collect::<Vec<_>>(),
            vec!["abondance", "val-thorens"]
        );

        let disk_raw = std::fs::read_to_string(&path).expect("disk read should succeed");
        assert!(disk_raw.ends_with('\n'));
        let reloaded = parse_places_json(&disk_raw).expect("disk JSON should parse");
        assert_eq!(
            reloaded.iter().map(|p| p.id.as_str()).collect::<Vec<_>>(),
            vec!["abondance", "val-thorens"]
        );

        let _ = std::fs::remove_file(&path);
    }
}
