import { useState } from "react";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    try {
      if (isSignUp) {
        if (username.trim() === "") {
          setError("Please enter a username!");
          return;
        }
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Save username to Firestore
        await setDoc(doc(db, "users", result.user.uid), {
          username: username.trim(),
          score: 0,
          email: email,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div id="login-page">
      <div id="login-card">
        <h1>🪞 Digital Mirror</h1>
        <p className="subtitle">Build habits. Grow your garden.</p>

        <h2>{isSignUp ? "Create Account" : "Welcome Back"}</h2>

        {error && <p className="error">{error}</p>}

        {isSignUp && (
          <input
            type="text"
            placeholder="Username (shown on leaderboard)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="add-btn" onClick={handleSubmit}>
          {isSignUp ? "Sign Up" : "Login"}
        </button>

        <p className="switch-text">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <span className="switch-link" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? " Login" : " Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;