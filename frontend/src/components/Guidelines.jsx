import React from 'react';

export default function Guidelines({ allStandards }) {
  if (!allStandards.length) {
    return <div style={styles.loading}>Loading guidelines...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>Centering Requirements by Company</h2>
      <p style={styles.subtitle}>
        All ratios expressed as larger-side / smaller-side out of 100.
        "No Limit" means any centering is accepted for that side.
      </p>

      <div style={styles.grid}>
        {allStandards.map((company) => (
          <div key={company.code} style={styles.companyCard}>
            <div style={styles.companyHeader}>
              <h3 style={styles.companyName}>{company.name}</h3>
              {company.website && (
                <a href={company.website} target="_blank" rel="noreferrer" style={styles.link}>
                  Official standards
                </a>
              )}
            </div>
            <p style={styles.desc}>{company.description}</p>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Grade</th>
                  <th style={styles.th}>Label</th>
                  <th style={styles.th}>Front</th>
                  <th style={styles.th}>Back</th>
                </tr>
              </thead>
              <tbody>
                {company.standards.map((s) => (
                  <tr key={s.id}>
                    <td style={styles.tdGrade}>{s.grade}</td>
                    <td style={styles.td}>{s.label}</td>
                    <td style={styles.tdMono}>{s.front_centering || '—'}</td>
                    <td style={styles.tdMono}>{s.back_centering || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div style={styles.disclaimer}>
        Grading standards may change without notice. Always verify with the official
        company website before submitting cards. Data last verified March 2026.
      </div>
    </div>
  );
}

const styles = {
  container: {},
  loading: { color: '#9E8E7E', textAlign: 'center', padding: 40, fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' },
  pageTitle: {
    margin: '0 0 6px',
    fontSize: 24,
    fontWeight: 800,
    color: '#2C1810',
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  subtitle: {
    margin: '0 0 28px',
    fontSize: 14,
    color: '#9E8E7E',
    lineHeight: 1.5,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: 20,
  },
  companyCard: {
    background: '#FFFDF9',
    border: '1px solid #E2D9CC',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 2px 12px rgba(44, 24, 16, 0.04)',
  },
  companyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  companyName: {
    margin: 0,
    fontSize: 18,
    fontWeight: 800,
    color: '#C5975B',
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  link: {
    fontSize: 12,
    color: '#9E8E7E',
    textDecoration: 'none',
    borderBottom: '1px solid #D4C9B8',
    transition: 'color 0.2s ease',
  },
  desc: {
    margin: '0 0 14px',
    fontSize: 13,
    color: '#8B7B6B',
    lineHeight: 1.5,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  th: {
    textAlign: 'left',
    padding: '8px 10px',
    background: '#F7F3ED',
    color: '#9E8E7E',
    fontWeight: 600,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    borderBottom: '1px solid #E2D9CC',
  },
  td: {
    padding: '6px 10px',
    color: '#6B5B4E',
    borderBottom: '1px solid #EDE6DC',
  },
  tdGrade: {
    padding: '6px 10px',
    color: '#2C1810',
    fontWeight: 700,
    borderBottom: '1px solid #EDE6DC',
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  tdMono: {
    padding: '6px 10px',
    color: '#6B5B4E',
    borderBottom: '1px solid #EDE6DC',
    fontVariantNumeric: 'tabular-nums',
  },
  disclaimer: {
    marginTop: 32,
    padding: 16,
    background: '#FFFDF9',
    borderRadius: 8,
    border: '1px solid #E2D9CC',
    fontSize: 12,
    color: '#9E8E7E',
    textAlign: 'center',
    lineHeight: 1.5,
    fontStyle: 'italic',
  },
};
