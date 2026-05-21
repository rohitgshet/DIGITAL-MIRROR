import { useState } from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
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

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="add-btn" onClick={handleSubmit}>
          {isSignUp ? "Sign Up" : "Login"}
        </button>

        <p className="switch-text">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <span
            className="switch-link"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? " Login" : " Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;