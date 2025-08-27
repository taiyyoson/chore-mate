// --- Users / roommates ---
// to log in use any user name below (Alice, Bob, Charlie)

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Pet from "./Pet.jsx";
import { userAPI, choreAPI } from "./services/api.js";
import "./App.css";
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
  const [newFrequency, setNewFrequency] = useState(0);
  const [newRoommate, setNewRoommate] = useState("");
  const [showForm, setShowForm] = useState(false);

  // --- Login / Signup toggles and inputs ---
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loginName, setLoginName] = useState("");
  const [signupName, setSignupName] = useState("");

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
      const newUser = await userAPI.create({ username: signupName, petHealth: 80 });
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
    if (!newChore || !newRoommate) return;
    try {
      const choreData = {
        name: newChore,
        frequency: parseInt(newFrequency, 10),
        roommate: newRoommate
      };
      const newChoreObj = await choreAPI.create(choreData);
      setChores([...chores, newChoreObj]);
      setNewChore("");
      setNewFrequency(0);
      setNewRoommate("");
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError('Failed to create chore');
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

                        {/* roommate initials */}
                        <div className="roommate-name">{chore.roommate.substring(0, 2).toUpperCase()}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Collapsible Add Chore Form - only show when form is open */}
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
                    <input type="text" value={newChore} onChange={e => setNewChore(e.target.value)} placeholder="New chore" />
                    <input type="number" min="1" value={newFrequency} onChange={e => setNewFrequency(e.target.value)} placeholder="Frequency" />
                    <select value={newRoommate} onChange={e => setNewRoommate(e.target.value)}>
                      <option value="" disabled>Select roommate</option>
                      {users.map(u => <option key={u.username} value={u.username}>{u.username}</option>)}
                    </select>
                    <div className="form-buttons">
                      <button className="small-button" onClick={addChore}>Submit</button>
                      <button className="small-button small-button-margin" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="bottom-nav">
            <button onClick={() => setShowForm(true)}>+ Chore</button>
            <button>+ Item</button>
            <div className="nav-circle"></div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;