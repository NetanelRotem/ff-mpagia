import { useState, useEffect } from "react";
import FileSelector from "./components/FileSelector/FileSelector";
import { CommandInput } from "./components/CommandInput/CommandInput";
import { saveApiKey, getApiKey } from "./services/storage";
import "./App.css";

// Import the FileWithPath type to ensure compatibility
interface FileWithPath {
  name: string;
  path: string;
  size?: number;
}

function App() {
  const [selectedFiles, setSelectedFiles] = useState<Partial<FileWithPath>[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Load API key on component mount
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const savedApiKey = await getApiKey();
        if (savedApiKey) {
          setApiKey(savedApiKey);
        }
      } catch (error) {
        console.error('Error loading API key:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApiKey();
  }, []);

  const handleFilesSelected = (files: Partial<FileWithPath>[]) => {
    setSelectedFiles(files);
    console.log("Files selected:", files.map(file => file.name));
  };

  const handleApiKeySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const key = formData.get("apiKey") as string;
    
    try {
      await saveApiKey(key);
      setApiKey(key);
      alert('API key saved successfully!');
    } catch (error) {
      console.error('Error saving API key:', error);
      alert('Failed to save API key. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app-container">
      <div className="content">
        <h1 className="title">FFMPEG Command Generator</h1>
        <div className="api-key-section">
          <form onSubmit={handleApiKeySubmit}>
            <div className="form-group">
              <label htmlFor="apiKey">OpenAI API Key</label>
              <input
                type="password"
                id="apiKey"
                name="apiKey"
                placeholder="Enter your OpenAI API key"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <small>Your API key will be stored securely on your device</small>
            </div>
            <button type="submit" className="submit-button">
              Save API Key
            </button>
          </form>
        </div>
        <FileSelector onFilesSelected={handleFilesSelected} />
        <CommandInput selectedFiles={selectedFiles} apiKey={apiKey} />
      </div>
    </div>
  );
}

export default App;
