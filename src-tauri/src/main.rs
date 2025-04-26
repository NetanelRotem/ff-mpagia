// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn get_file_path(file_path: String) -> Result<String, String> {
    Ok(file_path)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![get_file_path])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
