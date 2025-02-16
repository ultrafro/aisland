// app/api/generate-video/route.ts

import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FALAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body.
    const { prompt, imageUrl } = (await request.json()) as {
      prompt: string;
      imageUrl: string;
    };

    // A container to collect logs as they arrive.
    const logs: string[] = [];

    // Call the Fal.ai subscribe method.
    // Adjust the model/path "fal-ai/kling-video/v1.6/pro/image-to-video" if needed.
    const result = await fal.subscribe(
      "fal-ai/kling-video/v1.6/pro/image-to-video",
      {
        input: {
          prompt,
          image_url: imageUrl,
        },
        logs: true,
        onQueueUpdate: (update) => {
          console.log(update);
          // Capture logs from the subscription process
          if (update.status === "IN_PROGRESS") {
            update.logs
              .map((log) => log.message)
              .forEach((message) => logs.push(message));
          }
        },
      }
    );

    // Return a JSON response with the Fal.ai data, the requestId, and any logs.
    return NextResponse.json({
      data: result.data,
      requestId: result.requestId,
      logs,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Handle errors and return a 500
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
