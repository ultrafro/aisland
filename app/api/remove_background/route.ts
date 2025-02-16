import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const imageFile = formData.get("file") as unknown as File | null;

  if (imageFile == null) {
    return NextResponse.json({ error: "Missing image file" }, { status: 300 });
  }

  console.log(imageFile);

  formData.set(
    "data",
    JSON.stringify({
      operations: {
        background: {
          remove: true,
        },
      },
      output: {
        format: "png",
      },
    })
  );

  const response = await fetch(
    "https://api.claid.ai/v1-beta1/image/edit/upload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env["CLAID_API_KEY"]}`,
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    }
  );

  if (response.status > 299) {
    return NextResponse.json(
      { error: "Error Processing File" },
      { status: 300 }
    );
  }

  const result = await response.json();

  return NextResponse.json(
    { result: result["data"]["output"]["tmp_url"] },
    { status: 200 }
  );
}
