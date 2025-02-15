/* eslint-disable @typescript-eslint/no-explicit-any */
export async function generateVideo(
  token: string,
  requestBody: GenerateVideoRequestBody
): Promise<any> {
  const response = await fetch("https://api.pikapikapika.io/web/generate", {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    // Optionally handle HTTP errors
    const errorText = await response.text();
    throw new Error(
      `Request failed with status ${response.status}: ${errorText}`
    );
  }

  // The server should return JSON. Adjust the return type or parse strategy if needed.
  const data = await response.json();
  return data;
}

// model can be '1.0', '1.5', '2.0', '2.1', 'Turbo'
type ModelType = "1.0" | "1.5" | "2.0" | "2.1" | "Turbo";

// For model 1.5 only
type PikaffectType =
  | "Peel"
  | "Poke"
  | "Tear"
  | "Levitate"
  | "Decapitate"
  | "Eye-pop"
  | "Inflate"
  | "Melt"
  | "Explode"
  | "Squish"
  | "Crush"
  | "Cake-ify"
  | "Ta-da"
  | "Deflate"
  | "Crumble"
  | "Dissolve"
  | "Hearts Bouquet"
  | "Proposal"
  | "Love Bomb"
  | "Cupid Strike"
  | "Rose"
  | "Crazy in Love";

// For model 2.0 only
type IngredientsMode = "precise" | "creative";

interface CameraOptions {
  rotate: number | null;
  zoom: number | null;
  tilt: number | null;
  pan: number | null;
}

interface ParametersOptions {
  guidanceScale: number;
  motion: number;
  negativePrompt: string;
  seed: number | null;
}

interface VideoOptions {
  aspectRatio: string; // e.g. "16:9"
  frameRate: number; // e.g. 24
  camera: CameraOptions;
  parameters: ParametersOptions;
  extend: boolean;
}

export interface GenerateVideoRequestBody {
  promptText?: string;
  model?: ModelType; // defaults to "1.0" if omitted
  pikaffect?: PikaffectType; // model 1.5 only
  ingredientsMode?: IngredientsMode; // model 2.0 only
  ingredients?: string[]; // model 2.0 only (array of URLs)
  video?: string; // required for Turbo, optional otherwise (.mp4 URL)
  image?: string; // required for Turbo if no video, optional otherwise
  sfx?: boolean; // model 1.0 only
  style?:
    | "Anime"
    | "Moody"
    | "3D"
    | "Watercolor"
    | "Natural"
    | "Claymation"
    | "Black & white"; // model 1.0 only
  ref?: string; // custom reference
  webhookOverride?: string; // override the default webhook
  options: VideoOptions; // required
}
