import React from 'react';

export default function Guidelines({ allStandards, isMobile = false }) {
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

      <div style={isMobile ? mobileGuideStyles.grid : styles.grid}>
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
  loading: { color: '#94a3b8', textAlign: 'center', padding: 40 },
  pageTitle: {
    margin: '0 0 6px',
    fontSize: 22,
    fontWeight: 800,
    color: '#fff',
  },
  subtitle: {
    margin: '0 0 28px',
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 1.5,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: 20,
  },
  companyCard: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 12,
    padding: 20,
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
    color: '#10b981',
  },
  link: {
    fontSize: 12,
    color: '#94a3b8',
    textDecoration: 'none',
    borderBottom: '1px solid #475569',
  },
  desc: {
    margin: '0 0 14px',
    fontSize: 13,
    color: '#94a3b8',
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
    background: '#0f172a',
    color: '#94a3b8',
    fontWeight: 600,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    borderBottom: '1px solid #334155',
  },
  td: {
    padding: '6px 10px',
    color: '#cbd5e1',
    borderBottom: '1px solid #1e293b',
  },
  tdGrade: {
    padding: '6px 10px',
    color: '#fff',
    fontWeight: 700,
    borderBottom: '1px solid #1e293b',
  },
  tdMono: {
    padding: '6px 10px',
    color: '#cbd5e1',
    borderBottom: '1px solid #1e293b',
    fontVariantNumeric: 'tabular-nums',
  },
  disclaimer: {
    marginTop: 32,
    padding: 16,
    background: '#1e293b',
    borderRadius: 8,
    border: '1px solid #334155',
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 1.5,
  },
};

const mobileGuideStyles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 16,
  },
};
