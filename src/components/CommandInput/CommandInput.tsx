import { useState } from "react";
import { generateFFMPEGCommand } from "../../services/openai";
import "./CommandInput.css";

interface CommandInputProps {
  selectedFiles: File[];
  apiKey: string;
}

export function CommandInput({ selectedFiles, apiKey }: CommandInputProps) {
  const [command, setCommand] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCommand, setGeneratedCommand] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
          </div>
          <pre>{generatedCommand}</pre>
        </div>
      )}
    </div>
  );
} 