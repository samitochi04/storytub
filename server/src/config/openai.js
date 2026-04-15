import OpenAI from "openai";
import env from "./env.js";

const openai = new OpenAI({ apiKey: env.openaiApiKey });

export default openai;
