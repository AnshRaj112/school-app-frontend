// src/app/page.tsx
"use client";
import Link from "next/link";
import styles from "../Landing.module.scss"; // create this for styling

export default function LandingPage() {
  return (
    <div className={styles.landingWrapper}>
      <h1 className={styles.title}>Welcome to School Portal</h1>
      <div className={styles.roleGrid}>
        <Link href="/Dashboard/login" className={styles.roleBtn}>Login as Teacher</Link>
        {/* <Link href="/login/student" className={styles.roleBtn}>Login as Student</Link>
        <Link href="/login/principal" className={styles.roleBtn}>Login as Principal</Link>
        <Link href="/login/admin" className={styles.roleBtn}>Login as Admin</Link> */}
      </div>
    </div>
  );
}
