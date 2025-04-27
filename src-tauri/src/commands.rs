use std::process::Command as ProcessCommand;

#[tauri::command]
pub async fn run_terminal_cmd(cmd: String, args: Vec<String>) -> Result<String, String> {
    // Log the command and arguments for debugging
    println!("Running command: {}", cmd);
    println!("Arguments: {:?}", args);
    
    // Create the command
    let mut command = ProcessCommand::new(cmd);
    
    // Add arguments, ensuring proper handling of file paths
    for arg in args {
        command.arg(arg);
    }
    
    // Execute the command and process the output
    command
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e.to_string()))
        .and_then(|output| {
            if output.status.success() {
                String::from_utf8(output.stdout)
                    .map_err(|e| format!("Failed to parse command output: {}", e.to_string()))
            } else {
                let error_message = String::from_utf8_lossy(&output.stderr).to_string();
                println!("Command failed with error: {}", error_message);
                Err(error_message)
            }
        })
} 