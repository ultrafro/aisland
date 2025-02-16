// app/api/generate-video/route.ts

import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FALAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body.
    const { requestId } = (await request.json()) as {
      requestId: string;
    };

    // Call the Fal.ai subscribe method.
    // Adjust the model/path "fal-ai/kling-video/v1.6/pro/image-to-video" if needed.
    const result = await fal.queue.result(
      "fal-ai/kling-video/v1.6/pro/image-to-video",
      {
        requestId: requestId,
      }
    );

    // Return a JSON response with the Fal.ai data, the requestId, and any logs.
    return NextResponse.json({
      data: result.data,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Handle errors and return a 500
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
