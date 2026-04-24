const axios = require('axios');
const logger = require('./logger.service');

const sendAlert = async (payload) => {
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (!webhookUrl) {
    return false;
  }

  try {
    await axios.post(webhookUrl, payload, {
      timeout: Number(process.env.ALERT_WEBHOOK_TIMEOUT_MS) || 3000
    });
    return true;
  } catch (error) {
    logger.warn({
      message: 'Alert delivery failed',
      error: error.message
    });
    return false;
  }
};

module.exports = {
  sendAlert
};
