export function exportCSV(tasks) {
    const headers = [
        "Task",
        "Project",
        "Type",
        "Start",
        "End",
        "Estimated",
        "Actual",
    ];

    const rows = tasks.map(task => [
        task.taskName,
        task.project,
        task.type,
        task.startTime,
        task.endTime,
        task.estimatedHours,
        task.actualHours,
    ]);

    const csv = [
        headers.join(","),
        ...rows.map(row =>
            row.map(value => `"${value}"`).join(",")
        ),
    ].join("\n");

    const blob = new Blob([csv], {
        type: "text/csv",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "productivity-report.csv";
    link.click();
}
