"use client";

import { useState, useEffect } from "react";
import { FaUserPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import styles from "./manageStudents.module.scss";
import StudentModal from "./StudentModal";

const SCHOOL_ID = "694d3d339594374e726bca87";
const ACTOR_ID = "694d3af362028fdb6b2396a5";
const API = "http://localhost:5000";

interface Student {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  section: {
    _id: string;
    name: string;
    classId: {
      grade: number;
    } | null;
  } | null;
  isActive: boolean;
}

export default function ManageStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [totalStudents, setTotalStudents] = useState(0);
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  // Filters State
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const handleAdd = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchStudents();
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedClass) params.append("classId", selectedClass);
      if (selectedSection) params.append("sectionId", selectedSection);
      params.append("page", page.toString());
      params.append("limit", LIMIT.toString());
      params.append("actorId", ACTOR_ID);
      params.append("schoolId", SCHOOL_ID);

      const res = await fetch(`${API}/students?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setStudents(data.students);
        setTotalStudents(data.totalStudents);
      } else {
        toast.error("Failed to fetch students");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching students");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Classes for Filters
  const fetchClasses = async () => {
    try {
      const res = await fetch(`${API}/classes?schoolId=${SCHOOL_ID}&actorId=${ACTOR_ID}`); // Added actorId
      const data = await res.json();
      if (data.classes) setClasses(data.classes);
    } catch (error) {
      console.error("Failed to fetch classes", error);
    }
  };

  // Fetch Sections for Filters
  const fetchSections = async (classId: string) => {
    try {
      const res = await fetch(`${API}/sections/by-class?classId=${classId}&actorId=${ACTOR_ID}`); // Added actorId
      const data = await res.json();
      if (data.sections) setSections(data.sections);
    } catch (error) {
      console.error("Failed to fetch sections", error);
    }
  };

  const handleClassFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setSelectedSection("");
    setPage(1); // Reset page on filter change
    setSections([]); // Reset sections
    if (classId) {
      fetchSections(classId);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, selectedClass, selectedSection, page]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      const res = await fetch(`${API}/students/${id}?actorId=${ACTOR_ID}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Student deleted successfully");
        fetchStudents();
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (error) {
      toast.error("Error deleting student");
    }
  };

  return (
    <div className={styles.container}>
      <Toaster />

      {/* Header Stats */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <p>Total Students</p>
          <h2>{totalStudents}</h2>
          <div className={styles.subtext}>Class Strength</div>
        </div>
        {/* Placeholders */}
        <div className={`${styles.statCard} ${styles.green}`}>
          <p>Present Today</p>
          <h2>--</h2>
        </div>
        <div className={`${styles.statCard} ${styles.purple}`}>
          <p>New Admissions</p>
          <h2>--</h2>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.left}>
          <div className={styles.searchWrapper}>
            <FaSearch />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className={styles.filterSelect}
            value={selectedClass}
            onChange={handleClassFilterChange}
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>Class {cls.grade}</option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={selectedSection}
            onChange={(e) => {
              setSelectedSection(e.target.value);
              setPage(1); // Reset page on section change
            }}
            disabled={!selectedClass}
          >
            <option value="">All Sections</option>
            {sections.map((sec) => (
              <option key={sec._id} value={sec._id}>Section {sec.name}</option>
            ))}
          </select>
        </div>

        <button
          className={styles.addBtn}
          onClick={handleAdd}
        >
          <FaUserPlus />
          Add Student
        </button>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Class/Section</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className={styles.loadingState}>Loading students...</td>
              </tr>
            ) : students.length > 0 ? (
              students.map((student) => (
                <tr key={student._id}>
                  <td className={styles.nameCell}>{student.fullName}</td>
                  <td>{student.email}</td>
                  <td>
                    {student.section ? (
                      <span className={styles.classTag}>
                        Class {student.section.classId?.grade || "?"} - Sec {student.section.name}
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>--</span>
                    )}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${student.isActive ? styles.active : styles.inactive}`}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className={styles.actions}>
                    <button
                      className={styles.edit}
                      title="Edit"
                      onClick={() => handleEdit(student)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={styles.delete}
                      title="Delete"
                      onClick={() => handleDelete(student._id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <p>
          Showing {students.length} of {totalStudents} results (Page {page})
        </p>
        <div className={styles.pageBtns}>
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <button
            disabled={page * LIMIT >= totalStudents || loading}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        studentToEdit={editingStudent}
      />
    </div>
  );
}
