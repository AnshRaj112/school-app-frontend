"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import styles from "./manageSubjects.module.scss";

const API = "http://localhost:5000";
const ACTOR_ID = "694d3af362028fdb6b2396a5";
const SCHOOL_ID = "694d3d339594374e726bca87";

export default function ManageSubjects() {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<any | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  /* ================= FETCH ================= */

  async function fetchClasses() {
    try {
      const res = await fetch(
        `${API}/classes?actorId=${ACTOR_ID}&schoolId=${SCHOOL_ID}`
      );
      const data = await res.json();
      setClasses(data.classes || []);
    } catch {
      toast.error("Failed to load classes");
    }
  }

  async function fetchSubjects(classId: string) {
    try {
      const res = await fetch(
        `${API}/subjects?actorId=${ACTOR_ID}&classId=${classId}&includeInactive=true`
      );
      const data = await res.json();
      setSubjects(data.subjects || []);
    } catch {
      toast.error("Failed to load subjects");
    }
  }

  /* ================= ACTIONS ================= */

  async function createSubject() {
    try {
      await fetch(`${API}/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: ACTOR_ID,
          schoolId: SCHOOL_ID,
          classId: selectedClass._id,
          name,
          code,
        }),
      });

      toast.success("Subject created");
      setShowCreate(false);
      setName("");
      setCode("");
      fetchSubjects(selectedClass._id);
    } catch {
      toast.error("Failed to create subject");
    }
  }

  async function updateSubject() {
    try {
      await fetch(`${API}/subjects/${showEdit._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: ACTOR_ID,
          name,
          code,
        }),
      });

      toast.success("Subject updated");
      setShowEdit(null);
      fetchSubjects(selectedClass._id);
    } catch {
      toast.error("Failed to update subject");
    }
  }

  async function toggleSubject(subject: any) {
    try {
      await fetch(`${API}/subjects/${subject._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: ACTOR_ID,
          isActive: !subject.isActive,
        }),
      });

      toast.success(
        `Subject ${subject.isActive ? "deactivated" : "activated"}`
      );
      fetchSubjects(selectedClass._id);
    } catch {
      toast.error("Failed to update subject");
    }
  }

  /* ================= EFFECTS ================= */

  useEffect(() => {
    fetchClasses();
  }, []);

  /* ================= UI ================= */

  return (
    <div className={styles.container}>
      <div className={styles.pageTitle}>Manage Subjects</div>

      {/* ===== CLASS SELECTOR ===== */}
      {!selectedClass && (
        <div className={styles.classGrid}>
          {classes.map((cls) => (
            <div
              key={cls._id}
              className={styles.classCard}
              onClick={() => {
                setSelectedClass(cls);
                fetchSubjects(cls._id);
              }}
            >
              Class {cls.grade}
            </div>
          ))}
        </div>
      )}

      {/* ===== SUBJECTS ===== */}
      {selectedClass && (
        <div className={styles.subjectPanel}>
          <button
            className={styles.backBtn}
            onClick={() => setSelectedClass(null)}
          >
            ← Back to Classes
          </button>

          <div className={styles.headerRow}>
            <div className={styles.sectionTitle}>
              Subjects – Class {selectedClass.grade}
            </div>
            <button
              className={styles.primaryBtn}
              onClick={() => setShowCreate(true)}
            >
              + Add Subject
            </button>
          </div>

          <div className={styles.subjectGrid}>
            {subjects.map((sub) => (
              <div
                key={sub._id}
                className={`${styles.subjectCard} ${
                  !sub.isActive ? styles.inactive : ""
                }`}
              >
                <div className={styles.subjectName}>{sub.name}</div>
                <div className={styles.subjectCode}>{sub.code}</div>

                <div className={styles.cardActions}>
                  <button
                    className={styles.secondaryBtn}
                    onClick={() => {
                      setShowEdit(sub);
                      setName(sub.name);
                      setCode(sub.code);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className={styles.statusBtn}
                    onClick={() => toggleSubject(sub)}
                  >
                    {sub.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== CREATE / EDIT MODAL ===== */}
      {(showCreate || showEdit) && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>
              {showEdit ? "Edit Subject" : "Create Subject"}
            </div>

            <input
              className={styles.input}
              placeholder="Subject name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className={styles.input}
              placeholder="Subject code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <div className={styles.modalActions}>
              <button
                className={styles.secondaryBtn}
                onClick={() => {
                  setShowCreate(false);
                  setShowEdit(null);
                }}
              >
                Cancel
              </button>

              <button
                className={styles.primaryBtn}
                onClick={showEdit ? updateSubject : createSubject}
              >
                {showEdit ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
