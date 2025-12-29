"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import styles from "./manageStudents.module.scss";

// Hardcoded constants as per other pages (e.g. ManageClasses)
const SCHOOL_ID = "694d3d339594374e726bca87";
const ACTOR_ID = "694d3af362028fdb6b2396a5";
const API = "http://localhost:5000";

interface StudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    studentToEdit?: any | null;
}

export default function StudentModal({ isOpen, onClose, onSuccess, studentToEdit }: StudentModalProps) {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        username: "",
        password: "",
        section: "", // Section ID
    });

    // Cascading state
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);

    // Controlled selections
    const [selectedClassId, setSelectedClassId] = useState("");

    const [loadingOptions, setLoadingOptions] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchClasses();

            if (studentToEdit) {
                // Pre-fill form
                setFormData({
                    fullName: studentToEdit.fullName,
                    email: studentToEdit.email,
                    username: studentToEdit.username,
                    password: "",
                    section: studentToEdit.section?._id || "",
                });

                // Pre-fill class/section selection
                if (studentToEdit.section) {
                    // We need to know which class this section belongs to.
                    // Ideally the section object has classId inside it if populated properly, 
                    // or we check the section payload. 
                    // Based on previous mocks, section had classId.
                    const clsId = studentToEdit.section.classId;
                    if (clsId) {
                        setSelectedClassId(clsId);
                        fetchSections(clsId);
                    }
                }
            } else {
                // Reset form
                setFormData({
                    fullName: "",
                    email: "",
                    username: "",
                    password: "",
                    section: "",
                });
                setSelectedClassId("");
                setSections([]);
            }
        }
    }, [isOpen, studentToEdit]);

    const fetchClasses = async () => {
        try {
            // Using logic similar to ManageClasses
            // Assuming the simple GET /classes endpoint exists or we filter by school
            // The previous code in ManageClasses was: `${API}/classes?actorId=${ACTOR_ID}&schoolId=${SCHOOL_ID}&includeInactive=true`
            // We'll omit actorId if not strictly required by backend or provide a dummy one if auth is disabled.
            // Let's try basic filter first.
            const res = await fetch(
                `${API}/classes?actorId=${ACTOR_ID}&schoolId=${SCHOOL_ID}&includeInactive=true`
            );
            const data = await res.json();
            if (data.classes) {
                setClasses(data.classes);
            }
        } catch (err) {
            console.error("Failed to load classes", err);
            toast.error("Could not load classes");
        }
    };

    const fetchSections = async (classId: string) => {
        try {
            const res = await fetch(`${API}/sections/by-class?actorId=${ACTOR_ID}&classId=${classId}`);
            const data = await res.json();
            if (data.sections) {
                setSections(data.sections);
            }
        } catch (err) {
            console.error("Failed to load sections", err);
        }
    };

    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const classId = e.target.value;
        setSelectedClassId(classId);
        setFormData({ ...formData, section: "" }); // Reset section when class changes
        if (classId) {
            fetchSections(classId);
        } else {
            setSections([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // In create mode, we need to inject the School ID
            const payload = {
                ...formData,
                school: SCHOOL_ID,
                actorId: ACTOR_ID,
                section: formData.section || undefined, // Send undefined if empty to avoid validation errors if backend handles it
                // Ensure password is not sent if empty and we are editing
                ...(studentToEdit && !formData.password ? { password: undefined } : {})
            };

            // If creating, password is required. 
            // If editing, logic handled in controller (only hash if provided).
            // But we need to ensure we don't send empty string password on update.
            if (studentToEdit) {
                delete (payload as any).password; // Simple deletion if empty
                if (formData.password) {
                    (payload as any).password = formData.password;
                }
            }

            const url = studentToEdit
                ? `${API}/students/${studentToEdit._id}`
                : `${API}/students`;

            const method = studentToEdit ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.success) {
                toast.success(studentToEdit ? "Student updated" : "Student created");
                onSuccess();
                onClose();
            } else {
                toast.error(data.message || "Operation failed");
            }
        } catch (err) {
            toast.error("Error submitting form");
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h2 className={styles.modalTitle}>
                    {studentToEdit ? "Edit Student" : "Add Student"}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Full Name</label>
                        <input
                            className={styles.input}
                            type="text" required
                            value={formData.fullName}
                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="John Doe"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input
                            className={styles.input}
                            type="email" required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Username</label>
                        <input
                            className={styles.input}
                            type="text" required
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            placeholder="johndoe123"
                        />
                    </div>

                    {!studentToEdit && (
                        <div className={styles.formGroup}>
                            <label>Password</label>
                            <input
                                className={styles.input}
                                type="password" required
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    {/* Class Dropdown */}
                    <div className={styles.formGroup}>
                        <label>Class (Optional)</label>
                        <select
                            className={styles.select}
                            value={selectedClassId}
                            onChange={handleClassChange}
                        >
                            <option value="">Select Class</option>
                            {classes.map((c: any) => (
                                <option key={c._id} value={c._id}>Class {c.grade}</option>
                            ))}
                        </select>
                    </div>

                    {/* Section Dropdown */}
                    <div className={styles.formGroup}>
                        <label>Section (Optional)</label>
                        <select
                            className={styles.select}
                            value={formData.section}
                            onChange={e => setFormData({ ...formData, section: e.target.value })}
                            disabled={!selectedClassId}
                        >
                            <option value="">Select Section</option>
                            {sections.map((s: any) => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.secondaryBtn}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.primaryBtn}>
                            {studentToEdit ? "Update Student" : "Create Student"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
