module.exports = {
  forexRates: {
    USD: { buy: 132.50, sell: 133.10 },
    EUR: { buy: 143.20, sell: 144.00 },
    GBP: { buy: 167.40, sell: 168.50 },
    AUD: { buy: 85.30, sell: 86.00 },
    JPY: { buy: 0.88, sell: 0.89 }
  },
  
  kalimatiPrices: [
    { commodity: 'Tomato Big(Nepali)', min: 80, max: 90, avg: 85 },
    { commodity: 'Potato Red', min: 40, max: 45, avg: 43 },
    { commodity: 'Onion Dry (Indian)', min: 60, max: 65, avg: 63 },
    { commodity: 'Apple(Jholey)', min: 250, max: 280, avg: 265 }
  ],

  transportRoutes: {
    'Kalanki-Koteshwor': { distance_km: 10.5, time_mins: 45 },
    'Ratnapark-Sankhu': { distance_km: 18.0, time_mins: 90 },
    'Balkhu-Patan': { distance_km: 6.0, time_mins: 25 }
  },

  govApplications: {
    'PASS-12345': { type: 'e-Passport', status: 'READY', office: 'DOP Tripureshwor' },
    'NID-98765': { type: 'National ID', status: 'PROCESSING', office: 'DAO Kathmandu' },
    'DL-55555': { type: 'Driving License', status: 'PRINTED', office: 'Ekantakuna' }
  },
  
  tourismTrekRoutes: [
    { id: 'EBC', name: 'Everest Base Camp', distance_km: 130, max_alt: 5364, difficulty: 'Hard' },
    { id: 'ABC', name: 'Annapurna Base Camp', distance_km: 110, max_alt: 4130, difficulty: 'Moderate' },
    { id: 'POON', name: 'Poon Hill', distance_km: 51, max_alt: 3210, difficulty: 'Easy' }
  ],

  educationQa: {
    'newton': { answer: "Newton's third law states that for every action, there is an equal and opposite reaction.", topics: ["Physics", "Force"] },
    'photosynthesis': { answer: "The process by which green plants make their food using sunlight, water, and CO2.", topics: ["Biology", "Plants"] },
    'nepal history': { answer: "Prithvi Narayan Shah unified Nepal in 1768.", topics: ["History", "Unification"] }
  }
};
