import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportApplicationToPDF = (application, mfi) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(30, 154, 86);
  doc.text('GrameenGo', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(16);
  doc.setTextColor(60, 60, 60);
  doc.text('Loan Application Report', pageWidth / 2, 30, { align: 'center' });

  // Application details
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);

  const startY = 45;
  const lineHeight = 8;
  let currentY = startY;

  const addLine = (label, value) => {
    doc.setFont(undefined, 'bold');
    doc.text(label + ':', 20, currentY);
    doc.setFont(undefined, 'normal');
    doc.text(String(value), 80, currentY);
    currentY += lineHeight;
  };

  addLine('Application ID', application.id.slice(0, 8));
  addLine('MFI', mfi?.name || 'N/A');
  addLine('Business Name', application.business_name);
  addLine('Business Type', application.business_type);
  addLine('Loan Amount', `BDT ${application.loan_amount.toLocaleString()}`);
  addLine('Tenure', `${application.tenure_months} months`);
  addLine('Status', application.status);
  addLine('Applied On', new Date(application.created_at).toLocaleDateString());

  // Add table if needed
  if (application.documents && application.documents.length > 0) {
    currentY += 10;
    doc.text('Documents:', 20, currentY);
    currentY += 5;

    doc.autoTable({
      startY: currentY,
      head: [['Document Type', 'Status']],
      body: application.documents.map(doc => [doc.type, doc.status]),
      theme: 'grid',
      headStyles: { fillColor: [30, 154, 86] },
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`application-${application.id.slice(0, 8)}.pdf`);
};

export const exportAnalyticsToPDF = (stats, trends) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(30, 154, 86);
  doc.text('GrameenGo Analytics Report', pageWidth / 2, 20, { align: 'center' });

  // Stats
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Summary Statistics', 20, 40);

  const statsData = [
    ['Total Applications', stats.total_applications],
    ['Approved', stats.approved],
    ['Rejected', stats.rejected],
    ['Pending', stats.pending],
    ['Total Loan Amount', `BDT ${stats.total_loan_amount?.toLocaleString() || 0}`],
  ];

  doc.autoTable({
    startY: 45,
    body: statsData,
    theme: 'plain',
    styles: { fontSize: 12 },
  });

  // Trends
  if (trends && trends.length > 0) {
    const trendsY = doc.lastAutoTable.finalY + 15;
    doc.text('Monthly Trends', 20, trendsY);

    const trendsData = trends.map(t => [
      `${t._id.month}/${t._id.year}`,
      t.count,
      `BDT ${t.total_amount?.toLocaleString() || 0}`,
    ]);

    doc.autoTable({
      startY: trendsY + 5,
      head: [['Month', 'Applications', 'Total Amount']],
      body: trendsData,
      theme: 'grid',
      headStyles: { fillColor: [30, 154, 86] },
    });
  }

  doc.save(`analytics-${new Date().toISOString().split('T')[0]}.pdf`);
};
