// Nepal festivals — algorithmic + static cultural calendar

const ALL_FESTIVALS = [
  // Major Hindu
  { name: 'Dashain (Vijaya Dashami)', nepali: 'दशैं', type: 'Hindu', month_bs: 'Ashwin', approx_month_ad: 'October', duration_days: 15, significance: 'Biggest festival — goddess Durga victory over evil; tika and jamara ceremony', nationwide: true },
  { name: 'Tihar (Dipawali)', nepali: 'तिहार', type: 'Hindu', month_bs: 'Kartik', approx_month_ad: 'October/November', duration_days: 5, significance: 'Festival of lights — worship of crow, dog, cow, Laxmi, and brothers', nationwide: true },
  { name: 'Holi (Fagu Purnima)', nepali: 'होली', type: 'Hindu', month_bs: 'Falgun', approx_month_ad: 'March', duration_days: 2, significance: 'Festival of colors — Terai celebrates one day before hills', nationwide: true },
  { name: 'Maha Shivaratri', nepali: 'महाशिवरात्री', type: 'Hindu', month_bs: 'Falgun', approx_month_ad: 'February/March', duration_days: 1, significance: 'Night of Shiva — major pilgrimage at Pashupatinath Temple', nationwide: true },
  { name: 'Ram Navami', nepali: 'राम नवमी', type: 'Hindu', month_bs: 'Baishakh', approx_month_ad: 'April', duration_days: 1, significance: 'Birthday of Lord Ram', nationwide: true },
  { name: 'Krishna Janmashtami', nepali: 'कृष्ण जन्माष्टमी', type: 'Hindu', month_bs: 'Bhadra', approx_month_ad: 'August', duration_days: 1, significance: 'Birthday of Lord Krishna — celebrated at Patan', nationwide: true },
  { name: 'Teej', nepali: 'तीज', type: 'Hindu', month_bs: 'Bhadra', approx_month_ad: 'August/September', duration_days: 3, significance: 'Women\'s festival — fasting and prayer for husband\'s longevity', nationwide: true },
  { name: 'Janai Purnima (Raksha Bandhan)', nepali: 'जनाई पूर्णिमा', type: 'Hindu', month_bs: 'Shrawan', approx_month_ad: 'August', duration_days: 1, significance: 'Sacred thread ceremony; brothers tie rakhi to sisters', nationwide: true },
  { name: 'Chhath Parva', nepali: 'छठ पर्व', type: 'Hindu', month_bs: 'Kartik', approx_month_ad: 'October/November', duration_days: 4, significance: 'Sun worship — major in Terai; devotees fast near rivers', nationwide: false, regions: ['Terai', 'Madhesh'] },
  { name: 'Maghe Sankranti', nepali: 'माघे संक्रान्ति', type: 'Hindu', month_bs: 'Poush/Magh', approx_month_ad: 'January', duration_days: 1, significance: 'End of winter solstice — sesame seeds, sweet potato, ghee eaten', nationwide: true },

  // Buddhist
  { name: 'Buddha Jayanti', nepali: 'बुद्ध जयन्ती', type: 'Buddhist', month_bs: 'Baishakh', approx_month_ad: 'May', duration_days: 1, significance: 'Birthday of Siddhartha Gautama at Lumbini — national holiday', nationwide: true },
  { name: 'Losar (Tibetan New Year)', nepali: 'ल्होसार', type: 'Buddhist', month_bs: 'Magh', approx_month_ad: 'February', duration_days: 3, significance: 'New Year for Tibetan Buddhist communities — Sherpa, Tamang, Gurung', nationwide: false, regions: ['Kathmandu', 'Mustang', 'Solukhumbu'] },

  // Newari
  { name: 'Indra Jatra', nepali: 'इन्द्र जात्रा', type: 'Newari', month_bs: 'Bhadra', approx_month_ad: 'September', duration_days: 8, significance: 'Street festival with Kumari chariot procession in Kathmandu Durbar Square', nationwide: false, regions: ['Kathmandu Valley'] },
  { name: 'Bisket Jatra', nepali: 'बिस्केट जात्रा', type: 'Newari', month_bs: 'Chaitra/Baishakh', approx_month_ad: 'April', duration_days: 9, significance: 'Bhaktapur New Year — giant chariot pulled through streets', nationwide: false, regions: ['Bhaktapur'] },
  { name: 'Rato Machhendranath Jatra', nepali: 'रातो मच्छिन्द्रनाथ जात्रा', type: 'Newari', month_bs: 'Baishakh', approx_month_ad: 'April/May', duration_days: 30, significance: 'Month-long chariot festival in Lalitpur — rain god procession', nationwide: false, regions: ['Lalitpur'] },
  { name: 'Gai Jatra', nepali: 'गाई जात्रा', type: 'Newari', month_bs: 'Bhadra', approx_month_ad: 'August', duration_days: 8, significance: 'Procession of cows to help the recently deceased cross to afterlife', nationwide: false, regions: ['Kathmandu Valley'] },
  { name: 'Yenya (Indra Jatra) Kumari', nepali: 'येँयाः', type: 'Newari', month_bs: 'Bhadra', approx_month_ad: 'September', duration_days: 8, significance: 'The living goddess Kumari is displayed and worshipped', nationwide: false, regions: ['Kathmandu'] },

  // National Days
  { name: 'Nepal New Year (Nava Varsha)', nepali: 'नयाँ वर्ष', type: 'National', month_bs: 'Baishakh', approx_month_ad: 'April 14', duration_days: 1, significance: 'Bikram Sambat new year — public holiday', nationwide: true },
  { name: 'Constitution Day', nepali: 'संविधान दिवस', type: 'National', month_bs: 'Ashwin 3', approx_month_ad: 'September 19', duration_days: 1, significance: '2015 Constitution of Nepal promulgated', nationwide: true },
  { name: 'Democracy Day', nepali: 'प्रजातन्त्र दिवस', type: 'National', month_bs: 'Falgun 7', approx_month_ad: 'February 18/19', duration_days: 1, significance: 'End of Rana oligarchy in 1951', nationwide: true },
  { name: 'Prithvi Jayanti', nepali: 'पृथ्वी जयन्ती', type: 'National', month_bs: 'Poush 27', approx_month_ad: 'January 11', duration_days: 1, significance: 'Birthday of King Prithvi Narayan Shah — Nepal unification day', nationwide: true },
  { name: 'Martyr\'s Day (Shahid Diwas)', nepali: 'शहीद दिवस', type: 'National', month_bs: 'Magh 5', approx_month_ad: 'January', duration_days: 1, significance: 'Commemorating martyrs executed by Rana regime', nationwide: true },
];

exports.getAll = async (req, res, next) => {
  try {
    const { type, nationwide } = req.query;
    let festivals = ALL_FESTIVALS;
    if (type) festivals = festivals.filter(f => f.type.toLowerCase() === type.toLowerCase());
    if (nationwide === 'true') festivals = festivals.filter(f => f.nationwide === true);
    res.json({ status: 'success', source: 'static', data: { count: festivals.length, festivals } });
  } catch (e) { next(e); }
};

exports.getTypes = async (req, res, next) => {
  try {
    const types = [...new Set(ALL_FESTIVALS.map(f => f.type))];
    res.json({ status: 'success', data: { types } });
  } catch (e) { next(e); }
};

exports.getUpcoming = async (req, res, next) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const adMonthToBS = { 1:'Poush/Magh', 2:'Magh/Falgun', 3:'Falgun/Chaitra', 4:'Chaitra/Baishakh', 5:'Baishakh/Jestha', 6:'Jestha/Ashadh', 7:'Ashadh/Shrawan', 8:'Shrawan/Bhadra', 9:'Bhadra/Ashwin', 10:'Ashwin/Kartik', 11:'Kartik/Mangsir', 12:'Mangsir/Poush' };
    const currentBSMonths = (adMonthToBS[month] || '').split('/');
    const nextBSMonths = (adMonthToBS[month + 1 > 12 ? 1 : month + 1] || '').split('/');
    const relevantMonths = [...currentBSMonths, ...nextBSMonths];
    const upcoming = ALL_FESTIVALS.filter(f => relevantMonths.some(m => f.month_bs.includes(m)));
    res.json({ status: 'success', source: 'static', data: { count: upcoming.length, festivals: upcoming, approx_period: adMonthToBS[month] } });
  } catch (e) { next(e); }
};
