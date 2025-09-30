
"use client";
import { useState } from "react";
import styles from "./styles/Marks.module.scss";

const students = [
  { roll: 1, name: "Alice" },
  { roll: 2, name: "Bob" },
  { roll: 3, name: "Charlie" },
  { roll: 4, name: "David" }
];

const examOptions = ["Unit Test 1", "Half Yearly", "Final Exam"];
const subjectOptionsMaster = ["Math", "Physics", "Chemistry", "Biology", "Computer Science", "English"];

export default function Marks() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState(examOptions[0]);
  const [selectedSubject, setSelectedSubject] = useState(subjectOptionsMaster[0]);
  const [marks, setMarks] = useState<Record<string, Record<string, number>>>({});

  // Remove used subjects from dropdown
  const availableSubjects = subjectOptionsMaster.filter((s) => !subjects.includes(s));

  const handleAddSubject = () => {
    if (selectedSubject && !subjects.includes(selectedSubject)) {
      setSubjects((prev) => [...prev, selectedSubject]);
    }
  };

  const handleMarkChange = (
    student: string,
    subject: string,
    value: string
  ) => {
    setMarks((prev) => ({
      ...prev,
      [student]: {
        ...(prev[student] || {}),
        [subject]: parseInt(value) || 0,
      }
    }));
  };

  const handleSubmit = () => {
    alert(`Marks for ${selectedExam} submitted!`);
  };

  return (
    <div className={styles.marks}>
      <div className={styles.topRow}>
        <div className={styles.controls}>
          <select
            className={styles.dropdown}
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
          >
            {examOptions.map((exam) => (
              <option key={exam} value={exam}>{exam}</option>
            ))}
          </select>
          <select
            className={styles.dropdown}
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {availableSubjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          <button className={styles.button} onClick={handleAddSubject}>
            Add Subject
          </button>
        </div>
        <button className={styles.button} onClick={handleSubmit}>Submit</button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Roll No.</th>
            <th>Student</th>
            {subjects.map((subject) => (
              <th key={subject}>{subject}</th>
            ))}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const subjectMarks = subjects.map(
              (subject) => marks[student.name]?.[subject] || 0
            );
            const total = subjectMarks.reduce((a, b) => a + b, 0);
            return (
              <tr key={student.name}>
                <td>{student.roll}</td>
                <td>{student.name}</td>
                {subjects.map((subject) => (
                  <td key={subject}>
                    <input
                      type="number"
                      value={marks[student.name]?.[subject] ?? ""}
                      placeholder="Mark"
                      onChange={(e) =>
                        handleMarkChange(student.name, subject, e.target.value)
                      }
                      className={styles.marksInputNoBorder}
                    />
                  </td>
                ))}
                <td>{total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
