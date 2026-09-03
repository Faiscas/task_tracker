import { MessageSquarePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

const EMPTY_ISSUE = { title: "", estimatedHours: "", description: "", labels: [], priority: "Medium" };

export default function IssueModal({ issue, boards, onClose, onSave, onDelete }) {
    const [isEditing, setIsEditing] = useState(!issue);
    const [activeTab, setActiveTab] = useState(issue ? "details" : "edit");
    const [form, setForm] = useState(EMPTY_ISSUE);
    const [comment, setComment] = useState("");

    useEffect(() => {
        setIsEditing(!issue);
        setActiveTab(issue ? "details" : "edit");
        setForm(issue || EMPTY_ISSUE);
        setComment("");
    }, [issue]);

    const labels = form.labels || [];
    const updateLabel = (index, change) => setForm({ ...form, labels: labels.map((label, labelIndex) => labelIndex === index ? { ...label, ...change } : label) });
    const addLabel = () => setForm({ ...form, labels: [...labels, { name: "", color: "#238636" }] });
    const removeLabel = index => setForm({ ...form, labels: labels.filter((_, labelIndex) => labelIndex !== index) });
    const save = event => {
        event.preventDefault();
        if (!form.title.trim()) return;
        onSave({ ...form, title: form.title.trim(), description: form.description.trim() });
    };
    const addComment = () => {
        if (!comment.trim()) return;
        onSave({ ...issue, comments: [...(issue.comments || []), { id: crypto.randomUUID(), text: comment.trim(), createdAt: new Date().toISOString() }] });
        setComment("");
    };

    return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
        <form className="task-modal" onSubmit={save} onMouseDown={event => event.stopPropagation()}>
            <header><div><p className="eyebrow">{issue ? "ISSUE DETAILS" : "NEW ISSUE"}</p><h2>{isEditing ? "Configure issue" : issue.title}</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close issue"><X size={18} /></button></header>
            {issue && <nav className="modal-tabs" aria-label="Issue actions"><button className={activeTab === "details" ? "active" : ""} type="button" onClick={() => { setIsEditing(false); setActiveTab("details"); }}>Check issue</button><button className={activeTab === "edit" ? "active" : ""} type="button" onClick={() => { setIsEditing(true); setActiveTab("edit"); }}>Edit</button><button className={activeTab === "comments" ? "active" : ""} type="button" onClick={() => { setIsEditing(false); setActiveTab("comments"); }}>Comments</button></nav>}
            {isEditing ? <>
                <label>Task name<input autoFocus required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label>
                <label>Estimated time (hours)<input type="number" min="0" step="0.5" value={form.estimatedHours} onChange={event => setForm({ ...form, estimatedHours: event.target.value })} /></label>
                <label>Priority<select value={form.priority || "Medium"} onChange={event => setForm({ ...form, priority: event.target.value })}><option>Low</option><option>Medium</option><option>High</option><option>Very high</option></select></label>
                {boards && <label>Board<select value={form.boardId || boards[0]?.id || ""} onChange={event => setForm({ ...form, boardId: event.target.value })}>{boards.map(board => <option value={board.id} key={board.id}>{board.name}</option>)}</select></label>}
                <label>Description<textarea value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} /></label>
                <section className="tag-editor"><div className="tag-editor-heading"><span>Tags</span><button className="secondary-button" type="button" onClick={addLabel}><Plus size={16} /> Add tag</button></div>{labels.map((label, index) => <div className="label-fields" key={index}><label>Tag name<input value={label.name} onChange={event => updateLabel(index, { name: event.target.value })} /></label><label>Tag colour<input className="color-input" type="color" value={label.color} onChange={event => updateLabel(index, { color: event.target.value })} /></label><button className="icon-button delete-button" type="button" onClick={() => removeLabel(index)} aria-label="Remove tag"><X size={16} /></button></div>)}</section>
            </> : activeTab === "details" ? <div className="issue-details"><p><b>Tags</b>{labels.length ? <span className="detail-tags">{labels.map(label => <span className="board-label" key={label.name} style={{ "--label-color": label.color }}>{label.name}</span>)}</span> : "None"}</p><p><b>Priority</b>{issue.priority || "Medium"}</p><p><b>Description</b>{issue.description || "No description"}</p><p><b>Estimated time</b>{issue.estimatedHours ? `${issue.estimatedHours}h` : "Not set"}</p></div> : <section className="issue-comments"><h3>Comments</h3>{issue.comments?.length ? <div className="comment-list">{issue.comments.map(entry => <article className="comment" key={entry.id}><time>{new Date(entry.createdAt).toLocaleString()}</time><p>{entry.text}</p></article>)}</div> : <p className="empty-state">No comments yet.</p>}<div className="comment-form"><textarea value={comment} onChange={event => setComment(event.target.value)} placeholder="Add a progress note" /><button className="secondary-button" type="button" onClick={addComment}><MessageSquarePlus size={16} /> Add comment</button></div></section>}
            <footer>{isEditing ? <><button className="secondary-button" type="button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">Save issue</button></> : activeTab === "details" ? <button className="danger-button" type="button" onClick={() => onDelete(issue.id)}><Trash2 size={16} /> Delete</button> : <button className="secondary-button" type="button" onClick={onClose}>Close</button>}</footer>
        </form>
    </div>;
}