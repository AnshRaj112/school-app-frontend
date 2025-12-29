"use client";

import { useState } from "react";
import styles from "./principalLayout.module.scss";

import ClientToaster from "../components/ClientToaster";

import DashboardPage from "./dashboard/DashBoard";
import ManageSchoolPage from "./manage-school/ManageSchool";
import ManageClassesPage from "./manage-classes/ManageClasses";
import ManageTeachersPage from "./manage-teachers/ManageTeachers";
import ManageStudentsPage from "./manage-students/ManageStudents";
import ManageSubjectsPage from "./manage-subjects/manageSubjects";

type PageKey =
  | "dashboard"
  | "school"
  | "classes"
  | "subjects"
  | "teachers"
  | "students";

export default function PrincipalPage() {
  const [activePage, setActivePage] = useState<PageKey>("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "school":
        return <ManageSchoolPage />;
      case "classes":
        return <ManageClassesPage />;
      case "subjects":
        return <ManageSubjectsPage />;
      case "teachers":
        return <ManageTeachersPage />;
      case "students":
        return <ManageStudentsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <>
      <ClientToaster />
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.brand}>Principal Panel</div>

          <nav>
            <div
              className={
                activePage === "dashboard" ? styles.active : styles.navItem
              }
              onClick={() => setActivePage("dashboard")}
            >
              Dashboard
            </div>

            <div
              className={
                activePage === "school" ? styles.active : styles.navItem
              }
              onClick={() => setActivePage("school")}
            >
              Manage School
            </div>

            <div
              className={
                activePage === "classes" ? styles.active : styles.navItem
              }
              onClick={() => setActivePage("classes")}
            >
              Manage Classes
            </div>

            <div
              className={
                activePage === "subjects" ? styles.active : styles.navItem
              }
              onClick={() => setActivePage("subjects")}
            >
              Manage Subjects
            </div>

            <div
              className={
                activePage === "teachers" ? styles.active : styles.navItem
              }
              onClick={() => setActivePage("teachers")}
            >
              Manage Teachers
            </div>

            <div
              className={
                activePage === "students" ? styles.active : styles.navItem
              }
              onClick={() => setActivePage("students")}
            >
              Manage Students
            </div>
          </nav>
        </aside>

        <main className={styles.main}>{renderPage()}</main>
      </div>
    </>
  );
}
