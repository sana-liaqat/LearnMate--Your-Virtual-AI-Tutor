/* App.js */
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./home";
import SignIn from "./signin";
import SignUp from "./SignUp";
import Chat from "./Chat"; // User chat component
import Guest from "./Guest"; // Guest chat component
import Summarizer from "./Summarizer";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/Guest" element={<Guest />} />
        <Route path="/summarizer" element={<Summarizer />} /> {/* ✅ NEW */}
      </Routes>
    </Router>
  );
}

export default App;
