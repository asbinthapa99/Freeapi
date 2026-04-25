// PaisaLink API Controller - Finance
const { v4: uuidv4 } = require('uuid');
const liveApi = require('../services/liveApi.service');
const { appendRecord } = require('../services/persistence.service');
const { getDataset } = require('../services/catalog.service');
const { createPayment } = require('../services/payments.service');

const fallbackRates = [
  { currency: { iso3: 'USD', name: 'US Dollar' }, unit: 1, buy: 133.50, sell: 134.10 },
  { currency: { iso3: 'EUR', name: 'Euro' }, unit: 1, buy: 145.20, sell: 145.85 },
  { currency: { iso3: 'GBP', name: 'Pound Sterling' }, unit: 1, buy: 170.10, sell: 170.80 },
  { currency: { iso3: 'INR', name: 'Indian Rupee' }, unit: 100, buy: 160.00, sell: 160.15 }
];

const bankBranchesFallback = [
  { bank: 'Nabil Bank', district: 'Kathmandu', branch: 'Putalisadak', phone: '01-4422334' },
  { bank: 'Global IME Bank', district: 'Pokhara', branch: 'Lakeside', phone: '061-451122' },
  { bank: 'NIC Asia', district: 'Chitwan', branch: 'Bharatpur', phone: '056-590221' },
  { bank: 'Kumari Bank', district: 'Biratnagar', branch: 'Main Road', phone: '021-536200' }
];

const categorizeExpense = (description) => {
  const normalized = description.toLowerCase();
  if (/(rice|dal|vegetable|grocery|mart|food)/.test(normalized)) return 'GROCERIES';
  if (/(bus|taxi|fuel|petrol|transport)/.test(normalized)) return 'TRANSPORT';
  if (/(rent|room|flat|apartment)/.test(normalized)) return 'HOUSING';
  if (/(school|college|book|tuition)/.test(normalized)) return 'EDUCATION';
  if (/(hospital|clinic|medicine|pharmacy)/.test(normalized)) return 'HEALTH';
  if (/(internet|wifi|ntc|ncell|phone)/.test(normalized)) return 'UTILITIES';
  return 'GENERAL';
};

const getNormalizedForexPayload = async (date) => {
  const liveData = await liveApi.fetchForex(date);
  if (Array.isArray(liveData) && liveData.length > 0) {
    return {
      date: liveData[0].date || date || new Date().toISOString().split('T')[0],
      rates: liveData[0].rates
    };
  }

  return {
    date: date || new Date().toISOString().split('T')[0],
    rates: fallbackRates
  };
};

exports.getForex = async (req, res, next) => {
  try {
    const { date } = req.query; // format: YYYY-MM-DD
    const liveData = await liveApi.fetchForex(date);
    if (Array.isArray(liveData) && liveData.length > 0) {
      return res.json({ status: 'success', source: 'NRB Live API', data: { payload: liveData } });
    }

    if (liveApi.isStrictLiveMode()) {
      return res.status(503).json({
        error: {
          code: 'UPSTREAM_FOREX_UNAVAILABLE',
          message: 'Live NRB forex data is currently unavailable.',
          status: 503
        }
      });
    }

    res.json({ status: 'success', source: 'cached/fallback', data: {
      date: date || new Date().toISOString().split('T')[0],
      rates: fallbackRates.map((rate) => ({
        currency: rate.currency.name,
        iso3: rate.currency.iso3,
        unit: rate.unit,
        buy: rate.buy,
        sell: rate.sell
      }))
    }});
  } catch (error) { next(error); }
};

exports.calculateRemittance = async (req, res, next) => {
  try {
    const { amount, from_currency, to_currency } = req.body;
    if (!amount || !from_currency || !to_currency) {
      return res.status(400).json({ error: { code: 'MISSING_PARAMS', message: 'Provide amount, from_currency, and to_currency.', status: 400 } });
    }
    
    const forexData = await getNormalizedForexPayload();
    const rates = forexData.rates;
    
    let rate = 1;
    if (from_currency.toUpperCase() !== 'NPR') {
      const c = rates.find(r => r.currency.iso3 === from_currency.toUpperCase());
      if (!c) return res.status(400).json({ error: { code: 'UNSUPPORTED_CURRENCY', message: `Currency ${from_currency} not supported.`, status: 400 } });
      rate = parseFloat(c.buy || c.buy_rate); // depends on NRB structure or fallback structure
    }
    
    const total_npr = amount * rate;
    const estimated_fee = amount > 1000 ? 5 : 2; // Flat fee logic simulation
    
    res.json({ status: 'success', data: { amount, from_currency, to_currency: 'NPR', exchange_rate: rate, total_npr, estimated_transfer_fee_usd: estimated_fee } });
  } catch (error) { next(error); }
};

exports.getInflation = async (req, res, next) => {
  try {
    // Simulated historical data, as NRB inflation data often requires complex parsing or PDFs
    res.json({ status: 'success', data: {
      period: '2024-2025',
      inflation_rate_percent: 6.5,
      food_inflation: 7.2,
      non_food_inflation: 5.8
    }});
  } catch (error) { next(error); }
};

exports.getForexRates = exports.getForex;

exports.getRemittance = async (req, res, next) => {
  try {
    const { tracking_code } = req.params;
    res.json({
      status: 'success',
      data: {
        tracking_code: tracking_code.toUpperCase(),
        provider: 'PaisaLink Demo Network',
        amount_usd: 250,
        payout_currency: 'NPR',
        beneficiary_name: 'Sample Receiver',
        current_status: 'READY_FOR_PICKUP',
        last_updated: new Date().toISOString()
      }
    });
  } catch (error) { next(error); }
};

exports.initiatePayment = async (req, res, next) => {
  try {
    const { amount, currency = 'NPR', channel, reference } = req.body;
    if (!amount || !channel) {
      return res.status(400).json({ error: { code: 'MISSING_PAYMENT_FIELDS', message: 'Provide amount and channel.', status: 400 } });
    }

    const providerPayment = await createPayment({
      amount,
      currency,
      channel,
      reference,
      requestId: req.requestId
    });

    const payment = {
      payment_id: `PAY-${uuidv4().slice(0, 8).toUpperCase()}`,
      reference: reference || null,
      amount: Number(amount),
      currency,
      channel: providerPayment.channel,
      fee: providerPayment.fee,
      settlement: providerPayment.settlement,
      payment_url: providerPayment.payment_url,
      provider: providerPayment.provider,
      provider_reference: providerPayment.provider_reference,
      integration_mode: providerPayment.integration_mode,
      client_secret: providerPayment.client_secret,
      status: providerPayment.status,
      created_at: new Date().toISOString()
    };

    await appendRecord('payments', payment);
    res.status(201).json({
      status: 'success',
      data: payment
    });
  } catch (error) { next(error); }
};

exports.getBankBranches = async (req, res, next) => {
  try {
    const bankBranches = await getDataset('finance_bank_branches', bankBranchesFallback);
    const { bank, district } = req.query;
    let branches = bankBranches;

    if (bank) branches = branches.filter((item) => item.bank.toLowerCase().includes(bank.toLowerCase()));
    if (district) branches = branches.filter((item) => item.district.toLowerCase() === district.toLowerCase());

    res.json({ status: 'success', data: { count: branches.length, branches } });
  } catch (error) { next(error); }
};

exports.categorizeBudget = async (req, res, next) => {
  try {
    const { entries } = req.body;
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: { code: 'INVALID_ENTRIES', message: 'Provide an entries array.', status: 400 } });
    }

    const categorized = entries.map((entry) => ({
      ...entry,
      category: categorizeExpense(entry.description || ''),
      amount: Number(entry.amount || 0)
    }));

    const totals = categorized.reduce((acc, entry) => {
      acc[entry.category] = Number((acc[entry.category] || 0) + entry.amount);
      return acc;
    }, {});

    res.json({ status: 'success', data: { count: categorized.length, categorized, totals } });
  } catch (error) { next(error); }
};
