"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import styles from "./ManageTeachers.module.scss";

const API = "http://localhost:5000";
const ACTOR_ID = "694d3af362028fdb6b2396a5";
const SCHOOL_ID = "694d3d339594374e726bca87";

type Teacher = {
  _id: string;
  fullName: string;
  username?: string;
  email: string;
  roles: string[];
  isActive?: boolean;
};

type ClassItem = { _id: string; grade: number };
type Section = { _id: string; name: string; classId?: { grade: number } };
type Subject = { _id: string; name: string; code: string };

type Assignment = {
  _id: string;
  sectionId: Section;
  subjectId: Subject;
  academicYear: string;
};

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState<Teacher | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [showAssign, setShowAssign] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    role: "subject_teacher",
  });

  const [assignPayload, setAssignPayload] = useState({
    sectionId: "",
    subjectId: "",
    academicYear: "2025-26",
  });

  /* ================= FETCH ================= */

  async function fetchTeachers() {
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/teachers/by-school?actorId=${ACTOR_ID}&schoolId=${SCHOOL_ID}`
      );
      const data = await res.json();
      setTeachers(data.teachers || []);
    } catch (err) {
      console.error("fetchTeachers error:", err);
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  }

  async function openProfile(t: Teacher) {
    setProfile(t);
    setShowAssign(false);
    try {
      const res = await fetch(`${API}/teachers/${t._id}?actorId=${ACTOR_ID}`);
      const data = await res.json();
      setAssignments(data.assignments || []);
    } catch (err) {
      console.error("openProfile error:", err);
      toast.error("Failed to load assignments");
    }
  }

  async function fetchClasses() {
    try {
      const res = await fetch(
        `${API}/classes?actorId=${ACTOR_ID}&schoolId=${SCHOOL_ID}&includeInactive=true`
      );
      const data = await res.json();
      setClasses(data.classes || []);
    } catch (err) {
      console.error("fetchClasses error:", err);
    }
  }

  async function fetchSections(classId: string) {
    try {
      const res = await fetch(
        `${API}/sections/by-class?actorId=${ACTOR_ID}&classId=${classId}`
      );
      const data = await res.json();
      setSections(data.sections || []);
    } catch (err) {
      console.error("fetchSections error:", err);
      toast.error("Failed to load sections");
    }
  }

  async function fetchSubjects(classId: string) {
    try {
      const res = await fetch(
        `${API}/subjects/?actorId=${ACTOR_ID}&classId=${classId}&includeInactive=true`
      );
      const data = await res.json();
      setSubjects(data.subjects || []);
    } catch (err) {
      console.error("fetchSubjects error:", err);
      toast.error("Failed to load subjects");
    }
  }

  /* ================= CREATE / UPDATE ================= */

  async function saveTeacher() {
    try {
      if (!form.fullName || !form.email) {
        toast.error("Name and email required");
        return;
      }

      if (editing) {
        await fetch(`${API}/teachers/${editing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actorId: ACTOR_ID,
            username: form.username, // Added username to payload
            fullName: form.fullName,
            email: form.email,
            roles: [form.role],
          }),
        });
        toast.success("Teacher updated");
      } else {
        await fetch(`${API}/teachers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actorId: ACTOR_ID,
            schoolId: SCHOOL_ID,
            username: form.username,
            fullName: form.fullName,
            email: form.email,
            password: form.password,
            roles: [form.role],
          }),
        });
        toast.success("Teacher created");
      }

      setFormOpen(false);
      setEditing(null);
      fetchTeachers();
    } catch (err) {
      console.error("saveTeacher error:", err);
      toast.error("Failed to save teacher");
    }
  }

  async function toggleTeacher(t: Teacher) {
    try {
      await fetch(`${API}/teachers/${t._id || t._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: ACTOR_ID,
          isActive: !t.isActive,
        }),
      });
      toast.success(`Teacher ${t.isActive ? "deactivated" : "activated"}`);
      fetchTeachers();
    } catch (err) {
      console.error("toggleTeacher error:", err);
      toast.error("Failed to update status");
    }
  }

  /* ================= ASSIGNMENT ================= */

  async function createAssignment() {
    if (!assignPayload.sectionId || !assignPayload.subjectId || !profile) {
      toast.error("Select section and subject");
      return;
    }

    try {
      await fetch(`${API}/teaching-assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: ACTOR_ID,
          schoolId: SCHOOL_ID,
          teacherId: profile._id,
          sectionId: assignPayload.sectionId,
          subjectId: assignPayload.subjectId,
          academicYear: assignPayload.academicYear,
        }),
      });

      toast.success("Assignment added");
      setShowAssign(false);
      openProfile(profile);
    } catch (err) {
      console.error("createAssignment error:", err);
      toast.error("Failed to assign");
    }
  }

  async function removeAssignment(id: string) {
    try {
      await fetch(`${API}/teaching-assignments/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: ACTOR_ID }),
      });
      toast.success("Assignment removed");
      openProfile(profile!);
    } catch (err) {
      console.error("removeAssignment error:", err);
      toast.error("Failed to remove assignment");
    }
  }

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
  }, []);

  /* ================= UI ================= */

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.title}>Manage Teachers</div>
        <button
          onClick={() => {
            setEditing(null);
            setForm({
              username: "",
              fullName: "",
              email: "",
              password: "",
              role: "subject_teacher",
            });
            setFormOpen(true);
          }}
        >
          + Create Teacher
        </button>
      </div>

      <div className={styles.grid}>
        {loading ? (
          <div className={styles.loading}>Loading Teachers...</div>
        ) : (
          teachers.map((t) => (
            <div
              key={t._id}
              className={`${styles.card} ${!t.isActive ? styles.inactive : ""}`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  {t.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                </div>
                <div className={styles.info}>
                  <div className={styles.name}>{t.fullName}</div>
                  <div className={styles.email}>{t.email}</div>
                  <div className={styles.badges}>
                    {t.roles.includes("class_teacher") ? (
                      <span className={`${styles.roleBadge} ${styles.classTeacher}`}>Class Teacher</span>
                    ) : (
                      <span className={`${styles.roleBadge} ${styles.subjectTeacher}`}>Subject Teacher</span>
                    )}

                    <span className={`${styles.statusBadge} ${t.isActive ? styles.active : styles.inactive}`}>
                      {t.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={`${styles.btn} ${styles.outline}`}
                  onClick={() => openProfile(t)}
                  title="View Profile"
                >
                  View
                </button>

                <button
                  className={`${styles.btn} ${styles.outline}`}
                  onClick={() => {
                    setEditing(t);
                    setForm({
                      username: t.username || "",
                      fullName: t.fullName || "",
                      email: t.email || "",
                      password: "",
                      role: t.roles?.[0] || "subject_teacher",
                    });
                    setFormOpen(true);
                  }}
                  title="Edit Details"
                >
                  Edit
                </button>

                <button
                  className={`${styles.btn} ${styles.danger}`}
                  onClick={() => toggleTeacher(t)}
                  title="Toggle Status"
                >
                  {t.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PROFILE */}
      {profile && (
        <div className={styles.drawer}>
          <div className={styles.drawerHeader}>
            <div>
              <div className={styles.drawerName}>{profile.fullName}</div>
              <div className={styles.drawerMeta}>{profile.email}</div>
            </div>
            <button
              className={styles.secondaryBtn}
              onClick={() => setProfile(null)}
            >
              ← Back
            </button>
          </div>

          <div className={styles.sectionTitle}>Assignments</div>

          {assignments.map((a) => (
            <div key={a._id} className={styles.assignment}>
              <div>
                <strong>{a.subjectId?.name || "Unknown Subject"}</strong>
                <div className={styles.small}>
                  Class {a.sectionId?.classId?.grade || "?"} - Sec {a.sectionId?.name || "?"} · {a.academicYear}
                </div>
              </div>
              <button
                className={styles.dangerBtn}
                onClick={() => removeAssignment(a._id)}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            className={styles.primaryBtn}
            onClick={() => setShowAssign(!showAssign)}
          >
            + Add Assignment
          </button>

          {showAssign && (
            <div className={styles.assignBox}>
              <select
                className={styles.select}
                onChange={(e) => {
                  const classId = e.target.value;
                  setAssignPayload((p) => ({
                    ...p,
                    sectionId: "",
                    subjectId: "",
                  }));
                  fetchSections(classId);
                  fetchSubjects(classId);
                }}
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    Class {c.grade}
                  </option>
                ))}
              </select>

              <select
                className={styles.select}
                value={assignPayload.sectionId}
                onChange={(e) =>
                  setAssignPayload((p) => ({
                    ...p,
                    sectionId: e.target.value,
                  }))
                }
              >
                <option value="">Select Section</option>
                {sections.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                className={styles.select}
                value={assignPayload.subjectId}
                onChange={(e) =>
                  setAssignPayload((p) => ({
                    ...p,
                    subjectId: e.target.value,
                  }))
                }
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <div className={styles.assignActions}>
                <button
                  className={styles.secondaryBtn}
                  onClick={() => setShowAssign(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.primaryBtn}
                  onClick={createAssignment}
                >
                  Assign
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {formOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>
              {editing ? "Edit Teacher" : "Create Teacher"}
            </div>

            {/* Username — ALWAYS rendered */}
            <input
              className={styles.input}
              placeholder="Username"
              value={form.username}
              // disabled={!!editing}  <-- REMOVED disabled check
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />

            {/* Full name */}
            <input
              className={styles.input}
              placeholder="Full Name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />

            {/* Email — ALWAYS rendered */}
            <input
              className={styles.input}
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            {/* Password — ALWAYS rendered */}
            <input
              type="password"
              className={styles.input}
              placeholder="Password"
              value={form.password}
              disabled={!!editing}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <select
              className={styles.select}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="subject_teacher">Subject Teacher</option>
              <option value="class_teacher">Class Teacher</option>
              <option value="substitute_teacher">Substitute Teacher</option>
            </select>

            <div className={styles.modalActions}>
              <button
                className={styles.secondaryBtn}
                onClick={() => {
                  setFormOpen(false);
                  setEditing(null);
                }}
              >
                Cancel
              </button>
              <button className={styles.primaryBtn} onClick={saveTeacher}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
