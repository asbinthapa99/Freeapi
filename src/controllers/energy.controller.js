// Nepal Electricity Authority (NEA) — Energy Controller

const neaTariff = [
  { category: 'Residential (up to 20 units)', rate_per_unit_npr: 3.00 },
  { category: 'Residential (21–30 units)', rate_per_unit_npr: 6.50 },
  { category: 'Residential (31–100 units)', rate_per_unit_npr: 8.00 },
  { category: 'Residential (101–250 units)', rate_per_unit_npr: 11.00 },
  { category: 'Residential (>250 units)', rate_per_unit_npr: 13.00 },
  { category: 'Commercial (up to 20 units)', rate_per_unit_npr: 9.00 },
  { category: 'Commercial (21–100 units)', rate_per_unit_npr: 11.00 },
  { category: 'Commercial (>100 units)', rate_per_unit_npr: 13.00 },
  { category: 'Industrial (HT)', rate_per_unit_npr: 8.50 },
  { category: 'Industrial (LT)', rate_per_unit_npr: 10.00 },
];

const hydroPlants = [
  { name: 'Upper Tamakoshi', capacity_mw: 456, province: 'Bagmati', river: 'Tamakoshi', status: 'Operational', commissioned: 2021 },
  { name: 'Kali Gandaki A', capacity_mw: 144, province: 'Gandaki', river: 'Kali Gandaki', status: 'Operational', commissioned: 2002 },
  { name: 'Marsyangdi', capacity_mw: 69, province: 'Gandaki', river: 'Marsyangdi', status: 'Operational', commissioned: 1989 },
  { name: 'Chilime', capacity_mw: 22, province: 'Bagmati', river: 'Chilime', status: 'Operational', commissioned: 2003 },
  { name: 'Modi Khola', capacity_mw: 14.8, province: 'Gandaki', river: 'Modi Khola', status: 'Operational', commissioned: 1996 },
  { name: 'Trishuli', capacity_mw: 24, province: 'Bagmati', river: 'Trishuli', status: 'Operational', commissioned: 1967 },
  { name: 'Sun Koshi', capacity_mw: 10.05, province: 'Bagmati', river: 'Sun Koshi', status: 'Operational', commissioned: 1972 },
  { name: 'Lower Modi Khola', capacity_mw: 42.5, province: 'Gandaki', river: 'Modi Khola', status: 'Operational', commissioned: 2020 },
  { name: 'Rasuwagadhi', capacity_mw: 111, province: 'Bagmati', river: 'Trishuli', status: 'Operational', commissioned: 2020 },
  { name: 'Sanjen', capacity_mw: 42.9, province: 'Bagmati', river: 'Trishuli', status: 'Operational', commissioned: 2022 },
];

const plannedOutages = [
  { area: 'Baneshwor, Kathmandu', reason: 'Scheduled maintenance', start: '10:00', end: '14:00', date: new Date().toISOString().split('T')[0] },
  { area: 'Lagankhel, Lalitpur', reason: 'Line upgrade', start: '09:00', end: '13:00', date: new Date().toISOString().split('T')[0] },
  { area: 'Bhaktapur Durbar', reason: 'Transformer replacement', start: '11:00', end: '15:00', date: new Date().toISOString().split('T')[0] },
];

exports.getOutages = async (req, res, next) => {
  try {
    res.json({
      status: 'success',
      source: 'NEA scheduled (static cache)',
      note: 'Live NEA outage API not publicly available. Check https://nea.org.np/ for real-time updates.',
      data: { count: plannedOutages.length, outages: plannedOutages },
    });
  } catch (e) { next(e); }
};

exports.getHydro = async (req, res, next) => {
  try {
    const { province } = req.query;
    let plants = hydroPlants;
    if (province) plants = plants.filter(p => p.province.toLowerCase().includes(province.toLowerCase()));
    const totalCapacity = plants.reduce((sum, p) => sum + p.capacity_mw, 0);
    res.json({
      status: 'success', source: 'static (NEA public data)',
      data: { count: plants.length, total_capacity_mw: Math.round(totalCapacity * 10) / 10, plants },
    });
  } catch (e) { next(e); }
};

exports.getTariff = async (req, res, next) => {
  try {
    res.json({
      status: 'success', source: 'NEA Tariff FY 2024/25',
      data: { currency: 'NPR', unit: 'kWh', rates: neaTariff, source_url: 'https://nea.org.np/' },
    });
  } catch (e) { next(e); }
};

exports.getSummary = async (req, res, next) => {
  try {
    const totalInstalled = hydroPlants.reduce((sum, p) => sum + p.capacity_mw, 0);
    res.json({
      status: 'success',
      data: {
        installed_capacity_mw: Math.round(totalInstalled * 10) / 10,
        primary_source: 'Hydropower',
        grid_coverage_percent: 91,
        electrification_percent: 91,
        peak_demand_mw: 1800,
        note: 'Nepal meets ~91% of electricity demand from hydropower.',
        source_url: 'https://nea.org.np/',
      },
    });
  } catch (e) { next(e); }
};
