const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const CHANNEL_CONFIG = {
  CARD: { fee_percent: 2.5, settlement: 'T+1' },
  KHALTI: { fee_percent: 1.0, settlement: 'instant' },
  ESEWA: { fee_percent: 1.2, settlement: 'instant' },
  CONNECT_IPS: { fee_percent: 0.5, settlement: 'same_day' }
};

const createStripePaymentIntent = async ({ amount, currency, reference, requestId }) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  const payload = new URLSearchParams();
  payload.append('amount', String(Math.round(Number(amount) * 100)));
  payload.append('currency', currency.toLowerCase());
  payload.append('automatic_payment_methods[enabled]', 'true');
  if (reference) {
    payload.append('metadata[reference]', reference);
  }

  const response = await axios.post('https://api.stripe.com/v1/payment_intents', payload.toString(), {
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': requestId || uuidv4()
    },
    timeout: Number(process.env.STRIPE_TIMEOUT_MS) || 8000
  });

  return {
    provider: 'stripe',
    provider_reference: response.data.id,
    status: response.data.status,
    client_secret: response.data.client_secret,
    payment_url: null
  };
};

const createGenericProviderPayment = async ({ channel, amount, currency, reference, requestId }) => {
  const baseUrl = process.env[`${channel}_API_BASE_URL`];
  const apiKey = process.env[`${channel}_API_KEY`];
  const path = process.env[`${channel}_PAYMENT_PATH`] || '/payments/initiate';

  if (!baseUrl || !apiKey) {
    return null;
  }

  const response = await axios.post(`${baseUrl}${path}`, {
    amount: Number(amount),
    currency,
    reference,
    request_id: requestId || uuidv4()
  }, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-Request-Id': requestId || uuidv4()
    },
    timeout: Number(process.env.PROVIDER_TIMEOUT_MS) || 8000
  });

  return {
    provider: channel.toLowerCase(),
    provider_reference: response.data.id || response.data.payment_id || null,
    status: response.data.status || 'PENDING',
    client_secret: response.data.client_secret || null,
    payment_url: response.data.payment_url || response.data.url || null
  };
};

const createPayment = async ({ channel, amount, currency, reference, requestId }) => {
  const normalizedChannel = channel.toUpperCase();
  const config = CHANNEL_CONFIG[normalizedChannel];

  if (!config) {
    const error = new Error(`Unsupported channel. Allowed: ${Object.keys(CHANNEL_CONFIG).join(', ')}`);
    error.status = 400;
    error.code = 'INVALID_CHANNEL';
    throw error;
  }

  const fee = Number(((Number(amount) * config.fee_percent) / 100).toFixed(2));
  let providerPayload = null;

  if (normalizedChannel === 'CARD') {
    providerPayload = await createStripePaymentIntent({ amount, currency, reference, requestId });
  } else {
    providerPayload = await createGenericProviderPayment({
      channel: normalizedChannel,
      amount,
      currency,
      reference,
      requestId
    });
  }

  if (providerPayload) {
    return {
      channel: normalizedChannel,
      fee,
      settlement: config.settlement,
      integration_mode: 'live',
      ...providerPayload
    };
  }

  return {
    channel: normalizedChannel,
    fee,
    settlement: config.settlement,
    integration_mode: 'fallback',
    provider: normalizedChannel === 'CARD' ? 'stripe' : normalizedChannel.toLowerCase(),
    provider_reference: null,
    status: 'PENDING',
    client_secret: null,
    payment_url: process.env.LOCAL_PAYMENT_URL_BASE
      ? `${process.env.LOCAL_PAYMENT_URL_BASE}/${normalizedChannel.toLowerCase()}/${Date.now()}`
      : null
  };
};

module.exports = {
  createPayment
};
