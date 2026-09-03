import { CalendarDays, Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";

const EMPTY_ENTRY = { taskName: "", project: "", type: "Manual", actualHours: "", endTime: new Date().toISOString() };

export default function Timesheet({ tasks, setTasks }) {
    const [entry, setEntry] = useState(null);
    const [period, setPeriod] = useState("week");
    const visibleTasks = useMemo(() => {
        const start = new Date();
        start.setDate(start.getDate() - (period === "week" ? 6 : 29));
        start.setHours(0, 0, 0, 0);
        return tasks.filter(task => new Date(task.endTime) >= start);
    }, [tasks, period]);
    const dailyTotals = visibleTasks.reduce((totals, task) => {
        const day = task.endTime?.slice(0, 10);
        if (day) totals[day] = (totals[day] || 0) + Number(task.actualHours || 0);
        return totals;
    }, {});
    const saveEntry = event => {
        event.preventDefault();
        if (!entry.taskName.trim() || !entry.actualHours) return;
        const saved = { ...entry, id: entry.id || crypto.randomUUID(), taskName: entry.taskName.trim(), actualHours: Number(entry.actualHours), startTime: entry.startTime || entry.endTime };
        setTasks(current => entry.id ? current.map(task => task.id === entry.id ? saved : task) : [saved, ...current]);
        setEntry(null);
    };

    const totalHours = visibleTasks.reduce((total, task) => total + Number(task.actualHours || 0), 0);
    return <section className="timesheet-view">
        <header className="timesheet-header"><div><p className="eyebrow">TIME REVIEW</p><h2>Daily timesheet</h2><p className="muted">Review logged work and add manual time when needed.</p></div><button className="primary-button" onClick={() => setEntry(EMPTY_ENTRY)}><Plus size={17} /> Manual entry</button></header>
        <section className="timesheet-overview"><div className="timesheet-toolbar"><button className={period === "week" ? "tag active" : "tag"} onClick={() => setPeriod("week")}>Last 7 days</button><button className={period === "month" ? "tag active" : "tag"} onClick={() => setPeriod("month")}>Last 30 days</button></div><strong>{totalHours.toFixed(2)}h <span>logged</span></strong></section>
        <section className="timesheet-panel"><h3>Daily totals</h3><div className="daily-summary">{Object.entries(dailyTotals).sort(([first], [second]) => second.localeCompare(first)).map(([day, hours]) => <article key={day}><CalendarDays size={17} /><span>{new Date(`${day}T00:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span><strong>{hours.toFixed(2)}h</strong></article>) || <p className="empty-state">No time entries in this period.</p>}</div></section>
        <section className="timesheet-panel"><h3>Time entries</h3><div className="timesheet-entries">{visibleTasks.length ? visibleTasks.map(task => <article key={task.id}><div><strong>{task.taskName}</strong><span>{task.project || "Manual entry"}</span></div><time>{new Date(task.endTime).toLocaleString()}</time><strong>{Number(task.actualHours || 0).toFixed(2)}h</strong><button className="icon-button" onClick={() => setEntry({ ...task, actualHours: String(task.actualHours) })} aria-label={`Edit ${task.taskName}`}><Pencil size={16} /></button></article>) : <p className="empty-state">No time entries in this period.</p>}</div></section>
        {entry && <div className="modal-backdrop" role="presentation" onMouseDown={() => setEntry(null)}><form className="task-modal" onSubmit={saveEntry} onMouseDown={event => event.stopPropagation()}><header><div><p className="eyebrow">TIME ENTRY</p><h2>{entry.id ? "Edit time entry" : "Add manual time"}</h2></div></header><label>Task<input autoFocus required value={entry.taskName} onChange={event => setEntry({ ...entry, taskName: event.target.value })} /></label><label>Board or project<input value={entry.project} onChange={event => setEntry({ ...entry, project: event.target.value })} /></label><label>Date and time<input type="datetime-local" required value={new Date(entry.endTime).toISOString().slice(0, 16)} onChange={event => setEntry({ ...entry, endTime: new Date(event.target.value).toISOString() })} /></label><label>Hours<input type="number" min="0.01" step="0.25" required value={entry.actualHours} onChange={event => setEntry({ ...entry, actualHours: event.target.value })} /></label><footer><button className="secondary-button" type="button" onClick={() => setEntry(null)}>Cancel</button><button className="primary-button" type="submit">Save entry</button></footer></form></div>}
    </section>;
}
