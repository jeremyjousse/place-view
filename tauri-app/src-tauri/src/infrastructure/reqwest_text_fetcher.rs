//! SSRF-guarded external HTTP text fetcher used by desktop admin lookup tools.

use std::net::{IpAddr, Ipv4Addr, Ipv6Addr};
use std::time::Duration;

const MAX_EXTERNAL_TEXT_BYTES: usize = 2 * 1024 * 1024;

/// Managed HTTP client state with redirects disabled and strict timeouts.
pub struct HttpClientState(pub reqwest::Client);

impl HttpClientState {
    /// Builds the shared `reqwest::Client` configured for external admin fetches.
    ///
    /// # Errors
    ///
    /// Returns a descriptive error string if the TLS/HTTP client cannot be initialized.
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

/// Validates that `raw_url` uses HTTP(S) and does not target local, private, or SSRF-sensitive hosts.
///
/// # Errors
///
/// Returns a descriptive error string if the URL is invalid, uses an unsupported scheme,
/// or resolves syntactically to a local/private/loopback/reserved host or IP.
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

/// Fetches a UTF-8 text payload from `raw_url` with SSRF and response-size guards.
///
/// # Errors
///
/// Returns an error string if URL validation fails, the HTTP request fails or returns a
/// non-2xx status, the body exceeds 2 MiB, or the response is not valid UTF-8.
pub async fn fetch_external_text(state: &HttpClientState, raw_url: &str) -> Result<String, String> {
    let parsed_url = validate_external_url(raw_url)?;
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

    #[test]
    fn rejects_non_http_and_ssrf_urls() {
        assert!(validate_external_url("file:///etc/passwd").is_err());
        assert!(validate_external_url("ftp://example.com/a").is_err());
        assert!(validate_external_url("http://localhost:8080/secret").is_err());
        assert!(validate_external_url("http://127.0.0.1/secret").is_err());
        assert!(validate_external_url("http://169.254.169.254/latest/meta-data").is_err());
        assert!(validate_external_url("http://10.0.0.1/admin").is_err());
        assert!(validate_external_url("http://100.64.0.1/admin").is_err());
        assert!(validate_external_url("http://[::1]/admin").is_err());
        assert!(validate_external_url("https://www.skaping.com/demo").is_ok());
    }
}
