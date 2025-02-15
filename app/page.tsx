"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { FlexCol, UIButton } from "./UILibrary";
import { generateVideo, GenerateVideoRequestBody } from "./generateVideoPika";

export default function Home() {
  // State for uploaded image
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string>("");

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

  const onGenerateVideo = async () => {
    const token = "4742b7d4-ad2e-4296-9328-24bcb027c1ef";

    // For model 1.0
    const requestBody: GenerateVideoRequestBody = {
      promptText: "robed villain lurking the streets",
      model: "1.0", // or omit if the default is 1.0
      image: "https://example.image/1234-a186-53c4c6171ab5/image.jpg",
      sfx: true,
      style: "Anime",
      options: {
        aspectRatio: "16:9",
        frameRate: 24,
        camera: {
          rotate: null,
          zoom: null,
          tilt: null,
          pan: null,
        },
        parameters: {
          guidanceScale: 12,
          motion: 1,
          negativePrompt: "",
          seed: null,
        },
        extend: false,
      },
    };

    const result = await generateVideo(token, requestBody);
    console.log("Video generation response:", result);
  };

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
        <UIButton onClick={onGenerateVideo}>Generate Video</UIButton>

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
