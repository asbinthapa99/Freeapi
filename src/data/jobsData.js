module.exports = {
  jobCategories: [
    { id: 'IT', name: 'Information Technology', name_ne: 'सूचना प्रविधि' },
    { id: 'CONSTRUCTION', name: 'Construction & Engineering', name_ne: 'निर्माण तथा इन्जिनियरिङ' },
    { id: 'HEALTH', name: 'Healthcare & Medical', name_ne: 'स्वास्थ्य तथा चिकित्सा' },
    { id: 'EDUCATION', name: 'Education & Teaching', name_ne: 'शिक्षा तथा अध्यापन' },
    { id: 'HOSPITALITY', name: 'Hotel & Tourism', name_ne: 'होटल तथा पर्यटन' },
    { id: 'FINANCE', name: 'Banking & Finance', name_ne: 'बैंकिङ तथा वित्त' },
    { id: 'AGRICULTURE', name: 'Agriculture', name_ne: 'कृषि' },
    { id: 'FOREIGN', name: 'Foreign Employment', name_ne: 'वैदेशिक रोजगार' },
    { id: 'DRIVING', name: 'Driving & Transport', name_ne: 'सवारी चालक तथा यातायात' },
    { id: 'SECURITY', name: 'Security Guard', name_ne: 'सुरक्षा गार्ड' }
  ],

  sampleJobs: [
    { id: 'J001', title: 'Senior Node.js Developer', category: 'IT', company: 'F1Soft Intl', location: 'Kathmandu', salary_range: 'NPR 80,000-120,000', type: 'LOCAL', skills: ['nodejs','express','mongodb','javascript'] },
    { id: 'J002', title: 'Staff Nurse', category: 'HEALTH', company: 'Grande Hospital', location: 'Kathmandu', salary_range: 'NPR 35,000-50,000', type: 'LOCAL', skills: ['nursing','patient care','first aid'] },
    { id: 'J003', title: 'Mason/Carpenter', category: 'FOREIGN', company: 'Al Futtaim Group', location: 'Dubai, UAE', salary_range: 'AED 1,500-2,500', type: 'FOREIGN', skills: ['masonry','carpentry','construction'] },
    { id: 'J004', title: 'Hotel Receptionist', category: 'HOSPITALITY', company: 'Hotel Yak & Yeti', location: 'Kathmandu', salary_range: 'NPR 25,000-35,000', type: 'LOCAL', skills: ['english','hospitality','communication'] },
    { id: 'J005', title: 'Security Guard', category: 'FOREIGN', company: 'ISS Malaysia', location: 'Kuala Lumpur, Malaysia', salary_range: 'MYR 1,200-1,800', type: 'FOREIGN', skills: ['security','discipline','basic english'] },
    { id: 'J006', title: 'React Developer', category: 'IT', company: 'Leapfrog Technology', location: 'Kathmandu', salary_range: 'NPR 60,000-100,000', type: 'LOCAL', skills: ['react','javascript','css','typescript'] },
    { id: 'J007', title: 'Primary Teacher', category: 'EDUCATION', company: 'Budhanilkantha School', location: 'Kathmandu', salary_range: 'NPR 30,000-45,000', type: 'LOCAL', skills: ['teaching','english','mathematics'] }
  ],

  skillsDatabase: ['javascript','nodejs','react','python','java','mongodb','postgresql','html','css','typescript','masonry','carpentry','plumbing','welding','cooking','driving','nursing','teaching','english','nepali','accounting','marketing','security','construction','agriculture','tailoring','electrical','mechanical']
};
