import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const runtime = "edge";

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: Message[] } = await req.json();
    const start = Date.now();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: messages,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream, {
      headers: {
        "X-LLM-Start": `${start}`,
        "X-LLM-Response": `${Date.now()}`,
      },
    });
  } catch (error) {
    console.error("Error generating response", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
