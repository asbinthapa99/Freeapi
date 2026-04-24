module.exports = {
  treks: [
    { id: 'EBC', name: 'Everest Base Camp', region: 'Solukhumbu', distance_km: 130, max_alt_m: 5364, duration_days: 14, difficulty: 'Hard', permit: 'Sagarmatha NP Entry + TIMS', permit_cost_npr: 6000,
      daily_schedule: [
        { day: 1, start: 'Lukla', end: 'Phakding', distance_km: 8, altitude_m: 2610 },
        { day: 2, start: 'Phakding', end: 'Namche Bazaar', distance_km: 11, altitude_m: 3440 },
        { day: 3, start: 'Namche Bazaar', end: 'Acclimatization', distance_km: 5, altitude_m: 3440 },
        { day: 4, start: 'Namche', end: 'Tengboche', distance_km: 10, altitude_m: 3860 },
        { day: 5, start: 'Tengboche', end: 'Dingboche', distance_km: 14, altitude_m: 4410 },
        { day: 6, start: 'Dingboche', end: 'Acclimatization', distance_km: 5, altitude_m: 4410 },
        { day: 7, start: 'Dingboche', end: 'Lobuche', distance_km: 10, altitude_m: 4940 },
        { day: 8, start: 'Lobuche', end: 'Gorakshep/EBC', distance_km: 13, altitude_m: 5364 }
      ]
    },
    { id: 'ABC', name: 'Annapurna Base Camp', region: 'Kaski', distance_km: 110, max_alt_m: 4130, duration_days: 10, difficulty: 'Moderate', permit: 'ACAP Entry + TIMS', permit_cost_npr: 4000,
      daily_schedule: [
        { day: 1, start: 'Nayapul', end: 'Tikhedhunga', distance_km: 9, altitude_m: 1540 },
        { day: 2, start: 'Tikhedhunga', end: 'Ghorepani', distance_km: 11, altitude_m: 2860 },
        { day: 3, start: 'Ghorepani', end: 'Tadapani', distance_km: 13, altitude_m: 2630 },
        { day: 4, start: 'Tadapani', end: 'Chhomrong', distance_km: 10, altitude_m: 2170 },
        { day: 5, start: 'Chhomrong', end: 'Dovan', distance_km: 9, altitude_m: 2580 },
        { day: 6, start: 'Dovan', end: 'Machhapuchhre BC', distance_km: 11, altitude_m: 3700 },
        { day: 7, start: 'MBC', end: 'Annapurna BC', distance_km: 5, altitude_m: 4130 }
      ]
    },
    { id: 'POON', name: 'Poon Hill Trek', region: 'Myagdi', distance_km: 51, max_alt_m: 3210, duration_days: 5, difficulty: 'Easy', permit: 'ACAP Entry + TIMS', permit_cost_npr: 4000,
      daily_schedule: [
        { day: 1, start: 'Nayapul', end: 'Tikhedhunga', distance_km: 9, altitude_m: 1540 },
        { day: 2, start: 'Tikhedhunga', end: 'Ghorepani', distance_km: 11, altitude_m: 2860 },
        { day: 3, start: 'Ghorepani', end: 'Poon Hill & Tadapani', distance_km: 14, altitude_m: 3210 },
        { day: 4, start: 'Tadapani', end: 'Ghandruk', distance_km: 9, altitude_m: 1940 },
        { day: 5, start: 'Ghandruk', end: 'Nayapul', distance_km: 8, altitude_m: 1070 }
      ]
    },
    { id: 'LAN', name: 'Langtang Valley Trek', region: 'Rasuwa', distance_km: 74, max_alt_m: 3870, duration_days: 7, difficulty: 'Moderate', permit: 'Langtang NP Entry + TIMS', permit_cost_npr: 5000,
      daily_schedule: [
        { day: 1, start: 'Syabrubesi', end: 'Lama Hotel', distance_km: 10, altitude_m: 2380 },
        { day: 2, start: 'Lama Hotel', end: 'Langtang Village', distance_km: 12, altitude_m: 3430 },
        { day: 3, start: 'Langtang', end: 'Kyanjin Gompa', distance_km: 7, altitude_m: 3870 }
      ]
    }
  ],

  teahouses: [
    { name: 'Namche Lodge', location: 'Namche Bazaar', altitude_m: 3440, price_per_night_npr: 500, has_wifi: true, has_hot_shower: true },
    { name: 'Tengboche Guest House', location: 'Tengboche', altitude_m: 3860, price_per_night_npr: 400, has_wifi: false, has_hot_shower: true },
    { name: 'Himalayan Lodge', location: 'Ghorepani', altitude_m: 2860, price_per_night_npr: 600, has_wifi: true, has_hot_shower: true },
    { name: 'See You Lodge', location: 'Chhomrong', altitude_m: 2170, price_per_night_npr: 500, has_wifi: true, has_hot_shower: true },
    { name: 'Lobuche Peak GH', location: 'Lobuche', altitude_m: 4940, price_per_night_npr: 800, has_wifi: false, has_hot_shower: false }
  ],

  altitudeRiskTable: [
    { min_alt: 0, max_alt: 2500, risk: 'NONE', advice: 'No altitude risk at this elevation.' },
    { min_alt: 2500, max_alt: 3500, risk: 'LOW', advice: 'Mild headache possible. Stay hydrated.' },
    { min_alt: 3500, max_alt: 4500, risk: 'MODERATE', advice: 'Acclimatize for 1 day every 1000m gain. Watch for symptoms.' },
    { min_alt: 4500, max_alt: 5500, risk: 'HIGH', advice: 'Serious risk of AMS. Descend immediately if severe headache, nausea, or confusion.' },
    { min_alt: 5500, max_alt: 9000, risk: 'EXTREME', advice: 'Supplemental oxygen recommended. Only for experienced trekkers.' }
  ]
};
