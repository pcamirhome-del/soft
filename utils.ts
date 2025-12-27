
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(amount);
};

export const exportToExcel = (data: any[][], fileName: string, header: string = "") => {
  let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
  if (header) csvContent += header + "\n";
  data.forEach((row) => {
    csvContent += row.join(",") + "\n";
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getCurrentDateStr = () => {
  return new Date().toISOString().split('T')[0];
};

export const getMonthPeriod = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // Logical period: 21st of prev month to 20th of current month
  const start = new Date(year, month - 1, 21);
  const end = new Date(year, month, 20);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
    label: `فترة من ${start.toLocaleDateString('ar-EG')} إلى ${end.toLocaleDateString('ar-EG')}`
  };
};
