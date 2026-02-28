// Dustbin data for Madurai with real area names and coordinates
export const dustbinData = [
    { id: 'DB001', lat: 9.9252, lng: 78.1198, area: 'Meenakshi Amman Temple', status: 'clean', incharge: 'Murugan K', zone: 'Zone 1' },
    { id: 'DB002', lat: 9.9195, lng: 78.1270, area: 'Periyar Bus Stand', status: 'full', incharge: 'Murugan K', zone: 'Zone 1' },
    { id: 'DB003', lat: 9.9310, lng: 78.1155, area: 'Anna Nagar', status: 'clean', incharge: 'Lakshmi S', zone: 'Zone 2' },
    { id: 'DB004', lat: 9.9178, lng: 78.1340, area: 'Mattuthavani Bus Stand', status: 'full', incharge: 'Lakshmi S', zone: 'Zone 2' },
    { id: 'DB005', lat: 9.9350, lng: 78.1080, area: 'K.K. Nagar', status: 'partial', incharge: 'Ravi P', zone: 'Zone 3' },
    { id: 'DB006', lat: 9.9145, lng: 78.1400, area: 'Thirumangalam Road', status: 'clean', incharge: 'Ravi P', zone: 'Zone 3' },
    { id: 'DB007', lat: 9.9280, lng: 78.1050, area: 'Goripalayam', status: 'full', incharge: 'Selvi M', zone: 'Zone 4' },
    { id: 'DB008', lat: 9.9220, lng: 78.1320, area: 'Arapalayam', status: 'clean', incharge: 'Selvi M', zone: 'Zone 4' },
    { id: 'DB009', lat: 9.9400, lng: 78.1200, area: 'Teppakulam', status: 'partial', incharge: 'Kumar R', zone: 'Zone 1' },
    { id: 'DB010', lat: 9.9100, lng: 78.1250, area: 'Tallakulam', status: 'clean', incharge: 'Kumar R', zone: 'Zone 1' },
    { id: 'DB011', lat: 9.9330, lng: 78.1300, area: 'Sellur', status: 'full', incharge: 'Murugan K', zone: 'Zone 1' },
    { id: 'DB012', lat: 9.9160, lng: 78.1100, area: 'Simmakkal', status: 'clean', incharge: 'Lakshmi S', zone: 'Zone 2' },
    { id: 'DB013', lat: 9.9380, lng: 78.1350, area: 'Villapuram', status: 'partial', incharge: 'Ravi P', zone: 'Zone 3' },
    { id: 'DB014', lat: 9.9050, lng: 78.1180, area: 'Palanganatham', status: 'clean', incharge: 'Selvi M', zone: 'Zone 4' },
    { id: 'DB015', lat: 9.9270, lng: 78.1420, area: 'Thirunagar', status: 'full', incharge: 'Kumar R', zone: 'Zone 1' },
    { id: 'DB016', lat: 9.9450, lng: 78.1150, area: 'Ellis Nagar', status: 'clean', incharge: 'Murugan K', zone: 'Zone 1' },
    { id: 'DB017', lat: 9.9120, lng: 78.1050, area: 'Chokkikulam', status: 'partial', incharge: 'Lakshmi S', zone: 'Zone 2' },
    { id: 'DB018', lat: 9.9200, lng: 78.1480, area: 'Bibikulam', status: 'clean', incharge: 'Ravi P', zone: 'Zone 3' },
    { id: 'DB019', lat: 9.9500, lng: 78.1250, area: 'Avaniyapuram', status: 'full', incharge: 'Selvi M', zone: 'Zone 4' },
    { id: 'DB020', lat: 9.9080, lng: 78.1350, area: 'Madurai Junction', status: 'clean', incharge: 'Kumar R', zone: 'Zone 1' },
];

export const complaintsData = [
    { id: 'C001', dustbinId: 'DB002', area: 'Periyar Bus Stand', status: 'pending', reportedAt: '2026-02-27 09:30', description: 'Dustbin overflowing, waste scattered around', reporter: 'Ramesh S', reporterPhone: '9841234567', assignedWorkerId: 'W002', assignedWorker: 'Priya Devi', assignedWorkerPhone: '9876543211' },
    { id: 'C002', dustbinId: 'DB004', area: 'Mattuthavani Bus Stand', status: 'pending', reportedAt: '2026-02-27 08:15', description: 'Foul smell from the dustbin area', reporter: 'Lakshmi K', reporterPhone: '9841234568', assignedWorkerId: 'W004', assignedWorker: 'Kavitha R', assignedWorkerPhone: '9876543213' },
    { id: 'C003', dustbinId: 'DB007', area: 'Goripalayam', status: 'in-progress', reportedAt: '2026-02-27 07:45', description: 'Dustbin not cleaned for 2 days', reporter: 'Suresh M', reporterPhone: '9841234569', assignedWorkerId: 'W006', assignedWorker: 'Malathi S', assignedWorkerPhone: '9876543215' },
    { id: 'C004', dustbinId: 'DB011', area: 'Sellur', status: 'pending', reportedAt: '2026-02-27 10:00', description: 'Waste overflowing onto the road', reporter: 'Vijay R', reporterPhone: '9841234570', assignedWorkerId: 'W007', assignedWorker: 'Rajesh V', assignedWorkerPhone: '9876543216' },
    { id: 'C005', dustbinId: 'DB015', area: 'Thirunagar', status: 'in-progress', reportedAt: '2026-02-26 16:30', description: 'Animals scavenging near overflowing bin', reporter: 'Meena V', reporterPhone: '9841234571', assignedWorkerId: 'W008', assignedWorker: 'Vijaya L', assignedWorkerPhone: '9876543217' },
    { id: 'C006', dustbinId: 'DB019', area: 'Avaniyapuram', status: 'resolved', reportedAt: '2026-02-26 14:00', description: 'Bin was full, now cleaned', reporter: 'Karthik P', reporterPhone: '9841234572', assignedWorkerId: 'W006', assignedWorker: 'Malathi S', assignedWorkerPhone: '9876543215' },
    { id: 'C007', dustbinId: 'DB009', area: 'Teppakulam', status: 'resolved', reportedAt: '2026-02-26 11:00', description: 'Partial waste cleared', reporter: 'Anitha D', reporterPhone: '9841234573', assignedWorkerId: 'W001', assignedWorker: 'Arun Kumar', assignedWorkerPhone: '9876543210' },
    { id: 'C008', dustbinId: 'DB005', area: 'K.K. Nagar', status: 'resolved', reportedAt: '2026-02-25 15:30', description: 'Bin replaced and cleaned', reporter: 'Gopal N', reporterPhone: '9841234574', assignedWorkerId: 'W005', assignedWorker: 'Dinesh P', assignedWorkerPhone: '9876543214' },
];

export const workersData = [
    { id: 'W001', name: 'Arun Kumar', area: 'Meenakshi Amman Temple', zone: 'Zone 1', phone: '9876543210', status: 'active', lastPhoto: '2026-02-27 08:30', photoUploaded: true, lat: 9.9252, lng: 78.1198 },
    { id: 'W002', name: 'Priya Devi', area: 'Periyar Bus Stand', zone: 'Zone 1', phone: '9876543211', status: 'active', lastPhoto: '2026-02-27 07:45', photoUploaded: true, lat: 9.9195, lng: 78.1270 },
    { id: 'W003', name: 'Senthil M', area: 'Anna Nagar', zone: 'Zone 2', phone: '9876543212', status: 'active', lastPhoto: null, photoUploaded: false, lat: 9.9310, lng: 78.1155 },
    { id: 'W004', name: 'Kavitha R', area: 'Mattuthavani', zone: 'Zone 2', phone: '9876543213', status: 'inactive', lastPhoto: '2026-02-26 17:00', photoUploaded: false, lat: 9.9178, lng: 78.1340 },
    { id: 'W005', name: 'Dinesh P', area: 'K.K. Nagar', zone: 'Zone 3', phone: '9876543214', status: 'active', lastPhoto: '2026-02-27 09:15', photoUploaded: true, lat: 9.9350, lng: 78.1080 },
    { id: 'W006', name: 'Malathi S', area: 'Goripalayam', zone: 'Zone 4', phone: '9876543215', status: 'active', lastPhoto: '2026-02-27 08:00', photoUploaded: true, lat: 9.9280, lng: 78.1050 },
    { id: 'W007', name: 'Rajesh V', area: 'Sellur', zone: 'Zone 1', phone: '9876543216', status: 'active', lastPhoto: null, photoUploaded: false, lat: 9.9330, lng: 78.1300 },
    { id: 'W008', name: 'Vijaya L', area: 'Thirunagar', zone: 'Zone 1', phone: '9876543217', status: 'inactive', lastPhoto: '2026-02-26 16:45', photoUploaded: false, lat: 9.9270, lng: 78.1420 },
];

export const inchargeData = [
    { id: 'I001', name: 'Murugan K', area: 'Zone 1 - Temple Area', phone: '9876500001', totalBins: 5, pending: 2, resolved: 12, areas: ['Meenakshi Amman Temple', 'Periyar Bus Stand', 'Teppakulam', 'Sellur', 'Ellis Nagar'] },
    { id: 'I002', name: 'Lakshmi S', area: 'Zone 2 - Anna Nagar Area', phone: '9876500002', totalBins: 4, pending: 1, resolved: 8, areas: ['Anna Nagar', 'Mattuthavani', 'Simmakkal', 'Chokkikulam'] },
    { id: 'I003', name: 'Ravi P', area: 'Zone 3 - KK Nagar Area', phone: '9876500003', totalBins: 4, pending: 1, resolved: 15, areas: ['K.K. Nagar', 'Thirumangalam Road', 'Villapuram', 'Bibikulam'] },
    { id: 'I004', name: 'Selvi M', area: 'Zone 4 - South Madurai', phone: '9876500004', totalBins: 4, pending: 2, resolved: 10, areas: ['Goripalayam', 'Arapalayam', 'Palanganatham', 'Avaniyapuram'] },
    { id: 'I005', name: 'Kumar R', area: 'Zone 1 - East Region', phone: '9876500005', totalBins: 3, pending: 1, resolved: 9, areas: ['Tallakulam', 'Thirunagar', 'Madurai Junction'] },
];

// Garbage vehicles with assigned routes
export const vehiclesData = [
    {
        id: 'GV001', number: 'TN-58-AB-1234', type: 'Compactor Truck',
        driver: 'Arun Kumar', driverPhone: '9876543210',
        zone: 'Zone 1', status: 'on-route', capacity: '8 Tons',
        fuelLevel: 72, lastService: '2026-02-20',
        currentLat: 9.9280, currentLng: 78.1220,
        color: '#3b82f6',
        route: [
            { dustbinId: 'DB001', area: 'Meenakshi Amman Temple', lat: 9.9252, lng: 78.1198, order: 1, collected: true },
            { dustbinId: 'DB002', area: 'Periyar Bus Stand', lat: 9.9195, lng: 78.1270, order: 2, collected: true },
            { dustbinId: 'DB009', area: 'Teppakulam', lat: 9.9400, lng: 78.1200, order: 3, collected: false },
            { dustbinId: 'DB011', area: 'Sellur', lat: 9.9330, lng: 78.1300, order: 4, collected: false },
            { dustbinId: 'DB016', area: 'Ellis Nagar', lat: 9.9450, lng: 78.1150, order: 5, collected: false },
        ],
    },
    {
        id: 'GV002', number: 'TN-58-CD-5678', type: 'Mini Loader',
        driver: 'Priya Devi', driverPhone: '9876543211',
        zone: 'Zone 2', status: 'on-route', capacity: '4 Tons',
        fuelLevel: 55, lastService: '2026-02-18',
        currentLat: 9.9240, currentLng: 78.1130,
        color: '#f59e0b',
        route: [
            { dustbinId: 'DB003', area: 'Anna Nagar', lat: 9.9310, lng: 78.1155, order: 1, collected: true },
            { dustbinId: 'DB004', area: 'Mattuthavani Bus Stand', lat: 9.9178, lng: 78.1340, order: 2, collected: false },
            { dustbinId: 'DB012', area: 'Simmakkal', lat: 9.9160, lng: 78.1100, order: 3, collected: false },
            { dustbinId: 'DB017', area: 'Chokkikulam', lat: 9.9120, lng: 78.1050, order: 4, collected: false },
        ],
    },
    {
        id: 'GV003', number: 'TN-58-EF-9012', type: 'Compactor Truck',
        driver: 'Dinesh P', driverPhone: '9876543214',
        zone: 'Zone 3', status: 'on-route', capacity: '8 Tons',
        fuelLevel: 88, lastService: '2026-02-22',
        currentLat: 9.9360, currentLng: 78.1100,
        color: '#10b981',
        route: [
            { dustbinId: 'DB005', area: 'K.K. Nagar', lat: 9.9350, lng: 78.1080, order: 1, collected: true },
            { dustbinId: 'DB006', area: 'Thirumangalam Road', lat: 9.9145, lng: 78.1400, order: 2, collected: false },
            { dustbinId: 'DB013', area: 'Villapuram', lat: 9.9380, lng: 78.1350, order: 3, collected: false },
            { dustbinId: 'DB018', area: 'Bibikulam', lat: 9.9200, lng: 78.1480, order: 4, collected: false },
        ],
    },
    {
        id: 'GV004', number: 'TN-58-GH-3456', type: 'Tipper Truck',
        driver: 'Malathi S', driverPhone: '9876543215',
        zone: 'Zone 4', status: 'parked', capacity: '6 Tons',
        fuelLevel: 30, lastService: '2026-02-15',
        currentLat: 9.9280, currentLng: 78.1050,
        color: '#ef4444',
        route: [
            { dustbinId: 'DB007', area: 'Goripalayam', lat: 9.9280, lng: 78.1050, order: 1, collected: false },
            { dustbinId: 'DB008', area: 'Arapalayam', lat: 9.9220, lng: 78.1320, order: 2, collected: false },
            { dustbinId: 'DB014', area: 'Palanganatham', lat: 9.9050, lng: 78.1180, order: 3, collected: false },
            { dustbinId: 'DB019', area: 'Avaniyapuram', lat: 9.9500, lng: 78.1250, order: 4, collected: false },
        ],
    },
    {
        id: 'GV005', number: 'TN-58-IJ-7890', type: 'Mini Loader',
        driver: 'Rajesh V', driverPhone: '9876543216',
        zone: 'Zone 1', status: 'maintenance', capacity: '4 Tons',
        fuelLevel: 10, lastService: '2026-02-10',
        currentLat: 9.9100, currentLng: 78.1300,
        color: '#8b5cf6',
        route: [
            { dustbinId: 'DB010', area: 'Tallakulam', lat: 9.9100, lng: 78.1250, order: 1, collected: false },
            { dustbinId: 'DB015', area: 'Thirunagar', lat: 9.9270, lng: 78.1420, order: 2, collected: false },
            { dustbinId: 'DB020', area: 'Madurai Junction', lat: 9.9080, lng: 78.1350, order: 3, collected: false },
        ],
    },
];

// Recycle chatbot responses
export const recycleResponses = {
    greetings: [
        "Hello! 🌿 I'm your eco-friendly recycling assistant. How can I help you today?",
        "Hi there! ♻️ Ready to talk about recycling and waste management. What would you like to know?",
    ],
    plastic: [
        "♻️ **Plastic Recycling Tips:**\n\n• Rinse containers before recycling\n• Check for recycling numbers (1-7) on the bottom\n• Remove caps and labels when possible\n• Avoid recycling plastic bags in regular bins - take them to collection points\n• Reuse plastic containers for storage\n• Consider switching to reusable bags and bottles!",
    ],
    paper: [
        "📄 **Paper & Cardboard Recycling:**\n\n• Flatten cardboard boxes to save space\n• Remove tape and staples when possible\n• Don't recycle wax-coated or food-stained paper\n• Shredded paper can be composted\n• Old newspapers make great packing material\n• One ton of recycled paper saves 17 trees! 🌳",
    ],
    ewaste: [
        "🔋 **E-Waste Recycling:**\n\n• Never throw electronics in regular dustbins\n• Drop old phones, laptops at e-waste collection centers\n• Batteries should be disposed at designated points\n• Many brands offer take-back programs\n• Data should be wiped before disposal\n• In Madurai, check with the corporation for e-waste drives!",
    ],
    composting: [
        "🌱 **Composting at Home:**\n\n• Use kitchen scraps: vegetable peels, fruit waste, tea leaves\n• Avoid meat, dairy, and oily foods\n• Mix green (wet) and brown (dry) materials\n• Turn the pile regularly for aeration\n• Compost is ready in 2-3 months\n• Great for terrace gardens and plants! 🪴",
    ],
    segregation: [
        "🗑️ **Waste Segregation Guide:**\n\n• **Green Bin**: Wet waste - food scraps, garden waste\n• **Blue Bin**: Dry waste - paper, plastic, metal, glass\n• **Red Bin**: Hazardous waste - batteries, medicines, chemicals\n• Segregation at source makes recycling 80% more effective!\n• Madurai Corporation collects segregated waste daily 🏙️",
    ],
    ideas: [
        "💡 **Creative Recycling Ideas:**\n\n• Turn old t-shirts into reusable bags\n• Use glass jars as storage containers\n• Make bird feeders from plastic bottles\n• Create planters from old tires\n• Use newspaper for gift wrapping\n• Donate old clothes to NGOs instead of discarding\n• Make coasters from old CDs! 🎨",
    ],
    default: [
        "I can help you with recycling tips! Try asking about:\n\n🔹 Plastic recycling\n🔹 Paper recycling\n🔹 E-waste disposal\n🔹 Composting at home\n🔹 Waste segregation\n🔹 Creative recycling ideas\n\nWhat interests you? 🌿",
    ]
};

export function getChatResponse(message) {
    const lower = message.toLowerCase();
    if (lower.match(/hi|hello|hey|vanakkam|வணக்கம்/)) {
        return recycleResponses.greetings[Math.floor(Math.random() * recycleResponses.greetings.length)];
    }
    if (lower.match(/plastic|bottle|bag|பிளாஸ்டிக்/)) {
        return recycleResponses.plastic[0];
    }
    if (lower.match(/paper|cardboard|newspaper|காகிதம்/)) {
        return recycleResponses.paper[0];
    }
    if (lower.match(/e-waste|ewaste|electronic|battery|phone|laptop|மின்னணு/)) {
        return recycleResponses.ewaste[0];
    }
    if (lower.match(/compost|organic|kitchen|உரம்/)) {
        return recycleResponses.composting[0];
    }
    if (lower.match(/segregat|separate|sort|பிரித்தல்/)) {
        return recycleResponses.segregation[0];
    }
    if (lower.match(/idea|creative|diy|reuse|craft|யோசனை/)) {
        return recycleResponses.ideas[0];
    }
    return recycleResponses.default[0];
}
