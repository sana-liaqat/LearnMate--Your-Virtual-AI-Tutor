/* Home.js */
import React from "react";
import { useNavigate } from "react-router-dom";
import {useRive} from '@rive-app/react-canvas';
import "./Home.css";
import MyRiveFile from './animation (3).riv'; // Ensure correct path

const Home = () => {

  const navigate = useNavigate();

  const { RiveComponent } = useRive({
    src: MyRiveFile,
    artboard: "Full body",
    stateMachines: "State Machine 1",
    autoplay: true,
  });

  return (
    <div className="Home-container">
      {/* 🎉 Hero Section - Let's Get Learning! */}
      <section className="hero">
        <h1>Hey there, Little Einstein! 👋</h1>
        <p>Learn anything with your super-cool AI friend!</p>
        <button onClick={() => navigate("/Guest")}>Chat with Zyra! 💬</button>
        <button className="signup-btn" onClick={() => navigate("/signup")}>Sign Up to Join the Fun! 🚀</button>
        <button className="signin-btn" onClick={() => navigate("/signin")}>Sign In for the SMART stuff! 🚪</button>
      </section>
      

      {/* 💡 Features Section - Superpowers Activated! */}
      <section id="features" className="features">
        <h2>Why Zyra Rocks! 🌟</h2>
        <div className="feature-boxes">
          <div className="feature">🧠 Brainy Boosts!</div>
          <div className="feature">⚡️ Speedy Answers!</div>
          <div className="feature">🌈 Your Own Learning Adventure!</div>
        </div>
      </section>

      {/* 🎬 Zyra's World - Meet Your AI Pal! */}
      <section className="rive-section">
        <h2>Say Hi to Zyra! 👋</h2>
        <div className="rive-container">
          <RiveComponent style={{ width: "500px", height: "500px" }} />
        </div>
        <div className="zyra-name">I'm Zyra, let's learn together! 😊</div>
      </section>

      {/* 📖 How It Works - Easy Peasy! */}
      <section className="how-it-works">
        <h2>Learning Made Simple! 🚀</h2>
        <div className="steps">
          <div className="step">🤔 Ask Anything!</div>
          <div className="step">🤖 Zyra Finds the Answers!</div>
          <div className="step">🏆 Summarize the content from your books!!</div>
        </div>
      </section>

      {/* 🌟 Happy Learners - Hear the Cheers! */}
      <section className="testimonials">
        <h2>Awesome Student Stories! 🎉</h2>
        <div className="testimonial">
          "Learning with Zyra is like playing a fun game! 🎮" - Sana
        </div>
        <div className="testimonial">
          "Zyra helped me ace my computer science test! 🤩" - Rahhim
        </div>
      </section>

      {/* 🔗 Footer - We're Here to Help! */}
      <footer>
        <p>LearnMate &copy; 2025 - Let's Learn and Grow! 🌱</p>
      </footer>
    </div>
  );
};

export default Home;
