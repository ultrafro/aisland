"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { FlexCol, UIButton } from "./UILibrary";
import KlingTest from "./KlingTest";
import { Asset } from "./island.model";
import Requests from "./Requests";
import {
  convertToDataURL,
  getAudio,
  getPhotoRemoved,
  getPhotoReplaced,
  uploadToGCS,
} from "./requestFunctions";
import { nanoid } from "nanoid";

export default function Home() {
  const [stage, setStage] = useState<
    "photo" | "question" | "video" | "personal"
  >("photo");
  const [answers, setAnswers] = useState<string>("");

  // State for uploaded image
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string>("");
  const [requests, setRequests] = useState<Record<string, Asset>>({});
  const [finalPersonalVideo, setFinalPersonalVideo] = useState<string>("");
  const [finalPersonalAudio, setFinalPersonalAudio] = useState<string>("");

  /**
   * Handle image upload
   */
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setImageFile(null);
      setPreviewURL("");
      return;
    }

    const file = e.target.files[0];
    setImageFile(file);
    setPreviewURL(URL.createObjectURL(file));
  };

  const start = async () => {
    const text = "Hey I'm Andy and I'm looking for love!";

    //get photo datastring from file
    const photo = await convertToDataURL(imageFile as File);

    // const uploadedImage = await uploadToGCS(
    //   photo,
    //   "love-game-show",
    //   "photo.png"
    // );

    const removed = await getPhotoRemoved(photo);

    const combined = await getPhotoReplaced(removed, "/bg.PNG");

    //upload combined to gcs

    const uploadedImage = await uploadToGCS(
      combined,
      "love-game-show",
      "photo.png"
    );

    //get request id
    const rid = "c8a3ec9f-1cd8-433b-ae76-f5a56469bb46";
    // let rid = await fetch("/api/makeKlingRequest", {
    //   method: "POST",
    //   body: JSON.stringify({
    //     prompt: "man doing an interview",
    //     imageUrl: uploadedImage,
    //   }),
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });

    await new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        const response = await fetch("/api/checkKllingRquest", {
          method: "POST",
          body: JSON.stringify({
            requestId: rid,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        const { status } = data;

        console.log("Status:", status);
        // setStatus(status.status + " " + Date.now());

        if (status.status === "COMPLETED") {
          // fetchResult(rid);
          // setRequestId("");
          clearInterval(interval);
          resolve();
        }
      }, 5000);
    });

    //get final video
    const response = await fetch("/api/fetchKlingResult", {
      method: "POST",
      body: JSON.stringify({
        requestId: rid,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response2 = await response.json();
    const videoResult = response2.data.video.url;

    console.log("videoResult", videoResult);

    const audio = await getAudio(text);
    audioref.current?.setAttribute("src", audio);
    audioref.current?.play();
    console.log("audio", audio);

    const newAsset: Asset = {
      id: nanoid(),
      introVideo: videoResult,
      introVideoLoading: false,
      photo: photo,
      photoBGreplced: uploadedImage,
      photoBGreplcedLoading: false,
      introAudio: "",
      introAudioLoading: false,
    };

    setRequests({ ...requests, [newAsset.id]: newAsset });

    // get initial script
    // get initial audio
    // get photo with bg removed
    // get photo with replaced bg
    // get video
  };

  const doRest = async (intro: string) => {
    //get photo datastring from file
    const photo = await convertToDataURL(imageFile as File);

    // const uploadedImage = await uploadToGCS(
    //   photo,
    //   "love-game-show",
    //   "photo.png"
    // );

    const removed = await getPhotoRemoved(photo);

    const combined = await getPhotoReplaced(removed, "/bg.PNG");

    //upload combined to gcs

    const uploadedImage = await uploadToGCS(
      combined,
      "love-game-show",
      "photo.png"
    );

    console.log("uploadedImage", uploadedImage);

    //get request id
    //const rid = "c8a3ec9f-1cd8-433b-ae76-f5a56469bb46";
    const rid = await fetch("/api/makeKlingRequest", {
      method: "POST",
      body: JSON.stringify({
        prompt: "man doing an interview",
        imageUrl: uploadedImage,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    await new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        const response = await fetch("/api/checkKllingRquest", {
          method: "POST",
          body: JSON.stringify({
            requestId: rid,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("data", data);
        const { status } = data;

        console.log("Status:", status);
        // setStatus(status.status + " " + Date.now());

        if (status.status === "COMPLETED") {
          // fetchResult(rid);
          // setRequestId("");
          clearInterval(interval);
          resolve();
        }
      }, 500);
    });

    //get final video
    const response = await fetch("/api/fetchKlingResult", {
      method: "POST",
      body: JSON.stringify({
        requestId: rid,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response2 = await response.json();
    const videoResult = response2.data.video.url;

    console.log("videoResult", videoResult);

    const audio = await getAudio(intro);
    console.log("audio", audio);

    setFinalPersonalAudio(audio);
    setFinalPersonalVideo(videoResult);
  };

  const audioref = React.useRef<HTMLAudioElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (stage === "personal" && !!finalPersonalVideo && !!finalPersonalAudio) {
      setTimeout(() => {
        videoRef.current?.setAttribute("src", finalPersonalVideo);
        videoRef.current?.play();

        audioref.current?.setAttribute("src", finalPersonalAudio);
        audioref.current?.play();
      }, 1000);
    }
  }, [stage, finalPersonalVideo, finalPersonalAudio]);

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* Full-screen intro video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      >
        <source
          src="https://www.w3schools.com/html/mov_bbb.mp4" // Replace with your game show intro video
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* Overlay content */}
      <div
        style={{
          position: "relative",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflowY: "auto",
          backgroundColor: "rgba(0,0,0,0.5)", // semi-transparent overlay
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "2rem",
        }}
      >
        {stage === "photo" && (
          <FlexCol className="w-full h-full">
            <h1>Upload Your Photo</h1>

            {/* Image Upload Preview */}
            <div style={{ margin: "1rem 0" }}>
              <label
                style={{
                  cursor: "pointer",
                  background: "#fff",
                  color: "#000",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                }}
              >
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>
            {previewURL && (
              <div style={{ marginBottom: "1rem" }}>
                <img
                  src={previewURL}
                  alt="preview"
                  style={{ width: 200, height: "auto", borderRadius: "4px" }}
                />
              </div>
            )}

            <UIButton
              onClick={() => {
                setStage("question");
              }}
            >
              Next
            </UIButton>
          </FlexCol>
        )}

        {stage === "question" && (
          <FlexCol className="w-full h-full">
            <h1>Answer 20 Questions</h1>
            <textarea
              value={answers}
              onChange={(e) => setAnswers(e.target.value)}
              style={{ width: "100%", height: "200px", color: "black" }}
            />

            <UIButton
              onClick={async () => {
                //fetch from generated_profiles
                const response = await fetch("/api/generate_profiles", {
                  method: "POST",
                  body: JSON.stringify({
                    questionaire: answers,
                  }),
                  headers: {
                    "Content-Type": "application/json",
                  },
                });

                const data = await response.json();
                console.log("data", data);

                const intro = data.result.introDialogue.dialogue[0].dialogue;
                const name = data.result.introDialogue.dialogue[0].name;

                console.log("intro", intro);
                console.log("name", name);

                setStage("video");

                doRest(intro);
              }}
            >
              Next
            </UIButton>
          </FlexCol>
        )}

        {stage === "video" && (
          <FlexCol className="w-full h-full">
            <video
              className="w-[800px]"
              src={"/full.mp4"}
              ref={videoRef}
              muted={false}
              autoPlay
              controls
              onEnded={() => {
                setStage("personal");
              }}
            />
          </FlexCol>
        )}

        {stage === "personal" && (
          <FlexCol className="w-full h-full">
            <h1>Personal Video</h1>
            <video
              className="w-[800px]"
              ref={videoRef}
              muted={true}
              autoPlay={false}
              loop={true}
            />
            {!finalPersonalVideo && !finalPersonalAudio && <p>Loading...</p>}
          </FlexCol>
        )}

        <audio ref={audioref} />
      </div>
    </div>
  );
}
