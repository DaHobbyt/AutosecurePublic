const path = require("path");
const getAllFiles = require("../utils/getFiles");
module.exports = (client, token) => {
  const eventFolders = getAllFiles(path.join(__dirname, '..', 'events'), true);
  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    eventFiles.sort((a, b) => a.localeCompare(b));
    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();
    if (client.listenerCount(eventName) === 0) {
      client.on(eventName, async (...args) => {
        for (const eventFile of eventFiles) {
          const eventFunction = require(eventFile);
          try {
            await eventFunction(client, ...args, token); 
          } catch (error) {
            console.error(`Error in event ${eventName} from file ${eventFile}:`, error);
          }
        }
      });
    }
  }
};