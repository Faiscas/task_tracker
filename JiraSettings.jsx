import { Download, KeyRound, PlugZap, Save } from "lucide-react";
import { useEffect, useState } from "react";

const EMPTY_CONFIG = { baseUrl: "", email: "", token: "", projectKey: "" };

export default function JiraSettings({ boards, onImport }) {
    const [config, setConfig] = useState(EMPTY_CONFIG);
    const [targetBoardId, setTargetBoardId] = useState(boards[0]?.id || "");
    const [message, setMessage] = useState("");
    const [isBusy, setIsBusy] = useState(false);
    const desktopJira = window.jira;

    useEffect(() => {
        if (!desktopJira) return;
        desktopJira.getConfig().then(savedConfig => setConfig(current => ({ ...current, ...savedConfig }))).catch(() => setMessage("Could not load Jira configuration."));
    }, [desktopJira]);

    const saveConfig = async event => {
        event.preventDefault();
        if (!desktopJira) return;
        setIsBusy(true);
        try {
            const savedConfig = await desktopJira.saveConfig(config);
            setConfig(current => ({ ...current, ...savedConfig, token: "" }));
            setMessage("Jira access settings saved locally.");
        } catch (error) {
            setMessage(error.message);
        } finally {
            setIsBusy(false);
        }
    };

    const testConnection = async () => {
        setIsBusy(true);
        try {
            const user = await desktopJira.testConnection();
            setMessage(`Connected as ${user.displayName}.`);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setIsBusy(false);
        }
    };

    const importIssues = async () => {
        if (!config.projectKey.trim() || !targetBoardId) return;
        setIsBusy(true);
        try {
            const issues = await desktopJira.importIssues(config.projectKey.trim());
            onImport(targetBoardId, issues);
            setMessage(`${issues.length} Jira issues added to the board backlog.`);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setIsBusy(false);
        }
    };

    if (!desktopJira) return <section className="jira-settings"><p className="eyebrow">JIRA INTEGRATION</p><h2>Desktop app required</h2><p className="empty-state">Jira credentials are protected by the Electron desktop app. Launch the packaged app to configure this integration.</p></section>;

    return <section className="jira-settings">
        <div><p className="eyebrow">JIRA INTEGRATION</p><h2>Connect your Jira project</h2><p className="muted">Credentials are stored locally with Windows credential encryption.</p></div>
        <form className="jira-form" onSubmit={saveConfig}>
            <label>Jira Cloud URL<input required type="url" placeholder="https://company.atlassian.net" value={config.baseUrl} onChange={event => setConfig({ ...config, baseUrl: event.target.value })} /></label>
            <label>Atlassian account email<input required type="email" value={config.email} onChange={event => setConfig({ ...config, email: event.target.value })} /></label>
            <label>Jira API token<input required type="password" placeholder="Enter token to save or replace it" value={config.token} onChange={event => setConfig({ ...config, token: event.target.value })} /></label>
            <label>Default project key<input required placeholder="ENG" value={config.projectKey} onChange={event => setConfig({ ...config, projectKey: event.target.value.toUpperCase() })} /></label>
            <div className="jira-actions"><button className="primary-button" type="submit" disabled={isBusy}><Save size={17} /> Save access</button><button className="secondary-button" type="button" onClick={testConnection} disabled={isBusy}><PlugZap size={17} /> Test connection</button></div>
        </form>
        <section className="jira-import"><div><h3>Import project issues</h3><p className="muted">Imports the latest 100 issues into the selected board’s Backlog.</p></div><label>Target board<select value={targetBoardId} onChange={event => setTargetBoardId(event.target.value)}>{boards.map(board => <option value={board.id} key={board.id}>{board.name}</option>)}</select></label><button className="secondary-button" type="button" onClick={importIssues} disabled={isBusy || !boards.length}><Download size={17} /> Import issues</button></section>
        {message && <p className="jira-message"><KeyRound size={16} /> {message}</p>}
    </section>;
}