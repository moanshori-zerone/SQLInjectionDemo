const App = {
    db: null,
    sqlite: null,

    state: {
        isLoggedIn: false,
        currentUser: null
    },

    async init() {
        this.render();
        this.updateConsole("Initializing SQLite engine (WASM)...");
        
        try {
            // Initialize sql.js
            const config = {
                locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${filename}`
            };
            const SQL = await initSqlJs(config);
            this.sqlite = new SQL.Database();
            
            // Seed the database
            this.sqlite.run(`
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY,
                    username TEXT,
                    password TEXT,
                    email TEXT,
                    role TEXT
                );
                INSERT INTO users VALUES (1, 'admin', 'password123', 'admin@sqlinject.demo', 'Super Admin');
                INSERT INTO users VALUES (2, 'guest', 'guest', 'guest@sqlinject.demo', 'User');
            `);
            
            this.updateConsole("SQLite Database initialized and seeded.");
        } catch (err) {
            console.error(err);
            this.updateConsole("Error initializing database: " + err.message);
        }
    },

    updateConsole(msg, isQuery = false) {
        const consoleContent = document.getElementById('console-content');
        const header = document.querySelector('.console-header span:last-child');
        
        if (isQuery) {
            header.innerText = "EXECUTING";
            header.style.color = "#ff007a";
            consoleContent.innerHTML = `<div class="console-query">SQL: <span style="color: #00f2ff">${msg}</span></div>`;
        } else {
            header.innerText = "IDLE";
            header.style.color = "#444";
            consoleContent.innerHTML = `<span style="color: #666;">${msg}</span>`;
        }
    },

    // VULNERABLE SQL QUERY - Now using real SQLite!
    simulateQuery(username, password) {
        // VULNERABLE: Direct string concatenation
        const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
        this.updateConsole(query, true);

        try {
            // Execute query against the real SQLite engine
            const contents = this.sqlite.exec(query);
            
            if (contents.length > 0 && contents[0].values.length > 0) {
                // Map the result back to an object
                const columns = contents[0].columns;
                const firstRow = contents[0].values[0];
                
                const user = {};
                columns.forEach((col, index) => {
                    user[col] = firstRow[index];
                });
                
                return user;
            }
            return null;
        } catch (e) {
            this.updateConsole("SQLite Error: " + e.message);
            return null;
        }
    },

    handleLogin(e) {
        e.preventDefault();
        const userVal = document.getElementById('username').value;
        const passVal = document.getElementById('password').value;

        const user = this.simulateQuery(userVal, passVal);

        if (user) {
            this.state.isLoggedIn = true;
            this.state.currentUser = user;
            this.render();
        } else {
            this.updateConsole("Login Failed: Access Denied.");
        }
    },

    handleLogout() {
        this.state.isLoggedIn = false;
        this.state.currentUser = null;
        this.render();
        this.updateConsole("User logged out.");
    },

    render() {
        const app = document.getElementById('app');
        
        if (!this.state.isLoggedIn) {
            app.innerHTML = `
                <div class="card">
                    <h1>SQLInjectDemo</h1>
                    <p style="color: var(--text-dim); text-align: center; margin-bottom: 2rem;">Secure Authentication Portal (SQLite Engine)</p>
                    <form id="login-form">
                        <div class="input-group">
                            <label for="username">Username</label>
                            <input type="text" id="username" placeholder="Enter username" required autocomplete="off">
                        </div>
                        <div class="input-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" placeholder="Enter password" required>
                        </div>
                        <button type="submit">Initialize Access</button>
                    </form>
                    <div style="margin-top: 1.5rem; font-size: 0.8rem; color: #444; text-align: center;">
                        Vulnerability Level: <span style="color: #ff4444;">CRITICAL (Real SQLite)</span>
                    </div>
                </div>
            `;
            document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        } else {
            app.innerHTML = `
                <div class="dashboard">
                    <div class="dashboard-header">
                        <div>
                            <h2 style="text-align: left; margin-bottom: 0.5rem;">Access Granted</h2>
                            <p style="color: var(--text-dim);">System Dashboard | SQLite Node #01</p>
                        </div>
                        <button class="logout-btn" id="logout-btn">Terminate Session</button>
                    </div>

                    <div class="card" style="max-width: 100%; margin-bottom: 2rem;">
                        <h3 style="margin-bottom: 1rem; color: var(--primary-color);">Welcome, ${this.state.currentUser.username}</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <p style="color: var(--text-dim); font-size: 0.8rem;">EMAIL</p>
                                <p>${this.state.currentUser.email}</p>
                            </div>
                            <div>
                                <p style="color: var(--text-dim); font-size: 0.8rem;">ROLE</p>
                                <p>${this.state.currentUser.role}</p>
                            </div>
                        </div>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card">
                            <p style="color: var(--text-dim); font-size: 0.8rem;">ENGINE</p>
                            <div class="stat-value" style="font-size: 1.5rem;">SQLite 3.x</div>
                        </div>
                        <div class="stat-card">
                            <p style="color: var(--text-dim); font-size: 0.8rem;">ACTIVE SESSIONS</p>
                            <div class="stat-value" style="color: var(--primary-color);">42</div>
                        </div>
                        <div class="stat-card">
                            <p style="color: var(--text-dim); font-size: 0.8rem;">THREAT LEVEL</p>
                            <div class="stat-value" style="color: var(--accent-color);">LOW</div>
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
        }
    }
};

window.onload = () => App.init();
