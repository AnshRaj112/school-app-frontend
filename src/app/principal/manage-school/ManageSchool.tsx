"use client";

import { useEffect, useState } from "react";
import styles from "./manageSchool.module.scss";

const ACTOR_ID = "694d3af362028fdb6b2396a5";
const SCHOOL_ID = "694d3d339594374e726bca87";

interface School {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  email: string;
}

export default function ManageSchoolPage() {
  const [school, setSchool] = useState<School | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchool() {
      try {
        const res = await fetch(
          `http://localhost:5000/schools/fetch/${SCHOOL_ID}?actorId=${ACTOR_ID}`
        );

        if (!res.ok) throw new Error("Failed to fetch school");

        const data = await res.json();
        setSchool(data.school);
        setForm(data.school);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSchool();
  }, []);

  async function handleSave() {
    if (!form) return;

    try {
      const res = await fetch(
        `http://localhost:5000/schools/update/${SCHOOL_ID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actorId: ACTOR_ID,
            ...form,
          }),
        }
      );

      if (!res.ok) throw new Error("Update failed");

      const data = await res.json();
      setSchool(data.school);
      setEditMode(false);
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return <div className={styles.loading}>Loading school details...</div>;
  }

  if (!school || !form) {
    return <div className={styles.loading}>School not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>School Details</h2>

        {!editMode ? (
          <button className={styles.primary} onClick={() => setEditMode(true)}>
            Edit
          </button>
        ) : (
          <button className={styles.primary} onClick={handleSave}>
            Save
          </button>
        )}
      </div>

      <div className={styles.grid}>
        {(
          [
            ["name", "School Name"],
            ["code", "School Code"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["address", "Address"],
            ["city", "City"],
            ["state", "State"],
            ["country", "Country"],
            ["pincode", "Pincode"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className={styles.field}>
            <label className={styles.label}>{label}</label>

            {editMode ? (
              <input
                className={styles.input}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            ) : (
              <span className={styles.value}>{school[key]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
