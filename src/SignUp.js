/* SignUp.js */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from './supabaseClient';
import "./Auth.css";

const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!email || !password) {
      setErrorMessage("Please fill all fields.");
      return;
    }

    // 1. Sign up the user
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setErrorMessage("Signup failed: " + signUpError.message);
      return;
    }

    // 2. Notify user to verify email and redirect
    setErrorMessage("A verification email has been sent. Please verify your email to log in.");
    setTimeout(() => {
      navigate("/signin");
    }, 2500);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Join the Fun! 🚀</h2>
        <p>Start learning with Zyra today!</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Sign Up 🎉</button>
        </form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <p>
          Already have an account?{" "}
          <span onClick={() => navigate("/signin")} style={{ cursor: "pointer", color: "yellow" }}>
            Sign In
          </span>
        </p>
      </div>
      <button className="back-button" onClick={() => window.location.href = "/"}>
      ←
      </button> 
    </div>
  );
};

export default SignUp;
