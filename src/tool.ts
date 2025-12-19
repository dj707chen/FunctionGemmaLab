/**
 * Single tool, single turn example.
 * Run with: bun run tool.ts or npx tsx tool.ts
 */

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const MODEL = 'functiongemmanotexistkkkkkkkk';

// Mock tool functions
function getWeather(city: string): string {
  console.log('getWeather:')
  return JSON.stringify({ city: city + "-Normal IL", temperature: 22, unit: 'celsius', condition: 'sunny' });
}
function getNews(city: string): string {
  console.log('getNews:')
  return JSON.stringify({ city: city + "-Normal IL", headline: "Breaking News in " + city, details: "Details about the news in " + city });
}

// Define the tool functions
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

  // Initial chat call
  const response = await chat(messages);

  // Check if the model requested a tool function call
  if (response.message.tool_calls?.length) {
    const tool = response.message.tool_calls[0];
    console.log('tool=', tool);
    console.log(`Calling: ${tool.function.name}(${JSON.stringify(tool.function.arguments)})\n`);

    // Call the tool function
    let toolFunctionResult: string = '';
    if (tool.function.name == "get_weather")
      toolFunctionResult = getWeather(tool.function.arguments.city)
    else if (tool.function.name == "get_news")
      toolFunctionResult = getNews(tool.function.arguments.city)
    console.log('Function toolFunctionResult:', toolFunctionResult);

    if (!toolFunctionResult) {
      // No tool response, just return the model's response
      console.log('Model did not ask for tool function call. Response:', response.message.content);
    } else {
      // Append tool response and get final answer
      messages.push(response.message);
      messages.push({ role: 'tool', content: toolFunctionResult });

      // Get final response from model
      const final = await chat(messages);
      console.log('Called tool, response:', final.message.content);
  }
}
}

main("Beijing", "news").catch(console.error);