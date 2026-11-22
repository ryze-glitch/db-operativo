import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBFO-Zhg8c4XJzLDejtk66DZyPWqwuiN20",
  authDomain: "db-operativo.firebaseapp.com",
  projectId: "db-operativo",
  storageBucket: "db-operativo.firebasestorage.app",
  messagingSenderId: "449158035368",
  appId: "1:449158035368:web:bb2f8dc74d44c019c24f9d",
  measurementId: "G-D5YSYPKHXX",
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Webhook Discord del canale identificazioni (invariato rispetto al vecchio sito)
export const WEBHOOK_URL = "https://discord.com/api/webhooks/1481913832774570098/wyc0inW8zgiDfzqYiRFn8_jS5GwnCFLmA-X73-a307LbPJBVvOIjaMbkoa7byYqTcR4S"
