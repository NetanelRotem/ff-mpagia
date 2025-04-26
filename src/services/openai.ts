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
1. Return ONLY the FFMPEG command, nothing else
2. Use proper escaping for file paths
3. Include all necessary parameters for the operation
4. Make sure the output file has "_neta" suffix
5. If multiple outputs are needed, use numbered suffixes (_neta_1, _neta_2, etc.)
6. Prioritize speed and performance in the command. Use the fastest options available that do not compromise the requested operation.
7. If the user is asking to convert a .ts (MPEG-TS) file, use the -c copy option to avoid re-encoding unless otherwise specified.

Example format:
ffmpeg -i "input.mp4" -vf scale=1280:720 -c:v libx264 -crf 23 "input_neta.mp4"

Example for .ts file conversion (no re-encoding):
ffmpeg -i "input.ts" -c copy "input_neta.mp4"`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an FFMPEG expert. Generate precise FFMPEG commands based on user requirements."
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

    return generatedCommand.trim();
  } catch (error) {
    console.error('Error generating FFMPEG command:', error);
    throw error;
  }
}; 