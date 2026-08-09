import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  // Set column widths
  const wscols = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
  worksheet['!cols'] = wscols;

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);

  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(fieldName => {
        let value = row[fieldName] === null || row[fieldName] === undefined ? '' : String(row[fieldName]);
        // Handle commas in values
        if (value.includes(',')) {
          value = `"${value}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportToPDF(data: any[], columns: any[], title: string, filename: string) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const timestamp = new Date().toLocaleString('pt-BR');

  // Header
  doc.setFontSize(16);
  doc.setTextColor(0, 87, 255); // vessel-blue #0057FF
  doc.text('VESSEL - GESTÃO DE COLABORADORES', 40, 40);

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text('GESTÃO INTEGRADA DE COLABORADORES', 40, 55);

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(title, 40, 80);

  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(`Gerado em: ${timestamp}`, 40, 95);

  // Blue line separator
  doc.setDrawColor(0, 87, 255);
  doc.setLineWidth(1);
  doc.line(40, 105, doc.internal.pageSize.getWidth() - 40, 105);

  // Table
  const tableData = data.map(item => columns.map(col => item[col.dataKey]));
  const head = [columns.map(col => col.header)];

  autoTable(doc, {
    startY: 120,
    head: head,
    body: tableData,
    theme: 'grid',
    margin: { left: 32, right: 32 },
    tableWidth: 'auto',
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [0, 87, 255] },
    didDrawPage: function (data) {
      // Footer
      const str = 'Emitido pelo Sistema Vessel - Página ' + (doc as any).getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150);
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      doc.text(str, data.settings.margin.left, pageHeight - 20);
    }
  });

  doc.save(`${filename}.pdf`);
}

export function printReport() {
  window.print();
}
