// Entertainment — movies, events, cinemas

const cinemas = [
  { name: 'QFX Cinemas Kumari Hall', location: 'Durbarmarg, Kathmandu', screens: 3, website: 'https://www.qfxcinemas.com' },
  { name: 'QFX Cinemas Civil Mall', location: 'Sundhara, Kathmandu', screens: 5, website: 'https://www.qfxcinemas.com' },
  { name: 'QFX Cinemas Labim Mall', location: 'Pulchowk, Lalitpur', screens: 4, website: 'https://www.qfxcinemas.com' },
  { name: 'Big Movies Fcube', location: 'Bhrikutimandap, Kathmandu', screens: 3, website: 'https://bigmoviesnepal.com' },
  { name: 'Big Movies Daraz', location: 'Kalanki, Kathmandu', screens: 3, website: 'https://bigmoviesnepal.com' },
  { name: 'Himal Cinema', location: 'Pokhara', screens: 2, website: null },
  { name: 'New Plaza Cinema', location: 'Birgunj', screens: 2, website: null },
];

const movies = [
  { title: 'Chhakka Panja 4', genre: 'Comedy', language: 'Nepali', director: 'Deepa Shree Niraula', theaters: ['QFX Kumari', 'QFX Civil Mall', 'Big Movies Fcube'] },
  { title: 'Loot 3', genre: 'Action/Comedy', language: 'Nepali', director: 'Nischal Basnet', theaters: ['QFX Labim Mall', 'Big Movies Daraz'] },
  { title: 'Sherdil Shergill', genre: 'Romance', language: 'Hindi', director: 'Vikas Bahl', theaters: ['QFX Civil Mall', 'Big Movies Fcube'] },
  { title: 'Mero Yatra', genre: 'Drama', language: 'Nepali', director: 'Ram Babu Gurung', theaters: ['QFX Kumari'] },
  { title: 'Inception (Re-release)', genre: 'Sci-Fi', language: 'English', director: 'Christopher Nolan', theaters: ['QFX Labim Mall'] },
];

const getUpcomingFestivalEvents = () => {
  const now = new Date();
  const year = now.getFullYear();
  return [
    { name: 'Dashain Festival', type: 'Cultural', location: 'Nationwide', month: 'October', description: 'Biggest Hindu festival in Nepal — 15 days' },
    { name: 'Tihar / Dipawali', type: 'Cultural', location: 'Nationwide', month: 'October/November', description: '5-day festival of lights' },
    { name: 'Holi', type: 'Cultural', location: 'Nationwide', month: 'March', description: 'Festival of colors — celebrated one day before India' },
    { name: 'Bisket Jatra', type: 'Cultural', location: 'Bhaktapur', month: 'April', description: 'New Year chariot festival' },
    { name: 'Indra Jatra', type: 'Cultural', location: 'Kathmandu', month: 'September', description: 'Street festival with Kumari procession' },
    { name: 'Everest Marathon', type: 'Sports', location: 'Everest Base Camp', month: 'May', description: 'World\'s highest marathon at 5,364m' },
    { name: 'Nepal International Jazz Festival', type: 'Music', location: 'Kathmandu', month: 'March', description: 'Annual jazz event at Patan Museum' },
    { name: 'Mountain Bike Festival Pokhara', type: 'Sports', location: 'Pokhara', month: 'November', description: 'MTB race around Phewa Lake' },
  ];
};

exports.getMovies = async (req, res, next) => {
  try {
    const { language, genre } = req.query;
    let result = movies;
    if (language) result = result.filter(m => m.language.toLowerCase().includes(language.toLowerCase()));
    if (genre) result = result.filter(m => m.genre.toLowerCase().includes(genre.toLowerCase()));
    res.json({
      status: 'success', source: 'static (update via QFX/BigMovies)',
      note: 'For real-time showtimes visit https://www.qfxcinemas.com or https://bigmoviesnepal.com',
      data: { count: result.length, movies: result },
    });
  } catch (e) { next(e); }
};

exports.getEvents = async (req, res, next) => {
  try {
    const events = getUpcomingFestivalEvents();
    res.json({ status: 'success', source: 'static', data: { count: events.length, events } });
  } catch (e) { next(e); }
};

exports.getCinemas = async (req, res, next) => {
  try {
    const { location } = req.query;
    let result = cinemas;
    if (location) result = result.filter(c => c.location.toLowerCase().includes(location.toLowerCase()));
    res.json({ status: 'success', source: 'static', data: { count: result.length, cinemas: result } });
  } catch (e) { next(e); }
};
