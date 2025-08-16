let startTime = null;
const startTimer = () => {
    if (startTime !== null) {
        console.log('Timer is already running!');
        return;
    }
    startTime = Date.now();
    console.log('Timer started...');
};
const stopTimer = () => {
    if (startTime === null) {
        console.log('Timer has not been started!');
        return null;
    }
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    startTime = null;
    console.log(`Timer stopped. Time taken: ${timeTaken} ms`);
    return timeTaken;
};
const getTimeInSeconds = (milliseconds) => {
    if (milliseconds === null) return '0.00'; 
    return (milliseconds / 1000).toFixed(2);
};
module.exports = {
    startTimer,
    stopTimer,
    getTimeInSeconds,
};
