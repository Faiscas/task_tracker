import { Plus } from "lucide-react";
import { useState } from "react";
import IssueModal from "./IssueModal";

export default function Backlog({ boards, onCreateIssue, onUpdateIssue, onDeleteIssue }) {
    const [selectedIssue, setSelectedIssue] = useState(undefined);
    const [creating, setCreating] = useState(false);
    const [boardFilter, setBoardFilter] = useState("all");
    const backlogIssues = boards.flatMap(board => board.items.filter(item => !item.status).map(item => ({ ...item, boardId: board.id, boardName: board.name }))).filter(issue => boardFilter === "all" || issue.boardId === boardFilter);

    const saveIssue = issue => {
        if (selectedIssue) onUpdateIssue(selectedIssue.boardId, issue.boardId, issue);
        else onCreateIssue(issue.boardId || boards[0]?.id, issue);
        setCreating(false); setSelectedIssue(selectedIssue ? { ...issue, boardId: issue.boardId || selectedIssue.boardId, boardName: issue.boardName || selectedIssue.boardName } : undefined);
    };

    return <section className="backlog-view"><header className="backlog-header"><div><p className="eyebrow">ISSUE BACKLOG</p><h2>Plan work before it reaches the board</h2></div><button className="primary-button" onClick={() => setCreating(true)}><Plus size={17} /> Add issue</button></header>
        <label className="backlog-filter">Board<select value={boardFilter} onChange={event => setBoardFilter(event.target.value)}><option value="all">All boards</option>{boards.map(board => <option value={board.id} key={board.id}>{board.name}</option>)}</select></label>
        <div className="backlog-list">{backlogIssues.length ? backlogIssues.map(issue => <button className="backlog-issue" key={issue.id} onClick={() => setSelectedIssue(issue)}><span>{issue.boardName}</span><strong>{issue.title}</strong><small>{issue.priority || "Medium"} priority</small></button>) : <p className="empty-state">No issues in the backlog.</p>}</div>
        {(creating || selectedIssue) && <IssueModal issue={creating ? null : selectedIssue} boards={boards} onClose={() => { setCreating(false); setSelectedIssue(undefined); }} onSave={saveIssue} onDelete={id => { onDeleteIssue(selectedIssue.boardId, id); setSelectedIssue(undefined); }} />}
    </section>;
}