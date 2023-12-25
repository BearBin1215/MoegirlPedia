import {
    utils,
    writeFile,
} from "xlsx/dist/xlsx.mini.min";
import './index.less';

document.querySelectorAll("table.wikitable").forEach((table) => {
    const exportButton = document.createElement("div");
    exportButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M17 12v5H3v-5H1v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5z"/><path d="M15 9h-4V1H9v8H5l5 6z"/></svg>';
    exportButton.classList.add("export-table-button");
    exportButton.title = "导出表格";

    exportButton.addEventListener("click", () => {
        writeFile(utils.table_to_book(table), "export.xlsx");
    });

    table.append(exportButton);
});