// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
// The correct way to import the store plugin in v2
use tauri_plugin_store::Builder as StoreBuilder;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        // Use the correct Builder interface for the store plugin
        .plugin(StoreBuilder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
