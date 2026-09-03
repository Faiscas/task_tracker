import { ArrowDown, ArrowUp, ChevronsUp, GripVertical, Minus, Pencil, X } from "lucide-react";
import { useState } from "react";
import IssueModal from "./IssueModal";

export const DEFAULT_COLUMNS = [
    { id: "todo", label: "TODO", color: "#6e7781" },
    { id: "ongoing", label: "Ongoing", color: "#0969da" },
    { id: "done", label: "Done", color: "#1a7f37" },
];

const EMPTY_COLUMN = { id: "", label: "", color: "#0969da" };
const PRIORITY_ICONS = {
    Low: { Icon: ArrowDown, className: "priority-low" },
    Medium: { Icon: Minus, className: "priority-medium" },
    High: { Icon: ArrowUp, className: "priority-high" },
    "Very high": { Icon: ChevronsUp, className: "priority-very-high" },
};

export default function Kanban({ boardItems, setBoardItems, boardColumns, setBoardColumns, isAddingColumn, setIsAddingColumn, isAddingIssue, setIsAddingIssue }) {
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [columnEditor, setColumnEditor] = useState(null);
    const [columnForm, setColumnForm] = useState(EMPTY_COLUMN);
    const [selectedBacklogIssue, setSelectedBacklogIssue] = useState("");
    const columns = boardColumns.length ? boardColumns : DEFAULT_COLUMNS;
    const backlogIssues = boardItems.filter(item => !item.status);

    const closeColumnEditor = () => {
        setColumnEditor(null);
        setIsAddingColumn(false);
    };

    const saveColumn = event => {
        event.preventDefault();
        if (!columnForm.label.trim()) return;
        setBoardColumns(currentColumns => {
            const source = currentColumns.length ? currentColumns : DEFAULT_COLUMNS;
            return columnEditor
                ? source.map(column => column.id === columnForm.id ? { ...columnForm, label: columnForm.label.trim() } : column)
                : [...source, { ...columnForm, id: crypto.randomUUID(), label: columnForm.label.trim() }];
        });
        closeColumnEditor();
    };

    const moveItem = (event, status) => {
        event.preventDefault();
        const itemId = event.dataTransfer.getData("text/plain");
        setBoardItems(items => items.map(item => item.id === itemId ? { ...item, status } : item));
    };

    const moveColumn = (event, targetId) => {
        event.preventDefault();
        const sourceId = event.dataTransfer.getData("application/x-kanban-column");
        if (!sourceId || sourceId === targetId) return;
        setBoardColumns(currentColumns => {
            const columnsToOrder = currentColumns.length ? [...currentColumns] : [...DEFAULT_COLUMNS];
            const sourceIndex = columnsToOrder.findIndex(column => column.id === sourceId);
            const targetIndex = columnsToOrder.findIndex(column => column.id === targetId);
            const [movedColumn] = columnsToOrder.splice(sourceIndex, 1);
            columnsToOrder.splice(targetIndex, 0, movedColumn);
            return columnsToOrder;
        });
    };

    const placeBacklogIssue = status => {
        if (!selectedBacklogIssue || !status) return;
        setBoardItems(items => items.map(item => item.id === selectedBacklogIssue ? { ...item, status } : item));
        setSelectedBacklogIssue("");
    };

    const saveIssue = issue => {
        setBoardItems(items => items.map(item => item.id === issue.id ? issue : item));
        setSelectedIssue(issue);
    };
    const createIssue = issue => {
        setBoardItems(items => [...items, { ...issue, id: crypto.randomUUID(), status: columns[0]?.id || "todo" }]);
        setIsAddingIssue(false);
    };

    return <>
        <section className="board-intake">
            <select value={selectedBacklogIssue} onChange={event => setSelectedBacklogIssue(event.target.value)}>
                <option value="">Select an issue from backlog</option>
                {backlogIssues.map(issue => <option value={issue.id} key={issue.id}>{issue.title}</option>)}
            </select>
            <select defaultValue="" disabled={!selectedBacklogIssue} onChange={event => { placeBacklogIssue(event.target.value); event.target.value = ""; }}>
                <option value="">Add to board status...</option>
                {columns.map(column => <option value={column.id} key={column.id}>{column.label}</option>)}
            </select>
        </section>
        <section className="kanban-board">
            {columns.map(column => {
                const columnItems = boardItems.filter(item => item.status === column.id);
                return <div className="kanban-column" key={column.id} draggable onDragStart={event => event.dataTransfer.setData("application/x-kanban-column", column.id)} onDragOver={event => event.preventDefault()} onDrop={event => event.dataTransfer.types.includes("application/x-kanban-column") ? moveColumn(event, column.id) : moveItem(event, column.id)}>
                    <header className="kanban-column-header">
                        <span className="column-color" style={{ backgroundColor: column.color }} />
                        <h2><GripVertical size={15} />{column.label}</h2>
                        <span>{columnItems.length}</span>
                        <button className="column-edit-button" onClick={() => { setColumnForm(column); setColumnEditor(column.id); }} title={`Edit ${column.label}`} aria-label={`Edit ${column.label}`}><Pencil size={15} /></button>
                    </header>
                    <div className="kanban-cards">{columnItems.map(item => {
                        const labels = item.labels || [];
                        const label = labels[0];
                        const priority = PRIORITY_ICONS[item.priority || "Medium"];
                        const PriorityIcon = priority.Icon;
                        return <article className="kanban-card" key={item.id} draggable onClick={() => setSelectedIssue(item)} onDragStart={event => { event.stopPropagation(); event.dataTransfer.setData("text/plain", item.id); }}>
                            <div className="ticket-content"><strong>{item.title}</strong>{labels.length > 0 && <span className="ticket-tags">{labels.map(ticketLabel => <span className="board-label" key={ticketLabel.name} style={{ "--label-color": ticketLabel.color }}>{ticketLabel.name}</span>)}</span>}</div>
                            <span className={`priority-icon ${priority.className}`} title={`${item.priority || "Medium"} priority`} aria-label={`${item.priority || "Medium"} priority`}><PriorityIcon size={18} /></span>
                            {label && <span className="ticket-accent" style={{ backgroundColor: label.color }} aria-hidden="true" />}
                        </article>;
                    })}</div>
                    <p className="column-drop-hint">Drag issues here</p>
                </div>;
            })}
        </section>
        {(columnEditor || isAddingColumn) && <div className="modal-backdrop" role="presentation" onMouseDown={closeColumnEditor}><form className="task-modal column-modal" onSubmit={saveColumn} onMouseDown={event => event.stopPropagation()}>
            <header><div><p className="eyebrow">STATUS COLUMN</p><h2>{columnEditor ? "Edit status" : "Add status"}</h2></div><button className="icon-button" type="button" onClick={closeColumnEditor} aria-label="Close status editor"><X size={18} /></button></header>
            <label>Status name<input autoFocus required value={columnForm.label} onChange={event => setColumnForm({ ...columnForm, label: event.target.value })} /></label>
            <label>Colour<input className="color-input" type="color" value={columnForm.color} onChange={event => setColumnForm({ ...columnForm, color: event.target.value })} /></label>
            <footer><button className="secondary-button" type="button" onClick={closeColumnEditor}>Cancel</button><button className="primary-button" type="submit">Save status</button></footer>
        </form></div>}
        {isAddingIssue && <IssueModal issue={null} onClose={() => setIsAddingIssue(false)} onSave={createIssue} onDelete={() => {}} />}
        {selectedIssue && <IssueModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} onSave={saveIssue} onDelete={id => { setBoardItems(items => items.filter(item => item.id !== id)); setSelectedIssue(null); }} />}
    </>;
}
