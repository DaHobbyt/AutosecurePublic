const { initializeDB, queryParams } = require("./db/db");
const { initializeController } = require("./mainbot/controllerbot");
const initializeBots = require("./mainbot/handlers/initializeBots");
const emserver = require("./smtp");
initializeController().then(() => { 
    console.log(`Initialized Controller!`);
});
initializeDB().then(() => {
    console.log(`Initialized DB`);
    initializeBots().then((client) => {
        console.log(`Initialized Bots`);
    }).catch((error) => {
        console.error('Failed to initialize bots:', error);
    });
});
