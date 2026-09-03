const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("jira", {
    getConfig: () => ipcRenderer.invoke("jira:get-config"),
    saveConfig: config => ipcRenderer.invoke("jira:save-config", config),
    testConnection: () => ipcRenderer.invoke("jira:test-connection"),
    importIssues: projectKey => ipcRenderer.invoke("jira:import-issues", projectKey),
});