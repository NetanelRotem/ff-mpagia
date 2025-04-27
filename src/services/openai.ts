import OpenAI from 'openai';

// Initialize OpenAI client
const createOpenAIClient = (apiKey: string) => {
  return new OpenAI({
    apiKey: apiKey,dangerouslyAllowBrowser :true
  });
};

// Function to generate FFMPEG command using GPT-4
export const generateFFMPEGCommand = async (
  apiKey: string,
  userCommand: string,
  filePaths: string[]
): Promise<string> => {
  try {
    const openai = createOpenAIClient(apiKey);

    const prompt = `Generate an FFMPEG command for the following operation:
Operation: ${userCommand}

Input files:
${filePaths.map((path, index) => `${index + 1}. ${path}`).join('\n')}

Requirements:
1. Return ONLY the FFMPEG command, nothing else. DO NOT explain the command or provide any additional text.
2. VERY IMPORTANT: Make the command cross-platform compatible (works on Windows, Mac, Linux)
3. For Windows file paths, double-quote them and replace backslashes with forward slashes
4. Include all necessary parameters for the operation
5. Make sure the output file has "_neta" suffix
6. If multiple outputs are needed, use numbered suffixes (_neta_1, _neta_2, etc.)
7. Prioritize speed and performance in the command. Use the fastest options available that do not compromise the requested operation.
8. If the user is asking to convert a .ts (MPEG-TS) file, use the -c copy option to avoid re-encoding unless otherwise specified.
9. EXTREMELY IMPORTANT: Handle file paths with spaces correctly. Always quote file paths.

Example format (with proper cross-platform path handling):
ffmpeg -i "C:/Users/username/Videos/input.mp4" -vf scale=1280:720 -c:v libx264 -crf 23 "C:/Users/username/Videos/input_neta.mp4"

Example for .ts file conversion (no re-encoding):
ffmpeg -i "C:/path/to/input.ts" -c copy "C:/path/to/input_neta.mp4"`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an FFMPEG expert. Generate precise, cross-platform compatible FFMPEG commands based on user requirements. Make sure all file paths use forward slashes even for Windows paths, and are properly quoted."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.0000001,
      max_tokens: 1000
    });

    const generatedCommand = completion.choices[0]?.message?.content;
    if (!generatedCommand) {
      throw new Error('No command generated');
    }

    // Ensure forward slashes in paths for cross-platform compatibility
    const processedCommand = generatedCommand.trim().replace(/\\/g, '/');
    
    return processedCommand;
  } catch (error) {
    console.error('Error generating FFMPEG command:', error);
    throw error;
  }
};
