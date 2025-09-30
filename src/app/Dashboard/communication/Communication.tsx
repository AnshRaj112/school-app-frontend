

"use client";
import { useState } from "react";
import styles from "./styles/Communication.module.scss";

export default function Announcements() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const addMessage = () => {
    if (input.trim()) {
      setMessages([...messages, input.trim()]);
      setInput("");
    }
  };

  const deleteMessage = (index: number) => {
    const updated = [...messages];
    updated.splice(index, 1);
    setMessages(updated);
  };

  return (
    <div className={styles.anouncment}>
      <h2>Announcements / Messages</h2>

      <div className={styles.inputBox}>
        <input
          type="text"
          placeholder="Type a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={addMessage}>Add</button>
      </div>

      <ul className={styles.resourceList}>
        {messages.map((msg, i) => (
          <li key={i} className={styles.resourceItem}>
            <span>{msg}</span>
            <button
              className={styles.deleteBtn}
              onClick={() => deleteMessage(i)}
              title="Delete"
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
