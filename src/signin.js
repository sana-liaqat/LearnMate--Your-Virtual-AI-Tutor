/* SignIn.js */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from './supabaseClient'; 
import "./Auth.css";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [level, setLevel] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!age || !level) {
      setErrorMessage("Please enter your age and level.");
      return;
    }

    // 1. Authenticate user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    const user = data?.user;

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (user && !user.email_confirmed_at) {
      setErrorMessage("Please verify your email before logging in.");
      return;
    }

    // 2. Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("age, level")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Error fetching profile:", profileError.message);
      setErrorMessage("Login succeeded, but failed to fetch user info.");
      return;
    }

    if (profile) {
      // 3a. Update profile if exists
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ age: parseInt(age), level })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError.message);
        setErrorMessage("Failed to update profile info.");
        return;
      }
    } else {
      // 3b. Insert new profile if not exists
      const { error: insertError } = await supabase
        .from("profiles")
        .insert([{ id: user.id, email, age: parseInt(age), level }]);

      if (insertError) {
        console.error("Error inserting profile:", insertError.message);
        setErrorMessage("Failed to save profile info.");
        return;
      }
    }

    // 4. Save to localStorage for later use
    localStorage.setItem("age", age);
    localStorage.setItem("level", level);

    // 5. Navigate to chat
    navigate("/chat");
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Back! 👋</h2>
        <p>Sign in to chat with Zyra! 💬</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            required
          >
            <option value="" disabled>
            Select level
            </option>
            <option value="junior">Junior</option>
            <option value="senior">Senior</option>
            <option value="high school">High School</option>
            <option value="university">University</option>
          </select>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Sign In 🚀</button>
        </form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <p>
          New here?{" "}
          <span onClick={() => navigate("/signup")} style={{ cursor: "pointer", color: "yellow" }}>
            Create an account
          </span>
        </p>
      </div>
      <button className="back-button" onClick={() => window.location.href = "/"}>
      ←
      </button> 
    </div>
  );
};

export default SignIn;
