// --- Users / roommates ---
// to log in use any user name below (Alice, Bob, Charlie)

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Pet from "./Pet.jsx";
import { userAPI, choreAPI } from "./services/api.js";
import "./App.css";
import "./Form.css";
import logo from "./assets/logo.png";
import background from "./assets/background.png";

function App() {
  // --- Users / roommates ---
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // null = not logged in
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Chores ---
  const [chores, setChores] = useState([]);

  // --- Add Chore inputs ---
  const [newChore, setNewChore] = useState("");
  const [newFrequency, setNewFrequency] = useState(1); 
  const [sliderValue, setSliderValue] = useState(3);   
  const [showForm, setShowForm] = useState(false);

  // --- Login / Signup toggles and inputs ---
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loginName, setLoginName] = useState("");
  const [signupName, setSignupName] = useState("");

  // Added: Form configuration data
  const frequencyOptions = [
    { value: 1, label: "Once a week", icon: "📅" },
    { value: 2, label: "Twice a week", icon: "📅📅" },
    { value: 3, label: "3x a week", icon: "🔄" },
    { value: 7, label: "Daily", icon: "⭐" }
  ];

  const difficultyConfig = {
    1: { text: "Quick & Easy", emoji: "😊" },
    2: { text: "Light Work", emoji: "🙂" },
    3: { text: "Moderate", emoji: "😐" },
    4: { text: "Takes Effort", emoji: "😅" },
    5: { text: "Major Task", emoji: "😰" }
  };

  // --- Load data from backend ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, choresData] = await Promise.all([
        userAPI.getAll(),
        choreAPI.getAll(false) // Get incomplete chores
      ]);
      setUsers(usersData);
      setChores(choresData);
      setError(null);
    } catch (err) {
      setError('Failed to load data from server');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Login / logout handlers ---
  const handleLogin = async () => {
    try {
      const user = await userAPI.getByUsername(loginName);
      if (user) {
        setCurrentUser(loginName);
        setLoginName("");
        setShowLogin(false);
        setShowSignup(false);
      }
    } catch (err) {
      setError('User not found');
    }
  };

  const handleSignup = async () => {
    if (!signupName) return;
    try {
      const newUser = await userAPI.create({ username: signupName, petHealth: 80, capacityScore: 30 });
      setUsers([...users, newUser]);
      setCurrentUser(signupName);
      setSignupName("");
      setShowSignup(false);
      setShowLogin(false);
      setError(null);
    } catch (err) {
      setError('Username already exists or signup failed');
    }
  };

  const handleLogout = () => setCurrentUser(null);

  // --- Add chore --- 
  const addChore = async () => {
    if (!newChore) return; 
    try {
      const choreData = {
        name: newChore,
        frequency: parseInt(newFrequency, 10),
        difficulty: sliderValue
      };
      const newChoreObj = await choreAPI.create(choreData);
      setChores([...chores, newChoreObj]);
      
      // Reload users to reflect updated capacity scores
      const updatedUsers = await userAPI.getAll();
      setUsers(updatedUsers);
      
      // Reset form values
      setNewChore("");
      setNewFrequency(1);    
      setSliderValue(3);     
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError('Failed to create chore');
      console.error('Error creating chore:', err);
    }
  };

  // --- Incremental complete chore ---
  const completeChore = async (id) => {
    try {
      const response = await choreAPI.complete(id);
      const updatedChore = response.chore;
      
      // Update chores list
      setChores(prev => prev.map(c => c.id === id ? updatedChore : c));
      
      // If pet health was updated, refresh users data
      if (response.petHealthUpdated) {
        const updatedUsers = await userAPI.getAll();
        setUsers(updatedUsers);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to complete chore');
    }
  };

  // --- Delete chore ---
  const deleteChore = async (id) => {
    try {
      await choreAPI.delete(id);
      setChores(prev => prev.filter(c => c.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete chore');
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="banner-strip">
          <img src={logo} alt="ChoreMate logo" className="logo" />
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="banner-strip">
        <img src={logo} alt="ChoreMate logo" className="logo" />
      </div>

      {error && (
        <div style={{ 
          backgroundColor: '#ff4444', 
          color: 'white', 
          padding: '0.5rem', 
          margin: '1rem',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {error}
          <button 
            onClick={() => setError(null)} 
            style={{ marginLeft: '1rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {/* --- Login / Signup --- */}
      {!currentUser ? (
        <div className="login-signup">
          <div className="auth-buttons">
            <button className="log-button" onClick={() => { setShowLogin(!showLogin); setShowSignup(false); }}>
              Log In
            </button>
            <button className="log-button log-button-margin" onClick={() => { setShowSignup(!showSignup); setShowLogin(false); }}>
              Sign Up
            </button>
          </div>

          {showLogin && (
            <div className="auth-form">
              <input
                type="text"
                placeholder="Username"
                value={loginName}
                onChange={e => setLoginName(e.target.value)}
              />
              <button className="small-button small-button-margin" onClick={handleLogin}>Submit</button>
            </div>
          )}

          {showSignup && (
            <div className="auth-form">
              <input
                type="text"
                placeholder="New Username"
                value={signupName}
                onChange={e => setSignupName(e.target.value)}
              />
              <button className="small-button small-button-margin" onClick={handleSignup}>Submit</button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Top right user info */}
          <div className="user-info">
            <button className="small-button" onClick={handleLogout}>Log Out</button>
          </div>

          {/* ---- ONE COLUMN MAIN STACK ---- */}
          <div className="main-column">
            {/* Pet at the top */}
            <div className="pet-container">
              <div className="health">health: {users.find(u => u.username === currentUser)?.petHealth}%</div>
              <Pet health={users.find(u => u.username === currentUser)?.petHealth} />
            </div>

            {/* Chores under the pet */}
            <div className="chores-container">
              <h3>All Chores</h3>

              <div className="chore-list">
                <AnimatePresence>
                  {chores.filter(chore => !chore.completed).map(chore => (
                    <motion.div
                      key={chore.id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className={`chore-card ${chore.completed ? "completed" : "pending"} ${chore.roommate === currentUser && !chore.completed ? "clickable" : ""}`}
                      onClick={() => {
                        if (chore.roommate === currentUser && !chore.completed) {
                          completeChore(chore.id);
                        }
                      }}
                    >
                      <div className="chore-content">
                        {/* progress/frequency circle */}
                        <div className="progress-section">{chore.progress}/{chore.frequency}</div>

                        {/* chore name */}
                        <div className="chore-name">{chore.name}</div>

                        {/* days left for chore */}
                        <div className={`chore-days ${chore.daysLeft <= 2 ? 'urgent' : chore.daysLeft <= 4 ? 'warning' : ''}`}>
                          <div className="days-number">{chore.daysLeft}</div>
                          <div className="days-label">days left</div>
                        </div>
                        
                        {/* roommate initials */}
                        <div className="roommate-name">{chore.roommate.substring(0, 2).toUpperCase()}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/*Chore Form - NO ROOMMATE SELECTION */}
              <AnimatePresence>
                {showForm && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="add-chore-form"
                  >
                    {/* Form Header */}
                    <div className="form-header">
                      <h3>Add New Chore</h3>
                      <div className="form-divider"></div>
                    </div>

                    {/* Chore Name */}
                    <div className="form-field">
                      <label className="form-label">🏠 What needs to be done?</label>
                      <input
                        type="text"
                        value={newChore}
                        onChange={e => setNewChore(e.target.value)}
                        placeholder="e.g., Take out trash, Do dishes..."
                        className="form-input"
                      />
                    </div>

                    {/* Frequency Selection */}
                    <div className="form-field">
                      <label className="form-label">📅 How often?</label>
                      <div className="frequency-grid">
                        {frequencyOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setNewFrequency(option.value)}
                            className={`frequency-option ${newFrequency === option.value ? 'selected' : ''}`}
                          >
                            <span className="frequency-icon">{option.icon}</span>
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty/Value Slider */}
                    <div className="form-field">
                      <label className="form-label">⚡ How challenging is this?</label>
                      <div className="difficulty-container">
                        <div className="difficulty-display">
                          <span className="difficulty-emoji">
                            {difficultyConfig[sliderValue].emoji}
                          </span>
                          <span className={`difficulty-label level-${sliderValue}`}>
                            {difficultyConfig[sliderValue].text}
                          </span>
                        </div>
                        
                        <div className="difficulty-slider-wrapper">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={sliderValue}
                            onChange={e => setSliderValue(parseInt(e.target.value))}
                            className={`difficulty-slider level-${sliderValue}`}
                          />
                          <div className="slider-labels">
                            <span>Easy</span>
                            <span>Hard</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Form Buttons */}
                    <div className="form-buttons">
                      <button
                        type="button"
                        onClick={addChore}
                        disabled={!newChore}
                        className="form-submit-btn"
                      >
                        ✨ Create Chore
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="form-cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="bottom-nav">
            <button onClick={() => setShowForm(true)}>+ Chore</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;