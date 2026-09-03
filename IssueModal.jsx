import { Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

const EMPTY_ISSUE = { title: "", estimatedHours: "", description: "", labels: [], priority: "Medium" };

export default function IssueModal({ issue, boards, onClose, onSave, onDelete }) {
    const [isEditing, setIsEditing] = useState(!issue);
    const [form, setForm] = useState(EMPTY_ISSUE);

    useEffect(() => {
        setIsEditing(!issue);
        setForm(issue || EMPTY_ISSUE);
    }, [issue]);

    const label = form.labels?.[0] || { name: "", color: "#238636" };
    const updateLabel = change => setForm({ ...form, labels: change.name.trim() ? [{ ...label, ...change }] : [] });
    const save = event => {
        event.preventDefault();
        if (!form.title.trim()) return;
        onSave({ ...form, title: form.title.trim(), description: form.description.trim() });
    };

    return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
        <form className="task-modal" onSubmit={save} onMouseDown={event => event.stopPropagation()}>
            <header><div><p className="eyebrow">{issue ? "ISSUE DETAILS" : "NEW ISSUE"}</p><h2>{isEditing ? "Configure issue" : issue.title}</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close issue"><X size={18} /></button></header>
            {isEditing ? <>
                <label>Task name<input autoFocus required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label>
                <label>Estimated time (hours)<input type="number" min="0" step="0.5" value={form.estimatedHours} onChange={event => setForm({ ...form, estimatedHours: event.target.value })} /></label>
                <label>Priority<select value={form.priority || "Medium"} onChange={event => setForm({ ...form, priority: event.target.value })}><option>Low</option><option>Medium</option><option>High</option><option>Very high</option></select></label>
                {boards && <label>Board<select value={form.boardId || boards[0]?.id || ""} onChange={event => setForm({ ...form, boardId: event.target.value })}>{boards.map(board => <option value={board.id} key={board.id}>{board.name}</option>)}</select></label>}
                <label>Description<textarea value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} /></label>
                <div className="label-fields"><label>Tag name<input value={label.name} onChange={event => updateLabel({ name: event.target.value, color: label.color })} /></label><label>Tag colour<input className="color-input" type="color" value={label.color} onChange={event => updateLabel({ name: label.name, color: event.target.value })} /></label></div>
            </> : <div className="issue-details"><p><b>Tag</b>{label.name ? <span className="board-label" style={{ "--label-color": label.color }}>{label.name}</span> : "None"}</p><p><b>Priority</b>{issue.priority || "Medium"}</p><p><b>Description</b>{issue.description || "No description"}</p><p><b>Estimated time</b>{issue.estimatedHours ? `${issue.estimatedHours}h` : "Not set"}</p></div>}
            <footer>{isEditing ? <><button className="secondary-button" type="button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">Save issue</button></> : <><button className="secondary-button" type="button" onClick={() => setIsEditing(true)}><Pencil size={16} /> Edit</button><button className="danger-button" type="button" onClick={() => onDelete(issue.id)}><Trash2 size={16} /> Delete</button></>}</footer>
        </form>
    </div>;
}