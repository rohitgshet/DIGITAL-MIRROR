import { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs
} from "firebase/firestore";
import { deleteUser } from "firebase/auth";

// 🔒 Replace with YOUR Firebase UID
const ADMIN_UID = "5Xswlpej2mRchb7R4gtw3O9u9mV2";

function Admin({ user, onExit }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function handleDeleteUser(uid, username) {
    const confirm = window.confirm(`Delete user "${username}"? This removes their Firestore data.`);
    if (!confirm) return;

    try {
      // Delete all habits
      const habitsRef = collection(db, "users", uid, "habits");
      const snapshot = await getDocs(habitsRef);
      await Promise.all(snapshot.docs.map((d) => deleteDoc(doc(db, "users", uid, "habits", d.id))));

      // Delete user document
      await deleteDoc(doc(db, "users", uid));

      alert(`User "${username}" deleted successfully! ✅`);
    } catch (err) {
      alert("Error deleting user: " + err.message);
    }
  }

  if (user.uid !== ADMIN_UID) {
    return (
      <div id="app">
        <div id="header">
          <h1>🚫 Access Denied</h1>
          <p className="subtitle">You are not an admin.</p>
          <button className="logout-btn" onClick={onExit}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div id="app">
      <div id="header">
        <h1>🛡️ Admin Panel</h1>
        <p className="subtitle">Total users: {users.length}</p>
        <button className="logout-btn" onClick={onExit}>← Back to App</button>
      </div>

      <div id="score-card">
        <div className="score-number">{users.length}</div>
        <div className="score-label">Total Registered Users</div>
        <div className="motivation">
          Total habits tracked: {users.reduce((sum, u) => sum + (u.score || 0), 0)} pts
        </div>
      </div>

      <div id="garden">
        <h2>👥 All Users</h2>
        {loading && <p className="empty">Loading users...</p>}
        {users.map((u) => (
          <div key={u.id} className={`habit-card ${u.id === user.uid ? "my-card" : ""}`}>
            <div className="card-top">
              <span className="plant">👤</span>
              <div className="habit-info">
                <span className="habit-name">
                  {u.username} {u.id === user.uid ? "(You)" : ""}
                </span>
                <span className="next-plant">📧 {u.email}</span>
              </div>
              <span className="streak">🌿 {u.score || 0} pts</span>
              {u.id !== user.uid && (
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteUser(u.id, u.username)}
                  title="Delete user"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;