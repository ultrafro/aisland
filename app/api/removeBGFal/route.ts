import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FALAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { img } = (await req.json()) as {
    img: string;
  };

  const result = await fal.subscribe("fal-ai/imageutils/rembg", {
    input: {
      image_url: img,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        update.logs.map((log) => log.message).forEach(console.log);
      }
    },
  });

  return NextResponse.json({ result: result.data.image.url });
}
