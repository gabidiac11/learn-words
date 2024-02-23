import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const json = process.env.REACT_APP_FIREBASE_CONFIG ?? "";
console.log({json});

const firebaseConfig = JSON.parse(json);
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;