"use client";

import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import styles from "./studentDashboard.module.scss";
import { API, STUDENT_ID_STORAGE_KEY } from "../constants";

type DashboardData = any;

function AttendanceCalendar({
  records,
  holidays = [],
  halfDayRequests = [],
}: {
  records: any[];
  holidays?: any[];
  halfDayRequests?: any[];
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    days.push(date);
  }

  const isSchoolHoliday = (date: Date): { isHoliday: boolean; title?: string } => {
    const dateStr = date.toISOString().split("T")[0];
    const holiday = holidays.find((h) => {
      if (!h.date) return false;
      const holidayDate = new Date(h.date);
      holidayDate.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return holidayDate.getTime() === checkDate.getTime();
    });
    return holiday ? { isHoliday: true, title: holiday.title } : { isHoliday: false };
  };

  const getAttendanceStatus = (date: Date): { status: string | null; halfDayType?: string } => {
    const dateStr = date.toISOString().split("T")[0];
    const record = records.find((r) => r.date?.startsWith(dateStr));
    if (record) {
      return { status: record.status, halfDayType: record.halfDayType };
    }
    // Check approved half-day requests
    const halfDay = halfDayRequests.find(
      (h) => h.status === "approved" && h.date?.startsWith(dateStr)
    );
    if (halfDay) {
      return { status: "half_day", halfDayType: halfDay.halfDayType };
    }
    return { status: null };
  };

  const getStatusColor = (status: string | null): string => {
    if (!status) return "transparent";
    switch (status) {
      case "present":
        return "#10b981";
      case "absent":
        return "#ef4444";
      case "late":
        return "#f59e0b";
      case "excused":
        return "#6b7280";
      case "half_day":
        return "#06b6d4";
      case "holiday":
        return "#8b5cf6";
      default:
        return "transparent";
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHeader}>
        <button type="button" onClick={prevMonth} className={styles.calendarNav}>
          ←
        </button>
        <h3>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button type="button" onClick={nextMonth} className={styles.calendarNav}>
          →
        </button>
      </div>
      <div className={styles.calendarGrid}>
        {weekDays.map((day) => (
          <div key={day} className={styles.calendarDayHeader}>
            {day}
          </div>
        ))}
        {days.map((date, idx) => {
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
          const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const schoolHoliday = isSchoolHoliday(date);
          const isHoliday = isWeekend || schoolHoliday.isHoliday;
          const attendanceData = isHoliday ? { status: "holiday" as const } : getAttendanceStatus(date);
          const status = attendanceData.status;
          const halfDayType = attendanceData.halfDayType;

          return (
            <div
              key={idx}
              className={`${styles.calendarDay} ${!isCurrentMonth ? styles.calendarDayOther : ""} ${
                isToday ? styles.calendarDayToday : ""
              } ${isWeekend ? styles.calendarDayWeekend : ""} ${
                schoolHoliday.isHoliday ? styles.calendarDayHoliday : ""
              }`}
              style={{
                backgroundColor: status
                  ? getStatusColor(status) + (isHoliday ? "15" : "20")
                  : "transparent",
                borderColor: status ? getStatusColor(status) : undefined,
              }}
              title={
                schoolHoliday.isHoliday
                  ? `Holiday: ${schoolHoliday.title}`
                  : isWeekend
                    ? "Weekend"
                    : status === "half_day"
                      ? `Half-day (${halfDayType})`
                      : status
                        ? `Status: ${status}`
                        : ""
              }
            >
              <span>{date.getDate()}</span>
              {isHoliday && <span className={styles.calendarHolidayIcon}>🎉</span>}
              {status === "half_day" && (
                <span className={styles.calendarHalfDayBadge}>{halfDayType === "morning" ? "AM" : "PM"}</span>
              )}
              {status && !isHoliday && status !== "half_day" && (
                <span
                  className={styles.calendarStatusDot}
                  style={{ backgroundColor: getStatusColor(status) }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className={styles.calendarLegend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: "#10b981" }} />
          Present
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: "#ef4444" }} />
          Absent
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: "#f59e0b" }} />
          Late
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: "#6b7280" }} />
          Excused
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: "#06b6d4" }} />
          Half-Day
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: "#8b5cf6" }} />
          Holiday
        </div>
      </div>
    </div>
  );
}

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
    recent: (() => {
      const records: any[] = [];
      const today = new Date();
      for (let i = 0; i < 60; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        let status = "present";
        if (i % 10 === 0) status = "absent";
        else if (i % 15 === 0) status = "late";
        records.push({
          _id: `ATT_${i}`,
          date: date.toISOString(),
          status,
        });
      }
      return records.reverse();
    })(),
  },
  holidaysUpcoming: [
    { _id: "H1", title: "Festival Break", date: new Date(Date.now() + 10 * 86400000).toISOString() },
    { _id: "H2", title: "Sports Day", date: new Date(Date.now() + 25 * 86400000).toISOString() },
    { _id: "H3", title: "Independence Day", date: new Date(Date.now() + 5 * 86400000).toISOString() },
    { _id: "H4", title: "Diwali", date: new Date(Date.now() + 45 * 86400000).toISOString() },
  ],
  notices: [
    {
      _id: "N1",
      title: "Annual Sports Day Registration",
      content: "Registration for Annual Sports Day is now open. Please submit your forms by February 15th.",
      postedBy: "Principal",
      postedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      priority: "high",
    },
    {
      _id: "N2",
      title: "Library Hours Extended",
      content: "The school library will now be open until 6 PM on weekdays for better access to study materials.",
      postedBy: "Librarian",
      postedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      priority: "normal",
    },
    {
      _id: "N3",
      title: "Parent-Teacher Meeting",
      content: "Scheduled for February 20th, 2026. Please ensure your parents attend to discuss your progress.",
      postedBy: "Class Teacher",
      postedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      priority: "high",
    },
    {
      _id: "N4",
      title: "Science Fair Project Submission",
      content: "Science fair projects are due by March 1st. Submit your projects to your science teacher.",
      postedBy: "Science Department",
      postedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      priority: "normal",
    },
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
    "overview" | "timetable" | "assignments" | "attendance" | "holidays" | "fees" | "submit" | "halfday"
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
    attachments: [] as Array<{ type: string; url: string; name: string; file?: File }>,
  });
  const [uploadMethod, setUploadMethod] = useState<"file" | "drive" | "link">("file");
  const [linkInput, setLinkInput] = useState("");
  const [linkName, setLinkName] = useState("");

  const [halfDayRequest, setHalfDayRequest] = useState({
    date: "",
    halfDayType: "morning",
    reason: "",
  });

  const [halfDayRequests, setHalfDayRequests] = useState<any[]>([]);

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
  const notices = useMemo(() => data?.notices || [], [data]);
  const attendanceSummary = useMemo(() => data?.attendance?.summary || null, [data]);
  const attendanceRecords = useMemo(() => data?.attendance?.recent || [], [data]);

  useEffect(() => {
    if (USE_FAKE_DATA && studentId) {
      // Load fake half-day requests
      setHalfDayRequests([
        {
          _id: "HD1",
          date: new Date(Date.now() + 3 * 86400000).toISOString(),
          halfDayType: "morning",
          reason: "Medical appointment",
          status: "pending",
        },
        {
          _id: "HD2",
          date: new Date(Date.now() - 5 * 86400000).toISOString(),
          halfDayType: "afternoon",
          reason: "Family event",
          status: "approved",
          verifiedBy: { fullName: "Aarav Patel" },
        },
      ]);
    } else if (studentId) {
      // Load real half-day requests
      fetch(`${API}/students/${studentId}/half-day-requests`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success) setHalfDayRequests(json.requests || []);
        })
        .catch(() => {});
    }
  }, [studentId]);

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
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "halfday"}
              className={activeTab === "halfday" ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab("halfday")}
            >
              Half-Day Request
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
                <h2>Notice Board</h2>
                {notices.length ? (
                  <ul className={styles.list}>
                    {notices.map((notice: any) => (
                      <li
                        key={notice._id}
                        className={`${styles.listItem} ${
                          notice.priority === "high" ? styles.noticeHigh : ""
                        }`}
                      >
                        <div className={styles.liTitle}>
                          {notice.title}
                          {notice.priority === "high" && (
                            <span className={styles.pill} style={{ background: "#ef4444", color: "white" }}>
                              Important
                            </span>
                          )}
                        </div>
                        <div className={styles.liMeta}>{notice.content}</div>
                        <div className={styles.liMeta} style={{ fontSize: "11px", marginTop: "4px" }}>
                          Posted by {notice.postedBy} · {new Date(notice.postedAt).toLocaleDateString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.muted}>No notices available.</div>
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
            <div className={styles.attendanceContainer}>
              {attendanceSummary ? (
                <>
                  <section className={styles.card}>
                    <h2>Attendance Statistics</h2>
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
                    <div className={styles.pieChartContainer}>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Present", value: attendanceSummary.present, color: "#10b981" },
                              { name: "Absent", value: attendanceSummary.absent, color: "#ef4444" },
                              { name: "Late", value: attendanceSummary.late, color: "#f59e0b" },
                              { name: "Excused", value: attendanceSummary.excused || 0, color: "#6b7280" },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(props: any) => {
                              const { name, percent } = props;
                              const pct = percent ?? 0;
                              return `${name || ""}: ${(pct * 100).toFixed(0)}%`;
                            }}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[
                              { name: "Present", value: attendanceSummary.present, color: "#10b981" },
                              { name: "Absent", value: attendanceSummary.absent, color: "#ef4444" },
                              { name: "Late", value: attendanceSummary.late, color: "#f59e0b" },
                              { name: "Excused", value: attendanceSummary.excused || 0, color: "#6b7280" },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                  <section className={styles.card}>
                    <h2>Attendance Calendar</h2>
                    <AttendanceCalendar records={attendanceRecords} holidays={holidays} />
                  </section>
                </>
              ) : (
                <div className={styles.muted}>No attendance data yet.</div>
              )}
            </div>
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

                  <div className={styles.uploadSection}>
                    <h3>Add Attachments</h3>
                    <p className={styles.uploadHint}>Choose how you want to attach your files:</p>
                    
                    <div className={styles.uploadMethods}>
                      {/* File Upload Method */}
                      <div className={styles.uploadMethodCard}>
                        <div className={styles.uploadMethodHeader}>
                          <span className={styles.uploadIcon}>📱</span>
                          <h4>Upload from Device</h4>
                        </div>
                        <p className={styles.uploadMethodDesc}>Upload files directly from your phone or computer</p>
                        <input
                          id="file-upload"
                          type="file"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            const newAttachments = files.map((file) => ({
                              type: "file",
                              url: URL.createObjectURL(file),
                              name: file.name,
                              file,
                            }));
                            setSubmission((s) => ({
                              ...s,
                              attachments: [...s.attachments, ...newAttachments],
                            }));
                            toast.success(`${files.length} file(s) added`);
                            // Reset input
                            e.target.value = "";
                          }}
                          className={styles.fileInput}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                        />
                        <label htmlFor="file-upload" className={styles.fileInputLabel}>
                          📎 Choose Files
                        </label>
                      </div>

                      {/* Google Drive Method */}
                      <div className={styles.uploadMethodCard}>
                        <div className={styles.uploadMethodHeader}>
                          <span className={styles.uploadIcon}>☁️</span>
                          <h4>Google Drive Link</h4>
                        </div>
                        <p className={styles.uploadMethodDesc}>Paste a shareable Google Drive link</p>
                        <div className={styles.uploadContent}>
                          <input
                            type="text"
                            placeholder="Paste Google Drive share link..."
                            value={uploadMethod === "drive" ? linkInput : ""}
                            onChange={(e) => {
                              setLinkInput(e.target.value);
                              setUploadMethod("drive");
                            }}
                            onFocus={() => setUploadMethod("drive")}
                          />
                          <input
                            type="text"
                            placeholder="File name (optional)"
                            value={uploadMethod === "drive" ? linkName : ""}
                            onChange={(e) => {
                              setLinkName(e.target.value);
                              setUploadMethod("drive");
                            }}
                            onFocus={() => setUploadMethod("drive")}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (linkInput.trim()) {
                                setSubmission((s) => ({
                                  ...s,
                                  attachments: [
                                    ...s.attachments,
                                    {
                                      type: "drive",
                                      url: linkInput.trim(),
                                      name: linkName.trim() || "Google Drive File",
                                    },
                                  ],
                                }));
                                setLinkInput("");
                                setLinkName("");
                                toast.success("Google Drive link added");
                              } else {
                                toast.error("Please enter a Google Drive link");
                              }
                            }}
                            className={styles.secondaryBtn}
                          >
                            Add Drive Link
                          </button>
                        </div>
                      </div>

                      {/* URL/Link Method */}
                      <div className={styles.uploadMethodCard}>
                        <div className={styles.uploadMethodHeader}>
                          <span className={styles.uploadIcon}>🔗</span>
                          <h4>External Link/URL</h4>
                        </div>
                        <p className={styles.uploadMethodDesc}>Add a link to a file hosted elsewhere</p>
                        <div className={styles.uploadContent}>
                          <input
                            type="text"
                            placeholder="Paste file URL or link..."
                            value={uploadMethod === "link" ? linkInput : ""}
                            onChange={(e) => {
                              setLinkInput(e.target.value);
                              setUploadMethod("link");
                            }}
                            onFocus={() => setUploadMethod("link")}
                          />
                          <input
                            type="text"
                            placeholder="Link name/description (optional)"
                            value={uploadMethod === "link" ? linkName : ""}
                            onChange={(e) => {
                              setLinkName(e.target.value);
                              setUploadMethod("link");
                            }}
                            onFocus={() => setUploadMethod("link")}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (linkInput.trim()) {
                                setSubmission((s) => ({
                                  ...s,
                                  attachments: [
                                    ...s.attachments,
                                    {
                                      type: "link",
                                      url: linkInput.trim(),
                                      name: linkName.trim() || "External Link",
                                    },
                                  ],
                                }));
                                setLinkInput("");
                                setLinkName("");
                                toast.success("Link added");
                              } else {
                                toast.error("Please enter a URL");
                              }
                            }}
                            className={styles.secondaryBtn}
                          >
                            Add Link
                          </button>
                        </div>
                      </div>
                    </div>

                    {submission.attachments.length > 0 && (
                      <div className={styles.attachmentsList}>
                        <h4>Attachments ({submission.attachments.length}):</h4>
                        <ul>
                          {submission.attachments.map((att, idx) => (
                            <li key={idx} className={styles.attachmentItem}>
                              <span>
                                {att.type === "file" ? "📎" : att.type === "drive" ? "☁️" : "🔗"}{" "}
                                {att.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSubmission((s) => ({
                                    ...s,
                                    attachments: s.attachments.filter((_, i) => i !== idx),
                                  }));
                                }}
                                className={styles.removeBtn}
                              >
                                ✕
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={async () => {
                      if (!submission.assignmentId) {
                        toast.error("Please select an assignment");
                        return;
                      }

                      const attachments = submission.attachments.map((att) => ({
                        url: att.url,
                        name: att.name,
                        fileType: att.type === "file" ? "file" : att.type === "drive" ? "drive" : "link",
                        fileSize: att.file?.size,
                      }));

                      if (USE_FAKE_DATA) {
                        toast.success("Homework submitted successfully!");
                        setSubmission({
                          assignmentId: "",
                          submissionText: "",
                          attachments: [],
                        });
                        setLinkInput("");
                        setLinkName("");
                      } else {
                        try {
                          const res = await fetch(
                            `${API}/students/${studentId}/assignments/${submission.assignmentId}/submission`,
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                submissionText: submission.submissionText,
                                attachments,
                              }),
                            }
                          );
                          const json = await res.json();
                          if (json.success) {
                            toast.success("Homework submitted successfully!");
                            setSubmission({
                              assignmentId: "",
                              submissionText: "",
                              attachments: [],
                            });
                            setLinkInput("");
                            setLinkName("");
                          } else {
                            toast.error(json.message || "Failed to submit");
                          }
                        } catch (e: any) {
                          toast.error(e?.message || "Failed to submit");
                        }
                      }
                    }}
                    className={styles.primaryBtn}
                  >
                    Submit
                  </button>
                </div>
              ) : (
                <div className={styles.muted}>No assignments available to submit.</div>
              )}
            </section>
          )}

          {activeTab === "halfday" && (
            <div className={styles.grid}>
              <section className={styles.card}>
                <h2>Request Half-Day</h2>
                <div className={styles.formGridWide}>
                  <input
                    type="date"
                    value={halfDayRequest.date}
                    onChange={(e) =>
                      setHalfDayRequest((r) => ({ ...r, date: e.target.value }))
                    }
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <select
                    value={halfDayRequest.halfDayType}
                    onChange={(e) =>
                      setHalfDayRequest((r) => ({ ...r, halfDayType: e.target.value }))
                    }
                  >
                    <option value="morning">Morning Half-Day</option>
                    <option value="afternoon">Afternoon Half-Day</option>
                  </select>
                  <textarea
                    placeholder="Reason for half-day request..."
                    value={halfDayRequest.reason}
                    onChange={(e) =>
                      setHalfDayRequest((r) => ({ ...r, reason: e.target.value }))
                    }
                    rows={4}
                  />
                  <button
                    onClick={async () => {
                      if (!halfDayRequest.date) {
                        toast.error("Please select a date");
                        return;
                      }
                      if (USE_FAKE_DATA) {
                        const newRequest = {
                          _id: `HD_${Date.now()}`,
                          date: new Date(halfDayRequest.date).toISOString(),
                          halfDayType: halfDayRequest.halfDayType,
                          reason: halfDayRequest.reason,
                          status: "pending",
                        };
                        setHalfDayRequests([...halfDayRequests, newRequest]);
                        toast.success("Half-day request submitted");
                        setHalfDayRequest({ date: "", halfDayType: "morning", reason: "" });
                      } else {
                        try {
                          const res = await fetch(`${API}/students/${studentId}/half-day-requests`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(halfDayRequest),
                          });
                          const json = await res.json();
                          if (json.success) {
                            toast.success("Half-day request submitted");
                            setHalfDayRequest({ date: "", halfDayType: "morning", reason: "" });
                            // Reload requests
                            const reqRes = await fetch(`${API}/students/${studentId}/half-day-requests`);
                            const reqJson = await reqRes.json();
                            if (reqJson.success) setHalfDayRequests(reqJson.requests || []);
                          } else {
                            toast.error(json.message || "Failed to submit request");
                          }
                        } catch (e: any) {
                          toast.error(e?.message || "Failed to submit request");
                        }
                      }
                    }}
                    className={styles.primaryBtn}
                  >
                    Submit Request
                  </button>
                </div>
              </section>
              <section className={styles.card}>
                <h2>My Half-Day Requests</h2>
                {halfDayRequests.length ? (
                  <ul className={styles.list}>
                    {halfDayRequests.map((req: any) => (
                      <li key={req._id} className={styles.listItem}>
                        <div className={styles.liTitle}>
                          {new Date(req.date).toLocaleDateString()} - {req.halfDayType === "morning" ? "Morning" : "Afternoon"}
                          <span
                            className={`${styles.pill} ${
                              req.status === "approved"
                                ? styles.good
                                : req.status === "rejected"
                                  ? styles.warn
                                  : ""
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <div className={styles.liMeta}>
                          {req.reason && `Reason: ${req.reason}`}
                          {req.verifiedBy && ` · Verified by: ${req.verifiedBy.fullName}`}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.muted}>No half-day requests yet.</div>
                )}
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}


