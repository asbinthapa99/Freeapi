module.exports = {
  routes: [
    { id: 'R1', name: 'Ratnapark - Budhanilkantha', stops: ['Ratnapark','Lazimpat','Maharajgunj','Chakrapath','Budhanilkantha'], distance_km: 12, fare_npr: 30, vehicle: 'MICRO' },
    { id: 'R2', name: 'Kalanki - Koteshwor', stops: ['Kalanki','Kalimati','Tripureshwor','Thapathali','Tinkune','Koteshwor'], distance_km: 10.5, fare_npr: 25, vehicle: 'MICRO' },
    { id: 'R3', name: 'Ratnapark - Sankhu', stops: ['Ratnapark','Chabahil','Boudha','Jorpati','Sankhu'], distance_km: 18, fare_npr: 40, vehicle: 'BUS' },
    { id: 'R4', name: 'Lagankhel - Swayambhu', stops: ['Lagankhel','Pulchowk','Patan Dhoka','Tripureshwor','Kalimati','Swayambhu'], distance_km: 9, fare_npr: 25, vehicle: 'MICRO' },
    { id: 'R5', name: 'Balkhu - Suryabinayak', stops: ['Balkhu','Ekantakuna','Satdobato','Imadol','Suryabinayak'], distance_km: 11, fare_npr: 30, vehicle: 'MICRO' },
    { id: 'R6', name: 'Ring Road (Full Loop)', stops: ['Kalanki','Balaju','Chabahil','Tinkune','Koteshwor','Satdobato','Ekantakuna','Kalanki'], distance_km: 27, fare_npr: 35, vehicle: 'BUS' },
    { id: 'R7', name: 'Kathmandu - Bhaktapur', stops: ['Ratnapark','Tinkune','Koteshwor','Jadibuti','Thimi','Suryabinayak','Bhaktapur'], distance_km: 14, fare_npr: 35, vehicle: 'BUS' }
  ],

  intercityRoutes: [
    { id: 'IC1', from: 'Kathmandu', to: 'Pokhara', distance_km: 200, duration_hrs: 6, fare_npr: 800, operator: 'Tourist Bus' },
    { id: 'IC2', from: 'Kathmandu', to: 'Chitwan', distance_km: 150, duration_hrs: 5, fare_npr: 600, operator: 'Deluxe Bus' },
    { id: 'IC3', from: 'Kathmandu', to: 'Lumbini', distance_km: 280, duration_hrs: 8, fare_npr: 1100, operator: 'Night Bus' },
    { id: 'IC4', from: 'Kathmandu', to: 'Janakpur', distance_km: 225, duration_hrs: 7, fare_npr: 900, operator: 'Deluxe Bus' },
    { id: 'IC5', from: 'Kathmandu', to: 'Biratnagar', distance_km: 400, duration_hrs: 10, fare_npr: 1400, operator: 'Night Bus' },
    { id: 'IC6', from: 'Kathmandu', to: 'Nepalgunj', distance_km: 510, duration_hrs: 12, fare_npr: 1600, operator: 'Night Bus' },
    { id: 'IC7', from: 'Pokhara', to: 'Chitwan', distance_km: 150, duration_hrs: 5, fare_npr: 500, operator: 'Tourist Bus' },
    { id: 'IC8', from: 'Kathmandu', to: 'Dharan', distance_km: 380, duration_hrs: 9, fare_npr: 1300, operator: 'Night Bus' }
  ],

  fareRules: {
    MICRO: { base_fare: 15, per_km: 2.5, student_discount: 0.5 },
    BUS: { base_fare: 20, per_km: 2.0, student_discount: 0.5 },
    TEMPO: { base_fare: 10, per_km: 3.0, student_discount: 0.5 }
  }
};
