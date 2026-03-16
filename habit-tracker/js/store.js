/**
 * store.js - localStorage data layer for Habit Tracker
 *
 * Data schema:
 * {
 *   habits: [{ id, name, color, createdAt, archived }],
 *   checkins: { "habit-id": ["2026-03-01", ...] }
 * }
 */

const STORAGE_KEY = 'habit-tracker-data';

// eslint-disable-next-line no-unused-vars
var Store = {
  _getData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { habits: [], checkins: {} };
    try {
      return JSON.parse(raw);
    } catch {
      return { habits: [], checkins: {} };
    }
  },

  _saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  getHabits() {
    return this._getData().habits.filter(h => !h.archived);
  },

  getHabitById(id) {
    return this._getData().habits.find(h => h.id === id) || null;
  },

  addHabit(name, color) {
    const data = this._getData();
    const habit = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color: color || '#4CAF50',
      createdAt: new Date().toISOString().split('T')[0],
      archived: false
    };
    data.habits.push(habit);
    data.checkins[habit.id] = [];
    this._saveData(data);
    return habit;
  },

  updateHabit(id, updates) {
    const data = this._getData();
    const idx = data.habits.findIndex(h => h.id === id);
    if (idx === -1) return null;
    if (updates.name !== undefined) data.habits[idx].name = updates.name.trim();
    if (updates.color !== undefined) data.habits[idx].color = updates.color;
    this._saveData(data);
    return data.habits[idx];
  },

  deleteHabit(id) {
    const data = this._getData();
    data.habits = data.habits.filter(h => h.id !== id);
    delete data.checkins[id];
    this._saveData(data);
  },

  getCheckins(habitId) {
    return this._getData().checkins[habitId] || [];
  },

  toggleCheckin(habitId, date) {
    const data = this._getData();
    if (!data.checkins[habitId]) data.checkins[habitId] = [];
    const idx = data.checkins[habitId].indexOf(date);
    if (idx === -1) {
      data.checkins[habitId].push(date);
    } else {
      data.checkins[habitId].splice(idx, 1);
    }
    this._saveData(data);
    return idx === -1; // returns true if checked in, false if unchecked
  },

  isCheckedIn(habitId, date) {
    const checkins = this.getCheckins(habitId);
    return checkins.includes(date);
  },

  getStreaks(habitId) {
    const checkins = this.getCheckins(habitId).slice().sort();
    if (checkins.length === 0) return { current: 0, longest: 0 };

    const today = new Date().toISOString().split('T')[0];

    // Helper: get previous date string
    function prevDay(dateStr) {
      const d = new Date(dateStr + 'T00:00:00');
      d.setDate(d.getDate() - 1);
      return d.toISOString().split('T')[0];
    }

    // Calculate longest streak
    let longest = 1;
    let run = 1;
    for (let i = 1; i < checkins.length; i++) {
      if (checkins[i] === prevDay(checkins[i - 1])) {
        // Duplicate date guard
        continue;
      }
      const expected = new Date(checkins[i - 1] + 'T00:00:00');
      expected.setDate(expected.getDate() + 1);
      const expectedStr = expected.toISOString().split('T')[0];
      if (checkins[i] === expectedStr) {
        run++;
      } else {
        if (run > longest) longest = run;
        run = 1;
      }
    }
    if (run > longest) longest = run;

    // Calculate current streak (consecutive days ending today or yesterday)
    const checkinSet = new Set(checkins);
    let current = 0;
    let checkDate = today;

    // If today is not checked, start from yesterday
    if (!checkinSet.has(today)) {
      checkDate = prevDay(today);
    }

    while (checkinSet.has(checkDate)) {
      current++;
      checkDate = prevDay(checkDate);
    }

    return { current, longest };
  },

  getCompletionRate(habitId) {
    const habit = this.getHabitById(habitId);
    if (!habit) return 0;

    const checkins = this.getCheckins(habitId);

    // Use UTC to avoid DST issues in day counting
    const parts1 = habit.createdAt.split('-');
    const createdAt = Date.UTC(+parts1[0], +parts1[1] - 1, +parts1[2]);
    const todayStr = new Date().toISOString().split('T')[0];
    const parts2 = todayStr.split('-');
    const today = Date.UTC(+parts2[0], +parts2[1] - 1, +parts2[2]);
    const totalDays = Math.round((today - createdAt) / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays <= 0) return checkins.length > 0 ? 100 : 0;
    return Math.round((checkins.length / totalDays) * 100);
  },

  getOverallStats() {
    const habits = this.getHabits();
    const totalHabits = habits.length;

    if (totalHabits === 0) {
      return { totalHabits: 0, overallRate: 0, bestStreak: 0 };
    }

    let totalRate = 0;
    let bestStreak = 0;

    habits.forEach(h => {
      totalRate += this.getCompletionRate(h.id);
      const streaks = this.getStreaks(h.id);
      if (streaks.current > bestStreak) bestStreak = streaks.current;
    });

    return {
      totalHabits,
      overallRate: Math.round(totalRate / totalHabits),
      bestStreak
    };
  },

  getAllHabitStats() {
    return this.getHabits().map(h => ({
      habit: h,
      checkins: this.getCheckins(h.id).length,
      rate: this.getCompletionRate(h.id),
      streaks: this.getStreaks(h.id)
    }));
  },

  exportData() {
    return JSON.stringify(this._getData(), null, 2);
  },

  importData(jsonStr) {
    const data = JSON.parse(jsonStr);

    // Validate structure
    if (!data || typeof data !== 'object') throw new Error('Invalid data format');
    if (!Array.isArray(data.habits)) throw new Error('Missing or invalid habits array');
    if (!data.checkins || typeof data.checkins !== 'object') throw new Error('Missing or invalid checkins');

    // Validate each habit
    for (const h of data.habits) {
      if (!h.id || typeof h.id !== 'string') throw new Error('Invalid habit: missing id');
      if (!h.name || typeof h.name !== 'string') throw new Error('Invalid habit: missing name');
      if (!h.createdAt || typeof h.createdAt !== 'string') throw new Error('Invalid habit: missing createdAt');
    }

    // Validate checkins
    for (const [key, dates] of Object.entries(data.checkins)) {
      if (!Array.isArray(dates)) throw new Error('Invalid checkins for habit ' + key);
    }

    this._saveData(data);
    return true;
  }
};
