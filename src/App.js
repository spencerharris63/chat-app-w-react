import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  addDoc,
  collection,
  query,
  orderBy,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
  const [username, setUsername] = useState("");
  const [entered, setEntered] = useState(false);

  const handleEnterChat = () => {
    if (username.trim()) {
      setEntered(true);
    }
  };

  return (
    <div className="App">
      <header>
        <h1>Chat App</h1>
      </header>

      <section>
        {entered ? (
          <ChatRoom username={username} />
        ) : (
          <UsernameForm setUsername={setUsername} onEnter={handleEnterChat} />
        )}
      </section>
    </div>
  );
}

function UsernameForm({ setUsername, onEnter }) {
  return (
    <div className="sign-in-form">
      <input
        type="text"
        placeholder="Enter your name"
        onChange={(e) => setUsername(e.target.value)}
        className="sign-in-input"
      />
      <button onClick={onEnter} className="sign-in-button">
        Enter Chat Room
      </button>
    </div>
  );
}

function ChatRoom({ username }) {
  const dummy = useRef();
  const messagesRef = collection(db, "messages");
  const messagesQuery = query(
    messagesRef,
    orderBy("createdAt", "asc"),
    limit(100)
  ); // Increase the limit as needed
  const [messages] = useCollectionData(messagesQuery, { idField: "id" });
  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid: username,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        username
      )}`,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <section>
        {messages &&
          messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} currentUser={username} />
          ))}
        <span ref={dummy}></span>
      </section>
      <div className="message-input-block">
        <form onSubmit={sendMessage} className="message-input-form">
          <input
            className="message-input"
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder="Type message here"
          />
          <button
            type="submit"
            disabled={!formValue}
            className="message-send-button"
          >
            Send
          </button>
        </form>
      </div>
    </>
  );
}

function ChatMessage({ message, currentUser }) {
  const { text, uid, photoURL } = message;
  const messageClass = uid === currentUser ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="avatar" />
      <p>{text}</p>
    </div>
  );
}

export default App;
