import "dotenv/config";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import axios from "axios";
const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, PORT } = process.env;

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"] || "fasdfasdfasdf", // This is the default and can be omitted
});

export async function GET(req: Request) {
  const incoming = "How are you?";


    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: incoming }],
      model: 'gpt-3.5-turbo',
    });

    const response2:any = chatCompletion.choices[0].message.content
    console.log('response', response2)
    
  return NextResponse.json(
    {
        response: response2.toString()
    },
    {
      status: 200,
    }
  );
}

