import { useState } from 'react'

function StudentTable({ students, showUsd = false }) {
  const [sortField, setSortField] = useState('usd_amount')
  const [sortDirection, setSortDirection] = useState('desc')
  const [searchTerm, setSearchTerm] = useState('')

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstname} ${student.lastname}`.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase())
  })

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]

    if (sortField === 'name') {
      aVal = `${a.firstname} ${a.lastname}`
      bVal = `${b.firstname} ${b.lastname}`
    }

    if (typeof aVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }

    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
  })

  const totalCoins = students.reduce((sum, s) => sum + (s.pending_scholarship || 0), 0)
  const totalUsd = students.reduce((sum, s) => sum + (s.usd_amount || 0), 0)

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ opacity: 0.3 }}>&#8597;</span>
    return sortDirection === 'asc' ? <span>&#8593;</span> : <span>&#8595;</span>
  }

  return (
    <div className="student-table-container">
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--secondary-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            width: '250px'
          }}
        />
      </div>

      <table className="student-table">
        <thead>
          <tr>
            <th>#</th>
            <th
              onClick={() => handleSort('name')}
              style={{ cursor: 'pointer' }}
            >
              Student Name <SortIcon field="name" />
            </th>
            <th>Parent Email</th>
            <th
              onClick={() => handleSort('pending_scholarship')}
              style={{ cursor: 'pointer', textAlign: 'right' }}
            >
              Coins Converted <SortIcon field="pending_scholarship" />
            </th>
            <th
              onClick={() => handleSort('percentage')}
              style={{ cursor: 'pointer', textAlign: 'right' }}
            >
              Share % <SortIcon field="percentage" />
            </th>
            {showUsd && (
              <th
                onClick={() => handleSort('usd_amount')}
                style={{ cursor: 'pointer', textAlign: 'right' }}
              >
                USD Amount <SortIcon field="usd_amount" />
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map((student, index) => (
            <tr key={student.user_id}>
              <td>{index + 1}</td>
              <td>{student.firstname} {student.lastname}</td>
              <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {student.parent_email || 'N/A'}
              </td>
              <td className="amount coins" style={{ textAlign: 'right' }}>
                {student.pending_scholarship?.toLocaleString() || 0}
              </td>
              <td className="percentage" style={{ textAlign: 'right' }}>
                {student.percentage?.toFixed(2) || '0.00'}%
              </td>
              {showUsd && (
                <td className="amount usd" style={{ textAlign: 'right' }}>
                  ${student.usd_amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </td>
              )}
            </tr>
          ))}
          {sortedStudents.length > 0 && (
            <tr style={{ background: 'var(--secondary-color)', fontWeight: '600' }}>
              <td></td>
              <td>TOTAL ({sortedStudents.length} students)</td>
              <td></td>
              <td className="amount coins" style={{ textAlign: 'right' }}>
                {totalCoins.toLocaleString()}
              </td>
              <td className="percentage" style={{ textAlign: 'right' }}>
                100.00%
              </td>
              {showUsd && (
                <td className="amount usd" style={{ textAlign: 'right' }}>
                  ${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              )}
            </tr>
          )}
        </tbody>
      </table>

      {sortedStudents.length === 0 && searchTerm && (
        <div className="no-data">
          <p>No students match your search.</p>
        </div>
      )}
    </div>
  )
}

export default StudentTable
