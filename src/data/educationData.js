module.exports = {
  subjects: {
    SEE: ['Mathematics','Science','English','Nepali','Social Studies','Computer Science','Health & Environment','Optional Mathematics'],
    PLUS_TWO: ['Physics','Chemistry','Biology','Mathematics','English','Nepali','Computer Science','Economics','Accountancy']
  },

  pastPapers: [
    { subject: 'Mathematics', grade: 'SEE', year: 2080, questions: 22, full_marks: 100 },
    { subject: 'Mathematics', grade: 'SEE', year: 2079, questions: 22, full_marks: 100 },
    { subject: 'Science', grade: 'SEE', year: 2080, questions: 24, full_marks: 100 },
    { subject: 'Science', grade: 'SEE', year: 2079, questions: 24, full_marks: 100 },
    { subject: 'English', grade: 'SEE', year: 2080, questions: 20, full_marks: 100 },
    { subject: 'Physics', grade: 'PLUS_TWO', year: 2080, questions: 16, full_marks: 100 },
    { subject: 'Chemistry', grade: 'PLUS_TWO', year: 2080, questions: 16, full_marks: 100 }
  ],

  qaBank: {
    'newton': { answer: "Newton's Third Law: Every action has an equal and opposite reaction. Example: When you push water backward while swimming in the Fewa Lake, the water pushes you forward.", topics: ['Physics','Force','Motion'], grade: 'SEE' },
    'photosynthesis': { answer: "Photosynthesis is the process by which green plants convert sunlight, water (H₂O), and carbon dioxide (CO₂) into glucose (C₆H₁₂O₆) and oxygen. The equation: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. In Nepal, rice paddies in Terai are a great example of plants performing photosynthesis at scale.", topics: ['Biology','Plants','Energy'], grade: 'SEE' },
    'nepal history': { answer: "Prithvi Narayan Shah, king of Gorkha, unified the scattered kingdoms of Nepal in 1768 BS. He conquered the Kathmandu Valley by defeating the Malla kings of Kantipur, Lalitpur, and Bhaktapur. His strategies included blockading trade routes and diplomacy.", topics: ['History','Unification','Social Studies'], grade: 'SEE' },
    'pythagor': { answer: "Pythagoras Theorem: In a right triangle, the square of the hypotenuse (h) equals the sum of the squares of the other two sides: h² = p² + b². Example: If p=3cm, b=4cm, then h = √(9+16) = √25 = 5cm.", topics: ['Mathematics','Geometry','Triangle'], grade: 'SEE' },
    'acid': { answer: "Acids turn blue litmus red, have pH < 7, and taste sour. Common acids: HCl (Hydrochloric), H₂SO₄ (Sulphuric), CH₃COOH (Acetic/Vinegar). Bases turn red litmus blue and have pH > 7. NaOH (Sodium Hydroxide) is a common base.", topics: ['Chemistry','Acid-Base','pH'], grade: 'SEE' },
    'gravity': { answer: "Gravity is the force that attracts objects toward the center of the Earth. Acceleration due to gravity (g) = 9.8 m/s² on Earth's surface. Weight = mass × g. In Nepal, g varies slightly due to altitude — it is slightly less at the top of Mt. Everest.", topics: ['Physics','Gravity','Force'], grade: 'SEE' },
    'cell': { answer: "A cell is the basic structural and functional unit of all living organisms. Plant cells have a cell wall, chloroplast, and large vacuole. Animal cells lack a cell wall. Robert Hooke first discovered cells in 1665.", topics: ['Biology','Cell Biology'], grade: 'SEE' },
    'ohm': { answer: "Ohm's Law: V = I × R, where V is voltage (Volts), I is current (Amperes), R is resistance (Ohms). If a bulb has 5Ω resistance and 2A current flows, the voltage is V = 2 × 5 = 10V.", topics: ['Physics','Electricity','Current'], grade: 'SEE' },
    'earthquake': { answer: "Earthquakes are caused by the sudden release of energy along fault lines in the Earth's crust. Nepal lies on the boundary of the Indian and Eurasian tectonic plates, making it highly earthquake-prone. The 2015 Gorkha earthquake (7.8 magnitude) killed nearly 9,000 people.", topics: ['Science','Geography','Disaster'], grade: 'SEE' },
    'constitution': { answer: "Nepal's Constitution was promulgated on September 20, 2015 (Asoj 3, 2072 BS). It declares Nepal a federal democratic republic with 7 provinces. It guarantees fundamental rights including right to equality, freedom, and social justice.", topics: ['Social Studies','Civics','Government'], grade: 'SEE' }
  }
};
