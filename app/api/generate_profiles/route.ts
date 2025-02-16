import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env["OPENAI_API_KEY"] });

const profilePrompt = `
We’re creating a prototype of a Love Island simulator game, where players can see their AI generated avatars fall in love with other characters. You are a world-class character writer and game designer who is creating well rounded AI character personas based off of an intake form that was patterned off of 36 questions to fall in love.

Here is an example of answered questions:
What is your name?
Andy
What do you do for a living?
I am the CEO of Ramen VR. We are a VC Backed game company that made the smash hit Zenith: The Last City. I’ve spent my career working in tech and product on cutting edge games. My day to day is mostly product management and setting the direction and vision for the company
What do you do for fun:
Video Games, Anime, Cats, Running
What traits are important to you in an ideal partner?
Someone who is down to earth and kind, while being open to adventure. Someone I can trust to be there for me when the going gets tough – and also someone I can go through life laughing with.
What is the greatest accomplishment of your life?
Shipping Zenith to worldwide acclaim and hitting the top of the steam charts
What is your most treasured memory?
Bringing my grey tabby rescue kitten ding ding home for the first time
What is your most terrible memory?
Breaking up with my ex
Describe yourself in 50 words or less.
I am an ambitious tech entrepreneur with a nerdy streak. I love geek culture, especially videogames and anime, and have created a lifestyle for myself that reflects this. I also care a lot about mindfulness and physical fitness. I enjoy pushing myself to the limit – am a marathon runner, and am also practicing martial arts.
What do you do for a living?
I am the CEO of Ramen VR. We are a VC Backed game company that made the smash hit Zenith: The Last City. I’ve spent my career working in tech and product on cutting edge games. My day to day is mostly product management and setting the direction and vision for the company
Sexuality:
Straight
Gender:
Male

Imagine another 5 interesting AI avatars based off of this providing both the questions and answers again, give me the character above plus the 5 characters in JSON form so i can feed that into another prompt, add a field “Generated” which is a bool defining whether this was AI generated or not:
`;

const profileSchema = {
    "name": "profile",
    "strict": true,
    "schema": {
        "type": "object",
        "properties": {
            "profiles": {
                "type": "array",
                "items": { "$ref": "#/$defs/profile" }
            },
        },
        "required": [ "properties" ],
        "additionalProperties": false,
        "$defs": {
            "profile": {
                "type": "object",
                "properties": {
                    "name": { "type": "string" },
                    "occupation": { "type": "string" },
                    "funActivities": { "type": "string" },
                    "idealPartnerTraits": { "type": "string" },
                    "greatestAccomplishment": { "type": "string" },
                    "mostTreasuredMemory": { "type": "string" },
                    "mostTerribleMemory": { "type": "string" },
                    "selfDescription": { "type": "string" },
                    "sexuality": { "type": "string" },
                    "gender": { "type": "string" },
                    "generated": { "type": "boolean" }
                },
                "required": [
                    "name",
                    "occupation",
                    "funActivities",
                    "idealPartnerTraits",
                    "greatestAccomplishment",
                    "mostTreasuredMemory",
                    "mostTerribleMemory",
                    "selfDescription",
                    "sexuality",
                    "gender",
                    "generated"
                ],
                "additionalProperties": false
            }
        }
    }
}

const interestsPrompt = `
We’re creating a prototype of a Love Island simulator game, where players can see their AI generated avatars fall in love with other characters. You are a world-class character writer and game designer who is creating well rounded AI character personas based off of an intake form that was patterned off of 36 questions to fall in love.
Here’s the list of characters, questions, and answers in json form:

{{JSON_PAYLOAD}}

Generate a character sheet for all the characters above. They should be very well-fleshed out and well rounded and JSON formatted. Include these fields only: Likes, Dislikes, History, Name, Personality Traits, Hobbies, Generated. Generated is passed from the previous json to define whether they were AI generated or not. Use the values you have from the previous json only. generate values for the others based on both the input questions and your imagination, keeping them as consistent as possible.

Use only the following personality traits: Adventurous,Romantic,Skeptical,Flirtatious,Independent,Clingy,Ambitious,Lazy,Charming,Blunt,Mysterious,Energetic,Introverted,Extroverted,Jealous,Supportive,Sarcastic,Sensitive,Carefree,Perfectionist,Naïve,Cynical,Playful,Traditional,Quirky,Dominant,Passive,Intellectual,Materialistic,Generous

Give each person 5 personality traits – at least 2 good ones, and 2 bad ones, with one wildcard

Map 5 likes and 5 dislikes as best you can to the following list based on the question answers and your imagination:
"Likes","Dislikes" "Video games","People who steal the spotlight" "Anime","Overly clingy behavior" "Exploring new places","Playing it safe" "Sharing laughs with close friends","Judgmental people" "Creative problem-solving","People who can't admit they're wrong" "Cooking extravagant meals","Picky eaters" "Luxury vacations","Budget travel" "Partying until sunrise","Early sleepers" "Late-night deep talks","Surface-level conversations" "Dramatic reality TV","Documentaries" "Spicy food challenges","Bland meals" "Road trips with no plan","Over-planners" "Collecting cool sneakers","Wearing crocs unironically" "Fitness challenges","Skipping workouts" "Fashion risks","Outdated styles" "Trying new foods","Unadventurous eaters" "Geek culture","Hating on pop culture" "Photography","Selfies only" "Playing chess","Being underestimated" "Camping under the stars","Fear of bugs" "Rock climbing","Fear of heights" "Making DIY crafts","Messy workspaces" "Board games with friends","Losing graciously" "Gardening succulents","Killing plants" "Yoga and mindfulness","Chaotic environments" "Historical documentaries","Reality TV only" "Volunteering","People who don't care about others" "Live music shows","Crowded, disorganized venues" "Spontaneous tattoos","Overthinking everything" "Learning languages","Closed-mindedness" "Collecting vintage items","Minimalism fanatics" "Watching sunsets","Bad weather" "Playing with pets","Dislike for animals" "Celebrating holidays in style","Forgetting important dates" "Building model kits","Breaking things" "Interior design","Plain, boring spaces" "Watching thrillers","Predictable stories" "Stand-up comedy","Overly serious people" "Adventurous dates","Lack of creativity in planning" "Sharing spicy TikToks","Avoiding social media" "Beach volleyball","Cold, rainy weather" "Star-gazing","Bright city lights" "Exploring theme parks","Hating long lines" "Making people laugh","Being too serious" "Collecting memes","Ignoring humor" "Learning about space","Flat-earthers" "Cooking experimental dishes","Plain meals" "Planning surprise parties","Hating surprises" "Late-night karaoke","Bad singers who try too hard" "Winning games","Poor sportsmanship" "Big romantic gestures","Being forgotten" "Creative hobbies","People who don't dream big"
`;

const interestSchema = {
    "name": "interests",
    "strict": true,
    "schema": {
        "type": "object",
        "properties": {
            "interests": {
                "type": "array",
                "items": { "$ref": "#/$defs/interest" }
            },
        },
        "required": [ "interests" ],
        "additionalProperties": false,
        "$defs": {
            "interest": {
                "type": "object",
                "properties": {
                    "generated": { "type": "boolean" },
                    "name": { "type": "string" },
                    "personalityTraits": {
                        "type": "array",
                        "items": { "type": "string" },
                    },
                    "likes": {
                        "type": "array",
                        "items": { "type": "string" },
                    },
                    "dislikes": {
                        "type": "array",
                        "items": { "type": "string" },
                    },
                    "hobbies": {
                        "type": "array",
                        "items": { "type": "string" },
                    },
                    "history": { "type": "string" },
                },
                "required": [
                    "name",
                    "personalityTraits",
                    "likes",
                    "dislikes",
                    "hobbies",
                    "history",
                    "generated"
                ],
                additionalProperties: false
            }
        }
    }
}

const dialogueIntroPrompt = `
We’re creating a prototype of a Love Island simulator game, where players can see their AI generated avatars fall in love with other characters. You are a world-class character writer and game designer who is creating well rounded AI character personas based off of an intake form that was patterned off of 36 questions to fall in love.

Here is a character sheet which clearly defines each character - for the non generated characters I’d like you do do the following:

{{JSON_PAYLOAD}}

I would like you to roleplay each character as realistically as possible in the following output.

Pretend you are on screen for the first time and doing an introduction of yourself in front of the cameras. Do your best to inject personality and be as attention-catching as possible given your persona. You are trying to get as much screen time as possible. Avoid sounding generic or like an AI chatbot at all costs. generate the dialogue, and then create a json array with the character names and the dialogue as two fields so we can join it back in
`;

const dialougeIntroSchema = {
    "name": "dialogueIntro",
    "strict": true,
    "schema": {
        "type": "object",
        "properties": {
            "dialogue": {
                "type": "array",
                "items": { "$ref": "#/$defs/line" }
            },
        },
        "required": [ "properties" ],
        "additionalProperties": false,
        "$defs": {
            "line": {
                "type": "object",
                "properties": {
                    "name": { "type": "string" },
                    "dialogue": { "type": "string" },
                },
                "required": [ "name", "dialogue" ],
                "additionalProperties": false
            }
        }
    }
}

async function GetJson(prompt: string, schema: any) : Promise<string> {
    const model = {
        service: "openai",
        version: "gpt-4o",
    };

    const completion = await openai.chat.completions.create({
        messages: [ { role: "system", content: prompt } ],
        model: model["version"] || "gpt-4o-mini",
        response_format: { type: "json_schema", json_schema: schema },
        temperature: 0.5,
    });

    return completion.choices[0]?.message?.content || "{}";
}

export async function POST(req: NextRequest) {
    let profileJson = await GetJson(profilePrompt, profileSchema);
    let profiles : Array<Record<string, any>> = <any>JSON.stringify(profileJson);
    
    let interestJson = await GetJson(interestsPrompt.replace('{{JSON_PAYLOAD}}', profileJson), interestSchema);
    let interests: Array<Record<string, any>> = <any>JSON.stringify(interestJson);

    let fullProfiles = [];

    for (let profile of profiles) {
        let foundInterest : null | any = null;
        
        for (let interest of interests) {
            if (profile["name"] === interest["name"]) {
                foundInterest = interest;
                break;
            }
        }

        if (foundInterest != null) {
            fullProfiles.push({...profile, ...foundInterest});
        }
        else {
            fullProfiles.push(profile);
        }
    }

    let introDialogueJson = await GetJson(dialogueIntroPrompt.replace("{{JSON_PAYLOAD}}", JSON.stringify(fullProfiles, null, 2)), dialougeIntroSchema);
    let introDialogue : Array<Record<string, any>> = <any>JSON.stringify(introDialogueJson);

    return NextResponse.json(
        { result: {profiles: fullProfiles, introDialogue: introDialogue } },
        { status: 200 }
    );
}