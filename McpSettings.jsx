import { Pencil, Plus, ServerCog, Trash2, X } from "lucide-react";
import { useState } from "react";

const EMPTY_SERVER = { name: "", transport: "stdio", command: "", args: "", url: "", environment: "" };

export default function McpSettings({ servers, onSave, onDelete }) {
    const [editingServer, setEditingServer] = useState(null);
    const [form, setForm] = useState(EMPTY_SERVER);

    const openEditor = server => {
        setEditingServer(server || {});
        setForm(server ? { ...EMPTY_SERVER, ...server } : EMPTY_SERVER);
    };

    const saveServer = event => {
        event.preventDefault();
        if (!form.name.trim() || (form.transport === "stdio" && !form.command.trim()) || (form.transport === "http" && !form.url.trim())) return;
        onSave({ ...form, id: editingServer?.id || crypto.randomUUID(), name: form.name.trim(), args: form.args.trim(), environment: form.environment.trim() });
        setEditingServer(null);
    };

    return <section className="mcp-settings">
        <header className="backlog-header"><div><p className="eyebrow">MCP INTEGRATIONS</p><h2>Configure Model Context Protocol servers</h2><p className="muted">Servers are stored locally for this app.</p></div><button className="primary-button" onClick={() => openEditor()}><Plus size={17} /> Add MCP</button></header>
        <div className="mcp-list">{servers.length ? servers.map(server => <article className="mcp-server" key={server.id}><span className="mcp-server-icon"><ServerCog size={20} /></span><div><strong>{server.name}</strong><p>{server.transport === "stdio" ? server.command : server.url}</p></div><span className="mcp-transport">{server.transport}</span><button className="icon-button" onClick={() => openEditor(server)} title={`Edit ${server.name}`} aria-label={`Edit ${server.name}`}><Pencil size={17} /></button><button className="icon-button delete-button" onClick={() => onDelete(server.id)} title={`Delete ${server.name}`} aria-label={`Delete ${server.name}`}><Trash2 size={17} /></button></article>) : <p className="empty-state">No MCP servers configured.</p>}</div>
        {editingServer && <div className="modal-backdrop" role="presentation" onMouseDown={() => setEditingServer(null)}><form className="task-modal mcp-modal" onSubmit={saveServer} onMouseDown={event => event.stopPropagation()}><header><div><p className="eyebrow">MCP SERVER</p><h2>{editingServer.id ? "Edit MCP" : "Add MCP"}</h2></div><button className="icon-button" type="button" onClick={() => setEditingServer(null)} aria-label="Close MCP configuration"><X size={18} /></button></header><label>Server name<input autoFocus required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Example: GitHub MCP" /></label><label>Transport<select value={form.transport} onChange={event => setForm({ ...form, transport: event.target.value })}><option value="stdio">stdio (local command)</option><option value="http">HTTP / SSE URL</option></select></label>{form.transport === "stdio" ? <><label>Command<input required value={form.command} onChange={event => setForm({ ...form, command: event.target.value })} placeholder="npx" /></label><label>Arguments<input value={form.args} onChange={event => setForm({ ...form, args: event.target.value })} placeholder="-y @modelcontextprotocol/server-github" /></label></> : <label>Server URL<input required type="url" value={form.url} onChange={event => setForm({ ...form, url: event.target.value })} placeholder="https://mcp.example.com" /></label>}<label>Environment variables<textarea value={form.environment} onChange={event => setForm({ ...form, environment: event.target.value })} placeholder="NAME=value&#10;OTHER_NAME=value" /></label><footer><button className="secondary-button" type="button" onClick={() => setEditingServer(null)}>Cancel</button><button className="primary-button" type="submit">Save MCP</button></footer></form></div>}
    </section>;
}