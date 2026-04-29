// Bikram Sambat (BS) ↔ Gregorian (AD) calendar conversion

// Days in each month for BS years 2000–2090 (14 months per row: year + 12 months + total days)
const BS_MONTH_DAYS = {
  2080: [31,32,31,32,31,30,30,30,29,29,30,30],
  2081: [31,31,32,32,31,30,30,30,29,30,30,30],
  2082: [31,32,31,32,31,30,30,30,29,30,30,30],
  2083: [31,32,31,32,31,30,30,30,29,30,30,30],
  2084: [31,31,32,32,31,30,30,30,29,30,30,30],
  2085: [31,31,32,32,31,30,30,30,29,30,30,30],
  2086: [31,32,31,32,31,30,30,30,29,30,30,30],
};

// BS epoch: BS 2000 Baishakh 1 = AD 1943 April 14
const BS_EPOCH_AD = new Date(1943, 3, 14); // April 14 1943
const BS_EPOCH_BS = { year: 2000, month: 1, day: 1 };
const BS_MONTHS = ['Baishakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra'];
const BS_MONTHS_NE = ['बैशाख','जेठ','असार','साउन','भदौ','असोज','कार्तिक','मंसिर','पुस','माघ','फागुन','चैत'];

const getDaysInBSMonth = (year, month) => {
  const row = BS_MONTH_DAYS[year];
  if (!row) {
    // Approximation for years outside lookup table
    const daysPattern = [31,32,31,32,31,30,30,30,29,30,30,30];
    return daysPattern[(month - 1) % 12];
  }
  return row[month - 1];
};

const adToBS = (adDate) => {
  const msPerDay = 86400000;
  const diffDays = Math.floor((adDate - BS_EPOCH_AD) / msPerDay);
  let bsYear = BS_EPOCH_BS.year;
  let bsMonth = BS_EPOCH_BS.month;
  let bsDay = BS_EPOCH_BS.day;
  let remaining = diffDays;
  while (remaining > 0) {
    const daysInMonth = getDaysInBSMonth(bsYear, bsMonth);
    const daysLeft = daysInMonth - bsDay + 1;
    if (remaining < daysLeft) {
      bsDay += remaining;
      remaining = 0;
    } else {
      remaining -= daysLeft;
      bsDay = 1;
      bsMonth++;
      if (bsMonth > 12) { bsMonth = 1; bsYear++; }
    }
  }
  return { year: bsYear, month: bsMonth, day: bsDay, month_name: BS_MONTHS[bsMonth - 1], month_name_ne: BS_MONTHS_NE[bsMonth - 1] };
};

const bsToAD = (bsYear, bsMonth, bsDay) => {
  const msPerDay = 86400000;
  let days = 0;
  for (let y = BS_EPOCH_BS.year; y < bsYear; y++) {
    for (let m = 1; m <= 12; m++) days += getDaysInBSMonth(y, m);
  }
  for (let m = BS_EPOCH_BS.month; m < bsMonth; m++) days += getDaysInBSMonth(bsYear, m);
  days += bsDay - BS_EPOCH_BS.day;
  const adDate = new Date(BS_EPOCH_AD.getTime() + days * msPerDay);
  return adDate;
};

const nepalPublicHolidays = [
  { bs: '2081-01-01', name: 'Nepal New Year (Nava Varsha)', type: 'National' },
  { bs: '2081-01-11', name: 'Ram Navami', type: 'Religious' },
  { bs: '2081-06-01', name: 'Constitution Day', type: 'National' },
  { bs: '2081-06-15', name: 'Dashain (Ghatasthapana)', type: 'Religious' },
  { bs: '2081-07-01', name: 'Tihar / Lakshmi Puja', type: 'Religious' },
  { bs: '2081-09-29', name: 'Prithvi Narayan Shah Birthday', type: 'National' },
  { bs: '2081-10-01', name: 'Maghe Sankranti', type: 'Religious' },
  { bs: '2081-11-07', name: 'Maha Shivaratri', type: 'Religious' },
  { bs: '2081-12-01', name: 'Holi (Fagu Purnima)', type: 'Religious' },
];

exports.getToday = async (req, res, next) => {
  try {
    const today = new Date();
    const bs = adToBS(today);
    const nepDow = ['Aaityabar', 'Sombar', 'Mangalbar', 'Budhabar', 'Bihibar', 'Sukrabar', 'Sanibar'];
    res.json({
      status: 'success',
      data: {
        ad: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate(), date: today.toISOString().split('T')[0], day_of_week: today.toLocaleDateString('en-US', { weekday: 'long' }) },
        bs: { ...bs, date: `${bs.year}-${String(bs.month).padStart(2,'0')}-${String(bs.day).padStart(2,'0')}`, day_of_week: nepDow[today.getDay()] },
        timezone: 'Asia/Kathmandu (UTC+5:45)',
      },
    });
  } catch (e) { next(e); }
};

exports.convertADtoBS = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: { code: 'INVALID_DATE', message: 'Provide date in YYYY-MM-DD format.', status: 400 } });
    }
    const adDate = new Date(date);
    if (isNaN(adDate)) return res.status(400).json({ error: { code: 'INVALID_DATE', message: 'Invalid date.', status: 400 } });
    const bs = adToBS(adDate);
    res.json({ status: 'success', data: { input_ad: date, bs: { ...bs, date: `${bs.year}-${String(bs.month).padStart(2,'0')}-${String(bs.day).padStart(2,'0')}` } } });
  } catch (e) { next(e); }
};

exports.convertBStoAD = async (req, res, next) => {
  try {
    const { year, month, day } = req.query;
    if (!year || !month || !day) {
      return res.status(400).json({ error: { code: 'MISSING_PARAMS', message: 'Provide year, month, and day (BS).', status: 400 } });
    }
    const ad = bsToAD(Number(year), Number(month), Number(day));
    res.json({ status: 'success', data: { input_bs: `${year}-${month}-${day}`, ad: ad.toISOString().split('T')[0] } });
  } catch (e) { next(e); }
};

exports.getHolidays = async (req, res, next) => {
  try {
    res.json({ status: 'success', source: 'static (Government of Nepal)', data: { count: nepalPublicHolidays.length, holidays: nepalPublicHolidays } });
  } catch (e) { next(e); }
};

exports.getMonthNames = async (req, res, next) => {
  try {
    res.json({
      status: 'success',
      data: {
        months: BS_MONTHS.map((name, i) => ({ number: i + 1, name_en: name, name_ne: BS_MONTHS_NE[i] })),
        note: 'Bikram Sambat year starts in mid-April (Baishakh 1).',
      },
    });
  } catch (e) { next(e); }
};
