// --- Users / roommates ---
// to log in use any user name below (Alice, Bob, Charlie)

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Pet from "./Pet.jsx";
import "./App.css";
import logo from "./assets/logo.png";
import background from "./assets/background.png";

function App() {
  // --- Users / roommates ---
  const [users, setUsers] = useState([
    { username: "Alice", petHealth: 60 },
    { username: "Bob", petHealth: 0 },
    { username: "Charlie", petHealth: 40 },

  ]);

  const [currentUser, setCurrentUser] = useState(null); // null = not logged in

  // --- Chores ---
  const [chores, setChores] = useState([
    { id: 1, name: "Take out trash", frequency: 2, progress: 0, completed: false, roommate: "Alice" },
    { id: 2, name: "Wash dishes", frequency: 2, progress: 0, completed: false, roommate: "Bob" },
  ]);

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

  // --- Helper: generate next id ---
  const nextId = () => Math.max(0, ...chores.map(c => c.id)) + 1;

  // --- Login / logout handlers ---
  const handleLogin = () => {
    if (users.find(u => u.username === loginName)) {
      setCurrentUser(loginName);
      setLoginName("");
      setShowLogin(false);
      setShowSignup(false);
    }
  };

  const handleSignup = () => {
    if (!signupName || users.find(u => u.username === signupName)) return;
    setUsers([...users, { username: signupName, petHealth: 80 }]);
    setCurrentUser(signupName);
    setSignupName("");
    setShowSignup(false);
    setShowLogin(false);
  };

  const handleLogout = () => setCurrentUser(null);

  // --- Add chore ---
  const addChore = () => {
    if (!newChore || !newRoommate) return;
    setChores([
      ...chores,
      { 
        id: nextId(), 
        name: newChore, 
        frequency: parseInt(newFrequency, 10), 
        progress: 0, 
        completed: false, 
        roommate: newRoommate 
      }
    ]);
    setNewChore("");
    setShowForm(false);
  };

  // --- Incremental complete chore ---
  const completeChore = (id) => {
    setChores(prev =>
      prev.map(c => {
        if (c.id === id && !c.completed) {
          const newProgress = c.progress + 1;
          const isDone = newProgress >= c.frequency;

          if (isDone) {
            // reward pet when chore is fully complete
            setUsers(prevUsers =>
              prevUsers.map(u =>
                u.username === currentUser
                  ? { ...u, petHealth: Math.min(u.petHealth + 10, 100) }
                  : u
              )
            );
          }

          return { ...c, progress: newProgress, completed: isDone };
        }
        return c;
      })
    );
  };

  // --- Delete chore ---
  const deleteChore = (id) => setChores(prev => prev.filter(c => c.id !== id));

  return (
    <div className="app-container">
      <div className="banner-strip">
        <img src={logo} alt="ChoreMate logo" className="logo" />
      </div>

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