export default function KPICards({ tasks }) {
    const totalHours = tasks.reduce((total, task) => total + Number(task.actualHours || 0), 0);
    const estimatedHours = tasks.reduce((total, task) => total + Number(task.estimatedHours || 0), 0);
    const completionDays = new Set(tasks.map(task => task.endTime?.slice(0, 10)).filter(Boolean)).size;
    const meanDailyCompletions = completionDays ? tasks.length / completionDays : 0;
    const metrics = [
        ["Reported time", `${totalHours.toFixed(1)}h`],
        ["Estimated time", `${estimatedHours.toFixed(1)}h`],
        ["Daily completions", meanDailyCompletions.toFixed(1)],
    ];

    return (
        <section className="kpi-cards">
            {metrics.map(([label, value]) => (
                <article className="kpi-card" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                </article>
            ))}
        </section>
    );
}