
"use client";
import { useState } from "react";
import styles from "./styles/Assignments.module.scss";

export default function Assignments() {
  // Three sections' state
  const [assignments, setAssignments] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);

  // Three input states
  const [inputAssignments, setInputAssignments] = useState("");
  const [inputNotes, setInputNotes] = useState("");
  const [inputMaterials, setInputMaterials] = useState("");

  const addResource = (
    input: string,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    resources: string[],
    setResources: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (input.trim()) {
      setResources([...resources, input.trim()]);
      setInput("");
    }
  };

  const openResource = (url: string) => {
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }
    window.open(url, "_blank");
  };

  const deleteResource = (
    section: "assignments" | "notes" | "materials",
    index: number
  ) => {
    if (section === "assignments") {
      const updated = [...assignments];
      updated.splice(index, 1);
      setAssignments(updated);
    } else if (section === "notes") {
      const updated = [...notes];
      updated.splice(index, 1);
      setNotes(updated);
    } else {
      const updated = [...materials];
      updated.splice(index, 1);
      setMaterials(updated);
    }
  };

  return (
    <div className={styles.assignments}>
      <h2>Assignments & Resources</h2>

      {/* Assignments Section */}
      <Section
        title="Assignments"
        input={inputAssignments}
        setInput={setInputAssignments}
        resources={assignments}
        openResource={openResource}
        deleteResource={(i) => deleteResource("assignments", i)}
        addResource={() =>
          addResource(inputAssignments, setInputAssignments, assignments, setAssignments)
        }
      />

      {/* Notes Section */}
      <Section
        title="Notes"
        input={inputNotes}
        setInput={setInputNotes}
        resources={notes}
        openResource={openResource}
        deleteResource={(i) => deleteResource("notes", i)}
        addResource={() => addResource(inputNotes, setInputNotes, notes, setNotes)}
      />

      {/* Study Materials Section */}
      <Section
        title="Study Materials"
        input={inputMaterials}
        setInput={setInputMaterials}
        resources={materials}
        openResource={openResource}
        deleteResource={(i) => deleteResource("materials", i)}
        addResource={() => addResource(inputMaterials, setInputMaterials, materials, setMaterials)}
      />
    </div>
  );
}

// Reusable Section component
function Section({
  title,
  input,
  setInput,
  resources,
  openResource,
  deleteResource,
  addResource,
}: {
  title: string;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  resources: string[];
  openResource: (url: string) => void;
  deleteResource: (index: number) => void;
  addResource: () => void;
}) {
  const fieldPlaceholder = `Enter ${title.toLowerCase()} link or resource`;

  return (
    <div className={styles.sectionBox}>
      <h3>{title}</h3>
      <div className={styles.inputBox}>
        <input
          type="text"
          placeholder={fieldPlaceholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={addResource}>Add</button>
      </div>

      <ul className={styles.resourceList}>
        {resources.map((res, i) => (
          <li key={i} className={styles.resourceItem}>
            <span onClick={() => openResource(res)}>{res}</span>
            <button
              className={styles.deleteBtn}
              onClick={() => deleteResource(i)}
              title="Delete"
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
