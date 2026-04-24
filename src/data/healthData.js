module.exports = {
  healthFacilities: [
    { name: 'Tribhuvan University Teaching Hospital', name_ne: 'त्रिभुवन विश्वविद्यालय शिक्षण अस्पताल', type: 'Hospital', district: 'Kathmandu', lat: 27.7362, lng: 85.3290, phone: '01-4412303' },
    { name: 'Bir Hospital', name_ne: 'वीर अस्पताल', type: 'Hospital', district: 'Kathmandu', lat: 27.7050, lng: 85.3145, phone: '01-4221119' },
    { name: 'Patan Hospital', name_ne: 'पाटन अस्पताल', type: 'Hospital', district: 'Lalitpur', lat: 27.6681, lng: 85.3206, phone: '01-5522295' },
    { name: 'Bharatpur Hospital', name_ne: 'भरतपुर अस्पताल', type: 'Hospital', district: 'Chitwan', lat: 27.6833, lng: 84.4333, phone: '056-527012' },
    { name: 'B.P. Koirala Institute', name_ne: 'बि.पी. कोइराला स्वास्थ्य विज्ञान प्रतिष्ठान', type: 'Hospital', district: 'Sunsari', lat: 26.8120, lng: 87.2830, phone: '025-525555' },
    { name: 'Western Regional Hospital', name_ne: 'पश्चिमाञ्चल क्षेत्रीय अस्पताल', type: 'Hospital', district: 'Kaski', lat: 28.2096, lng: 83.9856, phone: '061-520066' },
    { name: 'Kanti Childrens Hospital', name_ne: 'कान्ती बाल अस्पताल', type: 'Hospital', district: 'Kathmandu', lat: 27.7150, lng: 85.3295, phone: '01-4411550' },
    { name: 'Dhulikhel Hospital', name_ne: 'धुलिखेल अस्पताल', type: 'Hospital', district: 'Kavrepalanchok', lat: 27.6200, lng: 85.5600, phone: '011-490497' },
    { name: 'Lumbini Provincial Hospital', name_ne: 'लुम्बिनी प्रदेश अस्पताल', type: 'Hospital', district: 'Rupandehi', lat: 27.4833, lng: 83.4500, phone: '071-520111' },
    { name: 'Nepalgunj Medical College', name_ne: 'नेपालगंज मेडिकल कलेज', type: 'Hospital', district: 'Banke', lat: 28.0500, lng: 81.6167, phone: '081-525700' }
  ],

  symptomMap: {
    'high_fever,joint_pain,rash': { name: 'Dengue Fever', name_ne: 'डेंगु ज्वरो', probability: 'HIGH', urgency: 'HIGH', advice: 'Visit hospital immediately for blood test (NS1/IgM). Avoid aspirin.' },
    'high_fever,headache,body_ache': { name: 'Typhoid', name_ne: 'टाइफाइड', probability: 'MODERATE', urgency: 'MODERATE', advice: 'Get Widal test done. Stay hydrated and consult a doctor.' },
    'diarrhea,vomiting,dehydration': { name: 'Cholera', name_ne: 'हैजा', probability: 'HIGH', urgency: 'HIGH', advice: 'Use ORS immediately. Seek nearest health post urgently.' },
    'cough,fever,breathing_difficulty': { name: 'Pneumonia', name_ne: 'निमोनिया', probability: 'MODERATE', urgency: 'HIGH', advice: 'Chest X-ray required. Visit hospital urgently if breathing worsens.' },
    'fever,chills,sweating': { name: 'Malaria', name_ne: 'औलो', probability: 'MODERATE', urgency: 'MODERATE', advice: 'Blood smear test needed. Common in Terai districts.' },
    'itchy_eyes,sneezing,runny_nose': { name: 'Allergic Rhinitis', name_ne: 'एलर्जिक राइनाइटिस', probability: 'HIGH', urgency: 'LOW', advice: 'Antihistamine may help. Avoid dust and pollen exposure.' },
    'stomach_pain,nausea,bloating': { name: 'Gastritis', name_ne: 'ग्यास्ट्राइटिस', probability: 'HIGH', urgency: 'LOW', advice: 'Avoid spicy food. Take antacid. Consult if persists over 3 days.' }
  },

  firstAid: {
    'snakebite': { title: 'Snakebite First Aid', title_ne: 'सर्पदंश प्राथमिक उपचार', steps: ['Keep patient calm and still', 'Immobilize the bitten limb', 'Remove jewelry near bite', 'Do NOT cut or suck the wound', 'Rush to nearest hospital with anti-venom'] },
    'burn': { title: 'Burn First Aid', title_ne: 'जलेको प्राथमिक उपचार', steps: ['Cool burn under running water for 20 mins', 'Remove clothing unless stuck to skin', 'Cover loosely with clean cloth', 'Do NOT apply toothpaste or butter', 'Seek medical help for severe burns'] },
    'fracture': { title: 'Fracture First Aid', title_ne: 'हड्डी भाँचिएको प्राथमिक उपचार', steps: ['Do NOT move the injured limb', 'Immobilize with splint', 'Apply ice wrapped in cloth', 'Elevate if possible', 'Transport to hospital carefully'] },
    'drowning': { title: 'Drowning First Aid', title_ne: 'डुबेको प्राथमिक उपचार', steps: ['Call for help immediately', 'Check breathing and pulse', 'Begin CPR if not breathing', 'Place in recovery position', 'Keep warm and rush to hospital'] },
    'heatstroke': { title: 'Heatstroke First Aid', title_ne: 'घाम लागेको प्राथमिक उपचार', steps: ['Move to shade immediately', 'Remove excess clothing', 'Cool with wet cloths or fan', 'Give sips of cool water if conscious', 'Call emergency if unconscious'] }
  }
};
