# SQLInjectDemo - Educational Laboratory

Welcome to the **SQLInjectDemo** project. This web application is designed as a secure environment to demonstrate and study **SQL Injection (SQLi)** vulnerabilities using a real SQLite engine.

## 📁 Project Structure

```text
Inject/
├── index.html   # Main UI structure and SQL library loader
├── styles.css   # Premium design system (Glassmorphism)
├── app.js       # Application logic and SQLite WASM integration
└── README.md    # Documentation (this file)
```
---

## 🛠️ Requirements

To run this laboratory, you need:
- **Modern Web Browser**: Chrome, Firefox, or Edge (required for WebAssembly/WASM support).
- **Internet Connection**: Required to load the SQLite engine (`sql.js`) and Google Fonts from CDNs.
- **Python 3**: Used to start the local web server.

---

## 🗄️ Database Details

The application uses **SQLite 3.x** compiled to WebAssembly via the `sql.js` library.

- **Type**: In-Memory (RAM). The database exists only while the browser tab is open.
- **Initial Data**:
  | ID | Username | Password | Email | Role |
  |----|----------|----------|-------|------|
  | 1  | admin    | password123 | admin@sqlinject.demo | Super Admin |
  | 2  | guest    | guest    | guest@sqlinject.demo | User |

---

## 🧪 How to Perform SQL Injection

This lab demonstrates **Authentication Bypass** using a classical "TAUTOLOGY" attack.

### 1. The Vulnerability
In `app.js`, the login query is built using direct string concatenation, which is insecure:
```javascript
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
```

### 2. The Attack
1.  Open the web app in your browser.
2.  In the **Username** field, enter:
    ```sql
    ' OR 1=1 --
    ```
3.  Enter anything in the **Password** field.
4.  Click **INITIALIZE ACCESS**.

### 3. What Happens?
The injected string changes the logic of the SQL statement. The resulting query becomes:
```sql
SELECT * FROM users WHERE username = '' OR 1=1 --' AND password = 'any'
```
- `'` closes the username string.
- `OR 1=1` is a condition that is **always true**.
- `--` is a comment in SQL, which **ignores** the rest of the query (the password check).

Because the condition `1=1` is true, SQLite returns the first record in the table (the `admin` user), and you are logged in without a valid password.

---

## 🚀 How to Run and Stop

### Running the App
1. Open your terminal in the `Inject` directory.
2. Start a local web server:
   ```bash
   python3 -m http.server 8000
   ```
3. Open your browser and navigate to `http://localhost:8000`.

### Stopping the App
1. Go back to the terminal where the server is running.
2. Press `Ctrl + C` to stop the server.
3. Close the browser tab (since the database is in-memory, closing the tab also "wipes" the database state).
