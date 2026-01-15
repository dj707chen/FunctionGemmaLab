/**
 * Single tool, single turn example.
 * Run with: bun run tool.ts or npx tsx tool.ts
 */

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const MODEL =
  // 'gemini-3-flash-preview:cloud'; // "error":"unauthorized","signin_url":"https://ollama.com/connect?name=MacBookPro24.local\u0026key=c3NoLWVkMjU1MTkgQUFBQUMzTnphQzFsWkRJMU5URTVBQUFBSU1ZTXBOM2ZZTkJLSzZoTTVHZG5rdmtpSDJqUHh5OVIrZE1OQnNXL2FsdDg"
  'functiongemma:270m';
  // 'functiongemma';
  // 'olmo-3:7b';  // https://arxiv.org/abs/2512.13961, "error":"registry.ollama.ai/library/olmo-3:7b does not support tools"
  // 'olmo-3:32b'; // https://arxiv.org/abs/2512.13961, "error":"registry.ollama.ai/library/olmo-3:32b does not support tools"
  // 'qwen2.5:7b';
  // 'nemotron-3-nano:30b'; // Nvidia model, "error":"model runner has unexpectedly stopped, this may be due to resource limitations or an internal error
  // 'deepseek-r1:14b'; // "error":"registry.ollama.ai/library/deepseek-r1:14b does not support tools"
  // 'gpt-oss:20b'; // Looks like the model calls it's own news in addition to the tool, refer to the gpt-oss:20

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
          topic: { type: 'string', description: 'The topic of the news' },
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
  const payloadObj = { model: MODEL, messages, tools, stream: false };
  const payload = JSON.stringify(payloadObj);
  // const payload = JSON.stringify(payloadObj, null, 2)
  console.log('Request payload:', payload);
  const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function main(city: string, topic: string) {
  const messages: Message[] = [{ role: 'user', content: `What is the news on ${topic} in ${city}?` }];
  console.log('Model:', MODEL);
  console.log('Initial prompt:', messages[0].content);

  // Initial chat call
  const response = await chat(messages);
  console.log('Initial response:', response);
  console.log('------------------------------------------------------------\n\n')





  
  // Check if the model requested a tool function call
  if (response.message.tool_calls?.length) {
    const tool0 = response.message.tool_calls[0];
    console.log('tool0=', tool0);
    console.log(`Calling: ${tool0.function.name}(${JSON.stringify(tool0.function.arguments)})\n`);

    // Call the tool function <------------------------------------------------------------
    let toolFunctionResult: string = '';
    if (tool0.function.name == "get_weather")
      toolFunctionResult = getWeather(tool0.function.arguments.city)
    else if (tool0.function.name == "get_news")
      toolFunctionResult = getNews(tool0.function.arguments.city, tool0.function.arguments.topic)
    console.log('toolFunctionResult:', toolFunctionResult);
    console.log('------------------------------------------------------------\n\n')

    if (!toolFunctionResult) {
      // No tool response, just return the model's response
      console.log('tool function call didn\'t return a response. Final response:', response.message.content);
    } else {
      // Append tool response and get final answer
      messages.push(response.message);
      messages.push({ role: 'tool', content: toolFunctionResult });

      // Get final response from model
      console.log('Prompt:', messages);
      const final = await chat(messages);
      console.log('With tool\'s response, final response:', final.message.content);
    }
  } else {
    console.log('Model did not ask for tool function call. Final response:', response.message.content);
  }
}

// Mock tool functions
function getWeather(city: string): string {
  console.log(`getWeather(${city}):`)
  return JSON.stringify({ city: city, temperature: 22, unit: 'celsius', condition: 'sunny' });
}
function getNews(city: string, topic: string): string {
  console.log(`getNews(${city}, ${topic}):`)
  return JSON.stringify({
    city: city,
    headline: `${topic} news in ${city}`,
    details: `Details:
On the morning of September 2, President Xi Jinping held talks at the Great Hall of the People in Beijing with Russian President Vladimir Putin,
who is in China for the Shanghai Cooperation Organization Summit 2025 and the commemoration of the 80th anniversary of the victory of
the Chinese People’s War of Resistance Against Japanese Aggression and the World Anti-Fascist War.`});
}

main("Beijing", "politics").catch(console.error);