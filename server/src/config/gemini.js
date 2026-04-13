import { GoogleGenerativeAI } from "@google/generative-ai";
import env from "./env.js";

const genAI = new GoogleGenerativeAI(env.geminiApiKey);

const gemini = genAI.getGenerativeModel({ model: env.geminiModel });

export default gemini;
