import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

function Leaderboard({ currentUserId }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("score", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlayers(data);
    });
    return unsubscribe;
  }, []);

  function getMedal(index) {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  }

  return (
    <div id="leaderboard">
      <h2>🏆 Leaderboard</h2>
      {players.length === 0 && (
        <p className="empty">No players yet. Be the first! 🌱</p>
      )}
      {players.map((player, index) => (
        <div
          key={player.id}
          className={`leaderboard-card ${player.id === currentUserId ? "my-card" : ""}`}
        >
          <span className="medal">{getMedal(index)}</span>
          <span className="player-name">
            {player.username}
            {player.id === currentUserId && " (You)"}
          </span>
          <span className="player-score">🌿 {player.score} pts</span>
        </div>
      ))}
    </div>
  );
}

export default Leaderboard;