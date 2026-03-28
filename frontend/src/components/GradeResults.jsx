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
  PSA: '#A0522D',
  BGS: '#5B7E9E',
  CGC: '#6B8E5A',
  SGC: '#C5975B',
  TAG: '#8B6B8E',
};

export default function GradeResults({ allStandards, frontRatios, backRatios, includeFront, includeBack }) {
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
      <div style={styles.row}>
        {results.map(({ company, grade }) => {
          const isBelow = grade?.grade === 'Below';
          const accent = COMPANY_COLORS[company.code] || '#7c3aed';
          return (
            <div key={company.code} style={{ ...styles.card, borderTopColor: accent }}>
              <div style={{ ...styles.companyCode, color: accent }}>{company.code}</div>
              {!hasAny ? (
                <div style={styles.waiting}>—</div>
              ) : (
                <>
                  <div style={{ ...styles.gradeValue, ...(isBelow ? { background: 'none', WebkitTextFillColor: '#D4C9B8', color: '#D4C9B8' } : {}), opacity: isPartial ? 0.6 : 1 }}>
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
    color: '#C5975B',
    textAlign: 'right',
    padding: '0 2px',
    fontStyle: 'italic',
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  asterisk: {
    fontSize: 14,
    color: '#C5975B',
    verticalAlign: 'super',
    marginLeft: 1,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 10,
    flexShrink: 0,
  },
  card: {
    background: '#FFFDF9',
    border: '1px solid #E2D9CC',
    borderTop: '3px solid',
    borderRadius: 10,
    padding: '10px 8px 12px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(44, 24, 16, 0.04)',
    animation: 'fadeInUp 0.4s ease both',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  companyCode: {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: '0.14em',
    marginBottom: 3,
    fontFamily: "'DM Sans', sans-serif",
    textTransform: 'uppercase',
  },
  gradeValue: {
    fontSize: 26,
    fontWeight: 900,
    lineHeight: 1.15,
    fontFamily: "'Playfair Display', Georgia, serif",
    background: 'linear-gradient(90deg, #C5975B 0%, #E8D5A8 25%, #C5975B 50%, #A67B45 75%, #C5975B 100%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'foilShimmer 4s linear infinite',
  },
  gradeLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: '#9E8E7E',
    marginTop: 3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '0.02em',
  },
  waiting: {
    fontSize: 22,
    fontWeight: 800,
    color: '#DDD5CA',
    lineHeight: 1.4,
    fontFamily: "'Playfair Display', Georgia, serif",
  },
};
