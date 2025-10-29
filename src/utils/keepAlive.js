const axios = require('axios');
const logger = require('./logger');

// Render free tier sleeps after 15 mins (900,000ms).
// We set the interval to 14 minutes (840,000ms) to ensure it stays awake.
const PING_INTERVAL = 14 * 60 * 1000; 

function startKeepAlive() {
    // Render typically exposes the service URL via RENDER_EXTERNAL_URL.
    const baseUrl = process.env.RENDER_EXTERNAL_URL || process.env.BASE_URL;

    if (!baseUrl) {
        logger.warn('Keep-Alive skipped: RENDER_EXTERNAL_URL or BASE_URL environment variable is not set. The app will go to sleep.');
        return;
    }

    const pingUrl = `${baseUrl}/api/health`;
    
    logger.info(`Starting self-ping service to ${pingUrl} every ${PING_INTERVAL / 60000} minutes.`);

    setInterval(async () => {
        try {
            // Set a short timeout (5 seconds) for the ping request.
            const response = await axios.get(pingUrl, { timeout: 5000 });
            if (response.status === 200) {
                logger.info('Self-ping successful. Service remains awake.');
            } else {
                logger.warn(`Self-ping failed with status: ${response.status}`);
            }
        } catch (error) {
            logger.error(`Error during self-ping: ${error.message}`);
        }
    }, PING_INTERVAL);
}

module.exports = { startKeepAlive };