const fs = require('fs');

const routesData = JSON.parse(fs.readFileSync('routes.json', 'utf8'));
const allStops = routesData.flatMap(r => r.stops).map((s, i) => ({
    id: 's' + i,
    name: s.name,
    lat: s.lat,
    lng: s.lng
}));

const fallbackStandsJson = JSON.stringify(allStops, null, 4);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Campus Bus Tracker - Student</title>
    
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet-control-geocoder@2.4.0/dist/Control.Geocoder.css" />
    
        <style>
        :root {
            /* Premium Slate & Indigo Theme */
            --primary: #4f46e5;
            --primary-hover: #4338ca;
            --primary-light: rgba(79, 70, 229, 0.15);
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --bg-dark: #0f172a;
            --glass-bg: rgba(15, 23, 42, 0.65);
            --glass-border: rgba(255, 255, 255, 0.08);
            --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            --text-main: #e2e8f0;
            --text-muted: #94a3b8;
            --text-bright: #ffffff;
            --card-bg: rgba(30, 41, 59, 0.5);
            --border-dim: rgba(255, 255, 255, 0.05);
            --border-med: rgba(255, 255, 255, 0.1);
        }
        
        [data-theme="light"] {
            --bg-dark: #f8fafc;
            --glass-bg: rgba(255, 255, 255, 0.85);
            --glass-border: rgba(0, 0, 0, 0.06);
            --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
            --text-main: #334155;
            --text-muted: #64748b;
            --text-bright: #0f172a;
            --card-bg: rgba(255, 255, 255, 0.9);
            --border-dim: rgba(0, 0, 0, 0.05);
            --border-med: rgba(0, 0, 0, 0.1);
        }

        body { 
            margin: 0; padding: 0; font-family: 'Inter', sans-serif; 
            background-color: var(--bg-dark); overflow: hidden; 
            color: var(--text-main); transition: background-color 0.4s ease;
        }

        /* --- GLOBAL UTILITIES --- */
        .glass-panel {
            background: var(--glass-bg); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
            border: 1px solid var(--glass-border); box-shadow: var(--glass-shadow);
        }
        
        .modern-card {
            background: var(--card-bg); border: 1px solid var(--border-dim);
            border-radius: 20px; padding: 24px; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .modern-card:hover {
            transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.12);
            border-color: var(--border-med); background: var(--glass-bg);
        }

        .premium-btn {
            background: var(--primary); color: #ffffff; border: none; padding: 12px 24px;
            border-radius: 12px; font-weight: 600; font-size: 0.95rem; cursor: pointer;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 4px 14px var(--primary-light);
        }
        
        .premium-btn:hover {
            background: var(--primary-hover); transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3);
        }
        
        .premium-btn:active { transform: scale(0.97); }

        .fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        /* --- NAVIGATION --- */
        #top-nav {
            position: absolute; top: 24px; left: 50%; transform: translateX(-50%); width: max-content;
            height: 64px; border-radius: 32px; display: flex; align-items: center; justify-content: space-between;
            padding: 0 12px 0 24px; z-index: 2000; gap: 32px;
        }

        .nav-brand { display: flex; align-items: center; gap: 12px; font-size: 1.1rem; font-weight: 800; color: var(--text-bright); letter-spacing: -0.3px; }
        .nav-brand-icon { background: linear-gradient(135deg, var(--primary), #8b5cf6); width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; box-shadow: 0 4px 15px var(--primary-light); }

        .nav-links { display: flex; gap: 4px; }
        .nav-link { padding: 10px 18px; border-radius: 20px; cursor: pointer; font-size: 0.9rem; font-weight: 600; color: var(--text-muted); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: flex; align-items: center; gap: 8px; }
        .nav-link:hover { color: var(--text-bright); }
        .nav-link.active { color: var(--primary); background: var(--primary-light); }

        .theme-toggle { background: var(--card-bg); border: 1px solid var(--border-dim); color: var(--text-bright); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.2rem; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .theme-toggle:hover { transform: rotate(15deg) scale(1.05); background: var(--border-med); }

        /* --- SPA VIEW MANAGEMENT --- */
        .spa-view { display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100vh; overflow-y: auto; background: var(--bg-dark); box-sizing: border-box; }
        .spa-view.active { display: block; animation: softFade 0.4s ease-out forwards; }
        @keyframes softFade { from { opacity: 0; } to { opacity: 1; } }

        .spa-view::-webkit-scrollbar { width: 8px; }
        .spa-view::-webkit-scrollbar-track { background: transparent; }
        .spa-view::-webkit-scrollbar-thumb { background: var(--border-med); border-radius: 10px; }
        .spa-view::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

        #view-live-tracking { overflow: hidden; }
        #map { height: 100%; width: 100%; z-index: 1; background: #11141a; }


        /* Light mode overrides */
        html[data-theme="light"] #map { background: #e5e3df; }
        html[data-theme="light"] .leaflet-tile-pane { filter: none; }

        /* --- SEARCH & OVERLAYS --- */
        #search-panel { position: absolute; top: 110px; left: 30px; z-index: 1000; padding: 24px; border-radius: 24px; width: 360px; box-sizing: border-box; color: var(--text-main); animation: slideRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        #active-buses-sidebar { position: absolute; top: 110px; right: 30px; z-index: 1000; padding: 24px; border-radius: 24px; width: 380px; max-height: calc(100vh - 140px); overflow-y: auto; box-sizing: border-box; color: var(--text-main); animation: slideLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes slideRight { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideLeft { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }

        .search-container { position: relative; margin-bottom: 16px; }
        .search-container svg { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; fill: none; stroke: var(--text-muted); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; z-index: 2; }
        input { width: 100%; padding: 16px 16px 16px 44px; border: 1px solid var(--border-med); border-radius: 16px; font-size: 14px; font-family: 'Inter', sans-serif; box-sizing: border-box; background: var(--card-bg); color: var(--text-bright); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); }
        input:focus { outline: none; border-color: var(--primary); background: var(--bg-dark); box-shadow: 0 0 0 4px var(--primary-light); }

        #suggestions-list { position: absolute; width: 100%; background: var(--bg-dark); border-radius: 16px; box-shadow: 0 15px 40px rgba(0,0,0,0.4); max-height: 240px; overflow-y: auto; z-index: 1001; display: none; border: 1px solid var(--glass-border); top: 100%; margin-top: 8px; }
        .suggestion-item { padding: 14px 18px; cursor: pointer; font-size: 13px; border-bottom: 1px solid var(--border-dim); text-align: left; color: var(--text-main); transition: all 0.2s; display: flex; align-items: center; gap: 12px; }
        .suggestion-item:last-child { border-bottom: none; }
        .suggestion-item:hover { background: var(--border-med); color: var(--text-bright); padding-left: 22px; }

        .sidebar-header { font-size: 1.15rem; font-weight: 800; color: var(--text-bright); margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-dim); display: flex; justify-content: space-between; align-items: center; letter-spacing: -0.5px; }

        /* --- BUS CARDS --- */
        .bus-card { background: var(--card-bg); border: 1px solid var(--border-dim); border-radius: 16px; padding: 20px; margin-bottom: 16px; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .bus-card:hover { transform: translateY(-4px); border-color: var(--border-med); box-shadow: 0 8px 24px rgba(0,0,0,0.15); background: var(--glass-bg); }
        .bus-route-tag { display: inline-flex; align-items: center; gap: 6px; background: var(--primary-light); color: var(--primary); padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 700; }
        .bus-eta { font-weight: 800; color: var(--primary); font-size: 1rem; }
        .card-btn { flex: 1; padding: 10px; border-radius: 10px; border: none; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: 0.2s; }

        /* Dashboard specific */
        .stat-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; }
        .quick-nav-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; margin-bottom: 20px; }

        /* Map UI */
        .leaflet-routing-container { display: none !important; }
        .bus-icon { font-size: 26px; text-align: center; line-height: 40px; width: 40px !important; height: 40px !important; border-radius: 50%; background-color: var(--primary); color: white; border: 2px solid #fff; box-shadow: 0 0 15px rgba(79, 70, 229, 0.8); margin-left: -20px !important; margin-top: -20px !important; }
        .user-icon { font-size: 20px; text-align: center; line-height: 30px; width: 30px !important; height: 30px !important; border-radius: 50%; background-color: var(--danger); color: white; border: 2px solid #fff; box-shadow: 0 0 10px rgba(239, 68, 68, 0.6); margin-left: -15px !important; margin-top: -15px !important; }
        .stop-icon { font-size: 20px; text-align: center; line-height: 30px; width: 30px !important; height: 30px !important; border-radius: 50%; background-color: var(--success); color: white; border: 2px solid #fff; box-shadow: 0 0 10px rgba(16, 185, 129, 0.6); margin-left: -15px !important; margin-top: -15px !important; }
        .college-icon { font-size: 24px; text-align: center; line-height: 40px; width: 40px !important; height: 40px !important; border-radius: 10px; background-color: #8b5cf6; color: white; border: 2px solid #fff; box-shadow: 0 0 15px rgba(139, 92, 246, 0.6); margin-left: -20px !important; margin-top: -20px !important; }
        
        .map-hint { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 1000; padding: 12px 24px; border-radius: 30px; font-size: 13px; font-weight: 600; color: var(--text-bright); border: 1px solid var(--glass-border); box-shadow: var(--glass-shadow); pointer-events: none; animation: bounceHint 2s infinite; }
        @keyframes bounceHint { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -5px); } }
    </style>
</head>
<body>
    <nav id="top-nav" class="glass-panel">
        <div class="nav-brand">
            <div class="nav-brand-icon">🚌</div>
            <span>Campus Tracker</span>
        </div>
        <div class="nav-links">
            <div class="nav-link active" onclick="switchView('view-home')" id="nav-home">🏠 Home</div>
            <div class="nav-link" onclick="switchView('view-live-tracking')" id="nav-live-tracking">📍 Map</div>
            <div class="nav-link" onclick="switchView('view-routes')" id="nav-routes">🛣️ Routes</div>
            <div class="nav-link" onclick="switchView('view-nearby')" id="nav-nearby">🗺️ Nearby</div>
            <div class="nav-link" onclick="switchView('view-arrivals')" id="nav-arrivals">⏱️ Arrivals</div>
        </div>
        <div style="display: flex; gap: 12px; align-items: center;">
            <button id="theme-toggle-btn" class="theme-toggle" onclick="toggleTheme()" title="Toggle Theme">☀️</button>
            <button id="logout-btn" class="premium-btn" style="background: transparent; border: 1px solid var(--border-med); color: var(--text-bright); box-shadow: none;" onclick="window.location.href='index.html'">Logout</button>
        </div>
    </nav>

    <!-- SPA VIEW: HOME -->
    <div id="view-home" class="spa-view active" style="padding: 120px 40px 40px 40px; background: radial-gradient(circle at top right, var(--primary-light), transparent 40%), var(--bg-dark);">
        <div style="max-width: 1200px; margin: 0 auto;" class="fade-in-up">
            <!-- Header Banner -->
            <div style="margin-bottom: 48px; text-align: center;">
                <h1 style="font-size: 3rem; font-weight: 800; letter-spacing: -1px; margin-bottom: 12px; color: var(--text-bright);">Campus Transit, <span style="color: var(--primary);">Elevated.</span></h1>
                <p style="color: var(--text-muted); font-size: 1.15rem; max-width: 600px; margin: 0 auto;">Experience seamless commuting with real-time tracking, accurate ETAs, and live crowd monitoring.</p>
            </div>
            
            <!-- Statistics Grid -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 48px;">
                <div class="modern-card stat-card" style="border-left: 4px solid var(--primary);">
                    <div class="stat-icon" style="background: var(--primary-light); color: var(--primary);">🚌</div>
                    <div>
                        <div class="stat-value">6</div>
                        <div class="stat-label" style="color: var(--primary);">Active Buses</div>
                    </div>
                </div>
                <div class="modern-card stat-card" style="border-left: 4px solid #8b5cf6;">
                    <div class="stat-icon" style="background: rgba(139, 92, 246, 0.15); color: #8b5cf6;">🛣️</div>
                    <div>
                        <div class="stat-value">18</div>
                        <div class="stat-label" style="color: #a78bfa;">Total Routes</div>
                    </div>
                </div>
                <div class="modern-card stat-card" style="border-left: 4px solid var(--success);">
                    <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15); color: var(--success);">🚏</div>
                    <div>
                        <div class="stat-value">174</div>
                        <div class="stat-label" style="color: #34d399;">Bus Stops</div>
                    </div>
                </div>
            </div>

            <!-- Quick Navigation Grid -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 48px;">
                <div class="modern-card quick-nav-card" onclick="switchView('view-live-tracking')" style="cursor: pointer;">
                    <div class="quick-nav-icon" style="background: var(--primary-light); color: var(--primary);">🗺️</div>
                    <h3 style="margin: 0 0 8px 0; color: var(--text-bright); font-size: 1.1rem;">Live Tracking</h3>
                    <div style="color: var(--text-muted); font-size: 0.9rem;">See buses in real-time</div>
                </div>
                <div class="modern-card quick-nav-card" onclick="switchView('view-routes')" style="cursor: pointer;">
                    <div class="quick-nav-icon" style="background: rgba(139, 92, 246, 0.15); color: #8b5cf6;">🛣️</div>
                    <h3 style="margin: 0 0 8px 0; color: var(--text-bright); font-size: 1.1rem;">All Routes</h3>
                    <div style="color: var(--text-muted); font-size: 0.9rem;">Browse bus routes</div>
                </div>
                <div class="modern-card quick-nav-card" onclick="switchView('view-nearby')" style="cursor: pointer;">
                    <div class="quick-nav-icon" style="background: rgba(16, 185, 129, 0.15); color: var(--success);">📍</div>
                    <h3 style="margin: 0 0 8px 0; color: var(--text-bright); font-size: 1.1rem;">Nearby Stops</h3>
                    <div style="color: var(--text-muted); font-size: 0.9rem;">Find stops near you</div>
                </div>
                <div class="modern-card quick-nav-card" onclick="switchView('view-arrivals')" style="cursor: pointer;">
                    <div class="quick-nav-icon" style="background: rgba(245, 158, 11, 0.15); color: var(--warning);">⏱️</div>
                    <h3 style="margin: 0 0 8px 0; color: var(--text-bright); font-size: 1.1rem;">Arrival Times</h3>
                    <div style="color: var(--text-muted); font-size: 0.9rem;">Check bus schedules</div>
                </div>
            </div>

            <!-- Live Bus Updates -->
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px;">
                <h2 style="color: var(--text-bright); margin: 0; font-size: 1.5rem; letter-spacing: -0.5px;">Live Bus Updates</h2>
                <button class="premium-btn" style="background: transparent; border: 1px solid var(--border-med); padding: 8px 16px;" onclick="switchView('view-live-tracking')">View All Map</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
                <div class="modern-card bus-update-card">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                        <div style="width: 44px; height: 44px; background: var(--primary-light); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">🚌</div>
                        <div>
                            <div style="color: var(--text-bright); font-weight: 700; font-size: 1.1rem;">Cuttack - 1</div>
                            <div style="color: var(--text-muted); font-size: 0.85rem;">2 buses active</div>
                        </div>
                    </div>
                    <div style="background: var(--bg-dark); border-radius: 12px; padding: 16px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid var(--border-dim); padding-bottom: 16px;">
                            <div style="color: var(--text-bright); font-weight: 600;">Bus B1</div>
                            <div style="color: var(--text-muted); display: flex; align-items: center; gap: 8px; font-size: 0.9rem;">Link Road <div style="width:8px; height:8px; background:var(--warning); border-radius:50%; box-shadow: 0 0 8px var(--warning);"></div></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                            <div style="color: var(--text-bright); font-weight: 600;">Bus B2</div>
                            <div style="color: var(--text-muted); display: flex; align-items: center; gap: 8px; font-size: 0.9rem;">ITER Campus <div style="width:8px; height:8px; background:var(--danger); border-radius:50%; box-shadow: 0 0 8px var(--danger);"></div></div>
                        </div>
                    </div>
                </div>
                <!-- Add similar styling for the other two cards... I'll omit for brevity to fit in one pass, but I will keep the structure -->
                <div class="modern-card bus-update-card">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                        <div style="width: 44px; height: 44px; background: rgba(16, 185, 129, 0.15); color: var(--success); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">🚌</div>
                        <div>
                            <div style="color: var(--text-bright); font-weight: 700; font-size: 1.1rem;">Patia - 1</div>
                            <div style="color: var(--text-muted); font-size: 0.85rem;">2 buses active</div>
                        </div>
                    </div>
                    <div style="background: var(--bg-dark); border-radius: 12px; padding: 16px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid var(--border-dim); padding-bottom: 16px;">
                            <div style="color: var(--text-bright); font-weight: 600;">Bus B3</div>
                            <div style="color: var(--text-muted); display: flex; align-items: center; gap: 8px; font-size: 0.9rem;">Khurda <div style="width:8px; height:8px; background:var(--success); border-radius:50%;"></div></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                            <div style="color: var(--text-bright); font-weight: 600;">Bus B4</div>
                            <div style="color: var(--text-muted); display: flex; align-items: center; gap: 8px; font-size: 0.9rem;">ITER Campus <div style="width:8px; height:8px; background:var(--danger); border-radius:50%;"></div></div>
                        </div>
                    </div>
                </div>
                <div class="modern-card bus-update-card">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                        <div style="width: 44px; height: 44px; background: rgba(245, 158, 11, 0.15); color: var(--warning); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">🚌</div>
                        <div>
                            <div style="color: var(--text-bright); font-weight: 700; font-size: 1.1rem;">Khurda</div>
                            <div style="color: var(--text-muted); font-size: 0.85rem;">2 buses active</div>
                        </div>
                    </div>
                    <div style="background: var(--bg-dark); border-radius: 12px; padding: 16px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid var(--border-dim); padding-bottom: 16px;">
                            <div style="color: var(--text-bright); font-weight: 600;">Bus B5</div>
                            <div style="color: var(--text-muted); display: flex; align-items: center; gap: 8px; font-size: 0.9rem;">Baramunda <div style="width:8px; height:8px; background:var(--warning); border-radius:50%;"></div></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                            <div style="color: var(--text-bright); font-weight: 600;">Bus B6</div>
                            <div style="color: var(--text-muted); display: flex; align-items: center; gap: 8px; font-size: 0.9rem;">ITER Campus <div style="width:8px; height:8px; background:var(--success); border-radius:50%;"></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- SPA VIEW: LIVE TRACKING -->
    <div id="view-live-tracking" class="spa-view">
        <div class="map-hint">🎯 Click anywhere on the map to drop a pin</div>

        <!-- Left Search Panel -->
        <div id="search-panel" class="glass-panel">
            <div id="search-panel-header">
                <h2>📍 Pickup Locator</h2>
                <svg class="drag-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="5" r="1"></circle>
                    <circle cx="9" cy="12" r="1"></circle>
                    <circle cx="9" cy="19" r="1"></circle>
                    <circle cx="15" cy="5" r="1"></circle>
                    <circle cx="15" cy="12" r="1"></circle>
                    <circle cx="15" cy="19" r="1"></circle>
                </svg>
            </div>
            
            <div class="search-container">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" id="address-input" placeholder="Search address or location..." autocomplete="off">
                <div id="suggestions-list"></div>
            </div>

            <div id="status-update"></div>
            <div id="crowd-meter"><div id="crowd-bar"></div></div>
            <div id="crowd-text"></div>
        </div>

        <!-- Right Active Buses Panel -->
        <div id="active-buses-sidebar" class="glass-panel">
            <div class="sidebar-header">
                <span>Active Buses (<span id="active-bus-count">0</span>)</span>
            </div>
            <div id="active-buses-list">
                <div class="bus-card" style="opacity: 0.5;">
                    <div style="text-align: center; color: var(--text-muted); font-size: 0.9rem;">No active buses on selected route</div>
                </div>
            </div>
        </div>

        <!-- The Leaflet Map -->
        <div id="map"></div>
    </div>

    <!-- SPA VIEW: ROUTES -->
    <div id="view-routes" class="spa-view" style="padding: 110px 40px 40px 40px;">
        <h1 style="margin-top: 0;">Bus Routes</h1>
        <p style="color: var(--text-muted); margin-bottom: 30px;">Browse all available campus bus routes</p>
        <div id="routes-container" style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px;">
            <div id="route-cards-list">
                <!-- Route cards will be injected here -->
            </div>
            <div id="route-legend" style="background: var(--glass-bg); padding: 24px; border-radius: 16px; border: 1px solid var(--glass-border); height: fit-content;">
                <h3 style="margin-top: 0;">Route Legend</h3>
                <div id="legend-items"></div>
            </div>
        </div>
    </div>

    <!-- SPA VIEW: NEARBY -->
    <div id="view-nearby" class="spa-view" style="padding: 110px 40px 40px 40px;">
        <h1 style="margin-top: 0;">Nearby Bus Stops</h1>
        <p style="color: var(--text-muted); margin-bottom: 30px;">Showing stops near your location</p>
        <div class="search-container" style="max-width: 600px; margin-bottom: 30px;">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search bus stops..." style="padding: 16px 16px 16px 45px; font-size: 1rem;">
        </div>
        <div style="display: flex; gap: 10px; margin-bottom: 24px;">
            <div style="background: var(--border-dim); padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; color: var(--text-muted);">10 stops found</div>
            <div style="background: var(--border-dim); padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; color: var(--text-muted); cursor: pointer;">Sorted by distance</div>
        </div>
        <div style="background: var(--card-bg); border: 1px solid var(--border-dim); border-radius: 16px; padding: 24px; max-width: 800px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(59, 130, 246, 0.2); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 20px;">📍</div>
                <div>
                    <h3 style="margin: 0; font-size: 1.1rem; color: var(--text-bright);">Main Campus Gate</h3>
                    <div style="color: var(--text-muted); font-size: 0.85rem;">0.00 km away</div>
                </div>
            </div>
            <div style="display: flex; gap: 8px; margin-bottom: 20px;">
                <span style="background: var(--border-dim); padding: 4px 10px; border-radius: 12px; font-size: 0.75rem;">Cuttack 1</span>
                <span style="background: var(--border-dim); padding: 4px 10px; border-radius: 12px; font-size: 0.75rem;">Patia 2</span>
            </div>
            <div style="font-size: 0.9rem; margin-bottom: 12px; color: var(--text-main);">Upcoming buses:</div>
            <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-dim);">
                <div style="display: flex; align-items: center; gap: 8px;"><span style="color: #3b82f6;">🚌</span> <span>Cuttack 1 (B1)</span></div>
                <div style="color: var(--primary); font-weight: bold;">3 min</div>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 12px 0;">
                <div style="display: flex; align-items: center; gap: 8px;"><span style="color: #10b981;">🚌</span> <span>Patia 2 (B6)</span></div>
                <div style="color: var(--primary); font-weight: bold;">14 min</div>
            </div>
        </div>
    </div>

    <!-- SPA VIEW: ARRIVALS -->
    <div id="view-arrivals" class="spa-view" style="padding: 110px 40px 40px 40px;">
        <div style="max-width: 800px; margin: 0 auto;">
            <h1 style="margin-top: 0; font-size: 2.5rem;">Bus Arrival Times</h1>
            <p style="color: var(--text-muted); margin-bottom: 30px; font-size: 1.1rem;">Select a bus stop to view estimated arrival times for upcoming buses.</p>
            
            <div style="background: var(--glass-bg); padding: 30px; border-radius: 16px; border: 1px solid var(--glass-border); margin-bottom: 30px;">
                <div class="search-container" style="margin-bottom: 0;">
                    <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" id="arrivals-search" placeholder="Type a stop name (e.g. Trisulia, Rail Vihar)..." style="padding: 16px 16px 16px 45px; font-size: 1rem;">
                    <div id="arrivals-suggestions" style="position: absolute; width: 100%; background: #1e293b; border-radius: 12px; box-shadow: 0 15px 35px rgba(0,0,0,0.4); max-height: 220px; overflow-y: auto; z-index: 1001; display: none; border: 1px solid var(--glass-border); top: 100%; margin-top: 4px;"></div>
                </div>
            </div>

            <div id="arrivals-content" style="display: none;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
                    <div>
                        <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 4px;">Live ETAs for</div>
                        <h2 id="arrivals-stop-name" style="margin: 0; font-size: 1.8rem; color: var(--text-bright);">Selected Stop</h2>
                    </div>
                    <button style="background: rgba(59, 130, 246, 0.1); color: var(--primary); border: 1px solid rgba(59, 130, 246, 0.2); padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer;" onclick="switchView('view-live-tracking')">View on Map 📍</button>
                </div>
                
                <div id="arrivals-list" style="display: flex; flex-direction: column; gap: 16px;">
                    <!-- ETAs dynamically injected here -->
                </div>
            </div>

            <div id="arrivals-empty" style="text-align: center; padding: 60px 20px; background: var(--bg-dark-overlay); border-radius: 16px; border: 1px dashed var(--border-med);">
                <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;">🚏</div>
                <div style="font-size: 1.2rem; font-weight: 600; color: var(--text-bright); margin-bottom: 8px;">No stop selected</div>
                <div style="color: var(--text-muted);">Use the search bar above to select a bus stop.</div>
            </div>
        </div>
    </div>

    <script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
    <script src="https://unpkg.com/leaflet-control-geocoder@2.4.0/dist/Control.Geocoder.js"></script>
    
    <script>
        const mapStyleLight = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
        const mapStyleDark = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&apistyle=s.e%3Ag%7Cp.c%3A%23242f3e%2Cs.e%3Al.t.s%7Cp.c%3A%23242f3e%2Cs.e%3Al.t.f%7Cp.c%3A%23746855%2Cs.t%3A6%7Cs.e%3Al.t.f%7Cp.c%3A%23d59563%2Cs.t%3A3%7Cs.e%3Al.t.f%7Cp.c%3A%23d59563%2Cs.t%3A3%7Cs.e%3Ag%7Cp.c%3A%23263c3f%2Cs.t%3A3%7Cs.e%3Al.t.f%7Cp.c%3A%236b9a76%2Cs.t%3A1%7Cs.e%3Ag%7Cp.c%3A%2338414e%2Cs.t%3A1%7Cs.e%3Ag.s%7Cp.c%3A%23212a37%2Cs.t%3A1%7Cs.e%3Al.t.f%7Cp.c%3A%239ca5b3%2Cs.t%3A1%7Cs.e%3Ag%7Cp.c%3A%23746855%2Cs.t%3A1%7Cs.e%3Ag.s%7Cp.c%3A%231f2835%2Cs.t%3A1%7Cs.e%3Al.t.f%7Cp.c%3A%23f3d19c%2Cs.t%3A4%7Cs.e%3Ag%7Cp.c%3A%232f3948%2Cs.t%3A4%7Cs.e%3Al.t.f%7Cp.c%3A%23d59563%2Cs.t%3A5%7Cs.e%3Ag%7Cp.c%3A%2317263c%2Cs.t%3A5%7Cs.e%3Al.t.f%7Cp.c%3A%23515c6d%2Cs.t%3A5%7Cs.e%3Al.t.s%7Cp.c%3A%2317263c';

        // Theme Toggle Logic
        function toggleTheme() {
            const html = document.documentElement;
            const btn = document.getElementById('theme-toggle-btn');
            if (html.getAttribute('data-theme') === 'light') {
                html.removeAttribute('data-theme');
                localStorage.setItem('busTrackerTheme', 'dark');
                btn.innerHTML = '☀️';
                if (window.mapTileLayer) window.mapTileLayer.setUrl(mapStyleDark);
            } else {
                html.setAttribute('data-theme', 'light');
                localStorage.setItem('busTrackerTheme', 'light');
                btn.innerHTML = '🌙';
                if (window.mapTileLayer) window.mapTileLayer.setUrl(mapStyleLight);
            }
        }

        // Initialize Theme
        if (localStorage.getItem('busTrackerTheme') === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            document.getElementById('theme-toggle-btn').innerHTML = '🌙';
        }

        // SPA View Switcher Logic
        function switchView(viewId) {
            document.querySelectorAll('.spa-view').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
            
            document.getElementById(viewId).classList.add('active');
            document.getElementById('nav-' + viewId.replace('view-', '')).classList.add('active');
            
            // Trigger leaflet resize when switching back to map
            if (viewId === 'view-live-tracking' && window.mapInstance) {
                window.mapInstance.invalidateSize();
            }
        }

        window.onload = () => {
            const socket = io('http://localhost:3000');
            const urlParams = new URLSearchParams(window.location.search);
            const studentId = urlParams.get('id') || "Student";
            
            const map = L.map('map').setView([20.2961, 85.8245], 13);
            window.mapInstance = map; // Expose globally for resize trigger
            const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
            const tileUrl = isLightMode ? mapStyleLight : mapStyleDark;

            window.mapTileLayer = L.tileLayer(tileUrl, {
                maxZoom: 20,
                attribution: '&copy; Google Maps'
            }).addTo(map);

            const busIcon = L.divIcon({ html: '🚌', className: 'bus-icon', iconSize: [40, 40] });
            const userIcon = L.divIcon({ html: '🧍', className: 'user-icon', iconSize: [30, 30] });
            const stopIcon = L.divIcon({ html: '🚏', className: 'stop-icon', iconSize: [30, 30] });
            const collegeIcon = L.divIcon({ html: '🎓', className: 'college-icon', iconSize: [40, 40] });

            const collegeLocation = L.latLng(20.2496, 85.8002); 
            L.marker(collegeLocation, { icon: collegeIcon }).addTo(map).bindPopup('<b>ITER Campus</b>');

            const fallbackStands = ${fallbackStandsJson};
            let busStands = fallbackStands;
            let userPin, standPin, routeControl, busRouteControl, busMarker;
            let selectedStand = null;
            let myAssignedRoute = null; 

            // Make Search Panel Draggable
            dragElement(document.getElementById("search-panel"));
            function dragElement(elmnt) {
                let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
                const header = document.getElementById("search-panel-header");
                if (header) {
                    header.onmousedown = dragMouseDown;
                }

                function dragMouseDown(e) {
                    e = e || window.event;
                    e.preventDefault();
                    pos3 = e.clientX;
                    pos4 = e.clientY;
                    document.onmouseup = closeDragElement;
                    document.onmousemove = elementDrag;
                }

                function elementDrag(e) {
                    e = e || window.event;
                    e.preventDefault();
                    pos1 = pos3 - e.clientX;
                    pos2 = pos4 - e.clientY;
                    pos3 = e.clientX;
                    pos4 = e.clientY;
                    
                    let newTop = elmnt.offsetTop - pos2;
                    let newLeft = elmnt.offsetLeft - pos1;
                    
                    if (newTop < 0) newTop = 0;
                    if (newLeft < 0) newLeft = 0;
                    if (newTop > window.innerHeight - elmnt.offsetHeight) newTop = window.innerHeight - elmnt.offsetHeight;
                    if (newLeft > window.innerWidth - elmnt.offsetWidth) newLeft = window.innerWidth - elmnt.offsetWidth;

                    elmnt.style.top = newTop + "px";
                    elmnt.style.left = newLeft + "px";
                }

                function closeDragElement() {
                    document.onmouseup = null;
                    document.onmousemove = null;
                }
            }

            function handleUserLocation(latlng) {
                if (busStands.length === 0) return;

                if (userPin) map.removeLayer(userPin);
                if (standPin) map.removeLayer(standPin);
                if (routeControl) map.removeControl(routeControl);
                if (busRouteControl) map.removeControl(busRouteControl);

                userPin = L.marker(latlng, { icon: userIcon }).addTo(map).bindPopup('Your Pickup Point').openPopup();

                let minDistance = Infinity;
                busStands.forEach(stand => {
                    const distance = map.distance([latlng.lat, latlng.lng], [stand.lat, stand.lng]);
                    if (distance < minDistance) {
                        minDistance = distance;
                        selectedStand = stand;
                    }
                });

                const standLatLng = L.latLng(selectedStand.lat, selectedStand.lng);
                standPin = L.marker(standLatLng, { icon: stopIcon }).addTo(map).bindPopup(\`<b>Nearest Stop: \${selectedStand.name}</b>\`).openPopup();

                routeControl = L.Routing.control({
                    waypoints: [L.latLng(latlng.lat, latlng.lng), standLatLng],
                    routeWhileDragging: false,
                    addWaypoints: false,
                    show: false,
                    createMarker: function() { return null; },
                    lineOptions: { 
                        styles: [
                            {color: '#ffffff', opacity: 0.9, weight: 7},
                            {color: '#6b7280', opacity: 1, weight: 4, dashArray: '5, 8'}
                        ] 
                    }
                }).addTo(map);

                busRouteControl = L.Routing.control({
                    waypoints: [standLatLng, collegeLocation],
                    routeWhileDragging: false,
                    addWaypoints: false,
                    show: false,
                    createMarker: function() { return null; },
                    lineOptions: { 
                        styles: [
                            {color: '#ffffff', opacity: 0.9, weight: 8},
                            {color: '#3b82f6', opacity: 0.8, weight: 5}
                        ] 
                    }
                }).addTo(map);

                socket.emit('set-pickup', { 
                    lat: standLatLng.lat, 
                    lng: standLatLng.lng, 
                    stopName: selectedStand.name, 
                    studentId: studentId 
                });
                
                document.getElementById('status-update').innerHTML = \`
                    <b style="color: #3b82f6;">✔ SUCCESS</b><br>
                    Assigned Stop: <b>\${selectedStand.name}</b><br>
                    Walk distance: <b>\${Math.round(minDistance)} meters</b>
                \`;
            }

            socket.on('bus-allocated', (data) => {
                myAssignedRoute = data.routeId;
                document.getElementById('status-update').innerHTML += \`<br><span style="color:#3b82f6">🚌 Tracking \${data.routeId}...</span>\`;
                
                const meter = document.getElementById('crowd-meter');
                const bar = document.getElementById('crowd-bar');
                const txt = document.getElementById('crowd-text');
                meter.style.display = 'block';
                txt.style.display = 'block';

                let count = data.crowdCount || 1;
                let percentage = Math.min((count / 20) * 100, 100);
                let color = "#10b981"; 
                if (count > 5) color = "#f59e0b"; 
                if (count > 15) color = "#ef4444"; 

                bar.style.width = percentage + "%";
                bar.style.background = color;
                txt.innerText = \`CROWD DENSITY: \${count} waiting\`;
                txt.style.color = color;
                
                // MOCK ACTIVE BUS CARD FOR NEW SIDEBAR
                document.getElementById('active-bus-count').innerText = "1";
                document.getElementById('active-buses-list').innerHTML = \`
                    <div class="bus-card">
                        <div class="bus-card-header">
                            <div class="bus-route-tag">🚌 \${myAssignedRoute}</div>
                            <div class="bus-eta">⏱ ~10 min</div>
                        </div>
                        <ul class="bus-details-list">
                            <li>📍 <b>Current:</b> Approaching \${selectedStand.name}</li>
                            <li>🚏 <b>Next Stop:</b> ITER</li>
                            <li>👥 <b>Occupancy:</b> \${Math.floor(Math.random() * 20 + 20)}/50</li>
                        </ul>
                        <div class="occ-bar-container">
                            <div class="occ-bar" style="width: 65%; background: var(--warning);"></div>
                        </div>
                        <div class="card-actions">
                            <button class="card-btn btn-track" onclick="switchView('view-live-tracking')">Track Live</button>
                            <button class="card-btn btn-info">Info</button>
                        </div>
                    </div>
                \`;
            });

            socket.on('receive-location', (data) => {
                const { lat, lng, routeId } = data;
                if (myAssignedRoute && routeId === myAssignedRoute) {
                    if (!busMarker) {
                        busMarker = L.marker([lat, lng], {icon: busIcon}).addTo(map);
                    } else {
                        busMarker.setLatLng([lat, lng]);
                    }
                    // Implement custom popup layout instead of simple text
                    const popupContent = \`
                        <div style="width: 200px; padding: 5px;">
                            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #333;">\${routeId}</h3>
                            <div style="border-left: 2px solid #3b82f6; margin-left: 5px; padding-left: 15px;">
                                <div style="position: relative; margin-bottom: 10px;">
                                    <div style="position: absolute; left: -21px; top: 0; background: #fff; border: 2px solid #94a3b8; width: 10px; height: 10px; border-radius: 50%;"></div>
                                    <div style="color: #64748b; font-size: 11px;">Previous Stop</div>
                                </div>
                                <div style="position: relative; margin-bottom: 10px;">
                                    <div style="position: absolute; left: -21px; top: 0; background: #3b82f6; border: 2px solid #3b82f6; width: 10px; height: 10px; border-radius: 50%;"></div>
                                    <div style="color: #0f172a; font-weight: bold; font-size: 12px;">Current Location</div>
                                </div>
                                <div style="position: relative;">
                                    <div style="position: absolute; left: -21px; top: 0; background: #fff; border: 2px solid #10b981; width: 10px; height: 10px; border-radius: 50%;"></div>
                                    <div style="color: #10b981; font-weight: bold; font-size: 12px;">Next: \${selectedStand ? selectedStand.name : 'College'}</div>
                                </div>
                            </div>
                        </div>
                    \`;
                    busMarker.bindPopup(popupContent).openPopup();
                }
            });

            function debounce(func, timeout = 800) {
                let timer;
                return (...args) => {
                    clearTimeout(timer);
                    timer = setTimeout(() => { func.apply(this, args); }, timeout);
                };
            }

            const addressInput = document.getElementById('address-input');
            const suggestionsList = document.getElementById('suggestions-list');

            map.on('click', function(e) {
                addressInput.value = "📍 Custom Map Location";
                document.getElementById('status-update').style.display = 'block';
                document.getElementById('status-update').innerHTML = "🔍 Calculating best route...";
                handleUserLocation(e.latlng);
            });

            addressInput.addEventListener('input', debounce(async (e) => {
                const query = e.target.value;
                if (query.length < 3) {
                    suggestionsList.style.display = 'none';
                    return;
                }

                try {
                    const response = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(query + ' Bhubaneswar')}&limit=6&addressdetails=1\`);
                    const data = await response.json();

                    suggestionsList.innerHTML = '';
                    if (data && data.length > 0) {
                        suggestionsList.style.display = 'block';
                        data.forEach(item => {
                            const div = document.createElement('div');
                            div.className = 'suggestion-item';
                            const displayName = item.display_name.split(',').slice(0, 4).join(',');
                            div.innerHTML = \`<span class="suggestion-icon">📍</span> <span>\${displayName}</span>\`;
                            div.onclick = () => {
                                addressInput.value = displayName;
                                suggestionsList.style.display = 'none';
                                map.setView([item.lat, item.lon], 16);
                                handleUserLocation(L.latLng(item.lat, item.lon));
                            };
                            suggestionsList.appendChild(div);
                        });
                    }
                } catch (err) {
                    console.error("Search failed:", err);
                }
            }));
            
            // --- INJECT ROUTE CARDS FOR 'ROUTES' VIEW ---
            const routesContainer = document.getElementById('route-cards-list');
            const legendContainer = document.getElementById('legend-items');
            
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e'];
            
            const routesJsonData = ${JSON.stringify(routesData)};
            
            routesJsonData.forEach((route, index) => {
                const color = colors[index % colors.length];
                
                // Add to Legend
                legendContainer.innerHTML += \`
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <div style="width: 16px; height: 16px; border-radius: 4px; background: \${color};"></div>
                        <div>
                            <div style="color: var(--text-bright); font-weight: 600; font-size: 0.95rem;">\${route.route.split('(')[0].trim()}</div>
                            <div style="color: var(--text-muted); font-size: 0.8rem;">Route \${index+1}</div>
                        </div>
                    </div>
                \`;
                
                // Route Card
                const card = document.createElement('div');
                card.style.background = 'rgba(255,255,255,0.03)';
                card.style.border = '1px solid var(--border-dim)';
                card.style.borderRadius = '16px';
                card.style.padding = '24px';
                card.style.marginBottom = '24px';
                
                card.innerHTML = \`
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div style="width: 48px; height: 48px; border-radius: 12px; background: \${color}22; display: flex; align-items: center; justify-content: center; font-size: 24px;">🚌</div>
                            <div>
                                <h2 style="margin: 0; font-size: 1.2rem;">\${route.route}</h2>
                                <div style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">\${route.stops.length} stops • Circular route</div>
                            </div>
                        </div>
                        <div style="background: \${color}33; color: \${color}; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 0.8rem;">R\${index+1}</div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
                        <div style="background: var(--bg-dark-overlay); padding: 16px; border-radius: 12px; text-align: center;">
                            <div style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 4px;">Frequency</div>
                            <div style="color: var(--text-bright); font-weight: 700; font-size: 1.1rem;">15 min</div>
                        </div>
                        <div style="background: var(--bg-dark-overlay); padding: 16px; border-radius: 12px; text-align: center;">
                            <div style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 4px;">Distance</div>
                            <div style="color: var(--text-bright); font-weight: 700; font-size: 1.1rem;">12 km</div>
                        </div>
                        <div style="background: var(--bg-dark-overlay); padding: 16px; border-radius: 12px; text-align: center;">
                            <div style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 4px;">Buses</div>
                            <div style="color: var(--text-bright); font-weight: 700; font-size: 1.1rem;">2 active</div>
                        </div>
                    </div>
                    
                    <button onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'" style="width: 100%; padding: 12px; background: transparent; border: 1px solid var(--border-med); color: var(--text-bright); border-radius: 12px; font-weight: 600; cursor: pointer; margin-bottom: 12px; transition: 0.2s;">View All Stops 🔽</button>
                    
                    <div style="display: none; background: var(--bg-dark-overlay); border-radius: 12px; padding: 16px; margin-bottom: 12px; max-height: 200px; overflow-y: auto;">
                        \${route.stops.map((stop, i) => \`
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border-dim);">
                                <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--glass-bg); border: 2px solid \${color}; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold; color: var(--text-bright);">\${i+1}</div>
                                <div style="color: #e2e8f0; font-size: 0.9rem;">\${stop.name}</div>
                            </div>
                        \`).join('')}
                    </div>
                    
                    <button style="width: 100%; padding: 12px; background: \${color}; border: none; color: var(--text-bright); border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.2s;" onclick="switchView('view-live-tracking')">Track Live</button>
                \`;
                routesContainer.appendChild(card);
            });
            
            // --- ARRIVALS LOGIC ---
            const arrivalsInput = document.getElementById('arrivals-search');
            const arrivalsSuggestions = document.getElementById('arrivals-suggestions');
            const arrivalsContent = document.getElementById('arrivals-content');
            const arrivalsEmpty = document.getElementById('arrivals-empty');
            const arrivalsStopName = document.getElementById('arrivals-stop-name');
            const arrivalsList = document.getElementById('arrivals-list');

            let allStops = [];
            routesJsonData.forEach(route => {
                route.stops.forEach(stop => {
                    if (!allStops.find(s => s.name === stop.name)) {
                        allStops.push(stop);
                    }
                });
            });

            if (arrivalsInput) {
                arrivalsInput.addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase();
                    arrivalsSuggestions.innerHTML = '';
                    
                    if (query.length < 2) {
                        arrivalsSuggestions.style.display = 'none';
                        return;
                    }

                    const matches = allStops.filter(stop => stop.name.toLowerCase().includes(query)).slice(0, 8);
                    
                    if (matches.length > 0) {
                        arrivalsSuggestions.style.display = 'block';
                        matches.forEach(match => {
                            const div = document.createElement('div');
                            div.style.padding = '12px 16px';
                            div.style.cursor = 'pointer';
                            div.style.borderBottom = '1px solid var(--border-dim)';
                            div.style.color = '#fff';
                            div.textContent = match.name;
                            
                            div.onmouseover = () => div.style.background = 'var(--border-med)';
                            div.onmouseout = () => div.style.background = 'transparent';
                            
                            div.onclick = () => {
                                arrivalsInput.value = match.name;
                                arrivalsSuggestions.style.display = 'none';
                                selectArrivalsStop(match.name);
                            };
                            
                            arrivalsSuggestions.appendChild(div);
                        });
                    } else {
                        arrivalsSuggestions.style.display = 'none';
                    }
                });
            }

            function selectArrivalsStop(stopName) {
                arrivalsEmpty.style.display = 'none';
                arrivalsContent.style.display = 'block';
                arrivalsStopName.textContent = stopName;
                arrivalsList.innerHTML = '';

                const passingRoutes = [];
                routesJsonData.forEach((route, index) => {
                    const stopIndex = route.stops.findIndex(s => s.name === stopName);
                    if (stopIndex !== -1) {
                        passingRoutes.push({
                            route: route.route,
                            color: colors[index % colors.length],
                            stopIndex: stopIndex
                        });
                    }
                });

                if (passingRoutes.length === 0) {
                    arrivalsList.innerHTML = '<div style="color: var(--text-muted); padding: 20px; text-align: center;">No routes found for this stop.</div>';
                    return;
                }

                // Sort by mock ETA
                passingRoutes.sort((a, b) => ((a.stopIndex * 3) % 45) - ((b.stopIndex * 3) % 45));

                passingRoutes.forEach(pr => {
                    const etaMinutes = Math.max(1, (pr.stopIndex * 3) % 45); // Mock calculation
                    
                    const card = document.createElement('div');
                    card.style.background = 'rgba(255,255,255,0.03)';
                    card.style.border = '1px solid var(--border-dim)';
                    card.style.borderRadius = '12px';
                    card.style.padding = '16px 20px';
                    card.style.display = 'flex';
                    card.style.justifyContent = 'space-between';
                    card.style.alignItems = 'center';

                    card.innerHTML = \`
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div style="width: 40px; height: 40px; border-radius: 10px; background: \${pr.color}22; display: flex; align-items: center; justify-content: center; font-size: 20px;">🚌</div>
                            <div>
                                <div style="color: var(--text-bright); font-weight: 600; font-size: 1.1rem;">\${pr.route}</div>
                                <div style="color: var(--text-muted); font-size: 0.85rem;">Towards Terminal</div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: \${pr.color}; font-weight: 800; font-size: 1.5rem;">\${etaMinutes} <span style="font-size: 0.9rem; font-weight: 600;">min</span></div>
                            <div style="color: var(--text-muted); font-size: 0.8rem;">Live updates</div>
                        </div>
                    \`;
                    arrivalsList.appendChild(card);
                });
            }
        };
    </script>
</body>
</html>`;

fs.writeFileSync('student.html', html);
console.log('Successfully generated complete SPA student.html');
