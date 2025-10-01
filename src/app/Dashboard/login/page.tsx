"use client";
import { useState } from "react";
import styles from "./styles/LoginForm.module.scss";

export default function TeacherLogin() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
  };

  return (
    <div className={styles.pageBg}>
      <div className={styles.loginCard}>
        <h2 className={styles.loginTitle}>Login</h2>
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email or Phone"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            required
          />
          <div className={styles.passwordRow}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <span className={styles.eyeIcon} tabIndex={-1} aria-hidden> {/* Use an icon if you wish */}&#128065;</span>
          </div>
          <div className={styles.actionRow}>
            <a href="#" className={styles.forgotPassword}>Forgot Password?</a>
          </div>
          <button type="submit" className={styles.loginBtn}>Login</button>
          <div className={styles.signUpRow}>
            <span>Don&apos;t have an account?</span>
            <a href="#" className={styles.signUpLink}>Sign Up</a>
          </div>
        </form>
      </div>
    </div>
  );
}
