use tauri::{Emitter, Manager};
use std::path::PathBuf;

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

fn emit_file_opened(handle: tauri::AppHandle, path: String) {
    let path_buf = PathBuf::from(&path);
    let absolute_path = if path_buf.is_absolute() {
        path_buf.canonicalize().unwrap_or(path_buf)
    } else {
        match std::env::current_dir() {
            Ok(cwd) => {
                let abs = cwd.join(&path_buf);
                abs.canonicalize().unwrap_or(abs)
            }
            Err(_) => path_buf,
        }
    };

    let path_str = absolute_path.to_string_lossy().to_string();

    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_millis(300));
        let _ = handle.emit("file-opened", path_str);
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

    #[cfg(desktop)]
    {
        builder = builder.plugin(
            tauri_plugin_single_instance::init(|app, args, _cwd| {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.set_focus();
                    let _ = window.show();

                    let handle = app.app_handle().clone();
                    for arg in args.iter().skip(1) {
                        if arg.starts_with('-') {
                            continue;
                        }

                        let path = std::path::Path::new(arg);
                        if path.exists() && path.is_file() {
                            if let Some(ext) = path.extension() {
                                if ext == "md" || ext == "markdown" {
                                    emit_file_opened(handle.clone(), arg.clone());
                                    break;
                                }
                            }
                        }
                    }
                }
            }),
        );
    }

    builder
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
                                emit_file_opened(handle.clone(), arg.clone());
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
