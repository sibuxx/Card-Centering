import React, { useState, useEffect, useCallback } from 'react';
import ImageCanvas from './components/ImageCanvas.jsx';
import GradeResults from './components/GradeResults.jsx';
import Guidelines from './components/Guidelines.jsx';

export default function App() {
  const [allStandards, setAllStandards] = useState([]);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontRatios, setFrontRatios] = useState(null);
  const [backRatios, setBackRatios] = useState(null);
  const [page, setPage] = useState('grader');

  useEffect(() => {
    fetch('/api/standards')
      .then((r) => r.json())
      .then(setAllStandards)
      .catch(console.error);
  }, []);

  const handleFileUpload = useCallback((side) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (side === 'front') {
      if (frontImage) URL.revokeObjectURL(frontImage);
      setFrontImage(url);
    } else {
      if (backImage) URL.revokeObjectURL(backImage);
      setBackImage(url);
    }
  }, [frontImage, backImage]);

  const handleDrop = useCallback((side) => (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    if (side === 'front') {
      if (frontImage) URL.revokeObjectURL(frontImage);
      setFrontImage(url);
    } else {
      if (backImage) URL.revokeObjectURL(backImage);
      setBackImage(url);
    }
  }, [frontImage, backImage]);

  const preventDefault = (e) => e.preventDefault();
  const handleFrontChange = useCallback((ratios) => setFrontRatios(ratios), []);
  const handleBackChange = useCallback((ratios) => setBackRatios(ratios), []);

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <h1 style={styles.logo}>
            <span style={styles.logoIcon}>&#9670;</span> Card Centering Grader
          </h1>
          <nav style={styles.nav}>
            <button
              onClick={() => setPage('grader')}
              style={{ ...styles.navBtn, ...(page === 'grader' ? styles.navBtnActive : {}) }}
            >
              Grader
            </button>
            <button
              onClick={() => setPage('guidelines')}
              style={{ ...styles.navBtn, ...(page === 'guidelines' ? styles.navBtnActive : {}) }}
            >
              Guidelines
            </button>
          </nav>
          <div style={styles.authPlaceholder}>{/* Future: login/signup */}</div>
        </div>
      </header>

      {page === 'grader' ? (
        <main style={styles.main}>
          {/* Side-by-side image upload */}
          <div style={styles.imagesRow}>
            <div style={styles.cardSection}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Front</h2>
                <label style={styles.uploadBtn}>
                  Choose Image
                  <input type="file" accept="image/*" onChange={handleFileUpload('front')} style={{ display: 'none' }} />
                </label>
              </div>
              <div onDrop={handleDrop('front')} onDragOver={preventDefault} style={styles.dropZone}>
                <ImageCanvas label="front" imageUrl={frontImage} onChange={handleFrontChange} />
              </div>
              {frontImage && (
                <div style={styles.hint}>
                  Drag <span style={{ color: '#ff4081' }}>pink</span> lines for L/R,{' '}
                  <span style={{ color: '#76ff03' }}>green</span> for T/B
                </div>
              )}
            </div>

            <div style={styles.cardSection}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Back</h2>
                <label style={styles.uploadBtn}>
                  Choose Image
                  <input type="file" accept="image/*" onChange={handleFileUpload('back')} style={{ display: 'none' }} />
                </label>
              </div>
              <div onDrop={handleDrop('back')} onDragOver={preventDefault} style={styles.dropZone}>
                <ImageCanvas label="back" imageUrl={backImage} onChange={handleBackChange} />
              </div>
              {backImage && (
                <div style={styles.hint}>
                  Drag <span style={{ color: '#ff4081' }}>pink</span> lines for L/R,{' '}
                  <span style={{ color: '#76ff03' }}>green</span> for T/B
                </div>
              )}
            </div>
          </div>

          {/* Measured ratios summary */}
          <div style={styles.ratioBar}>
            <RatioChip label="Front L/R" ratio={frontRatios?.lr} color="#ff4081" />
            <RatioChip label="Front T/B" ratio={frontRatios?.tb} color="#76ff03" />
            <RatioChip label="Back L/R" ratio={backRatios?.lr} color="#ff4081" />
            <RatioChip label="Back T/B" ratio={backRatios?.tb} color="#76ff03" />
          </div>

          {/* All companies grades */}
          <GradeResults
            allStandards={allStandards}
            frontRatios={frontRatios}
            backRatios={backRatios}
          />
        </main>
      ) : (
        <main style={styles.main}>
          <Guidelines allStandards={allStandards} />
        </main>
      )}
    </div>
  );
}

function RatioChip({ label, ratio, color }) {
  return (
    <div style={styles.ratioChip}>
      <span style={{ ...styles.ratioLabel, color }}>{label}</span>
      <span style={styles.ratioValue}>
        {ratio ? `${ratio.larger} / ${ratio.smaller}` : '—'}
      </span>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#fff',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    borderBottom: '1px solid #1a1a1a',
    background: '#0d0d0d',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: { color: '#00e5ff', fontSize: 18 },
  nav: { display: 'flex', gap: 4 },
  navBtn: {
    padding: '7px 18px',
    borderRadius: 6,
    border: '1px solid transparent',
    background: 'transparent',
    color: '#777',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  navBtnActive: {
    background: '#1a1a1a',
    color: '#fff',
    border: '1px solid #333',
  },
  authPlaceholder: {},
  main: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '24px 24px 60px',
  },
  imagesRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
  },
  cardSection: {
    background: '#111',
    borderRadius: 12,
    padding: 20,
    border: '1px solid #1a1a1a',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: { margin: 0, fontSize: 16, fontWeight: 700 },
  uploadBtn: {
    padding: '6px 16px',
    borderRadius: 6,
    border: '1px solid #333',
    background: '#1a1a1a',
    color: '#ccc',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  dropZone: { borderRadius: 8, minHeight: 80 },
  hint: { fontSize: 12, color: '#555', marginTop: 10, lineHeight: 1.5 },
  ratioBar: {
    display: 'flex',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  ratioChip: {
    flex: '1 1 0',
    minWidth: 140,
    background: '#111',
    border: '1px solid #1a1a1a',
    borderRadius: 10,
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  ratioLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  ratioValue: {
    fontSize: 22,
    fontWeight: 800,
    color: '#fff',
    fontVariantNumeric: 'tabular-nums',
  },
};
