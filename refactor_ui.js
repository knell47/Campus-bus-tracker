const fs = require('fs');

let content = fs.readFileSync('build.js', 'utf8');

const premiumStyleBlock = `    <style>
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
        #map { height: 100%; width: 100%; z-index: 1; background: #11141a; transition: filter 0.5s; }
        html[data-theme="light"] #map { background: #e5e3df; }

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
    </style>`;

// Replace old style block
const styleRegex = /<style>[\s\S]*?<\/style>/;
content = content.replace(styleRegex, premiumStyleBlock);

// Replace Nav
const oldNavRegex = /<nav id="top-nav">[\s\S]*?<\/nav>/;
const newNav = `<nav id="top-nav" class="glass-panel">
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
            <button id="logout-btn" class="premium-btn" style="background: var(--card-bg); border: 1px solid var(--border-med);" onclick="window.location.href='index.html'">Logout</button>
        </div>
    </nav>`;
content = content.replace(oldNavRegex, newNav);

// Replace Home View 
const oldHomeRegex = /<!-- SPA VIEW: HOME -->[\s\S]*?<!-- SPA VIEW: LIVE TRACKING -->/;
const newHome = `<!-- SPA VIEW: HOME -->
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

    <!-- SPA VIEW: LIVE TRACKING -->`;
content = content.replace(oldHomeRegex, newHome);


// Overwrite class "glass-panel" on search panel and sidebar
content = content.replace('<div id="search-panel">', '<div id="search-panel" class="glass-panel">');
content = content.replace('<div id="active-buses-sidebar">', '<div id="active-buses-sidebar" class="glass-panel">');

fs.writeFileSync('build.js', content);
console.log('UI Overhaul completed in build.js!');
