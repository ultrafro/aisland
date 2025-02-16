import { NextResponse } from "next/server";

// If you're storing your API key in an environment variable, do something like:
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "<YOUR_API_KEY>";

// Replace <VOICE_ID> with one of your voice IDs from ElevenLabs
const ELEVENLABS_VOICE_ID = "nPczCjzI2devNBz1zQrb";

// Example endpoint from ElevenLabs docs:
// POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
const ELEVENLABS_URL = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`;

export async function POST(request: Request) {
  try {
    // Parse the incoming JSON for the text
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided." }, { status: 400 });
    }

    // Make request to ElevenLabs
    const response = await fetch(ELEVENLABS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        // Optional voice settings
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json(
        { error: `ElevenLabs API error: ${errorBody}` },
        { status: response.status }
      );
    }

    // The response.body is a ReadableStream with the mp3 data
    // We pipe it directly back to the client
    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        // Optional: set a filename on the returned audio
        "Content-Disposition": "inline; filename=voice.mp3",
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error generating speech:", error);
    return NextResponse.json(
      { error: "An error occurred while generating speech." },
      { status: 500 }
    );
  }
}
