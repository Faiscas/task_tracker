const { app, BrowserWindow, ipcMain, safeStorage } = require("electron");
const fs = require("fs");
const path = require("path");

const isDevelopment = !app.isPackaged;

const configPath = () => path.join(app.getPath("userData"), "jira-config.json");

function readJiraConfig(includeToken = false) {
    if (!fs.existsSync(configPath())) return {};
    const config = JSON.parse(fs.readFileSync(configPath(), "utf8"));
    if (includeToken && config.encryptedToken && safeStorage.isEncryptionAvailable()) {
        config.token = safeStorage.decryptString(Buffer.from(config.encryptedToken, "base64"));
    }
    delete config.encryptedToken;
    return config;
}

function saveJiraConfig(config) {
    const existing = readJiraConfig();
    const next = { ...existing, baseUrl: config.baseUrl.replace(/\/$/, ""), email: config.email, projectKey: config.projectKey };
    if (config.token && safeStorage.isEncryptionAvailable()) next.encryptedToken = safeStorage.encryptString(config.token).toString("base64");
    fs.writeFileSync(configPath(), JSON.stringify(next, null, 2));
}

async function jiraRequest(endpoint) {
    const config = readJiraConfig(true);
    if (!config.baseUrl || !config.email || !config.token) throw new Error("Configure Jira URL, email, and API token first.");
    const response = await fetch(`${config.baseUrl}${endpoint}`, { headers: { Authorization: `Basic ${Buffer.from(`${config.email}:${config.token}`).toString("base64")}`, Accept: "application/json" } });
    if (!response.ok) throw new Error(`Jira request failed (${response.status}). Check your URL, account, and API token.`);
    return response.json();
}

function createWindow() {
    const window = new BrowserWindow({
        width: 1280,
        height: 820,
        minWidth: 960,
        minHeight: 640,
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, "electron-preload.cjs"),
        },
    });

    if (isDevelopment) {
        window.loadURL("http://127.0.0.1:5173");
    } else {
        window.loadFile(path.join(__dirname, "dist", "index.html"));
    }
}

app.whenReady().then(createWindow);

ipcMain.handle("jira:get-config", () => readJiraConfig());
ipcMain.handle("jira:save-config", (_, config) => {
    saveJiraConfig(config);
    return readJiraConfig();
});
ipcMain.handle("jira:test-connection", async () => {
    const user = await jiraRequest("/rest/api/3/myself");
    return { displayName: user.displayName };
});
ipcMain.handle("jira:import-issues", async (_, projectKey) => {
    const data = await jiraRequest(`/rest/api/3/search?jql=${encodeURIComponent(`project = ${projectKey} ORDER BY updated DESC`)}&maxResults=100&fields=summary,description,priority,labels,status`);
    return data.issues.map(issue => ({
        jiraKey: issue.key,
        title: issue.fields.summary,
        description: typeof issue.fields.description === "string" ? issue.fields.description : "",
        priority: issue.fields.priority?.name || "Medium",
        labels: issue.fields.labels.map(name => ({ name, color: "#57606a" })),
        status: null,
        comments: [],
    }));
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});