import OpenAI from "openai";
import env from "./env.js";

const openai = new OpenAI({
  apiKey: env.openaiApiKey || "ollama",
  baseURL: env.openaiBaseUrl,
});

export default openai;
