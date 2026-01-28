"use client";

import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import styles from "./studentDashboard.module.scss";
import { STUDENT_ID_STORAGE_KEY } from "../constants";

type DashboardData = any;

const USE_FAKE_DATA = true;

const FAKE_DASHBOARD: DashboardData = {
  success: true,
  student: {
    _id: "FAKE_STUDENT_001",
    fullName: "Student One",
    school: { _id: "FAKE_SCHOOL_001", name: "Springfield Public School" },
    section: { _id: "FAKE_SECTION_A", name: "A", classId: { grade: 5 } },
  },
  attendance: {
    summary: { total: 60, present: 54, absent: 4, late: 2, excused: 0 },
    recent: [],
  },
  holidaysUpcoming: [
    { _id: "H1", title: "Festival Break", date: new Date(Date.now() + 10 * 86400000).toISOString() },
    { _id: "H2", title: "Sports Day", date: new Date(Date.now() + 25 * 86400000).toISOString() },
  ],
  timetable: [
    {
      _id: "T1",
      dayOfWeek: 1,
      startMinute: 540,
      endMinute: 585,
      subjectId: { name: "Mathematics", code: "MATH" },
      teacherId: { fullName: "Aarav Patel" },
    },
    {
      _id: "T2",
      dayOfWeek: 1,
      startMinute: 590,
      endMinute: 635,
      subjectId: { name: "Science", code: "SCI" },
      teacherId: { fullName: "Diya Saxena" },
    },
    {
      _id: "T3",
      dayOfWeek: 2,
      startMinute: 540,
      endMinute: 585,
      subjectId: { name: "English", code: "ENG" },
      teacherId: { fullName: "Vihaan Gupta" },
    },
  ],
  assignments: [
    {
      _id: "A1",
      title: "Math Homework - Fractions",
      type: "homework",
      subject: { name: "Mathematics", code: "MATH" },
      assignedBy: { fullName: "Aarav Patel" },
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      mySubmission: null,
    },
    {
      _id: "A2",
      title: "Science Classwork - Plants",
      type: "classwork",
      subject: { name: "Science", code: "SCI" },
      assignedBy: { fullName: "Diya Saxena" },
      dueDate: null,
      mySubmission: { status: "submitted", submittedAt: new Date().toISOString() },
    },
    {
      _id: "A3",
      title: "English Assignment - Essay",
      type: "assignment",
      subject: { name: "English", code: "ENG" },
      assignedBy: { fullName: "Vihaan Gupta" },
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      mySubmission: { status: "submitted", submittedAt: new Date(Date.now() - 86400000).toISOString() },
    },
  ],
  fees: [
    {
      _id: "F1",
      academicYearStart: new Date(new Date().getFullYear(), 3, 1).toISOString(),
      academicYearEnd: new Date(new Date().getFullYear() + 1, 2, 31).toISOString(),
      remainingAmount: 13000,
      currency: "INR",
      status: "partial",
    },
  ],
  payments: [
    {
      _id: "P1",
      amount: 10000,
      method: "upi",
      reference: "UPI-TXN-123456",
      receivedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ],
};

function formatMinute(min: number) {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const h12 = ((h24 + 11) % 12) + 1;
  const ampm = h24 >= 12 ? "PM" : "AM";
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function StudentDashboard() {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "timetable" | "assignments" | "attendance" | "holidays" | "fees" | "submit"
  >("overview");

  const [feePayment, setFeePayment] = useState({
    studentFeeId: "",
    amount: "",
    method: "upi",
    reference: "",
    notes: "",
  });

  const [submission, setSubmission] = useState({
    assignmentId: "",
    submissionText: "",
    attachmentUrl: "",
    attachmentName: "",
  });

  useEffect(() => {
    const saved = window.localStorage.getItem(STUDENT_ID_STORAGE_KEY);
    const initial = saved || "FAKE_STUDENT_001";
    setStudentId(initial);
    if (USE_FAKE_DATA) {
      setData(FAKE_DASHBOARD);
    }
  }, []);

  async function loadDashboard(id: string) {
    if (!id) return;
    if (USE_FAKE_DATA) {
      setLoading(true);
      setTimeout(() => {
        setData(FAKE_DASHBOARD);
        setLoading(false);
      }, 250);
      return;
    }
  }

  useEffect(() => {
    if (studentId) loadDashboard(studentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const assignments = useMemo(() => data?.assignments || [], [data]);
  const fees = useMemo(() => data?.fees || [], [data]);
  const payments = useMemo(() => data?.payments || [], [data]);
  const timetable = useMemo(() => data?.timetable || [], [data]);
  const holidays = useMemo(() => data?.holidaysUpcoming || [], [data]);
  const attendanceSummary = useMemo(() => data?.attendance?.summary || null, [data]);

  async function payFee() {
    if (!feePayment.studentFeeId) return toast.error("Select a fee record");
    const amount = Number(feePayment.amount);
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");

    if (USE_FAKE_DATA) {
      setData((prev: any) => {
        if (!prev) return prev;
        const payments = Array.isArray(prev.payments) ? prev.payments : [];
        const fees = Array.isArray(prev.fees) ? prev.fees : [];
        const fee = fees.find((f: any) => f._id === feePayment.studentFeeId);
        if (!fee) return prev;
        const remaining = Math.max(0, Number(fee.remainingAmount || 0) - amount);
        const updatedFees = fees.map((f: any) =>
          f._id === fee._id
            ? { ...f, remainingAmount: remaining, status: remaining === 0 ? "paid" : "partial" }
            : f
        );
        const newPayment = {
          _id: `P${Date.now()}`,
          amount,
          method: feePayment.method,
          reference: feePayment.reference,
          receivedAt: new Date().toISOString(),
        };
        return { ...prev, fees: updatedFees, payments: [newPayment, ...payments] };
      });
      toast.success("Payment recorded (fake)");
      setFeePayment((p) => ({ ...p, amount: "", reference: "", notes: "" }));
      return;
    }
  }

  async function submitHomework() {
    if (!submission.assignmentId) return toast.error("Select an assignment");

    const attachments =
      submission.attachmentUrl.trim() !== ""
        ? [
            {
              url: submission.attachmentUrl.trim(),
              name: submission.attachmentName?.trim() || undefined,
            },
          ]
        : [];

    if (USE_FAKE_DATA) {
      setData((prev: any) => {
        if (!prev) return prev;
        const assignments = Array.isArray(prev.assignments) ? prev.assignments : [];
        const updated = assignments.map((a: any) =>
          a._id === submission.assignmentId
            ? {
                ...a,
                mySubmission: {
                  status: "submitted",
                  submittedAt: new Date().toISOString(),
                  submissionText: submission.submissionText,
                  attachments,
                },
              }
            : a
        );
        return { ...prev, assignments: updated };
      });
      toast.success("Submitted (fake)");
      setSubmission({
        assignmentId: "",
        submissionText: "",
        attachmentUrl: "",
        attachmentName: "",
      });
      return;
    }
  }

  return (
    <div className={styles.wrapper}>
      <Toaster />

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Student Dashboard</h1>
          <div className={styles.subtitle}>
            View assignments, attendance, timetable, holidays, fees, and submit homework.
          </div>
        </div>

        <div className={styles.studentIdBox}>
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Student ID (for later auth) — fake data mode"
          />
          <button
            onClick={() => {
              window.localStorage.setItem(STUDENT_ID_STORAGE_KEY, studentId);
              loadDashboard(studentId);
            }}
            disabled={!studentId || loading}
          >
            Load
          </button>
        </div>
      </div>

      {loading && <div className={styles.loading}>Loading...</div>}

      {!loading && !data && (
        <div className={styles.empty}>
          Enter a valid student id to load your dashboard.
        </div>
      )}

      {data && (
        <>
          <div className={styles.tabs} role="tablist" aria-label="Student dashboard tabs">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "overview"}
              className={activeTab === "overview" ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "timetable"}
              className={activeTab === "timetable" ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab("timetable")}
            >
              Timetable
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "assignments"}
              className={activeTab === "assignments" ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab("assignments")}
            >
              Assignments
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "attendance"}
              className={activeTab === "attendance" ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab("attendance")}
            >
              Attendance
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "holidays"}
              className={activeTab === "holidays" ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab("holidays")}
            >
              Holidays
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "fees"}
              className={activeTab === "fees" ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab("fees")}
            >
              Fees
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "submit"}
              className={activeTab === "submit" ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab("submit")}
            >
              Submit Homework
            </button>
          </div>

          {activeTab === "overview" && (
            <div className={styles.grid}>
              <section className={styles.card}>
                <h2>Attendance</h2>
                {attendanceSummary ? (
                  <div className={styles.kvGrid}>
                    <div>
                      <div className={styles.k}>Total</div>
                      <div className={styles.v}>{attendanceSummary.total}</div>
                    </div>
                    <div>
                      <div className={styles.k}>Present</div>
                      <div className={styles.v}>{attendanceSummary.present}</div>
                    </div>
                    <div>
                      <div className={styles.k}>Absent</div>
                      <div className={styles.v}>{attendanceSummary.absent}</div>
                    </div>
                    <div>
                      <div className={styles.k}>Late</div>
                      <div className={styles.v}>{attendanceSummary.late}</div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.muted}>No attendance data yet.</div>
                )}
              </section>

              <section className={styles.card}>
                <h2>Upcoming Holidays</h2>
                {holidays.length ? (
                  <ul className={styles.list}>
                    {holidays.slice(0, 6).map((h: any) => (
                      <li key={h._id} className={styles.listItem}>
                        <div className={styles.liTitle}>{h.title}</div>
                        <div className={styles.liMeta}>
                          {new Date(h.date).toLocaleDateString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.muted}>No upcoming holidays.</div>
                )}
              </section>

              <section className={styles.cardWide}>
                <h2>Assignments (Top)</h2>
                {assignments.length ? (
                  <ul className={styles.list}>
                    {assignments.slice(0, 6).map((a: any) => (
                      <li key={a._id} className={styles.listItem}>
                        <div className={styles.liTitle}>
                          {a.title} <span className={styles.pill}>{a.type}</span>
                        </div>
                        <div className={styles.liMeta}>
                          {a.subject?.name ? `Subject: ${a.subject.name}` : ""}{" "}
                          {a.assignedBy?.fullName ? `· Teacher: ${a.assignedBy.fullName}` : ""}
                          {a.dueDate
                            ? ` · Due: ${new Date(a.dueDate).toLocaleDateString()}`
                            : ""}
                        </div>
                        <div className={styles.liMeta}>
                          {a.mySubmission ? (
                            <span className={styles.good}>Submitted ({a.mySubmission.status})</span>
                          ) : (
                            <span className={styles.warn}>Not submitted</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.muted}>No assignments yet.</div>
                )}
              </section>
            </div>
          )}

          {activeTab === "timetable" && (
            <section className={styles.cardWide}>
              <h2>Class Schedule (Timetable)</h2>
              {timetable.length ? (
                <div className={styles.table}>
                  <div className={styles.trHead}>
                    <div>Day</div>
                    <div>Time</div>
                    <div>Subject</div>
                    <div>Teacher</div>
                  </div>
                  {timetable.map((t: any) => (
                    <div key={t._id} className={styles.tr}>
                      <div>{t.dayOfWeek}</div>
                      <div>
                        {formatMinute(t.startMinute)} - {formatMinute(t.endMinute)}
                      </div>
                      <div>{t.subjectId?.name || "—"}</div>
                      <div>{t.teacherId?.fullName || "—"}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.muted}>No timetable entries.</div>
              )}
            </section>
          )}

          {activeTab === "assignments" && (
            <section className={styles.cardWide}>
              <h2>Assignments / Classwork</h2>
              {assignments.length ? (
                <ul className={styles.list}>
                  {assignments.map((a: any) => (
                    <li key={a._id} className={styles.listItem}>
                      <div className={styles.liTitle}>
                        {a.title} <span className={styles.pill}>{a.type}</span>
                      </div>
                      <div className={styles.liMeta}>
                        {a.subject?.name ? `Subject: ${a.subject.name}` : ""}{" "}
                        {a.assignedBy?.fullName ? `· Teacher: ${a.assignedBy.fullName}` : ""}
                        {a.dueDate
                          ? ` · Due: ${new Date(a.dueDate).toLocaleDateString()}`
                          : ""}
                      </div>
                      <div className={styles.liMeta}>
                        {a.mySubmission ? (
                          <span className={styles.good}>Submitted ({a.mySubmission.status})</span>
                        ) : (
                          <span className={styles.warn}>Not submitted</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.muted}>No assignments yet.</div>
              )}
            </section>
          )}

          {activeTab === "attendance" && (
            <section className={styles.cardWide}>
              <h2>Attendance</h2>
              {attendanceSummary ? (
                <div className={styles.kvGrid}>
                  <div>
                    <div className={styles.k}>Total</div>
                    <div className={styles.v}>{attendanceSummary.total}</div>
                  </div>
                  <div>
                    <div className={styles.k}>Present</div>
                    <div className={styles.v}>{attendanceSummary.present}</div>
                  </div>
                  <div>
                    <div className={styles.k}>Absent</div>
                    <div className={styles.v}>{attendanceSummary.absent}</div>
                  </div>
                  <div>
                    <div className={styles.k}>Late</div>
                    <div className={styles.v}>{attendanceSummary.late}</div>
                  </div>
                </div>
              ) : (
                <div className={styles.muted}>No attendance data yet.</div>
              )}
            </section>
          )}

          {activeTab === "holidays" && (
            <section className={styles.cardWide}>
              <h2>Upcoming Holidays</h2>
              {holidays.length ? (
                <ul className={styles.list}>
                  {holidays.map((h: any) => (
                    <li key={h._id} className={styles.listItem}>
                      <div className={styles.liTitle}>{h.title}</div>
                      <div className={styles.liMeta}>
                        {new Date(h.date).toLocaleDateString()}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.muted}>No upcoming holidays.</div>
              )}
            </section>
          )}

          {activeTab === "fees" && (
            <div className={styles.grid}>
              <section className={styles.card}>
                <h2>Pay Fees</h2>
                {fees.length ? (
                  <>
                    <select
                      value={feePayment.studentFeeId}
                      onChange={(e) =>
                        setFeePayment((p) => ({ ...p, studentFeeId: e.target.value }))
                      }
                    >
                      <option value="">Select fee record</option>
                      {fees.map((f: any) => (
                        <option key={f._id} value={f._id}>
                          {new Date(f.academicYearStart).getFullYear()}-{new Date(
                            f.academicYearEnd
                          ).getFullYear()} · Remaining: {f.remainingAmount} {f.currency} · {f.status}
                        </option>
                      ))}
                    </select>
                    <div className={styles.formGrid}>
                      <input
                        placeholder="Amount"
                        value={feePayment.amount}
                        onChange={(e) =>
                          setFeePayment((p) => ({ ...p, amount: e.target.value }))
                        }
                      />
                      <select
                        value={feePayment.method}
                        onChange={(e) =>
                          setFeePayment((p) => ({ ...p, method: e.target.value }))
                        }
                      >
                        <option value="upi">UPI</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cheque">Cheque</option>
                      </select>
                      <input
                        placeholder="Reference (optional)"
                        value={feePayment.reference}
                        onChange={(e) =>
                          setFeePayment((p) => ({ ...p, reference: e.target.value }))
                        }
                      />
                      <input
                        placeholder="Notes (optional)"
                        value={feePayment.notes}
                        onChange={(e) =>
                          setFeePayment((p) => ({ ...p, notes: e.target.value }))
                        }
                      />
                      <button onClick={payFee} className={styles.primaryBtn}>
                        Pay
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={styles.muted}>No fee records found.</div>
                )}
              </section>

              <section className={styles.card}>
                <h2>Past Payments</h2>
                {payments.length ? (
                  <ul className={styles.list}>
                    {payments.slice(0, 10).map((p: any) => (
                      <li key={p._id} className={styles.listItem}>
                        <div className={styles.liTitle}>
                          {p.amount} · {p.method}
                        </div>
                        <div className={styles.liMeta}>
                          {new Date(p.receivedAt).toLocaleString()}
                          {p.reference ? ` · Ref: ${p.reference}` : ""}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.muted}>No payments yet.</div>
                )}
              </section>
            </div>
          )}

          {activeTab === "submit" && (
            <section className={styles.cardWide}>
              <h2>Submit Homework</h2>
              {assignments.length ? (
                <div className={styles.formGridWide}>
                  <select
                    value={submission.assignmentId}
                    onChange={(e) =>
                      setSubmission((s) => ({ ...s, assignmentId: e.target.value }))
                    }
                  >
                    <option value="">Select assignment</option>
                    {assignments.map((a: any) => (
                      <option key={a._id} value={a._id}>
                        {a.title} ({a.type})
                      </option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Write your homework submission..."
                    value={submission.submissionText}
                    onChange={(e) =>
                      setSubmission((s) => ({ ...s, submissionText: e.target.value }))
                    }
                    rows={6}
                  />
                  <div className={styles.row2}>
                    <input
                      placeholder="Attachment URL (optional)"
                      value={submission.attachmentUrl}
                      onChange={(e) =>
                        setSubmission((s) => ({ ...s, attachmentUrl: e.target.value }))
                      }
                    />
                    <input
                      placeholder="Attachment name (optional)"
                      value={submission.attachmentName}
                      onChange={(e) =>
                        setSubmission((s) => ({ ...s, attachmentName: e.target.value }))
                      }
                    />
                  </div>
                  <button onClick={submitHomework} className={styles.primaryBtn}>
                    Submit
                  </button>
                </div>
              ) : (
                <div className={styles.muted}>No assignments available to submit.</div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}


