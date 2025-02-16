"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
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
import { get } from "http";

export default function Home() {
  // State for uploaded image
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string>("");

  const [requests, setRequests] = useState<Record<string, Asset>>({});

  const [visible, setVisible] = useState(false);

  // State for questions
  const [answers, setAnswers] = useState<string[]>(Array(20).fill(""));

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

  /**
   * Handle question changes
   */
  const handleAnswerChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = e.target.value;
    setAnswers(updatedAnswers);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // You can add custom logic here, e.g. sending data to an API
    alert("Form submitted. Integrate your AI logic here!");
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

  const audioref = React.useRef<HTMLAudioElement>(null);

  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
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
        {/* <UIButton onClick={onGenerateVideoKling}>Generate Video</UIButton> */}

        <KlingTest />

        <UIButton
          onClick={() => {
            setVisible(!visible);
          }}
        >
          View Requests
        </UIButton>
        <audio ref={audioref} />

        {visible && <Requests requests={requests} />}

        <UIButton onClick={start}>Start</UIButton>

        <h1>AI-Powered Love Game Show</h1>
        <p>Upload a photo and answer 20 questions!</p>

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

        {/* 20 Questions Form */}
        <form onSubmit={handleSubmit}>
          <FlexCol className="h-[200px] overflow-y-auto">
            {answers.map((answer, index) => (
              <div key={index} style={{ margin: "0.5rem 0" }}>
                <label
                  htmlFor={`question-${index}`}
                  style={{ display: "block", marginBottom: "0.3rem" }}
                >
                  Question {index + 1}
                </label>
                <input
                  id={`question-${index}`}
                  type="text"
                  value={answer}
                  onChange={(e) => handleAnswerChange(e, index)}
                  style={{ width: "100%", padding: "0.5rem" }}
                  required
                />
              </div>
            ))}
          </FlexCol>
          <button
            type="submit"
            style={{
              marginTop: "1rem",
              padding: "0.7rem 1.2rem",
              border: "none",
              background: "#ff69b4",
              color: "#fff",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
