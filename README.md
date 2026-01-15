# FunctionGemmaLab

For information on Google's FunctionGemma, refer:
- https://github.com/google-deepmind/gemma
- https://ollama.com/library/functiongemma
- https://github.com/google-gemini/gemma-cookbook/blob/main/FunctionGemma/%5BFunctionGemma%5DFinetune_FunctionGemma_270M_for_Mobile_Actions_with_Hugging_Face.ipynb

## Prepare models
```shell
ollama pull functiongemma:270m
```
Run Ollama

## How to run

### Typescript
```shell
npm install
npm run tool

# Test runs
npm run tool news beijing
npm run tool weather beijing
```

### Python
Try FunctionGemma, notes from https://www.youtube.com/watch?v=-Tgc_9uYJLI&t=4s
For Python
```shell
# https://docs.astral.sh/uv/getting-started/installation/
curl -LsSf https://astral.sh/uv/install.sh | sh

uv run python rcbentch/run_all_tests.py --suite functiongemma_270m_tuning_v1
```
