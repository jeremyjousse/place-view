//! Native iOS appearance for the fullscreen webcam viewer.

use objc2::{msg_send, runtime::AnyObject, sel};

#[tauri::command]
pub async fn set_webcam_fullscreen(
    webview: tauri::Webview,
    fullscreen: bool,
) -> Result<(), String> {
    let (sender, mut receiver) = tauri::async_runtime::channel(1);
    webview
        .with_webview(move |platform| {
            // SAFETY: Tauri supplies a live UIViewController on the main thread.
            // Tao's status bar setter is checked before sending the message.
            let result = unsafe {
                let controller = &*platform.view_controller().cast::<AnyObject>();
                let supported: bool =
                    msg_send![controller, respondsToSelector: sel!(setPrefersStatusBarHidden:)];
                if supported {
                    let (): () = msg_send![controller, setPrefersStatusBarHidden: fullscreen];
                    Ok(())
                } else {
                    Err(
                        "The iOS view controller does not support status bar visibility"
                            .to_string(),
                    )
                }
            };
            if sender.try_send(result).is_err() {
                log::error!("Failed to return the iOS fullscreen appearance result");
            }
        })
        .map_err(|error| error.to_string())?;
    receiver
        .recv()
        .await
        .ok_or_else(|| "The iOS fullscreen appearance update was interrupted".to_string())?
}
