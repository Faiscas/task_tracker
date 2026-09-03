import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportExcel(tasks) {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(tasks);

    XLSX.utils.book_append_sheet(
        workbook,
        sheet,
        "Tasks"
    );

    const file = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
    });

    saveAs(
        new Blob([file]),
        "EngineeringProductivity.xlsx"
    );
}
