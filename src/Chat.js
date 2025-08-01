/* Chat.js */
import React, { useState, useRef, useEffect } from 'react';
import './Chat.css';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import MyRiveFile from './animation (10).riv';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import VoiceIcon from './noise-icon.svg';  
import SendArrowIcon from './arrow.svg';
import StopIcon from './stop-icon.svg';

function Chat() {
    const navigate = useNavigate();

    // Rive animation
    const { rive, RiveComponent } = useRive({
        src: MyRiveFile,
        artboard: "Full body",
        stateMachines: "State Machine 1",
        autoplay: true,
    });
    const talks = useStateMachineInput(rive, "State Machine 1", "Talks");
    const [messages, setMessages] = useState([
        { text: "Hey there! I'm Zyra, your AI tutor. Ready to learn something new? Ask me anything!", sender: 'bot', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const typingIntervalRef = useRef(null);
    const speechUtteranceRefs = useRef([]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [documentFiles, setDocumentFiles] = useState([]);

    const chatAreaRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll and focus handling
    useEffect(() => {
        if (chatAreaRef.current) chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        if (inputRef.current) inputRef.current.focus();
        window.speechSynthesis.onvoiceschanged = () => {};
    }, [messages]);

    // Fetch chat history on sidebar open
    useEffect(() => {
        if (isSidebarOpen) fetchChatHistory();
    }, [isSidebarOpen]);

    // Sidebar toggle
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Close sidebar on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isSidebarOpen && !e.target.closest('.chat-sidebar') && !e.target.closest('.hamburger-menu')) {
                setIsSidebarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSidebarOpen]);

    // Fetch chat history
    const fetchChatHistory = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/history');
            if (!response.ok) throw new Error("Failed to fetch chat history");
            const data = await response.json();
            setChatHistory(data.history);
        } catch (error) {
            console.error("Error fetching chat history:", error);
        }
    };

    // Voice input
    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Speech recognition not supported.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setUserInput(transcript);
            handleSendMessage(transcript);
        };

        recognition.start();
    };

    const addMessageWithTypingEffect = (fullText) => {
        let index = 0;
        let typingMessage = { text: "", sender: "bot", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages((prevMessages) => [...prevMessages, typingMessage]);
    
        // Ensure voices are loaded before speaking
        const loadVoicesAndSpeak = () => {
            const synth = window.speechSynthesis;
    
            const speakChunks = async (text) => {
                const chunkSize = 120;
                const textChunks = text.match(new RegExp(`.{1,${chunkSize}}(\\s|$)`, 'g'));
                if (!textChunks) return;
    
                const voices = synth.getVoices();
                const selectedVoice = voices.find(v =>
                    v.name.toLowerCase().includes("teen") ||
                    v.name.toLowerCase().includes("girl") ||
                    v.name.toLowerCase().includes("child") ||
                    v.name.toLowerCase().includes("female")
                ) || voices.find(v => v.lang.includes("en")) || voices[0];
    
                for (let i = 0; i < textChunks.length; i++) {
                    const isLast = i === textChunks.length - 1;
                    await new Promise((resolve) => {
                        const utterance = new SpeechSynthesisUtterance(textChunks[i]);
                        speechUtteranceRefs.current.push(utterance);
                        utterance.voice = selectedVoice;
                        utterance.rate = 1.05;
                        utterance.pitch = 1.1;
                        utterance.volume = 1.0;
    
                        utterance.onstart = () => {
                            if (talks) talks.value = true;
                        };
                        utterance.onend = () => {
                            if (isLast && talks) talks.value = false;
                            if (isLast) setIsGenerating(false);
                            resolve();
                        };
                        synth.speak(utterance);
                    });
                }
            };
    
            speakChunks(fullText);
        };
    
        // Delay voice loading slightly to ensure voices are ready
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = loadVoicesAndSpeak;
        } else {
            loadVoicesAndSpeak();
        }
    
        // Typing effect
        // Set generating state
        setIsGenerating(true);

        // Typing effect with cancellation support
        if (talks) talks.value = true;
        typingIntervalRef.current = setInterval(() => {
            if (index < fullText.length) {
                typingMessage.text += fullText[index];
                setMessages((prevMessages) => {
                    let updatedMessages = [...prevMessages];
                    updatedMessages[updatedMessages.length - 1] = { ...typingMessage };
                    return updatedMessages;
                });
                index++;
            } else {
                clearInterval(typingIntervalRef.current);
                typingIntervalRef.current = null;
                setTimeout(() => {
                    if (talks) talks.value = false;
                    setIsGenerating(false);
                }, 500);
            }
        }, 50);

    };

    // Send message to API
    const handleSendMessage = async (message) => {
        const age = localStorage.getItem("age");
        const level = localStorage.getItem("level");
    
        console.log("User level from localStorage:", level);
        console.log("User age from localStorage:", age);
    
        if (!message) return;
    
        setIsLoading(true);
        setMessages(prev => [...prev, {
            text: message, sender: 'user', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setUserInput('');
    
        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, age, level }),
            });
    
            if (!response.ok) throw new Error("API Error");
    
            const data = await response.json();
            if (!data.botReply) {
                addMessageWithTypingEffect("Oops! Something went wrong.");
                return;
            }
    
            addMessageWithTypingEffect(data.botReply);
            setChatHistory(prev => [...prev, { user: message, bot: data.botReply }]);
        } catch (error) {
            console.error("Error:", error);
            addMessageWithTypingEffect("Sorry, I encountered an error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };
    

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSendMessage(userInput.trim());
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            navigate('/signin');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // File upload
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setDocumentFiles(files);
    };

    // Modified to send all files at once and get one summary back
    const handleDocumentSubmit = async () => {
        if (documentFiles.length === 0) return;
        setIsLoading(true);

        // Show user message listing uploaded files
        setMessages(prev => [...prev, {
            text: `Uploaded ${documentFiles.length} document(s): ${documentFiles.map(f => f.name).join(', ')}`,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);

        try {
            const formData = new FormData();
            documentFiles.forEach((file, idx) => {
                formData.append('files', file);
            });

            const response = await fetch('http://localhost:5000/api/summarize', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error("Summarization failed");

            const data = await response.json();

            // Show one combined summary
            addMessageWithTypingEffect(`Here's the combined summary of your documents:\n\n${data.summary}`);

        } catch (error) {
            console.error('Error summarizing:', error);
            addMessageWithTypingEffect(`Sorry, I couldn't summarize your documents.`);
        } finally {
            setIsLoading(false);
            setDocumentFiles([]);
        }
    };

    const stopGenerating = () => {
        // Stop typing effect
        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
        }
    
        // Stop speech synthesis
        window.speechSynthesis.cancel();
    
        // Stop animation
        if (talks) talks.value = false;
    
        setIsGenerating(false);
    };

    return (
        <div className="app-container">
            <div className="ai-tutor-image-container">
                <RiveComponent />
                <div className="bot-info-overlay">
                    <span className="bot-name">LearnMate</span>
                    <span className="bot-version">Version 1.15</span>
                </div>
            </div>

            <div className={`chat-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="chat-header">
                    <button className="back-button" onClick={() => navigate('/')}>←</button>
                    <button className="hamburger-menu" onClick={toggleSidebar}>☰</button>
                    <span>Chat</span>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </div>

                <div className="chat-area" ref={chatAreaRef}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message ${msg.sender}`}>
                            <div className="message-content">{msg.text}</div>
                            <div className="message-timestamp">{msg.timestamp}</div>
                        </div>
                    ))}
                </div>

                <div className="document-upload">
                    <label className="upload-label">
                        ✚ PDF/DOCX
                        <input type="file" accept=".pdf,.docx" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                    {documentFiles.length > 0 && (
                        <div className="uploaded-file-name">
                            📎 {documentFiles.length} document(s) ready to summarize
                        </div>
                    )}
                </div>

                <div className="input-area">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="What do you wanna learn today?"
                        ref={inputRef}
                        disabled={isLoading}
                    />
                    <button onClick={handleDocumentSubmit} disabled={documentFiles.length === 0 || isLoading}>
                    Summarize
                    </button>

                    {isGenerating ? (
                    <button
                        onClick={stopGenerating}
                        style={{
                            padding: '4px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <img
                            src={StopIcon}
                            alt="Send"
                            style={{ width: '34px', height: '34px' }}
                            />
                    </button>
                
            ) : userInput.trim().length > 0 ? (
                    <button
                        onClick={() => handleSendMessage(userInput.trim())}
                        disabled={isLoading || userInput.trim().length === 0}
                        style={{
                            padding: '4px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        {isLoading ? "Sending..." : (
                            <img
                                src={SendArrowIcon}
                                alt="Send"
                                style={{ width: '34px', height: '34px' }}
                            />
                         )}
                        </button>
                ) : (
                   
                    <button
                        onClick={startListening}
                        disabled={isListening}
                        style={{
                            padding: '4px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        {isListening ? (
                            "Listening..."
                        ) : (
                            <img
                                src={VoiceIcon}
                                alt="Voice Input"
                                style={{ width: '34px', height: '34px' }}
                            />
                        )}
                    </button>
                )}

                </div>
            </div>


            <aside className={`chat-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <span className="bot-name">LearnMate</span>
                    <span className="bot-version">Version 1.15</span>
                </div>
                <h2>Chat History</h2>
                <div className="history-list">
                    {chatHistory.map((session, idx) => (
                        <div key={idx} className="history-item">
                            <p><strong>User:</strong> {session.user}</p>
                            <p><strong>Bot:</strong> {session.bot}</p>
                        </div>
                    ))}
                </div>
            </aside>
        </div>

    );
}

export default Chat;
