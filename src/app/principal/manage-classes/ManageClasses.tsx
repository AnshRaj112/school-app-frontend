"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import styles from "./manageClasses.module.scss";

const ACTOR_ID = "694d3af362028fdb6b2396a5";
const SCHOOL_ID = "694d3d339594374e726bca87";
const API = "http://localhost:5000";

export default function ManageClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showCreateSection, setShowCreateSection] = useState(false);
  const [assigningSection, setAssigningSection] = useState<any | null>(null);

  const [newGrade, setNewGrade] = useState("");
  const [newSectionName, setNewSectionName] = useState("");

  /* ================= FETCH ================= */

  async function fetchClasses() {
    try {
      const res = await fetch(
        `${API}/classes?actorId=${ACTOR_ID}&schoolId=${SCHOOL_ID}&includeInactive=true`
      );
      const data = await res.json();
      setClasses(data.classes || []);
    } catch {
      toast.error("Failed to load classes");
    }
  }

  async function fetchSections(classId: string) {
    try {
      const res = await fetch(
        `${API}/sections/by-class?actorId=${ACTOR_ID}&classId=${classId}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch sections");
      }

      const data = await res.json();
      setSections(data.sections || []);
    } catch {
      toast.error("Failed to load sections");
    }
  }

  async function fetchTeachers() {
    try {
      const res = await fetch(
        `${API}/teachers/by-school?actorId=${ACTOR_ID}&schoolId=${SCHOOL_ID}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch teachers");
      }

      const data = await res.json();
      setTeachers(data.teachers || []);
    } catch {
      toast.error("Failed to load teachers");
    }
  }

  /* ================= ACTIONS ================= */

  async function createClass() {
    try {
      await fetch(`${API}/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: ACTOR_ID,
          schoolId: SCHOOL_ID,
          grade: Number(newGrade),
        }),
      });
      toast.success("Class created");
      setShowCreateClass(false);
      setNewGrade("");
      fetchClasses();
    } catch {
      toast.error("Failed to create class");
    }
  }

  async function toggleClassStatus(cls: any) {
    try {
      await fetch(`${API}/classes/${cls._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: ACTOR_ID,
          isActive: !cls.isActive,
        }),
      });
      toast.success(`Class ${cls.isActive ? "deactivated" : "activated"}`);
      fetchClasses();
    } catch {
      toast.error("Failed to update class");
    }
  }

  async function createSection() {
    try {
      await fetch(`${API}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: ACTOR_ID,
          schoolId: SCHOOL_ID,
          classId: selectedClass._id,
          name: newSectionName,
        }),
      });
      toast.success("Section created");
      setShowCreateSection(false);
      setNewSectionName("");
      fetchSections(selectedClass._id);
    } catch {
      toast.error("Failed to create section");
    }
  }

  async function assignTeacher(sectionId: string, teacher: any) {
    try {
      await fetch(`${API}/sections/${sectionId}/assign-class-teacher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: ACTOR_ID,
          teacherId: teacher._id,
        }),
      });
      toast.success("Teacher assigned");
      setAssigningSection(null);
      fetchSections(selectedClass._id);
    } catch {
      toast.error("Failed to assign teacher");
    }
  }
  async function unassignTeacher(sectionId: string) {
    try {
      await fetch(`${API}/sections/${sectionId}/unassign-class-teacher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: ACTOR_ID }),
      });

      toast.success("Class teacher removed");
      fetchSections(selectedClass._id);
    } catch {
      toast.error("Failed to remove teacher");
    }
  }

  /* ================= EFFECTS ================= */

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (assigningSection) fetchTeachers();
  }, [assigningSection]);

  /* ================= UI ================= */

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.pageTitle}>Manage Classes</div>
        <button
          className={styles.primaryBtn}
          onClick={() => setShowCreateClass(true)}
        >
          + Create Class
        </button>
      </div>

      {/* ===== CLASSES ===== */}
      <div className={styles.classGrid}>
        {classes.map((cls) => (
          <div
            key={cls._id}
            className={`${styles.classCard} ${
              !cls.isActive ? styles.inactive : ""
            }`}
            onClick={() => {
              setSelectedClass(cls);
              fetchSections(cls._id);
            }}
          >
            <div className={styles.classLabel}>Class {cls.grade}</div>

            <button
              className={styles.statusBtn}
              onClick={(e) => {
                e.stopPropagation();
                toggleClassStatus(cls);
              }}
            >
              {cls.isActive ? "Deactivate" : "Activate"}
            </button>
          </div>
        ))}
      </div>

      {/* ===== SECTIONS ===== */}
      {selectedClass && (
        <div className={styles.sectionPanel}>
          <button
            className={styles.backBtn}
            onClick={() => setSelectedClass(null)}
          >
            ← Back to Classes
          </button>

          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              Sections – Class {selectedClass.grade}
            </div>
            <button
              className={styles.primaryBtn}
              onClick={() => setShowCreateSection(true)}
            >
              + Add Section
            </button>
          </div>

          <div className={styles.sectionGrid}>
            {sections.map((sec) => (
              <div key={sec._id} className={styles.sectionCard}>
                <div className={styles.sectionName}>Section {sec.name}</div>

                <div className={styles.teacherName}>
                  {sec.classTeacher
                    ? sec.classTeacher.fullName
                    : "No class teacher assigned"}
                </div>

                <div className={styles.sectionActions}>
                  <button
                    className={styles.assignBtn}
                    onClick={() => setAssigningSection(sec)}
                  >
                    {sec.classTeacher ? "Change Teacher" : "Assign Teacher"}
                  </button>

                  {sec.classTeacher && (
                    <button
                      className={styles.removeBtn}
                      onClick={() => unassignTeacher(sec._id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== CREATE CLASS MODAL ===== */}
      {showCreateClass && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>Create Class</div>
            <input
              className={styles.input}
              placeholder="Grade (1–12)"
              value={newGrade}
              onChange={(e) => setNewGrade(e.target.value)}
            />
            <div className={styles.modalActions}>
              <button
                className={styles.secondaryBtn}
                onClick={() => setShowCreateClass(false)}
              >
                Cancel
              </button>
              <button className={styles.primaryBtn} onClick={createClass}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CREATE SECTION MODAL ===== */}
      {showCreateSection && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>Create Section</div>
            <input
              className={styles.input}
              placeholder="Section name (A, B, C)"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
            />
            <div className={styles.modalActions}>
              <button
                className={styles.secondaryBtn}
                onClick={() => setShowCreateSection(false)}
              >
                Cancel
              </button>
              <button className={styles.primaryBtn} onClick={createSection}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ASSIGN TEACHER MODAL ===== */}
      {assigningSection && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>
              Assign Teacher – Section {assigningSection.name}
            </div>

            <div className={styles.teacherList}>
              {teachers.map((t) => (
                <div
                  key={t._id}
                  className={styles.teacherItem}
                  onClick={() => assignTeacher(assigningSection._id, t)}
                >
                  {t.fullName}
                </div>
              ))}
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.secondaryBtn}
                onClick={() => setAssigningSection(null)}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
