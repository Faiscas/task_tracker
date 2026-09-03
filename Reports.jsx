import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { exportCSV } from "./csvExport";
import { exportExcel } from "./ExcelExport";

export default function Reports({ tasks }) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyTasks = tasks.filter(task => task.endTime?.startsWith(currentMonth));
    const managementRows = tasks.map(task => ({
        Project: task.project,
        Task: task.taskName,
        "Reported time": Number(task.actualHours || 0).toFixed(2),
        "Estimated time": task.estimatedHours,
    }));

    const downloadManagementKpis = () => {
        const headers = Object.keys(managementRows[0] || { Project: "", Task: "" });
        const content = [headers.join(","), ...managementRows.map(row => headers.map(header => `"${String(row[header]).replaceAll('"', '""')}"`).join(","))].join("\n");
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([content], { type: "text/csv" }));
        link.download = "management-kpis.csv";
        link.click();
        URL.revokeObjectURL(link.href);
    };

    return (
        <section className="reports-panel">
            <div>
                <p className="eyebrow">REPORTING</p>
                <h2>Ready when review time arrives</h2>
                <p className="muted">This month: {monthlyTasks.length} completed tasks</p>
            </div>
            <div className="report-actions">
                <button className="secondary-button" onClick={() => exportCSV(monthlyTasks)}><Download size={17} /> Monthly CSV</button>
                <button className="secondary-button" onClick={() => exportExcel(monthlyTasks)}><FileSpreadsheet size={17} /> Monthly Excel</button>
                <button className="secondary-button" onClick={() => window.print()}><Printer size={17} /> Print / PDF</button>
                <button className="primary-button" onClick={downloadManagementKpis}><Download size={17} /> KPI export</button>
            </div>
        </section>
    );
}