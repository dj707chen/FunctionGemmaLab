/**
 * Single tool, single turn example.
 * Run with: bun run tool.ts or npx tsx tool.ts
 */

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const MODEL = 'functiongemma';

function getWeather(city: string): string {
  return JSON.stringify({ city, temperature: 22, unit: 'celsius', condition: 'sunny' });
}

const tools = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get the current weather for a city.',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'The name of the city' },
        },
        required: ['city'],
      },
    },
  },
];

interface Message {
  role: string;
  content: string;
  tool_calls?: { function: { name: string; arguments: Record<string, string> } }[];
}

interface ChatResponse {
  message: Message;
}

async function chat(messages: Message[]): Promise<ChatResponse> {
  const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages, tools, stream: false }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function main() {
  const messages: Message[] = [{ role: 'user', content: 'What is the weather in Paris?' }];
  console.log('Prompt:', messages[0].content);

  const response = await chat(messages);

  if (response.message.tool_calls?.length) {
    const tool = response.message.tool_calls[0];
    console.log(`Calling: ${tool.function.name}(${JSON.stringify(tool.function.arguments)})\n`);

    const result = getWeather(tool.function.arguments.city);
    console.log('Function Result:', result);

    messages.push(response.message);
    messages.push({ role: 'tool', content: result });

    const final = await chat(messages);
    console.log('Response:', final.message.content);
  } else {
    console.log('Response:', response.message.content);
  }
}

main().catch(console.error);