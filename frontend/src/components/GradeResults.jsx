import React, { useMemo } from 'react';

function parseRatio(str) {
  if (!str || str === '—') return null;
  if (str === 'No Limit') return 100;
  return parseFloat(str.split('/')[0]);
}

function evaluateGrade(standards, frontLr, frontTb, backLr, backTb) {
  if (!frontLr || !frontTb || !backLr || !backTb) return null;

  const measured = {
    frontLr: frontLr.larger,
    frontTb: frontTb.larger,
    backLr: backLr.larger,
    backTb: backTb.larger,
  };

  for (const std of standards) {
    const frontLimit = parseRatio(std.front_centering);
    const backLimit = parseRatio(std.back_centering);
    if (frontLimit === null || backLimit === null) continue;

    if (
      measured.frontLr <= frontLimit &&
      measured.frontTb <= frontLimit &&
      measured.backLr <= backLimit &&
      measured.backTb <= backLimit
    ) {
      return std;
    }
  }

  return { grade: 'Below Min', label: 'Below minimum standards' };
}

export default function GradeResults({ allStandards, frontRatios, backRatios }) {
  const hasBoth = frontRatios?.lr && frontRatios?.tb && backRatios?.lr && backRatios?.tb;

  const results = useMemo(() => {
    return allStandards.map((company) => {
      const grade = evaluateGrade(
        company.standards,
        frontRatios?.lr,
        frontRatios?.tb,
        backRatios?.lr,
        backRatios?.tb
      );
      return { company, grade };
    });
  }, [allStandards, frontRatios, backRatios]);

  if (!hasBoth) {
    return (
      <div style={styles.prompt}>
        Upload both front and back images, then adjust the lines to see centering grades across all companies.
      </div>
    );
  }

  return (
    <div style={styles.grid}>
      {results.map(({ company, grade }) => {
        const isBelow = grade?.grade === 'Below Min';
        return (
          <div key={company.code} style={styles.card}>
            <div style={styles.companyName}>{company.name}</div>
            <div style={{ ...styles.gradeValue, color: isBelow ? '#666' : '#00e5ff' }}>
              {grade?.grade ?? '—'}
            </div>
            <div style={styles.gradeLabel}>{grade?.label ?? ''}</div>
            {grade?.notes && <div style={styles.gradeNotes}>{grade.notes}</div>}
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  prompt: {
    textAlign: 'center',
    color: '#444',
    fontSize: 15,
    fontWeight: 500,
    padding: '36px 20px',
    background: '#111',
    borderRadius: 12,
    border: '1px solid #1a1a1a',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 14,
  },
  card: {
    background: 'linear-gradient(135deg, #111 0%, #141422 100%)',
    border: '1px solid #1e1e2e',
    borderRadius: 12,
    padding: '20px 18px',
    textAlign: 'center',
    transition: 'border-color 0.2s',
  },
  companyName: {
    fontSize: 13,
    fontWeight: 700,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: 8,
  },
  gradeValue: {
    fontSize: 36,
    fontWeight: 800,
    lineHeight: 1.1,
  },
  gradeLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#999',
    marginTop: 4,
  },
  gradeNotes: {
    fontSize: 11,
    color: '#555',
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 1.4,
  },
};
