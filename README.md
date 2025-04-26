# FFMPEG Command Generator with AI (Tauri Desktop App)

This application allows users to select media files and generate FFMPEG commands using AI based on natural language descriptions. It leverages the power of OpenAI's GPT models within a secure Tauri desktop environment.

## Features

*   **Secure API Key Management:** Prompts for OpenAI API key on first use and stores it securely using Tauri's store plugin.
*   **File Selection:** Allows users to select media files (implementation details may vary, uses a `FileSelector` component).
*   **Natural Language Input:** Provides an interface (`CommandInput` component) for users to describe the desired FFMPEG operation.
*   **AI-Powered Command Generation:** Integrates with the OpenAI API to generate FFMPEG commands based on user input and selected files.
*   **(Planned/Partial) Command Execution:** Aims to execute the generated FFMPEG commands locally (further implementation details needed).
*   **(Planned) Smart Output Naming:** Intends to save output files with a `_neta` suffix in the original file directory.

## Technical Stack

*   **Framework:** Tauri (v2)
*   **Frontend:** React + Vite with TypeScript
*   **UI Library:** Plain CSS / Custom Components (Chakra UI dependency present but not used in main layout)
*   **State Management:** React Hooks
*   **API Interaction:** OpenAI JS Client
*   **Secure Storage:** `@tauri-apps/plugin-store`
*   **Backend (Tauri Core):** Rust

## Setup and Installation

1.  **Prerequisites:**
    *   Node.js and npm/yarn/pnpm
    *   Rust and Cargo
    *   Tauri prerequisites (see [Tauri documentation](https://tauri.app/v1/guides/getting-started/prerequisites/))
2.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd ff-mpagia
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Run in development mode:**
    ```bash
    npm run tauri dev
    ```
5.  **Build the application:**
    ```bash
    npm run tauri build
    ```

## Usage

1.  **First Launch:** The application will prompt you to enter your OpenAI API key. Enter your key and click "Save API Key". It will be stored securely.
2.  **Select Files:** Use the file selection component to choose the media file(s) you want to process.
3.  **Describe Operation:** In the input field, describe what you want to do with the file(s) (e.g., "compress video to 720p", "convert mp4 to mp3").
4.  **Generate Command:** The application will send your request and file information to the OpenAI API to generate an FFMPEG command.
5.  **(Planned) Review and Execute:** Review the generated command and approve it for local execution.
6.  **(Planned) Output:** The processed file(s) will be saved in the same directory as the input file(s) with the `_neta` suffix.

## Project Structure (Simplified)

```
.
├── src/                      # Frontend code (React, TypeScript)
│   ├── components/           # React components (FileSelector, CommandInput, etc.)
│   ├── services/             # API interaction (OpenAI, Tauri storage)
│   ├── App.tsx               # Main application component
│   └── main.tsx              # Entry point
├── src-tauri/                # Backend code (Rust)
│   └── src/
│       └── main.rs           # Tauri application setup
├── instractions.md           # Original detailed instructions/plan
├── package.json              # Project metadata and dependencies
└── README.md                 # This file
```

## Contributing

Contributions are welcome! Please follow standard Git workflow (fork, branch, pull request).

## License

[Specify License Here - e.g., MIT]

## Next Steps

1. **Integrate Chakra UI Components:** Refactor the UI to use Chakra UI components for improved maintainability and a more consistent design system.
2. **Enable Command Execution:** Implement functionality to execute the generated FFMPEG command directly from the app after the user reviews and approves it.
3. **Support Multi-File Selection:** Allow users to select multiple files (e.g., an image and an audio file) and handle combined operations, such as merging them into a video.
4. **Bundle FFMPEG Binary:** Package the FFMPEG binary with the application so users do not need to install FFMPEG separately.
5. **Optimize Performance:** Enhance the application's performance for a smoother and faster user experience.
