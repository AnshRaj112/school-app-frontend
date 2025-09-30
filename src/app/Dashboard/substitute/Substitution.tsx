
"use client";
import { useState } from "react";
import styles from "./styles/Substitution.module.scss";

const classes = ["6th", "7th", "8th", "9th", "10th"];
const sections = ["A", "B", "C", "D"];
const periods = ["1st", "2nd", "3rd", "4th", "5th"];
const subjectsByPeriod: Record<string, string[]> = {
  "1st": ["Math", "English"],
  "2nd": ["Physics", "Chemistry", "Chemistry Lab"], // Chemistry Lab has no teachers!
  "3rd": ["Biology", "History"],
  "4th": ["Computer Science", "Art"],
  "5th": ["Physical Education", "Music"]
};

const teachersByPeriodSubject: Record<string, Array<{ id: string; name: string }>> = {
  "1st_Math": [
    { id: "T001", name: "Mr. Smith" },
    { id: "T002", name: "Ms. Johnson" }
  ],
  "1st_English": [{ id: "T003", name: "Mrs. Davis" }],
  "2nd_Physics": [
    { id: "T004", name: "Mr. Wilson" },
    { id: "T005", name: "Ms. Brown" }
  ],
  "2nd_Chemistry": [
    { id: "T006", name: "Mrs. Clark" },
    { id: "T007", name: "Mr. Lee" }
  ],
  "3rd_Biology": [{ id: "T008", name: "Mr. Lewis" }],
  "3rd_History": [
    { id: "T009", name: "Mrs. Walker" },
    { id: "T010", name: "Ms. Harris" }
  ],
  "4th_Computer Science": [
    { id: "T011", name: "Mr. Young" },
    { id: "T012", name: "Ms. King" }
  ],
  "4th_Art": [{ id: "T013", name: "Mrs. Scott" }],
  "5th_Physical Education": [{ id: "T014", name: "Coach Carter" }],
  "5th_Music": [{ id: "T015", name: "Ms. Allen" }]
};

export default function Substitution() {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [confirmedTeacher, setConfirmedTeacher] = useState<{
    id: string;
    name: string;
    class: string;
    section: string;
    period: string;
    subject: string;
  } | null>(null);
  const [requestSent, setRequestSent] = useState(false);

  const availableSubjects = selectedPeriod ? subjectsByPeriod[selectedPeriod] : [];
  const availableTeachers =
    selectedPeriod && selectedSubject && selectedClass && selectedSection
      ? teachersByPeriodSubject[`${selectedPeriod}_${selectedSubject}`] || []
      : [];

  // Manual clear/patch state
  const resetSelections = () => {
    setSelectedSubject("");
    setSelectedTeacher("");
    setConfirmedTeacher(null);
    setRequestSent(false);
  };

  const confirmRequest = () => {
    const teacherObj = availableTeachers.find(t => t.id === selectedTeacher);
    if (!teacherObj) return;
    setConfirmedTeacher({
      ...teacherObj,
      class: selectedClass,
      section: selectedSection,
      period: selectedPeriod,
      subject: selectedSubject
    });
    setRequestSent(true);
  };

  return (
    <div className={styles.substitutionTableWrapper}>
      <h2 className={styles.header}>Substitute Teacher</h2>

      <div className={styles.controlsRow}>
        <label>
          Class:
          <select
            value={selectedClass}
            onChange={e => {
              setSelectedClass(e.target.value);
              setSelectedSection("");
              setSelectedPeriod("");
              resetSelections();
            }}
          >
            <option value="">Select Class</option>
            {classes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          Section:
          <select
            value={selectedSection}
            onChange={e => {
              setSelectedSection(e.target.value);
              setSelectedPeriod("");
              resetSelections();
            }}
            disabled={!selectedClass}
          >
            <option value="">Select Section</option>
            {sections.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <label>
          Period:
          <select
            value={selectedPeriod}
            onChange={e => {
              const newPeriod = e.target.value;
              setSelectedPeriod(newPeriod);
              if (!subjectsByPeriod[newPeriod].includes(selectedSubject)) {
                setSelectedSubject("");
              }
              setSelectedTeacher("");
              setConfirmedTeacher(null);
              setRequestSent(false);
            }}
            disabled={!selectedClass || !selectedSection}
          >
            <option value="">Select Period</option>
            {periods.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>

        <label>
          Subject:
          <select
            value={selectedSubject}
            onChange={e => {
              setSelectedSubject(e.target.value);
              setSelectedTeacher("");
              setConfirmedTeacher(null);
              setRequestSent(false);
            }}
            disabled={!selectedPeriod}
          >
            <option value="">Select Subject</option>
            {availableSubjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      {(selectedClass && selectedSection && selectedPeriod && selectedSubject) && (
        <div className={styles.tableContainer}>
          <table className={styles.teacherTable}>
            <thead>
              <tr>
                <th>Teacher ID</th>
                <th>Name</th>
                <th>Select</th>
              </tr>
            </thead>
            <tbody>
              {availableTeachers.length > 0 ? (
                availableTeachers.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.name}</td>
                    <td>
                      <input
                        type="radio"
                        name="teacher"
                        value={t.id}
                        checked={selectedTeacher === t.id}
                        onChange={() => setSelectedTeacher(t.id)}
                        disabled={requestSent}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className={styles.noTeacherCell}>No teachers available for this selection.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={confirmRequest}
        disabled={!selectedTeacher || requestSent}
        className={styles.confirmBtn}
      >
        {requestSent ? "Request Sent" : "Confirm Substitute"}
      </button>

      {/* Confirmation summary row like attendance */}
      {confirmedTeacher && (
        <div className={styles.tableContainer} style={{marginTop:"2rem"}}>
          <table className={styles.summaryTable}>
            <thead>
              <tr>
                <th>Teacher ID</th>
                <th>Name</th>
                <th>Class</th>
                <th>Section</th>
                <th>Period</th>
                <th>Subject</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{confirmedTeacher.id}</td>
                <td>{confirmedTeacher.name}</td>
                <td>{confirmedTeacher.class}</td>
                <td>{confirmedTeacher.section}</td>
                <td>{confirmedTeacher.period}</td>
                <td>{confirmedTeacher.subject}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
