import jsPDF from 'jspdf'
import 'jspdf-autotable'

export const generateDistributionPdf = (reportData) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Colors
  const primaryColor = [255, 105, 0] // Orange
  const textColor = [51, 51, 51]
  const lightGray = [150, 150, 150]

  // Header
  doc.setFontSize(24)
  doc.setTextColor(...primaryColor)
  doc.text('XOGOS', 14, 20)

  doc.setFontSize(10)
  doc.setTextColor(...lightGray)
  doc.text('GAMING', 51, 20)

  doc.setFontSize(16)
  doc.setTextColor(...textColor)
  doc.text('Scholarship Distribution Report', 14, 35)

  doc.setFontSize(10)
  doc.setTextColor(...lightGray)
  doc.text(`Batch #${reportData.batch_id} | Generated: ${reportData.generated_at}`, 14, 42)

  // Summary Section
  doc.setFontSize(12)
  doc.setTextColor(...textColor)
  doc.text('Summary', 14, 55)

  doc.setFontSize(10)
  const summary = reportData.summary
  const summaryData = [
    ['Total Scholarship Fund', `$${summary.total_fund_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
    ['Total Coins Converted', summary.total_coins_converted.toLocaleString()],
    ['Number of Students', summary.student_count.toString()],
    ['Status', summary.status.charAt(0).toUpperCase() + summary.status.slice(1)],
    ['Created By', `${summary.created_by.name} (${summary.created_by.email})`],
    ['Created At', summary.created_at || 'N/A'],
    ['Distributed At', summary.distributed_at || 'Pending']
  ]

  if (summary.notes) {
    summaryData.push(['Notes', summary.notes])
  }

  doc.autoTable({
    startY: 60,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 'auto' }
    }
  })

  // Approvals Section
  let currentY = doc.lastAutoTable.finalY + 15

  doc.setFontSize(12)
  doc.setTextColor(...textColor)
  doc.text('Board Member Approvals', 14, currentY)

  if (reportData.approvals.length > 0) {
    const approvalRows = reportData.approvals.map((approval, index) => [
      (index + 1).toString(),
      approval.name,
      approval.email,
      approval.approved_at,
      approval.ip_address || 'N/A'
    ])

    doc.autoTable({
      startY: currentY + 5,
      head: [['#', 'Board Member', 'Email', 'Approved At', 'IP Address']],
      body: approvalRows,
      theme: 'striped',
      headStyles: { fillColor: primaryColor },
      styles: { fontSize: 8 }
    })
  } else {
    doc.setFontSize(9)
    doc.setTextColor(...lightGray)
    doc.text('No approvals recorded yet.', 14, currentY + 10)
  }

  // Student Allocations Section
  currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : currentY + 20

  doc.setFontSize(12)
  doc.setTextColor(...textColor)
  doc.text('Student Allocations', 14, currentY)

  if (reportData.allocations.length > 0) {
    const allocationRows = reportData.allocations.map((alloc, index) => [
      (index + 1).toString(),
      alloc.student_name,
      alloc.parent_email || 'N/A',
      alloc.coins_converted.toLocaleString(),
      `${alloc.percentage.toFixed(2)}%`,
      `$${alloc.usd_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    ])

    // Add total row
    const totalCoins = reportData.allocations.reduce((sum, a) => sum + a.coins_converted, 0)
    const totalUsd = reportData.allocations.reduce((sum, a) => sum + a.usd_amount, 0)
    allocationRows.push([
      '',
      'TOTAL',
      '',
      totalCoins.toLocaleString(),
      '100.00%',
      `$${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    ])

    doc.autoTable({
      startY: currentY + 5,
      head: [['#', 'Student Name', 'Parent Email', 'Coins', '%', 'USD Amount']],
      body: allocationRows,
      theme: 'striped',
      headStyles: { fillColor: primaryColor },
      styles: { fontSize: 8 },
      columnStyles: {
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' }
      },
      didParseCell: function(data) {
        // Bold the total row
        if (data.row.index === allocationRows.length - 1) {
          data.cell.styles.fontStyle = 'bold'
        }
      }
    })
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...lightGray)

    // Footer text
    doc.text(
      `${reportData.footer.company} | ${reportData.footer.website}`,
      14,
      doc.internal.pageSize.getHeight() - 15
    )
    doc.text(
      reportData.footer.disclaimer,
      14,
      doc.internal.pageSize.getHeight() - 10
    )

    // Page number
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 30,
      doc.internal.pageSize.getHeight() - 10
    )
  }

  return doc
}

export const downloadPdf = (reportData) => {
  const doc = generateDistributionPdf(reportData)
  const filename = `scholarship_distribution_${reportData.batch_id}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}
