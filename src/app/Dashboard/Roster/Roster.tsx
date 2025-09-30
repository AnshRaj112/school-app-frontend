import styles from "./styles/Roster.module.scss";

const students = [
  { name: "Alice", contact: "123-456", health: "Asthma" },
  { name: "Bob", contact: "789-012", health: "None" },
  { name: "Charlie", contact: "345-678", health: "Diabetic" },
];

export default function Roster() {
  return (
    <div className={styles.rosterWrapper}>
      <h2 className={styles.header}>Class Roster</h2>
      <table className={styles.rosterTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Emergency Contact</th>
            <th>Health / Conditions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <tr key={i}>
              <td>{s.name}</td>
              <td>{s.contact}</td>
              <td>{s.health}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
