const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

// Ensure database file and directory exist
function initDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      users: [],
      workspaces: [],
      projects: [],
      tasks: [],
      sprints: [],
      comments: [],
      notifications: []
    }, null, 2), 'utf8');
  }
}

function readDb() {
  initDb();
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON DB, resetting', err);
    return {
      users: [],
      workspaces: [],
      projects: [],
      tasks: [],
      sprints: [],
      comments: [],
      notifications: []
    };
  }
}

function writeDb(data) {
  initDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// Generate unique short IDs resembling Mongo BSON IDs
function generateId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

class LocalModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  async find(query = {}) {
    const db = readDb();
    const items = db[this.collectionName] || [];
    return items.filter(item => {
      for (const key in query) {
        if (query[key] && typeof query[key] === 'object' && !Array.isArray(query[key])) {
          // Handle simple Mongo operators like $in or $ne
          if ('$in' in query[key]) {
            if (!Array.isArray(query[key].$in)) continue;
            const val = item[key];
            if (Array.isArray(val)) {
              if (!val.some(v => query[key].$in.includes(v))) return false;
            } else {
              if (!query[key].$in.includes(val)) return false;
            }
          } else if ('$ne' in query[key]) {
            if (item[key] === query[key].$ne) return false;
          }
        } else if (Array.isArray(query[key])) {
          // If query value is array and item is array, match inclusion or intersection
          const val = item[key];
          if (Array.isArray(val)) {
            if (!query[key].every(q => val.includes(q))) return false;
          } else {
            if (!query[key].includes(val)) return false;
          }
        } else {
          // Exact match
          if (item[key] !== query[key]) return false;
        }
      }
      return true;
    });
  }

  async findOne(query = {}) {
    const items = await this.find(query);
    return items[0] || null;
  }

  async findById(id) {
    if (!id) return null;
    const db = readDb();
    const items = db[this.collectionName] || [];
    const idStr = id.toString();
    return items.find(item => item._id === idStr) || null;
  }

  async create(data) {
    const db = readDb();
    if (!db[this.collectionName]) {
      db[this.collectionName] = [];
    }
    const newItem = {
      _id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    db[this.collectionName].push(newItem);
    writeDb(db);
    return newItem;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const db = readDb();
    const items = db[this.collectionName] || [];
    const idStr = id.toString();
    const idx = items.findIndex(item => item._id === idStr);
    if (idx === -1) return null;

    // Handle Mongoose-like update operators e.g., $push
    const current = items[idx];
    let updated = { ...current };

    if (update.$push) {
      for (const key in update.$push) {
        if (!Array.isArray(updated[key])) {
          updated[key] = [];
        }
        updated[key].push(update.$push[key]);
      }
    }

    if (update.$pull) {
      for (const key in update.$pull) {
        if (Array.isArray(updated[key])) {
          updated[key] = updated[key].filter(v => v !== update.$pull[key]);
        }
      }
    }

    // Normal set fields (excluding operators starting with $)
    for (const key in update) {
      if (!key.startsWith('$')) {
        updated[key] = update[key];
      }
    }

    updated.updatedAt = new Date().toISOString();
    items[idx] = updated;
    writeDb(db);
    return updated;
  }

  async findByIdAndDelete(id) {
    const db = readDb();
    const items = db[this.collectionName] || [];
    const idStr = id.toString();
    const idx = items.findIndex(item => item._id === idStr);
    if (idx === -1) return null;
    const deleted = items.splice(idx, 1)[0];
    writeDb(db);
    return deleted;
  }

  async countDocuments(query = {}) {
    const items = await this.find(query);
    return items.length;
  }
}

// Export models acting like Mongoose Model classes
module.exports = {
  dbPath: DB_PATH,
  readDb,
  writeDb,
  initDb,
  generateId,
  User: new LocalModel('users'),
  Workspace: new LocalModel('workspaces'),
  Project: new LocalModel('projects'),
  Task: new LocalModel('tasks'),
  Sprint: new LocalModel('sprints'),
  Comment: new LocalModel('comments'),
  Notification: new LocalModel('notifications')
};
