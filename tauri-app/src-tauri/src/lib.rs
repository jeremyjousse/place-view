#[cfg(desktop)]
mod desktop_admin {
	use std::io::Write;
	use std::net::{IpAddr, Ipv4Addr, Ipv6Addr};
	use std::path::{Path, PathBuf};
	use std::time::{Duration, SystemTime, UNIX_EPOCH};

	const MAX_EXTERNAL_TEXT_BYTES: usize = 2 * 1024 * 1024;

	pub struct HttpClientState(pub reqwest::Client);

	impl HttpClientState {
		pub fn new() -> Result<Self, String> {
			let client = reqwest::Client::builder()
				.timeout(Duration::from_secs(15))
				.redirect(reqwest::redirect::Policy::none())
				.user_agent("place-view-desktop/0.1.0")
				.build()
				.map_err(|err| format!("Failed to initialize HTTP client: {err}"))?;
			Ok(Self(client))
		}
	}

	pub fn validate_json_path(path: &str) -> Result<&Path, String> {
		let trimmed = path.trim();
		if trimmed.is_empty() {
			return Err("File path cannot be empty.".to_string());
		}

		let path_ref = Path::new(trimmed);
		match path_ref.extension().and_then(|ext| ext.to_str()) {
			Some(ext) if ext.eq_ignore_ascii_case("json") => Ok(path_ref),
			_ => Err("Selected file must have a .json extension.".to_string()),
		}
	}

	pub fn validate_places_json_array(content: &str) -> Result<(), String> {
		let parsed: serde_json::Value =
			serde_json::from_str(content).map_err(|err| format!("Invalid JSON content: {err}"))?;
		if !parsed.is_array() {
			return Err("JSON root must be an array of places.".to_string());
		}
		Ok(())
	}

	fn is_disallowed_ipv4(ip: Ipv4Addr) -> bool {
		ip.is_private()
			|| ip.is_loopback()
			|| ip.is_link_local()
			|| ip.is_broadcast()
			|| ip.is_documentation()
			|| ip.is_unspecified()
			|| ip.is_multicast()
			// CGNAT 100.64.0.0/10
			|| (ip.octets()[0] == 100 && (ip.octets()[1] & 0b1100_0000) == 64)
	}

	fn is_disallowed_ipv6(ip: Ipv6Addr) -> bool {
		if let Some(mapped) = ip.to_ipv4_mapped() {
			return is_disallowed_ipv4(mapped);
		}
		let segments = ip.segments();
		let is_ula = (segments[0] & 0xfe00) == 0xfc00;
		let is_link_local = (segments[0] & 0xffc0) == 0xfe80;
		ip.is_loopback() || ip.is_unspecified() || ip.is_multicast() || is_ula || is_link_local
	}

	fn is_disallowed_ip(ip: IpAddr) -> bool {
		match ip {
			IpAddr::V4(v4) => is_disallowed_ipv4(v4),
			IpAddr::V6(v6) => is_disallowed_ipv6(v6),
		}
	}

	pub fn validate_external_url(raw_url: &str) -> Result<reqwest::Url, String> {
		let parsed =
			reqwest::Url::parse(raw_url.trim()).map_err(|err| format!("Invalid URL: {err}"))?;
		match parsed.scheme() {
			"http" | "https" => {}
			other => return Err(format!("Unsupported URL scheme: {other}")),
		}

		let host = parsed
			.host_str()
			.ok_or_else(|| "URL must include a valid host.".to_string())?
			.to_ascii_lowercase();

		if host == "localhost"
			|| host.ends_with(".localhost")
			|| host.ends_with(".local")
			|| host.ends_with(".internal")
		{
			return Err("Requests to local or internal hosts are not allowed.".to_string());
		}

		let bare_host = host.trim_start_matches('[').trim_end_matches(']');
		if let Ok(ip) = bare_host.parse::<IpAddr>()
			&& is_disallowed_ip(ip)
		{
			return Err("Requests to private or loopback IP addresses are not allowed.".to_string());
		}

		Ok(parsed)
	}

	pub fn read_places_file(path: &str) -> Result<String, String> {
		let file_path = validate_json_path(path)?;
		let content = std::fs::read_to_string(file_path)
			.map_err(|err| format!("Failed to read {}: {err}", file_path.display()))?;
		validate_places_json_array(&content)?;
		Ok(content)
	}

	fn unique_temp_path(parent: &Path, file_name: &str) -> PathBuf {
		let nanos = SystemTime::now()
			.duration_since(UNIX_EPOCH)
			.map(|d| d.as_nanos())
			.unwrap_or(0);
		parent.join(format!(".{file_name}.{}.{nanos}.tmp", std::process::id()))
	}

	pub fn write_places_file(path: &str, content: &str) -> Result<(), String> {
		let file_path = validate_json_path(path)?;
		validate_places_json_array(content)?;

		let parent = file_path
			.parent()
			.ok_or_else(|| "Target file has no parent directory.".to_string())?;
		let file_name = file_path
			.file_name()
			.and_then(|name| name.to_str())
			.ok_or_else(|| "Target file name is invalid.".to_string())?;
		let temp_path = unique_temp_path(parent, file_name);

		let write_result = (|| -> std::io::Result<()> {
			let mut file = std::fs::File::create(&temp_path)?;
			file.write_all(content.as_bytes())?;
			file.sync_all()?;
			Ok(())
		})();

		if let Err(err) = write_result {
			let _ = std::fs::remove_file(&temp_path);
			return Err(format!("Failed to write temporary file: {err}"));
		}

		if let Err(err) = std::fs::rename(&temp_path, file_path) {
			let _ = std::fs::remove_file(&temp_path);
			return Err(format!("Failed to finalize {}: {err}", file_path.display()));
		}

		Ok(())
	}

	#[tauri::command]
	pub fn read_local_places(path: String) -> Result<String, String> {
		read_places_file(&path)
	}

	#[tauri::command]
	pub fn write_local_places(path: String, content: String) -> Result<(), String> {
		write_places_file(&path, &content)
	}

	#[tauri::command]
	pub async fn fetch_external_text(
		state: tauri::State<'_, HttpClientState>,
		url: String,
	) -> Result<String, String> {
		let parsed_url = validate_external_url(&url)?;
		let mut response = state
			.0
			.get(parsed_url)
			.send()
			.await
			.map_err(|err| format!("Request failed: {err}"))?;

		if !response.status().is_success() {
			return Err(format!("Remote server returned HTTP {}", response.status()));
		}

		if let Some(len) = response.content_length()
			&& len > MAX_EXTERNAL_TEXT_BYTES as u64
		{
			return Err(format!(
				"Response exceeds maximum allowed size ({MAX_EXTERNAL_TEXT_BYTES} bytes)."
			));
		}

		let mut bytes = Vec::new();
		while let Some(chunk) = response
			.chunk()
			.await
			.map_err(|err| format!("Failed to read response body: {err}"))?
		{
			if bytes.len() + chunk.len() > MAX_EXTERNAL_TEXT_BYTES {
				return Err(format!(
					"Response exceeds maximum allowed size ({MAX_EXTERNAL_TEXT_BYTES} bytes)."
				));
			}
			bytes.extend_from_slice(&chunk);
		}

		String::from_utf8(bytes).map_err(|err| format!("Response body is not valid UTF-8: {err}"))
	}

	#[cfg(test)]
	mod tests {
		use super::*;

		fn temp_file_path(name: &str) -> std::path::PathBuf {
			let nanos = SystemTime::now()
				.duration_since(UNIX_EPOCH)
				.expect("system time before epoch")
				.as_nanos();
			std::env::temp_dir().join(format!("place_view_test_{nanos}_{name}"))
		}

		#[test]
		fn rejects_non_json_paths() {
			assert!(validate_json_path("").is_err());
			assert!(validate_json_path("/tmp/places.txt").is_err());
			assert!(validate_json_path("/tmp/places.JSON").is_ok());
		}

		#[test]
		fn rejects_non_array_json() {
			assert!(validate_places_json_array(r#"{"id":"a"}"#).is_err());
			assert!(validate_places_json_array("not json").is_err());
			assert!(validate_places_json_array(r#"[{"id":"a"}]"#).is_ok());
		}

		#[test]
		fn rejects_non_http_and_ssrf_urls() {
			assert!(validate_external_url("file:///etc/passwd").is_err());
			assert!(validate_external_url("ftp://example.com/a").is_err());
			assert!(validate_external_url("http://localhost:8080/secret").is_err());
			assert!(validate_external_url("http://127.0.0.1/secret").is_err());
			assert!(validate_external_url("http://169.254.169.254/latest/meta-data").is_err());
			assert!(validate_external_url("http://10.0.0.1/admin").is_err());
			assert!(validate_external_url("http://[::1]/admin").is_err());
			assert!(validate_external_url("https://www.skaping.com/demo").is_ok());
		}

		#[test]
		fn writes_and_reads_places_roundtrip() {
			let path = temp_file_path("places.json");
			let path_str = path.to_string_lossy().to_string();
			let payload = r#"[{"id":"test","name":"Test"}]"#;

			write_places_file(&path_str, payload).expect("write should succeed");
			let read_back = read_places_file(&path_str).expect("read should succeed");
			assert_eq!(read_back, payload);

			let _ = std::fs::remove_file(&path);
		}
	}
}

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
		.manage(desktop_admin::HttpClientState::new().expect("failed to build HTTP client"))
		.plugin(tauri_plugin_dialog::init())
		.invoke_handler(tauri::generate_handler![
			desktop_admin::read_local_places,
			desktop_admin::write_local_places,
			desktop_admin::fetch_external_text
		]);

	builder
		.run(tauri::generate_context!())
		.expect("error while building tauri application");
}
