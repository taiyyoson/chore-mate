// Updated form section for your App.js
// Replace your current form section with this

// Add these state variables to your component (if not already present)
const [selectedRoommate, setSelectedRoommate] = useState("");

// Add this data array near your other constants
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

      {/* Roommate Selection */}
      <div className="form-field">
        <label className="form-label">👤 Who's responsible?</label>
        <select
          value={selectedRoommate}
          onChange={e => setSelectedRoommate(e.target.value)}
          className="form-select"
        >
          <option value="">Select roommate...</option>
          {users.map(user => (
            <option key={user.username} value={user.username}>
              {user.username}
            </option>
          ))}
        </select>
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
          disabled={!newChore || !selectedRoommate}
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

