const mongoose = require('mongoose');

// Use your local connection string
const mongoURI = 'mongodb://127.0.0.1:27017/busTracker';

const stopSchema = new mongoose.Schema({
    name: String,
    lat: Number,
    lng: Number
});
const BusStop = mongoose.model('BusStop', stopSchema);

const initialStops = [
    { name: "KIIT Square", lat: 20.3548, lng: 85.8193 },
    { name: "Patia Square", lat: 20.3540, lng: 85.8160 },
    { name: "Jayadev Vihar", lat: 20.2990, lng: 85.8180 },
    { name: "Acharya Vihar", lat: 20.2940, lng: 85.8240 },
    { name: "Vani Vihar", lat: 20.2940, lng: 85.8330 },
    { name: "Khandagiri Bus Stop", lat: 20.2600, lng: 85.7850 }
];

async function seed() {
    try {
        await mongoose.connect(mongoURI);
        await BusStop.deleteMany({}); 
        await BusStop.insertMany(initialStops);
        console.log("✅ Database seeded successfully!");
        process.exit();
    } catch (err) {
        console.error("❌ Seed error:", err);
        process.exit(1);
    }
}

seed();