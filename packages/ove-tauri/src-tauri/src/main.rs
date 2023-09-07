// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
// use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    
    // here `"quit".to_string()` defines the menu item id, and the second parameter is the menu item label.

    // let submenu = Submenu::new(
    //     "File",
    //     Menu::new()
    //         .add_item(CustomMenuItem::new("newFile".to_string(), "New File"))
    //         .add_item(CustomMenuItem::new("open".to_string(), "Open"))
    //         .add_item(CustomMenuItem::new("quit".to_string(), "Quit"))
    //         .add_item(CustomMenuItem::new("close".to_string(), "Close")),
    // );
    // let menu = Menu::new()
    //     .add_native_item(MenuItem::Copy)
    //     .add_item(CustomMenuItem::new("hide", "Hide"))
    //     .add_submenu(submenu);

    tauri::Builder::default()
        // .menu(menu)
        // .on_menu_event(|event| match event.menu_item_id() {
        //     "open" => {
        //         //what should go here?
        //     }
        //     "newFile" => {
        //         event.window().clone();
                
        //     }
        //     "quit" => {
        //         std::process::exit(0);
        //     }
        //     "close" => {
        //         event.window().close().unwrap();
        //     }
        //     _ => {}
        // })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
