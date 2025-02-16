import { useCallback, useEffect, useState } from "react";
import { FlexCol, UIButton } from "./UILibrary";

export default function KlingTest() {
  const [status, setStatus] = useState<string>("");
  const [requestId, setRequestId] = useState<string>("");
  const [final, setFinal] = useState<string>("");

  async function makeRequest() {
    setRequestId("c8a3ec9f-1cd8-433b-ae76-f5a56469bb46");
    return;

    //make posst request to /api/kling
    const response = await fetch("/api/makeKlingRequest", {
      method: "POST",
      body: JSON.stringify({
        prompt: "man doing an interview",
        imageUrl: "https://aisland.vercel.app/andybg.JPG",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    const { requestId } = data;
    setRequestId(requestId);
  }

  const fetchResult = useCallback(async function (rid: string) {
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
    const result = response2.data.video.url;
    setFinal(result);
  }, []);

  const checkStatus = useCallback(
    async function (rid: string) {
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
      setStatus(status.status + " " + Date.now());

      if (status.status === "COMPLETED") {
        fetchResult(rid);
        setRequestId("");
      }
    },
    [fetchResult]
  );

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (requestId) {
      checkStatus(requestId);
      interval = setInterval(() => {
        checkStatus(requestId);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [checkStatus, requestId]);

  return (
    <FlexCol>
      <UIButton onClick={makeRequest}>Generate Video</UIButton>
      <p>Status {status}</p>
      {final && (
        <video
          src={final}
          controls
          muted={true}
          autoPlay
          className="w-[200px]"
        ></video>
      )}
    </FlexCol>
  );
}
