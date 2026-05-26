import { useState, useEffect, useRef } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, onSnapshot, deleteDoc, collection, updateDoc } from "firebase/firestore";
import Login from "./Login";
import Leaderboard from "./Leaderboard";

function getPlant(streak) {
  if (streak === 0) return "🪨";
  if (streak <= 2)  return "🌱";
  if (streak <= 5)  return "🌿";
  if (streak <= 9)  return "🌳";
  return "🏆";
}

function getProgress(streak) {
  if (streak === 0) return 0;
  if (streak <= 2)  return (streak / 2) * 100;
  if (streak <= 5)  return (streak / 5) * 100;
  if (streak <= 9)  return (streak / 9) * 100;
  return 100;
}

function getGlow(streak) {
  if (streak === 0) return "none";
  if (streak <= 2)  return "0 0 8px #2ecc71";
  if (streak <= 5)  return "0 0 16px #2ecc71";
  if (streak <= 9)  return "0 0 24px #f1c40f";
  return "0 0 32px #e74c3c";
}

function getNextPlant(streak) {
  if (streak === 0) return "🌱 needs 1 check in";
  if (streak <= 2)  return `🌿 needs ${3 - streak} more`;
  if (streak <= 5)  return `🌳 needs ${6 - streak} more`;
  if (streak <= 9)  return `🏆 needs ${10 - streak} more`;
  return "🏆 Legend status!";
}

function getMotivation(score) {
  if (score === 0)  return "Start your first habit today! 🌱";
  if (score <= 5)   return "Great start! Keep going! 💪";
  if (score <= 15)  return "You're building momentum! 🔥";
  if (score <= 30)  return "Your garden is thriving! 🌿";
  return "You're a habit legend! 🏆";
}

function HabitCard({ id, name, streak, onCheckIn, onDelete }) {
  return (
    <div className="habit-card">
      <div className="card-top">
        <span className="plant" style={{ filter: `drop-shadow(${getGlow(streak)})` }}>
          {getPlant(streak)}
        </span>
        <div className="habit-info">
          <span className="habit-name">{name}</span>
          <span className="next-plant">{getNextPlant(streak)}</span>
        </div>
        <span className="streak">🔥 {streak}</span>
        <button className="checkin-btn" onClick={() => onCheckIn(id)}>✅</button>
        <button className="delete-btn" onClick={() => onDelete(id)}>🗑️</button>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${getProgress(streak)}%` }} />
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [celebrating, setCelebrating] = useState(false);
  const [username, setUsername] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const celebrated = useRef(new Set());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) setUsername(snap.data().username);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user || habits.length === 0) return;
    const score = habits.reduce((sum, h) => sum + h.streak, 0);
    const userRef = doc(db, "users", user.uid);
    updateDoc(userRef, { score });
  }, [habits]);

  useEffect(() => {
    if (!user) return;
    const habitsRef = collection(db, "users", user.uid, "habits");
    const unsubscribe = onSnapshot(habitsRef, (snapshot) => {
      const loaded = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHabits(loaded);
    });
    return unsubscribe;
  }, [user]);

  const totalScore = habits.reduce((sum, habit) => sum + habit.streak, 0);

  async function checkIn(id) {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;
    const newStreak = habit.streak + 1;
    if (newStreak === 10 && !celebrated.current.has(id)) {
      celebrated.current.add(id);
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 2000);
    }
    const habitRef = doc(db, "users", user.uid, "habits", id);
    await setDoc(habitRef, { ...habit, streak: newStreak });
  }

  async function deleteHabit(id) {
    const habitRef = doc(db, "users", user.uid, "habits", id);
    await deleteDoc(habitRef);
  }

  async function addHabit() {
    if (inputValue === "") {
      alert("Please type a habit first! 🌱");
      return;
    }
    const newId = Date.now().toString();
    const habitRef = doc(db, "users", user.uid, "habits", newId);
    await setDoc(habitRef, { name: inputValue, streak: 0 });
    setInputValue("");
  }

  if (loading) return <div className="loading">🌱 Loading...</div>;
  if (!user) return <Login />;

  return (
    <div id="app">

      {celebrating && (
        <div className="celebration">🎊 LEGEND STATUS! 🎊</div>
      )}

      <div id="header">
        <h1>🪞 Digital Mirror</h1>
        <p className="subtitle">Welcome, {username}! 👋</p>
        <div className="header-buttons">
          <button
            className="leaderboard-btn"
            onClick={() => setShowLeaderboard(!showLeaderboard)}
          >
            {showLeaderboard ? "🌱 My Garden" : "🏆 Leaderboard"}
          </button>
          <button className="logout-btn" onClick={() => signOut(auth)}>
            Logout
          </button>
        </div>
      </div>

      {showLeaderboard ? (
        <Leaderboard currentUserId={user.uid} />
      ) : (
        <>
          <div id="score-card">
            <div className="score-number">{totalScore}</div>
            <div className="score-label">Total Garden Score</div>
            <div className="motivation">{getMotivation(totalScore)}</div>
          </div>

          <div id="garden">
            <h2>🌱 My Garden</h2>
            {habits.length === 0 && (
              <p className="empty">No habits yet. Add one below! 👇</p>
            )}
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                id={habit.id}
                name={habit.name}
                streak={habit.streak}
                onCheckIn={checkIn}
                onDelete={deleteHabit}
              />
            ))}
          </div>

          <div id="add-habit">
            <input
              type="text"
              placeholder="e.g. Meditate 🧘"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addHabit()}
            />
            <button className="add-btn" onClick={addHabit}>
              Add Habit
            </button>
          </div>
        </>
      )}

    </div>
  );
}

export default App;