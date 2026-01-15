#!/usr/bin/env bash

curl -X POST http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
  "model":"gpt-oss:20b",
  "messages":[
    {
      "role":"user",
      "content": "What is the capital of France?"
    }
  ],
  "tools":[
      {"type":"function","function":{"name":"get_weather","description":"Get the current weather for a city.",      "parameters":{"type":"object","properties":{"city":{"type":"string","description":"The name of the city"}},"required":["city"]}}},
      {"type":"function","function":{"name":"get_news",   "description":"Get the current news happening in a city.","parameters":{"type":"object","properties":{"city":{"type":"string","description":"The name of the city"},"topic":{"type":"string","description":"The topic of the news"}},"required":["city"]}}}
  ],
  "stream":false}
  ' \
  | jq '.'









# Output example
: << 'EOF'
  ➜  FunctionGemmaLab git:(main) ✗ ./scripts/chat1.sh
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  1257  100   543  100   714    122    161  0:00:04  0:00:04 --:--:--   284
{
  "model": "gpt-oss:20b",
  "created_at": "2025-12-21T05:51:46.570193Z",
  "message": {
    "role": "assistant",
    "content": "",
    "thinking": "The user wants news on politics in Beijing. The tool get_news can fetch current news. We'll call that.",
    "tool_calls": [
      {
        "id": "call_4qipwd2b",
        "function": {
          "index": 0,
          "name": "get_news",
          "arguments": {
            "city": "Beijing",
            "topic": "politics"
          }
        }
      }
    ]
  },
  "done": true,
  "done_reason": "stop",
  "total_duration": 4420446334,
  "load_duration": 118108959,
  "prompt_eval_count": 185,
  "prompt_eval_duration": 3251397500,
  "eval_count": 52,
  "eval_duration": 1035306418
}
EOF
