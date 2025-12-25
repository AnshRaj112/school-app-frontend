"use client";

import styles from "./manageStudents.module.scss";

export default function ManageStudentsPage() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Manage Students</h2>

      <button className={styles.primary}>Add Student</button>

      <div className={styles.list}>
        <div className={styles.row}>Aman – Class 5A</div>
        <div className={styles.row}>Riya – Class 6B</div>
      </div>
    </div>
  );
}
