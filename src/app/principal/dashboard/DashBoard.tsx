"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.scss";

const ACTOR_ID = "694d3af362028fdb6b2396a5";
const PRINCIPAL_ID = "694d3dff96d1f2b81fce319a";

interface Principal {
  fullName: string;
  school: {
    _id: string;
    name: string;
  };
}

interface Stats {
  classes: number;
  sections: number;
  teachers: number;
  students: number;
}

export default function DashboardPage() {
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [stats, setStats] = useState<Stats>({
    classes: 0,
    sections: 0,
    teachers: 0,
    students: 0,
  });

  useEffect(() => {
    async function loadPrincipal() {
      const res = await fetch(
        `http://localhost:5000/principals/fetch/${PRINCIPAL_ID}?actorId=${ACTOR_ID}`
      );

      if (!res.ok) {
        console.error("Failed to fetch principal");
        return;
      }

      const data = await res.json();
      setPrincipal(data.principal);

      // Fetch Stats if school exists
      if (data.principal?.school?._id) {
        fetchStats(data.principal.school._id);
      }
    }

    async function fetchStats(schoolId: string) {
      try {
        const res = await fetch(`http://localhost:5000/schools/${schoolId}/stats`);
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to fetch stats");
      }
    }

    loadPrincipal();
  }, []);

  return (
    <>
      <div className={styles.header}>
        <h1>Welcome, {principal?.fullName}</h1>
        <p>{principal?.school.name}</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.card}>
          <span>Classes</span>
          <strong>{stats.classes}</strong>
        </div>
        <div className={styles.card}>
          <span>Sections</span>
          <strong>{stats.sections}</strong>
        </div>
        <div className={styles.card}>
          <span>Teachers</span>
          <strong>{stats.teachers}</strong>
        </div>
        <div className={styles.card}>
          <span>Students</span>
          <strong>{stats.students}</strong>
        </div>
      </div>
    </>
  );
}
