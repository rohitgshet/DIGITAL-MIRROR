import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

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
        <span
          className="plant"
          style={{ filter: `drop-shadow(${getGlow(streak)})` }}
        >
          {getPlant(streak)}
        </span>
        <div className="habit-info">
          <span className="habit-name">{name}</span>
          <span className="next-plant">{getNextPlant(streak)}</span>
        </div>
        <span className="streak">🔥 {streak}</span>
        <button className="checkin-btn" onClick={() => onCheckIn(id)}>
          ✅
        </button>
        <button className="delete-btn" onClick={() => onDelete(id)}>
          🗑️
        </button>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${getProgress(streak)}%` }}
        />
      </div>
    </div>
  );
}

function App() {
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem("habits");
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Drink Water", streak: 3 },
      { id: 2, name: "Exercise", streak: 7 },
      { id: 3, name: "Read", streak: 1 },
    ];
  });

  const [inputValue, setInputValue] = useState("");
  const celebrated = useRef(new Set());

  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  // Derived state — no extra useState needed!
  const totalScore = habits.reduce((sum, habit) => sum + habit.streak, 0);

  function checkIn(id) {
    setHabits(habits.map((habit) => {
      if (habit.id !== id) return habit;
      const newStreak = habit.streak + 1;

      // 🎊 Confetti at 10 streaks!
      if (newStreak === 10 && !celebrated.current.has(id)) {
        celebrated.current.add(id);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      return { ...habit, streak: newStreak };
    }));
  }

  function deleteHabit(id) {
    setHabits(habits.filter((habit) => habit.id !== id));
  }

  function addHabit() {
    if (inputValue === "") {
      alert("Please type a habit first! 🌱");
      return;
    }
    const newHabit = {
      id: Date.now(),
      name: inputValue,
      streak: 0,
    };
    setHabits([...habits, newHabit]);
    setInputValue("");
  }

  return (
    <div id="app">
      <div id="header">
        <h1>🪞 Digital Mirror</h1>
        <p className="subtitle">Build habits. Grow your garden.</p>
      </div>

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
    </div>
  );
}

export default App;