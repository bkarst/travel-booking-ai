import "dotenv/config";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import axios from "axios";
const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, PORT } = process.env;

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

export async function POST(req: Request) {
  const incoming = "How are you?";
  console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));


  const { entry } = await req.json();

  const message = entry?.[0]?.changes[0]?.value?.messages?.[0];

  console.log('message', message?.type)

    


  if (message?.type === "text") {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: message.text.body }],
      model: 'gpt-3.5-turbo',
    });
    // extract the business number to send the reply from it
    const business_phone_number_id =
      entry?.[0].changes?.[0].value?.metadata?.phone_number_id;

    console.log('business_phone_number_id', business_phone_number_id)

    // send a reply message as per the docs here https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
      },
      data: {
        messaging_product: "whatsapp",
        to: message.from,
        text: { body: chatCompletion.choices[0].message.content },
        // context: {
        //   message_id: message.id, // shows the message as a reply to the original user message
        // },
      },
    });

    // mark incoming message as read
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
      },
      data: {
        messaging_product: "whatsapp",
        status: "read",
        message_id: message.id,
      },
    });
  }

  return NextResponse.json(
    {
      response: "chatCompletion.choices[0].message.content",
    },
    {
      status: 200,
    }
  );
}

export async function GET(req: Request) {
  // console.log(req)
  const url = new URL(req.url);

  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  // const mode = req.query["hub.mode"];
  // const token = req.query["hub.verify_token"];
  // const challenge = req.query["hub.challenge"];

  // check the mode and token sent are correct
  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    // respond with 200 OK and challenge token from the request
    //   res.status(200).send(challenge);
    //   console.log("Webhook verified successfully!");
    const trialEndResponse = new NextResponse(challenge)
    return trialEndResponse
    return NextResponse.json(
      {
        
      },
      {
        status: 200,
      }
    );
  } else {
    // respond with '403 Forbidden' if verify tokens do not match
    return NextResponse.json(
      {
        response: "chatCompletion.choices[0].message.content,",
      },
      {
        status: 402,
      }
    );
  }

}
