const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors'); // <-- NEW: Imported CORS
const mongoose = require('mongoose'); // <-- NEW: Imported Mongoose

const app = express();
const server = http.createServer(app);

// <-- UPDATED: Configured Socket.io to allow cross-origin requests
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// <-- NEW: Enabled CORS for Express API routes
app.use(cors());

// Middleware to serve your HTML files from the 'public' folder
// app.use(express.static(path.join(__dirname, 'public'))); // <-- UPDATED: Commented out since frontend is separate
app.use(express.json());

const fs = require('fs');

// ==========================================
// DATABASE CONNECTION
// ==========================================
mongoose.connect('mongodb://127.0.0.1:27017/busTracker')
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        try {
            const stopSchema = new mongoose.Schema({
                name: String,
                lat: Number,
                lng: Number
            });
            // Overwrite model if it exists to avoid OverwriteModelError during hot reloads
            const BusStop = mongoose.models.BusStop || mongoose.model('BusStop', stopSchema);
            
            const count = await BusStop.countDocuments();
            if (count === 0) {
                console.log("🌱 Database is empty. Seeding highly accurate bus stops from routes.json...");
                const routesPath = path.join(__dirname, '../frontend/routes.json');
                if (fs.existsSync(routesPath)) {
                    const routesData = JSON.parse(fs.readFileSync(routesPath, 'utf8'));
                    let allStops = [];
                    routesData.forEach(routeObj => {
                        allStops = allStops.concat(routeObj.stops);
                    });
                    
                    await BusStop.insertMany(allStops);
                    console.log(`✅ Successfully seeded ${allStops.length} bus stops into MongoDB.`);
                } else {
                    console.error("❌ routes.json not found in frontend folder. Cannot seed database.");
                }
            }
        } catch (seedErr) {
            console.error("❌ Error during database seeding:", seedErr);
        }
    })
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

const stopSchema = new mongoose.Schema({
    name: String,
    lat: Number,
    lng: Number
});
const BusStop = mongoose.models.BusStop || mongoose.model('BusStop', stopSchema);

// ==========================================
// SECURITY & AUTHENTICATION
// ==========================================
const DRIVER_PIN = "5555"; 
const SECRET_TOKEN = "verified-driver-token-2026";

app.post('/api/login', (req, res) => {
    if (req.body.pin === DRIVER_PIN) {
        res.json({ success: true, token: SECRET_TOKEN });
    } else {
        res.json({ success: false });
    }
});

// ==========================================
// REST API ENDPOINTS
// ==========================================

app.get('/api/stops', async (req, res) => {
    try {
        const stops = await BusStop.find({});
        res.json(stops);
    } catch (err) {
        console.error("Error fetching stops:", err);
        res.status(500).json({ error: "Failed to fetch stops" });
    }
});

// ==========================================
// SOCKET.IO LOGIC
// ==========================================

const studentPickups = {};
const latestBusLocations = {};

// --- NEW: Track Crowd Counts at each stop ---
const stopCrowdCounts = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // 1. Listen for when a student drops a pickup pin
    socket.on('set-pickup', (data) => {
        console.log(`Student ${data.studentId} wants pickup at: ${data.stopName}`);
        
        // Save request in memory
        studentPickups[socket.id] = data;

        // Routing Allocation Logic
        let assignedRoute = "Route B (Khandagiri/South)";
        if (data.lat > 20.28) {
            assignedRoute = "Route A (Patia/North)";
        }

        // --- NEW: Increment Crowd Count for specific stop ---
        const stopName = data.stopName || "Unknown Stop";
        stopCrowdCounts[stopName] = (stopCrowdCounts[stopName] || 0) + 1;

        // Send allocation AND crowd density back to student
        socket.emit('bus-allocated', {
            routeId: assignedRoute,
            message: `Bus Allocated: Assigned to ${assignedRoute}.`,
            crowdCount: stopCrowdCounts[stopName] // Send the density
        });

        if (latestBusLocations[assignedRoute]) {
            socket.emit('receive-location', latestBusLocations[assignedRoute]);
        }
        
        // Broadcast new crowd info to everyone so the "meter" stays live
        io.emit('crowd-update', { stopName: stopName, count: stopCrowdCounts[stopName] });
    });

    // 2. When a driver sends their location
    socket.on('send-location', (data) => {
        if (data.token !== SECRET_TOKEN) {
            console.log(`🚨 Security Alert: Unauthorized ping from ${socket.id}`);
            return; 
        }

        latestBusLocations[data.routeId] = data;
        io.emit('receive-location', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // --- NEW: Decrement Crowd Count when student leaves ---
        const pickup = studentPickups[socket.id];
        if (pickup && pickup.stopName && stopCrowdCounts[pickup.stopName] > 0) {
            stopCrowdCounts[pickup.stopName]--;
            io.emit('crowd-update', { 
                stopName: pickup.stopName, 
                count: stopCrowdCounts[pickup.stopName] 
            });
        }
        
        delete studentPickups[socket.id];
    });
});

const PORT = process.env.PORT || 3000; 
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});