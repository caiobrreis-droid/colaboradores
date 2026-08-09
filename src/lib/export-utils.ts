export function exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1') {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const escapeXml = (value: unknown) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
  const safeSheetName = sheetName.replace(/[\\/?*\[\]:]/g, ' ').slice(0, 31) || 'Relatório';
  const row = (values: unknown[]) => `<Row>${values.map((value) => `<Cell><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`).join('')}</Row>`;
  const columns = headers.map(() => '<Column ss:AutoFitWidth="0" ss:Width="120"/>').join('');
  const workbook = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="${escapeXml(safeSheetName)}"><Table>${columns}${row(headers)}${data.map((item) => row(headers.map((header) => item[header]))).join('')}</Table></Worksheet>
</Workbook>`;
  const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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

async function waitForPrintAssets() {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const images = Array.from(document.querySelectorAll<HTMLImageElement>('.print-only img'));
  await Promise.all(images.map((image) => {
    if (image.complete && image.naturalWidth > 0) return Promise.resolve();

    return new Promise<void>((resolve) => {
      const finish = () => resolve();
      image.addEventListener('load', finish, { once: true });
      image.addEventListener('error', finish, { once: true });
      window.setTimeout(finish, 4000);
    });
  }));

  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
  });
}

export async function printReport() {
  await waitForPrintAssets();
  window.print();
}
