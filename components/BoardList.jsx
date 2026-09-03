import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

export default function BoardList({ boards, onCreate, onOpen, onDelete, onRename }) {
    const [name, setName] = useState("");
    const [editingBoardId, setEditingBoardId] = useState(null);
    const [editingName, setEditingName] = useState("");

    const createBoard = event => {
        event.preventDefault();
        if (!name.trim()) return;
        onCreate(name.trim());
        setName("");
    };

    const saveName = boardId => {
        if (editingName.trim()) onRename(boardId, editingName.trim());
        setEditingBoardId(null);
    };

    return <section className="boards-view">
        <header className="backlog-header"><div><p className="eyebrow">PROJECT BOARDS</p><h2>Choose a board to plan and track work</h2></div></header>
        <form className="new-board-form" onSubmit={createBoard}><input value={name} onChange={event => setName(event.target.value)} placeholder="New board name" /><button className="primary-button" type="submit"><Plus size={17} /> Create board</button></form>
        <div className="board-list">{boards.map(board => <article className="board-list-item" key={board.id}>{editingBoardId === board.id ? <div className="board-rename"><input autoFocus value={editingName} onChange={event => setEditingName(event.target.value)} onKeyDown={event => event.key === "Enter" && saveName(board.id)} /><button className="icon-button" onClick={() => saveName(board.id)} aria-label="Save board name"><Check size={17} /></button><button className="icon-button" onClick={() => setEditingBoardId(null)} aria-label="Cancel board rename"><X size={17} /></button></div> : <><button className="board-open-button" onClick={() => onOpen(board.id)}><strong>{board.name}</strong><span>{board.items.length} issues</span></button><button className="icon-button" onClick={() => { setEditingName(board.name); setEditingBoardId(board.id); }} aria-label={`Rename ${board.name}`} title={`Rename ${board.name}`}><Pencil size={17} /></button><button className="icon-button delete-button" onClick={() => onDelete(board.id)} aria-label={`Delete ${board.name}`} title={`Delete ${board.name}`}><Trash2 size={17} /></button></>}</article>)}</div>
    </section>;
}