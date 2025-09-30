

import Link from "next/link";
import { MdAssignment, MdEventNote, MdUploadFile, MdPerson, MdGroup, MdAnnouncement } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import styles from "./styles/Dashboard.module.scss";

const teacherInfo = {
  name: "John Doe",
  id: "T123456",
};

const days = ["Time", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const timetable = [
  ["8:00 - 9:00", "DAA (B-019)", "", "CN (B-207)", "SE (A-216)", ""],
  ["9:00 - 10:00", "SE (B-019)", "CN Lab (B-102L)", "DAA (B-207)", "DAA Lab (A-204L)", "SE (B-101)"],
  ["10:00 - 11:00", "EE (B-019)", "CN Lab (B-102L)", "EE (B-207)", "DAA Lab (A-204L)", "CN (B-101)"],
  ["11:00 - 12:00", "DOS (A-201)", "EE (B-310)", "", "", "DMDW (A-106)"],
  ["12:00 - 1:00", "DMDW (A-106)", "CN (B-310)", "DOS (A-201)", "", ""],
  ["1:00 - 2:00", "", "", "DMDW (A-106)", "DOS (A-201)", ""],
  ["2:00 - 3:00", "", "", "", "", ""],
  ["3:15 - 4:15", "", "DAA (A-308)", "", "", ""],
  ["4:15 - 5:15", "", "SE (A-308)", "", "", ""],
];

export default function TeacherDashboard() {
  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <h2>Teacher Dashboard</h2>
        <nav>
          <Link href="/Dashboard/attendance"><MdEventNote /> Daily Attendance</Link>
          <Link href="/Dashboard/assignments"><MdAssignment /> Assignments</Link>
          <Link href="/Dashboard/marks"><MdUploadFile /> Upload Marks</Link>
          <Link href="/Dashboard/substitute"><MdPerson /> Substitute Teacher</Link>
          <Link href="/Dashboard/roster"><MdGroup /> Class Roster</Link>
          <Link href="/Dashboard/communication"><MdAnnouncement /> Announcements</Link>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <section className={styles.teacherDetails}>
          <FaUserCircle className={styles.avatar} />
          <h3>Teacher Information</h3>
          <p>
            <strong>Name:</strong> {teacherInfo.name}
          </p>
          <p>
            <strong>ID:</strong> {teacherInfo.id}
          </p>
        </section>

        <section className={styles.weeklyRoutine}>
          <h3>Weekly Routine</h3>
          <div className={styles.timetableGrid}>
            {days.map((d, i) => (
              <div key={i} className={styles.headerCell}>
                {d}
              </div>
            ))}
            {timetable.map((row, rowIdx) =>
              row.map((cell, colIdx) => (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={colIdx === 0 ? styles.timeCell : styles.cell}
                >
                  {cell || "X"}
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
