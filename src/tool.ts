/**
 * Single tool, single turn example.
 * Run with: bun run tool.ts or npx tsx tool.ts
 */

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const MODEL = 'functiongemma';

function getWeather(city: string): string {
  console.log('getWeather:')
  return JSON.stringify({ city: city + "-Normal IL", temperature: 22, unit: 'celsius', condition: 'sunny' });
}

function getNews(city: string): string {
  console.log('getNews:')
  return JSON.stringify({ city: city + "-Normal IL", headline: "Breaking News in " + city, details: "Details about the news in " + city });
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
  {
    type: 'function',
    function: {
      name: 'get_news',
      description: 'Get the current news happening in a city.',
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

async function main(city: string, topic: string) {
  const messages: Message[] = [{ role: 'user', content: `What is the ${topic} of ${city}?` }];
  console.log('Prompt:', messages[0].content);

  const response = await chat(messages);

  if (response.message.tool_calls?.length) {
    const tool = response.message.tool_calls[0];
    console.log('tool=', tool);
    console.log(`Calling: ${tool.function.name}(${JSON.stringify(tool.function.arguments)})\n`);

    let result: string = '';
    if (tool.function.name == "get_weather")
      result = getWeather(tool.function.arguments.city)
    else if (tool.function.name == "get_news")
      result = getNews(tool.function.arguments.city)
    console.log('Function Result:', result);

    if (!result) {
      console.log('Response:', response.message.content);
      throw new Error(`No result from tool: ${tool.function.name}`);
    } else {
    messages.push(response.message);
    messages.push({ role: 'tool', content: result });

    const final = await chat(messages);
    console.log('Called tool,Response:', final.message.content);
  }
}
}

main("Beijing", "news").catch(console.error);