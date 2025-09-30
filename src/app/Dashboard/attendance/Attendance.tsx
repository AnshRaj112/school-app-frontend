"use client";
import { useState } from "react";
import styles from "./styles/Attendance.module.scss";

// Add roll numbers to each student
const students = [
  { roll: 1, name: "Alice" },
  { roll: 2, name: "Bob" },
  { roll: 3, name: "Charlie" },
  { roll: 4, name: "David" },
  { roll: 5, name: "ggg" },
  { roll: 6, name: "Aditi" },
];

export default function Attendance() {
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  // Toggle individual student
  const toggleAttendance = (studentName: string) => {
    setAttendance((prev) => ({ ...prev, [studentName]: !prev[studentName] }));
  };

  // Mark all present
  const markAllPresent = () => {
    const allPresent: Record<string, boolean> = {};
    students.forEach((s) => {
      allPresent[s.name] = true;
    });
    setAttendance(allPresent);
  };

  // Submit handler
  const handleSubmit = () => {
    console.log("Submitted Attendance:", attendance);
    alert("Attendance submitted!");
  };

  return (
    <div className={styles.attendance}>
      <h2>Daily Attendance </h2>
      <div className={styles.buttons}>
        <button onClick={markAllPresent}>Mark All Present</button>
        <button onClick={handleSubmit}>Submit</button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Roll No.</th>
            <th>Name</th>
            <th>Present</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.roll}>
              <td>{s.roll}</td>
              <td>{s.name}</td>
              <td>
                <input
                  type="checkbox"
                  checked={!!attendance[s.name]}
                  onChange={() => toggleAttendance(s.name)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
