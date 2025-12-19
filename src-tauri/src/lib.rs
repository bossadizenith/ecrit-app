// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
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
        .invoke_handler(tauri::generate_handler![greet, toggle_devtools])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
