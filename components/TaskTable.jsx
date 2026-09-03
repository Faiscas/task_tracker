import { Search, Trash2 } from "lucide-react";
import { useState } from "react";

export default function TaskTable({ tasks, setTasks }) {
    const [search, setSearch] = useState("");
    const [selectedTag, setSelectedTag] = useState("");
    const removeTask = id => {
        setTasks(currentTasks => currentTasks.filter(task => task.id !== id));
    };

    const tags = [...new Set(tasks.flatMap(task => task.tags || []))];
    const filteredTasks = tasks.filter(task => {
        const term = search.toLowerCase();
        const matchesSearch = [task.taskName, task.project, task.type, task.notes, ...(task.tags || [])]
            .some(value => String(value || "").toLowerCase().includes(term));
        return matchesSearch && (!selectedTag || task.tags?.includes(selectedTag));
    });

    if (tasks.length === 0) {
        return <section className="empty-history"><p className="eyebrow">TASK HISTORY</p><h2>No completed tasks yet</h2><p className="empty-state">Completed timed issues will appear here.</p></section>;
    }

    return (
        <section className="task-table-wrap">
            <div className="table-header">
                <div>
                    <p className="eyebrow">HISTORY</p>
                    <h2>Completed Tasks</h2>
                </div>
                <label className="search-field">
                    <Search size={17} />
                    <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search tasks" />
                </label>
            </div>
            {tags.length > 0 && (
                <div className="tag-filter">
                    <button className={!selectedTag ? "tag active" : "tag"} onClick={() => setSelectedTag("")}>All</button>
                    {tags.map(tag => <button className={selectedTag === tag ? "tag active" : "tag"} key={tag} onClick={() => setSelectedTag(tag)}>{tag}</button>)}
                </div>
            )}
            <table>
                <thead>
                    <tr>
                        <th>Task</th>
                        <th>Project</th>
                        <th>Type</th>
                        <th>Tags</th>
                        <th>Actual Hours</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTasks.map(task => (
                        <tr key={task.id}>
                            <td>{task.taskName}</td>
                            <td>{task.project}</td>
                            <td>{task.type}</td>
                            <td>{(task.tags || []).map(tag => <span className="task-tag" key={tag}>{tag}</span>)}</td>
                            <td>{Number(task.actualHours || 0).toFixed(2)}</td>
                            <td>
                                <button className="icon-button delete-button" onClick={() => removeTask(task.id)} title="Delete task" aria-label="Delete task">
                                    <Trash2 size={17} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filteredTasks.length === 0 && <p className="empty-state">No tasks match this filter.</p>}
        </section>
    );
}