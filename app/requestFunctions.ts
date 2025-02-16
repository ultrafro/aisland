import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/database";
import "firebase/compat/storage";
import { nanoid } from "nanoid";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUufaP4YVEZogc2-8g6HAS8SMyRStxO80",
  authDomain: "jetmouse-52a3e.firebaseapp.com",
  databaseURL: "https://jetmouse-52a3e.firebaseio.com",
  projectId: "jetmouse-52a3e",
  storageBucket: "jetmouse-52a3e.appspot.com",
  messagingSenderId: "818018271769",
  appId: "1:818018271769:web:844b56d736cfbcb0d4a088",
  measurementId: "G-96W3K45YC6",
};
// const app = initializeApp(firebaseConfig);

// const db = getFirestore(app);

// // Get a list of cities from your database
// async function getCities(db) {
//   const citiesCol = collection(db, "cities");
//   const citySnapshot = await getDocs(citiesCol);
//   const cityList = citySnapshot.docs.map((doc) => doc.data());
//   return cityList;
// }

firebase.initializeApp(firebaseConfig);
//firebase.analytics();
export const storage = firebase.storage();

export async function getPhotoRemoved(photo: string): Promise<string> {
  const gcsUrl = await uploadToGCS(
    photo,
    "love-game-show",
    "photo" + nanoid() + ".png"
  );

  // 4. Send the FormData to your Next.js route (adjust the path if needed)
  const response = await fetch("/api/removeBGFal", {
    method: "POST",
    body: JSON.stringify({
      img: gcsUrl,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  // 5. Handle the response from the Next.js route
  const result = await response.json();

  return result.result;
}
export async function getPhotoReplaced(
  photo: string,
  newBG: string
): Promise<string> {
  const final = await new Promise((resolve, reject) => {
    const photoImg = new Image();
    const bgImg = new Image();

    photoImg.crossOrigin = "anonymous";
    bgImg.crossOrigin = "anonymous";

    // Uncomment if needed for cross-domain images
    // photoImg.crossOrigin = 'anonymous';
    // bgImg.crossOrigin = 'anonymous';

    let imagesLoaded = 0;

    const onLoad = () => {
      imagesLoaded++;
      if (imagesLoaded === 2) {
        // Create a canvas that matches the background's size
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = bgImg.width;
        canvas.height = bgImg.height;

        // 1) Draw the background at its original size
        ctx.drawImage(bgImg, 0, 0);

        // 2) Scale and center the photo so it fits inside the background
        const bgWidth = bgImg.width;
        const bgHeight = bgImg.height;

        const photoWidth = photoImg.width;
        const photoHeight = photoImg.height;

        // Figure out the scaling factor so the photo fits entirely
        const scale = Math.min(bgWidth / photoWidth, bgHeight / photoHeight);

        // Compute the new width/height of the photo
        const newWidth = photoWidth * scale;
        const newHeight = photoHeight * scale;

        // Center the photo on the background
        const offsetX = (bgWidth - newWidth) / 2;
        const offsetY = (bgHeight - newHeight) / 2;

        ctx.drawImage(photoImg, offsetX, offsetY, newWidth, newHeight);

        // Export as data URL
        const dataUrl = canvas.toDataURL("image/png");
        resolve(dataUrl);
      }
    };

    const onError = (err: unknown) => {
      reject(err);
    };

    photoImg.onload = onLoad;
    bgImg.onload = onLoad;
    photoImg.onerror = onError;
    bgImg.onerror = onError;

    // Trigger the loading of both images
    photoImg.src = photo;
    bgImg.src = newBG;
  });

  return final as string;
}

export async function getAudio(text: string): Promise<string> {
  const response = await fetch("/api/generateSpeech", {
    method: "POST",
    body: JSON.stringify({
      text,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.blob();
  const audio = URL.createObjectURL(result);
  return audio;

  console.log("response", response);

  return text;
}

export async function getVideo(photo: string): Promise<string> {
  return photo;
}

export async function convertToDataURL(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // `reader.result` will be something like: data:image/png;base64,iVBORw0K...
      resolve(reader.result as string);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function uploadToGCS(
  img: string,
  bucketName: string,
  fileName: string
): Promise<string> {
  // const storage = new Storage();
  const ref = storage.ref();

  // const bucket = ref.bucket(bucketName);

  //convert image to buffer
  const buffer = Buffer.from(
    img.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );

  //   const buffer = Buffer.from(
  //     base64Video.replace(/^data:video\/\w+;base64,/, ""),
  //     "base64"
  //   );

  const result = await ref.child(fileName).put(buffer);
  const downloadURL = await result.ref.getDownloadURL();
  console.log("download url!", downloadURL);
  return downloadURL;

  // const file = bucket.file(fileName);

  // return new Promise<string>((resolve, reject) => {
  //   file.save(buffer, (error) => {
  //     if (error) {
  //       reject(error);
  //     } else {
  //       const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
  //       resolve(publicUrl);
  //     }
  //   });
  // });
}
