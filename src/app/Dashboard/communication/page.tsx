import Communication from "@/app/Dashboard/communication/Communication";
import Link from "next/link";
import styles from "../teacher/styles/Dashboard.module.scss";

export default function CommunicationPage() {
  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <h2>Teacher Dashboard</h2>
        <nav>
          <Link href="/Dashboard/attendance" className={styles.active}>Daily Attendance</Link>
          <Link href="/Dashboard/assignments">Assignments</Link>
          <Link href="/Dashboard/marks">Upload Marks</Link>
          <Link href="/Dashboard/substitute">Substitute Teacher</Link>
          <Link href="/Dashboard/roster">Class Roster</Link>
          <Link href="/Dashboard/communication">Announcements</Link>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <Communication />
      </main>
    </div>
  );
}
