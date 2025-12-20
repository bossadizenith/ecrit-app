// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Emitter;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn toggle_devtools(webview_window: tauri::WebviewWindow, open: bool) {
    #[cfg(debug_assertions)]
    {
        if open {
            webview_window.open_devtools();
        } else {
            webview_window.close_devtools();
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![greet, toggle_devtools])
        .setup(|app| {
            let handle = app.handle().clone();

            let args: Vec<String> = std::env::args().collect();
            if args.len() > 1 {
                for arg in args.iter().skip(1) {
                    if arg.starts_with('-') {
                        continue;
                    }

                    let path = std::path::Path::new(arg);
                    if path.exists() && path.is_file() {
                        if let Some(ext) = path.extension() {
                            if ext == "md" || ext == "markdown" {
                                let handle_clone = handle.clone();
                                let path_str = arg.clone();
                                std::thread::spawn(move || {
                                    std::thread::sleep(std::time::Duration::from_millis(500));
                                    let _ = handle_clone.emit("file-opened", path_str);
                                });
                                break;
                            }
                        }
                    }
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
