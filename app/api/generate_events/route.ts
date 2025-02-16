/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env["OPENAI_API_KEY"] });

const eventsPrompt = `
We’re creating a prototype of a Love Island simulator game, where players can see their AI generated avatars fall in love with other characters. You are a world-class character writer and game designer who is creating well rounded AI character personas based off of an intake form that was patterned off of 36 questions to fall in love.

Here are 5 detailed prompt descriptions for generating realistic scenes within Pika or Sora for Love Island:
1. The Living Room "An open-concept modern living room in a luxurious villa with large glass sliding doors opening to a sunlit patio. The room features plush sectional sofas with colorful throw pillows, a sleek coffee table with magazines and tropical fruit bowls, and a large flat-screen TV mounted on the wall. Bright natural light floods the space, complemented by warm wooden accents and a hint of ocean breeze coming through the doors. Tropical plants in decorative pots are scattered around for a vibrant yet cozy atmosphere. The setting exudes comfort and style, perfect for group conversations or playful drama."
2. The Beach "A pristine white-sand beach stretching to the horizon, with crystal-clear turquoise waves gently lapping the shore under a golden sunset sky. A few scattered wooden loungers and umbrellas offer shaded seating, while palm trees sway in the warm, salty breeze. Couples can be seen walking barefoot along the shoreline or chatting in the shallow waters. Nearby, a bonfire setup with logs and cushions creates a romantic focal point. Seashells and footprints dot the sand, and a small wooden bar in the distance serves colorful tropical drinks. The atmosphere is tranquil, yet alive with the anticipation of summer romance."
3. Their Bedroom "A chic, intimate bedroom with a minimalist yet luxurious design, featuring two neatly made double beds with crisp white linens and colorful accent throws. A large floor-to-ceiling window offers a breathtaking view of the villa's pool and the ocean beyond. Personal touches like framed photos, open suitcases, and small trinkets are scattered on a sleek wooden dresser. Soft, ambient lighting from bedside lamps and string lights adds a romantic, cozy glow. The walls are adorned with tasteful modern art, and a ceiling fan spins lazily above, keeping the room cool and inviting."
4. The Pool "A stunning infinity pool with sparkling azure water reflecting the sun, set against the backdrop of a lush tropical garden and panoramic ocean views. A row of stylish lounge chairs with white cushions and colorful towels lines the poolside, while a modern cabana offers shade with billowing white curtains. Small groups of people relax with drinks or splash playfully in the shallow end. A floating drink tray with cocktails and fresh fruit adds a touch of luxury. The sound of gentle music plays from hidden speakers, mingling with the laughter and clinking of glasses. The atmosphere is vibrant yet serene, perfect for mingling or private chats."
5. At The Campfire "A cozy campfire scene set on a quiet section of the beach under a starry night sky. The flames crackle warmly, casting a golden glow on the faces of people sitting on large driftwood logs or cushioned blankets arranged in a circle. Small fairy lights are strung on nearby palm trees, adding a magical ambiance. A few drinks and snacks are set on a nearby rustic wooden crate turned into a makeshift table. The sound of waves crashing gently in the background blends with lighthearted laughter and the occasional deep, intimate conversation. The atmosphere feels both relaxed and emotionally charged, perfect for confessions and bonding moments."

There are 3 times of day: Morning, Noon, and at Night

Here are the characters that are on love island:
{{JSON_PAYLOAD}}

Based on the characters above – take the human (non-generated) characters above and simulate their interactions with both generated and other human characters on the island for one week, through a mixture of dialogue, interaction, and location
Think through this in steps and out loud Based on the above output – give me a JSON output with these fields, character name as the primary key with an array of: [love interest, moment they fell in love, why they fell in love], an array of [enemy, moment they started hating them, reason for hating them] Maximize drama – be descriptive and succinct for each of these Now it is the second week – based off of the bonds these characters have built, I’d like you to build 3 major events for me – a major romantic moment between each human character and another character, a gossip session between a human character and another character, and finally, a big fight, either verbal or physical between the human character and another character. I would like you to imagine 3 separate scenes between potential love interests and enemies happening at the locations i described above and provide two outputs Generate the full script dialogue between each of the characters for each of the events that I could pass into eleven labs. It is important you do not abbreviate or try to reduce the token length. Here are some tones you can emulate depending on how they are feeling: 1. Angry Tone: json Copy Edit { "stability": 0.3, "similarity_boost": 0.8, "style": 0.5 } Explanation: Lower stability introduces variability to convey anger. A moderate similarity boost maintains the original voice's characteristics, while a higher style value enhances expressiveness. 2. Normal Tone: json Copy Edit { "stability": 0.75, "similarity_boost": 0.75, "style": 0 } Explanation: Balanced settings provide a neutral, steady delivery without exaggerated expressiveness. 3. Happy Tone: json Copy Edit { "stability": 0.4, "similarity_boost": 0.85, "style": 0.6 } Explanation: Lower stability allows for a more lively tone. A higher similarity boost retains the original voice's warmth, and an increased style value adds cheerfulness. 4. Excited Tone: json Copy Edit { "stability": 0.2, "similarity_boost": 0.9, "style": 0.7 } Explanation: Minimal stability introduces significant variability to express excitement. A high similarity boost keeps the voice recognizable, and a heightened style value amplifies enthusiasm. 5. Sensual Tone: json Copy Edit { "stability": 0.5, "similarity_boost": 0.8, "style": 0.5 } Explanation: Moderate stability and similarity boost provide a smooth delivery, while a mid-range style value adds a subtle, alluring quality. Take into account each characters personality – while emphasizing drama. Remember, this is a reality TV show and ratings are everything. At the same time, generate video prompts using the pregenerated environment prompts above, while adding the characters and what they are doing in the dialogue, into Pika or Sora, maximizing drama and consistency as the prompt. Incorporate this data into the previous character name JSON, nested under a new EVENT object. The Event Object has two sub objects – the SCENE_DESCRIPTION to be fed into Pika or Sora and the DIALOGUE to be fed into Eleven Labs, which includes, split by character persona – with a tone in each line. Do not abbreviate this. It is critical that you give me the full JSON. Finally it has a string which defines which event it is (Love, Fight, or Gossip) The final output structure should look like this, but with the script you imagined above STRUCTURE OF FINAL OUTPUT: { "name": "GENERATED OUTPUT", "status": { "love_interests": [ { "name": "GENERATED OUTPUT", "moment": "GENERATED OUTPUT", "reason": "GENERATED OUTPUT" } ], "enemies": [ { "name": "GENERATED OUTPUT", "moment": "GENERATED OUTPUT", "reason": "GENERATED OUTPUT" } ], "EVENTS": [ { "event_type": "GENERATED OUTPUT", "scene_description": "GENERATED OUTPUT", "dialogue": [ { "name": "GENERATED OUTPUT", "lines": [ { "line": "GENERATED OUTPUT", "tone": "GENERATED OUTPUT" }, { "line": "GENERATED OUTPUT", "tone": "GENERATED OUTPUT" } ] }, { "name": "GENERATED OUTPUT", "lines": [ { "line": "GENERATED OUTPUT", "tone": "GENERATED OUTPUT" }, { "line": "GENERATED OUTPUT", "tone": "GENERATED OUTPUT" } ] } ] } ] } }
`;

const eventSchema = {
  name: "events",
  strict: true,
  schema: {
    type: "object",
    properties: {
      scene_planning_and_breakdown: {
        type: "array",
        items: { type: "string" },
      },
      characters: {
        type: "array",
        items: { $ref: "#/$defs/character" },
      },
    },
    $defs: {
      character: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          status: {
            type: "object",
            properties: {
              love_interests: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    moment: { type: "string" },
                    reason: { type: "string" },
                  },
                  required: ["name", "moment", "reason"],
                  additionalProperties: false,
                },
              },
              enemies: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    moment: { type: "string" },
                    reason: { type: "string" },
                  },
                  required: ["name", "moment", "reason"],
                  additionalProperties: false,
                },
              },
              EVENTS: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    event_type: { type: "string" },
                    scene_description: { type: "string" },
                    dialogue: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          lines: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                line: { type: "string" },
                                tone: { type: "string" },
                              },
                              required: ["line", "tone"],
                              additionalProperties: false,
                            },
                          },
                        },
                        required: ["name", "lines"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["event_type", "scene_description", "dialogue"],
                  additionalProperties: false,
                },
              },
            },
            required: ["love_interests", "enemies", "EVENTS"],
            additionalProperties: false,
          },
        },
        required: ["name", "status"],
        additionalProperties: false,
      },
    },
  },
};

async function GetJson(prompt: string, schema: any): Promise<string> {
  const model = {
    service: "openai",
    version: "gpt-4o",
  };

  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: prompt }],
    model: model["version"] || "gpt-4o-mini",
    response_format: { type: "json_schema", json_schema: schema },
    temperature: 0.5,
  });

  return completion.choices[0]?.message?.content || "{}";
}

export async function POST(req: NextRequest) {
  const requestJSON = await req.json();
  var profiles = JSON.stringify(requestJSON["profiles"]);

  let eventsJson = await GetJson(
    eventsPrompt.replace("{{JSON_PAYLOAD}}", profiles),
    eventSchema
  );
  let characters = JSON.parse(eventsJson).characters;

  return NextResponse.json({ result: characters }, { status: 200 });
}
