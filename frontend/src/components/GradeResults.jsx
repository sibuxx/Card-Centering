import React, { useMemo } from 'react';

function parseRatio(str) {
  if (!str || str === '—') return null;
  if (str === 'No Limit') return 100;
  return parseFloat(str.split('/')[0]);
}

function evaluateGrade(standards, frontLr, frontTb, backLr, backTb) {
  const hasFront = frontLr && frontTb;
  const hasBack = backLr && backTb;
  if (!hasFront && !hasBack) return null;

  // Worst axis = the one furthest from 50/50 (highest larger-side %)
  const frontWorst = hasFront
    ? Math.max(frontLr.rawLarger ?? frontLr.larger, frontTb.rawLarger ?? frontTb.larger)
    : 0;
  const backWorst = hasBack
    ? Math.max(backLr.rawLarger ?? backLr.larger, backTb.rawLarger ?? backTb.larger)
    : 0;

  for (const std of standards) {
    const frontLimit = parseRatio(std.front_centering);
    const backLimit = parseRatio(std.back_centering);
    if (frontLimit === null || backLimit === null) continue;

    const frontOk = !hasFront || frontWorst <= frontLimit;
    const backOk = !hasBack || backWorst <= backLimit;
    if (frontOk && backOk) {
      return std;
    }
  }

  return { grade: 'Below', label: 'Below minimum' };
}

const COMPANY_COLORS = {
  PSA: '#e53935',
  BGS: '#1e88e5',
  CGC: '#43a047',
  SGC: '#fb8c00',
  TAG: '#8e24aa',
};

export default function GradeResults({ allStandards, frontRatios, backRatios, includeFront, includeBack, isMobile = false }) {
  const effFront = includeFront ? frontRatios : null;
  const effBack = includeBack ? backRatios : null;
  const hasFront = !!(effFront?.lr && effFront?.tb);
  const hasBack = !!(effBack?.lr && effBack?.tb);
  const hasAny = hasFront || hasBack;
  const hasBoth = hasFront && hasBack;
  const isPartial = hasAny && !hasBoth;

  const results = useMemo(() => {
    return allStandards.map((company) => {
      const grade = evaluateGrade(
        company.standards,
        effFront?.lr, effFront?.tb,
        effBack?.lr, effBack?.tb
      );
      return { company, grade };
    });
  }, [allStandards, effFront, effBack]);

  return (
    <div style={styles.wrapper}>
      {isPartial && (
        <div style={styles.partialBadge}>
          Indicative — upload {!hasFront ? 'front' : 'back'} for complete grade
        </div>
      )}
      <div style={isMobile ? mobileStyles.row : styles.row}>
        {results.map(({ company, grade }) => {
          const isBelow = grade?.grade === 'Below';
          const accent = COMPANY_COLORS[company.code] || '#10b981';
          return (
            <div key={company.code} style={{ ...(isMobile ? mobileStyles.card : styles.card), borderTopColor: accent }}>
              <div style={{ ...styles.companyCode, color: accent }}>{company.code}</div>
              {!hasAny ? (
                <div style={styles.waiting}>—</div>
              ) : (
                <>
                  <div style={{ ...styles.gradeValue, color: isBelow ? '#475569' : '#fff', opacity: isPartial ? 0.6 : 1 }}>
                    {grade?.grade ?? '—'}
                    {isPartial && grade?.grade && grade.grade !== 'Below' && <span style={styles.asterisk}>*</span>}
                  </div>
                  <div style={styles.gradeLabel}>{grade?.label ?? ''}</div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flexShrink: 0,
  },
  partialBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: '#fbbf24',
    textAlign: 'right',
    padding: '0 2px',
  },
  asterisk: {
    fontSize: 14,
    color: '#fbbf24',
    verticalAlign: 'super',
    marginLeft: 1,
  },
  row: {
    display: 'flex',
    gap: 8,
    flexShrink: 0,
    overflowX: 'auto',
    paddingBottom: 4,
  },
  card: {
    flex: '1 0 0',
    minWidth: 100,
    background: '#1e293b',
    border: '1px solid #334155',
    borderTop: '3px solid',
    borderRadius: 8,
    padding: '8px 8px 10px',
    textAlign: 'center',
  },
  companyCode: {
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: '0.1em',
    marginBottom: 2,
  },
  gradeValue: {
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1.15,
  },
  gradeLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: '#94a3b8',
    marginTop: 2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  waiting: {
    fontSize: 22,
    fontWeight: 800,
    color: '#334155',
    lineHeight: 1.4,
  },
};

const mobileStyles = {
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 6,
    flexShrink: 0,
    paddingBottom: 4,
  },
  card: {
    minWidth: 0,
    background: '#1e293b',
    border: '1px solid #334155',
    borderTop: '3px solid',
    borderRadius: 8,
    padding: '6px 6px 8px',
    textAlign: 'center',
  },
};
