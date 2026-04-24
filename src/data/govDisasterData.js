module.exports = {
  riverStations: [
    { station: 'Chatara', river: 'Koshi', district: 'Sunsari', current_level_m: 5.8, warning_m: 6.0, danger_m: 6.8, status: 'NORMAL' },
    { station: 'Devghat', river: 'Narayani', district: 'Tanahu', current_level_m: 4.2, warning_m: 5.5, danger_m: 6.5, status: 'NORMAL' },
    { station: 'Kusum', river: 'Rapti', district: 'Chitwan', current_level_m: 3.1, warning_m: 4.0, danger_m: 5.0, status: 'NORMAL' },
    { station: 'Chisapani', river: 'Karnali', district: 'Bardiya', current_level_m: 7.3, warning_m: 8.0, danger_m: 9.5, status: 'NORMAL' },
    { station: 'Pachuwarghat', river: 'Melamchi', district: 'Sindhupalchok', current_level_m: 2.5, warning_m: 3.0, danger_m: 3.8, status: 'NORMAL' }
  ],

  landslideZones: [
    { district: 'Sindhupalchok', risk: 'HIGH', zone: 'Melamchi Valley', lat: 27.85, lng: 85.56 },
    { district: 'Gorkha', risk: 'HIGH', zone: 'Barpak Area', lat: 28.20, lng: 84.82 },
    { district: 'Kavre', risk: 'MODERATE', zone: 'Dhulikhel Hills', lat: 27.62, lng: 85.56 },
    { district: 'Myagdi', risk: 'MODERATE', zone: 'Beni Road Section', lat: 28.35, lng: 83.57 },
    { district: 'Dolakha', risk: 'HIGH', zone: 'Charikot Area', lat: 27.67, lng: 86.05 }
  ],

  activeAlerts: [
    { id: 'ALT-001', type: 'FLOOD_WARNING', severity: 'MODERATE', district: 'Sunsari', message: 'Koshi river level rising. Stay alert.', message_ne: 'कोशी नदीको सतह बढ्दै छ। सतर्क रहनुहोस्।', issued_at: '2025-07-15T06:00:00Z' },
    { id: 'ALT-002', type: 'LANDSLIDE_RISK', severity: 'HIGH', district: 'Sindhupalchok', message: 'Heavy rainfall expected. Landslide risk elevated.', message_ne: 'भारी वर्षा अपेक्षित। पहिरोको जोखिम बढेको छ।', issued_at: '2025-07-15T08:00:00Z' }
  ],

  govApplications: {
    'PASS-12345': { type: 'e-Passport', applicant_district: 'Kathmandu', status: 'READY', office: 'Department of Passports, Tripureshwor', applied_date: '2025-01-10', estimated_completion: '2025-02-10' },
    'NID-98765': { type: 'National ID Card', applicant_district: 'Lalitpur', status: 'PROCESSING', office: 'DAO Lalitpur', applied_date: '2025-03-01', estimated_completion: '2025-04-15' },
    'DL-55555': { type: 'Driving License', applicant_district: 'Chitwan', status: 'PRINTED', office: 'DoTM Bharatpur', applied_date: '2025-02-20', estimated_completion: '2025-03-20' },
    'PASS-67890': { type: 'e-Passport', applicant_district: 'Pokhara', status: 'PENDING', office: 'Regional Passport Office, Pokhara', applied_date: '2025-04-01', estimated_completion: '2025-05-15' },
    'CIT-11111': { type: 'Citizenship Certificate', applicant_district: 'Jhapa', status: 'VERIFIED', office: 'DAO Jhapa', applied_date: '2025-01-15', estimated_completion: '2025-02-01' }
  },

  wardOffices: [
    { ward: 1, municipality: 'Kathmandu Metropolitan City', address: 'Tundikhel', phone: '01-4211234', office_hours: '10:00-17:00' },
    { ward: 4, municipality: 'Kathmandu Metropolitan City', address: 'Kamaladi', phone: '01-4220056', office_hours: '10:00-17:00' },
    { ward: 10, municipality: 'Lalitpur Metropolitan City', address: 'Kupondole', phone: '01-5540078', office_hours: '10:00-17:00' },
    { ward: 6, municipality: 'Bhaktapur Municipality', address: 'Taumadhi', phone: '01-6612345', office_hours: '10:00-17:00' },
    { ward: 1, municipality: 'Pokhara Metropolitan City', address: 'Lakeside', phone: '061-520034', office_hours: '10:00-17:00' }
  ]
};
