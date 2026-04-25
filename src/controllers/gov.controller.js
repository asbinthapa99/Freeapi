// NagarikConnect API Controller - Government Services
const govDisasterData = require('../data/govDisasterData');
const holidaysFallback = require('../data/holidays');
const { getDataset } = require('../services/catalog.service');
const verificationService = require('../services/verification.service');
const liveApi = require('../services/liveApi.service');

exports.trackApplication = async (req, res, next) => {
  try {
    const { app_id } = req.params;
    const applications = await getDataset('gov_applications', govDisasterData.govApplications);
    const application = applications[app_id.toUpperCase()];
    
    if (!application) {
      return res.status(404).json({ error: { code: 'APP_NOT_FOUND', message: `Application ID ${app_id} not found.`, status: 404 } });
    }
    
    res.json({ status: 'success', data: { app_id: app_id.toUpperCase(), ...application } });
  } catch (error) { next(error); }
};

exports.getWardInfo = async (req, res, next) => {
  try {
    const { ward, municipality } = req.query;
    const liveOffices = await liveApi.fetchGovernmentOffices({ ward, municipality, limit: 75 });
    if (!liveOffices && liveApi.isStrictLiveMode()) {
      return res.status(503).json({
        error: {
          code: 'UPSTREAM_GOV_OFFICES_UNAVAILABLE',
          message: 'Live OpenStreetMap government office data is currently unavailable.',
          status: 503
        }
      });
    }

    let offices = liveOffices || await getDataset('gov_ward_offices', govDisasterData.wardOffices);
    
    if (!liveOffices && ward) offices = offices.filter(o => o.ward === parseInt(ward, 10));
    if (!liveOffices && municipality) offices = offices.filter(o => o.municipality.toLowerCase().includes(municipality.toLowerCase()));
    
    res.json({ status: 'success', source: liveOffices ? 'OpenStreetMap' : 'catalog', data: { count: offices.length, offices } });
  } catch (error) { next(error); }
};

exports.getPublicHolidays = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    let holidays = await getDataset('gov_holidays', holidaysFallback);
    
    if (year) holidays = holidays.filter(h => h.year === parseInt(year, 10));
    if (month) {
      const monthStr = month.padStart(2, '0');
      holidays = holidays.filter(h => h.date.split('-')[1] === monthStr);
    }
    
    res.json({ status: 'success', data: { count: holidays.length, holidays } });
  } catch (error) { next(error); }
};

exports.getStatus = async (req, res, next) => {
  req.params.app_id = req.params.tracking_id;
  return exports.trackApplication(req, res, next);
};

exports.verifyDocument = async (req, res, next) => {
  try {
    const { document_number, document_type, holder_name } = req.body;
    if (!document_number || !document_type) {
      return res.status(400).json({ error: { code: 'MISSING_DOCUMENT_FIELDS', message: 'Provide document_number and document_type.', status: 400 } });
    }

    res.json({
      status: 'success',
      data: await verificationService.verifyDocument({
        document_number,
        document_type,
        holder_name,
        requestId: req.requestId
      })
    });
  } catch (error) { next(error); }
};

exports.getHolidays = async (req, res, next) => {
  req.query.year = req.params.year;
  return exports.getPublicHolidays(req, res, next);
};

exports.getOffices = exports.getWardInfo;

exports.getVehicleTax = async (req, res, next) => {
  try {
    const rates = [
      { vehicle_type: 'Motorbike', engine_capacity_cc: 'Up to 150', annual_tax_npr: 3000 },
      { vehicle_type: 'Car', engine_capacity_cc: '1001-1500', annual_tax_npr: 28000 },
      { vehicle_type: 'Jeep/Van', engine_capacity_cc: '1501-2000', annual_tax_npr: 37000 },
      { vehicle_type: 'Electric Car', engine_capacity_cc: 'N/A', annual_tax_npr: 12000 }
    ];

    res.json({ status: 'success', data: { count: rates.length, rates } });
  } catch (error) { next(error); }
};
