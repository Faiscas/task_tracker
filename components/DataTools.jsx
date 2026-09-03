import { Download, Upload } from "lucide-react";

export default function DataTools({ data, onRestore }) {
    const exportData = () => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
        link.download = `engineering-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
    };
    const restoreData = event => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try { onRestore(JSON.parse(reader.result)); }
            catch { window.alert("That file is not a valid tracker backup."); }
        };
        reader.readAsText(file);
        event.target.value = "";
    };
    return <section className="data-tools"><div className="data-tools-heading"><p className="eyebrow">DATA PORTABILITY</p><h2>Back up your workspace</h2><p className="muted">Keep a portable copy of every board, issue, timer entry, and preference.</p></div><div className="data-tool-grid"><article><Download size={20} /><div><h3>Export a backup</h3><p>Download a JSON snapshot of your workspace.</p></div><button className="secondary-button" onClick={exportData}>Export JSON</button></article><article><Upload size={20} /><div><h3>Restore a backup</h3><p>Replace local data with a previous JSON snapshot.</p></div><label className="secondary-button">Restore JSON<input type="file" accept="application/json" onChange={restoreData} /></label></article></div></section>;
}
