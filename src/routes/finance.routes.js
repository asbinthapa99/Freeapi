const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');
const { requireAuth, requirePermission } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const {
  financeBudgetValidation,
  financePaymentValidation,
  financeRemittanceValidation,
  financeTrackingValidation
} = require('../validators/api.validators');

router.get('/forex/rates', financeController.getForexRates);
router.get('/remittance/:tracking_code', validate(financeTrackingValidation), financeController.getRemittance);
router.post('/remittance/calculate', validate(financeRemittanceValidation), financeController.calculateRemittance);
router.post('/payments/initiate', requireAuth, requirePermission('payments:create'), validate(financePaymentValidation), financeController.initiatePayment);
router.get('/banks/branches', financeController.getBankBranches);
router.get('/inflation', financeController.getInflation);
router.post('/budget/categorize', validate(financeBudgetValidation), financeController.categorizeBudget);

module.exports = router;
