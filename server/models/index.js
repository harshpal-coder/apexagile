const dbEngine = require('../utils/dbEngine');

// Check if we should use Mongoose/MongoDB or local JSON database
const useRealMongo = !!process.env.MONGODB_URI;

if (useRealMongo) {
  module.exports = {
    isMongo: true,
    User: require('./User'),
    Workspace: require('./Workspace'),
    Project: require('./Project'),
    Task: require('./Task'),
    Sprint: require('./Sprint'),
    Comment: require('./Comment'),
    Notification: require('./Notification')
  };
} else {
  module.exports = {
    isMongo: false,
    User: dbEngine.User,
    Workspace: dbEngine.Workspace,
    Project: dbEngine.Project,
    Task: dbEngine.Task,
    Sprint: dbEngine.Sprint,
    Comment: dbEngine.Comment,
    Notification: dbEngine.Notification,
    dbEngine // export dbEngine directly if controllers need low level control
  };
}
