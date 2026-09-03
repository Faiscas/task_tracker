import { useEffect, useState } from "react";
import { Pause, Play, Square } from "lucide-react";

export default function TaskForm({ activeTask, setActiveTask, setTasks, boardIssues, onStartIssue }) {
    const [selectedIssueId, setSelectedIssueId] = useState("");
    const [elapsedMs, setElapsedMs] = useState(0);
    const selectedIssue = boardIssues.find(issue => issue.id === selectedIssueId);

    const startTask = () => {
        if (!selectedIssue) return;
        const now = new Date().toISOString();
        setActiveTask({
            issueId: selectedIssue.id,
            taskName: selectedIssue.title,
            project: selectedIssue.boardName,
            type: selectedIssue.priority || "Medium",
            notes: selectedIssue.description || "",
            estimatedHours: selectedIssue.estimatedHours || "",
            tags: selectedIssue.labels?.map(label => label.name) || [],
            startTime: now,
            lastStartedAt: now,
            elapsedMs: 0,
            isPaused: false,
        });
        onStartIssue(selectedIssue);
    };

    const pauseTask = () => {
        const elapsedMs = activeTask.elapsedMs + (Date.now() - new Date(activeTask.lastStartedAt).getTime());
        setActiveTask({ ...activeTask, elapsedMs, isPaused: true, lastStartedAt: null });
    };

    const resumeTask = () => setActiveTask({ ...activeTask, isPaused: false, lastStartedAt: new Date().toISOString() });

    const stopTask = () => {
        const endTime = new Date().toISOString();
        const durationMs = activeTask.elapsedMs + (activeTask.isPaused ? 0 : Date.now() - new Date(activeTask.lastStartedAt).getTime());
        setTasks(currentTasks => [{ id: crypto.randomUUID(), ...activeTask, endTime, actualHours: durationMs / 3600000 }, ...currentTasks]);
        setActiveTask(null);
        setSelectedIssueId("");
    };

    useEffect(() => {
        if (!activeTask) {
            setElapsedMs(0);
            return;
        }
        const updateElapsed = () => setElapsedMs(activeTask.elapsedMs + (activeTask.isPaused ? 0 : Date.now() - new Date(activeTask.lastStartedAt).getTime()));
        updateElapsed();
        const intervalId = activeTask.isPaused ? null : window.setInterval(updateElapsed, 1000);
        return () => intervalId && window.clearInterval(intervalId);
    }, [activeTask]);

    const elapsedLabel = new Date(elapsedMs).toISOString().slice(11, 19);

    return <section className="task-form card">
        {!activeTask ? <>
            <div className="form-heading"><p className="eyebrow">TRACK TIME</p><h2>What are you working on?</h2></div>
            <label className="issue-selector">Kanban issue<select value={selectedIssueId} onChange={event => setSelectedIssueId(event.target.value)}><option value="">Select an issue on a board</option>{boardIssues.map(issue => <option key={issue.id} value={issue.id}>{issue.boardName}: {issue.title}</option>)}</select></label>
            <button className="primary-button" onClick={startTask} disabled={!selectedIssue}><Play size={17} /> Start timer</button>
            {!boardIssues.length && <p className="empty-state">Add an issue to a board before tracking it.</p>}
        </> : <div className="active-timer"><div><p className="eyebrow">{activeTask.isPaused ? "PAUSED" : "IN PROGRESS"}</p><h2>{activeTask.taskName}</h2></div><strong>{elapsedLabel}</strong><div className="timer-actions"><button className="secondary-button" onClick={activeTask.isPaused ? resumeTask : pauseTask}>{activeTask.isPaused ? <Play size={17} /> : <Pause size={17} />}{activeTask.isPaused ? "Resume" : "Pause"}</button><button className="primary-button" onClick={stopTask}><Square size={16} /> Complete</button></div></div>}
    </section>;
}
