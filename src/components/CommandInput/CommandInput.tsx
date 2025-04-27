import { useState } from "react";
import { generateFFMPEGCommand } from "../../services/openai";
import { core } from "@tauri-apps/api";
import "./CommandInput.css";

// Match the same FileWithPath interface used in App.tsx
interface FileWithPath {
  name: string;
  path: string;
  size?: number;
}

interface CommandInputProps {
  selectedFiles: Partial<FileWithPath>[];
  apiKey: string;
}

export function CommandInput({ selectedFiles, apiKey }: CommandInputProps) {
  const [command, setCommand] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCommand, setGeneratedCommand] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [runOutput, setRunOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setGeneratedCommand(null);
    
    try {
      if (!apiKey) {
        throw new Error("Please enter your OpenAI API key first");
      }

      if (selectedFiles.length === 0) {
        throw new Error("Please select at least one file first");
      }

      const filePaths = selectedFiles.map(file => (file as any).path || file.name);
      const ffmpegCommand = await generateFFMPEGCommand(apiKey, command, filePaths);
      setGeneratedCommand(ffmpegCommand);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while generating the command");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCommand = () => {
    if (generatedCommand) {
      navigator.clipboard.writeText(generatedCommand)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        })
        .catch(err => {
          console.error("Failed to copy command: ", err);
          // Optionally show an error message to the user
        });
    }
  };

  const handleRunCommand = async () => {
    if (!generatedCommand) return;
    setIsRunning(true);
    setRunOutput(null);
    try {
      // Instead of using regex splitting, we'll handle the command more carefully
      let parts: string[] = [];
      
      // Extract the executable (ffmpeg) as the first part
      const ffmpegIndex = generatedCommand.indexOf("ffmpeg");
      if (ffmpegIndex === -1) throw new Error("Invalid command: ffmpeg not found");
      
      parts.push("ffmpeg");
      
      // Parse the rest of the command more carefully, preserving quoted paths
      const restOfCommand = generatedCommand.slice(ffmpegIndex + 6).trim();
      
      // Process arguments, being careful with quoted strings
      let currentArg = "";
      let inQuotes = false;
      let quoteChar = "";
      
      for (let i = 0; i < restOfCommand.length; i++) {
        const char = restOfCommand[i];
        
        if ((char === '"' || char === "'") && (i === 0 || restOfCommand[i-1] !== '\\')) {
          if (!inQuotes) {
            inQuotes = true;
            quoteChar = char;
          } else if (char === quoteChar) {
            inQuotes = false;
            quoteChar = "";
          } else {
            currentArg += char;
          }
        } else if (char === ' ' && !inQuotes) {
          if (currentArg) {
            parts.push(currentArg);
            currentArg = "";
          }
        } else {
          currentArg += char;
        }
      }
      
      if (currentArg) {
        parts.push(currentArg);
      }
      
      // Filter out empty arguments
      parts = parts.filter(part => part.trim() !== "");
      
      if (parts.length === 0) throw new Error("Invalid command");
      
      const cmd = parts[0];
      const args = parts.slice(1).map(arg => {
        // Handle file paths - remove surrounding quotes if present
        if ((arg.startsWith('"') && arg.endsWith('"')) || 
            (arg.startsWith("'") && arg.endsWith("'"))) {
          return arg.slice(1, -1);
        }
        return arg;
      });
      
      const output = await core.invoke<string>("run_terminal_cmd", {
        cmd,
        args,
      });
      setRunOutput(output);
    } catch (err) {
      alert(err);
      setRunOutput(err instanceof Error ? err.message : "Failed to run command");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="command-input-section">
      <h2>Describe Your Operation</h2>
      <p className="command-description">
        Tell us what you want to do with your media files. For example:
      </p>
      <ul className="command-examples">
        <li>"Compress this video to 720p and reduce file size"</li>
        <li>"Extract audio from this video and save as MP3"</li>
        <li>"Convert this video to GIF with 10fps"</li>
        <li>"Trim this video from 1:30 to 3:45"</li>
      </ul>
      
      <form onSubmit={handleSubmit} className="command-form">
        <div className="form-group">
          <label htmlFor="command">What would you like to do?</label>
          <textarea
            id="command"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Describe your desired operation..."
            rows={4}
            required
          />
        </div>
        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Generating Command..." : "Generate FFMPEG Command"}
        </button>
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {generatedCommand && (
        <div className="generated-command">
          <div className="generated-command-header">
            <h3>Generated FFMPEG Command:</h3>
            <button 
              onClick={handleCopyCommand} 
              className="copy-button"
              disabled={copied} // Temporarily disable after copying
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleRunCommand}
              className="run-button"
              disabled={isRunning}
              style={{ marginLeft: 8 }}
            >
              {isRunning ? "Running..." : "Run Command"}
            </button>
          </div>
          <pre>{generatedCommand}</pre>
          {runOutput && (
            <div className="run-output">
              <strong>Output:</strong>
              <pre>{runOutput}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 