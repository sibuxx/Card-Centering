import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [includeFront, setIncludeFront] = useState(true);
  const [includeBack, setIncludeBack] = useState(true);
  const [frontRotation, setFrontRotation] = useState(0);
  const [backRotation, setBackRotation] = useState(0);
  const [fullscreen, setFullscreen] = useState(null); // 'front' | 'back' | null
  const [zoom, setZoom] = useState(1);
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e) => { if (e.key === 'Escape') { setFullscreen(null); setZoom(1); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);

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
            <img src="/logo.svg" alt="" style={styles.logoImg} /> Perfect Centering
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
          {/* Top: images side by side + ratios */}
          <div style={styles.topRow}>
            <div style={fullscreen === 'front' ? styles.imageCardFullscreen : styles.imageCard}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>Front</span>
                <label style={styles.includeCheckbox}>
                  <input type="checkbox" checked={includeFront} onChange={() => setIncludeFront((v) => !v)} />
                  <span>Include in grade</span>
                </label>
                <input ref={frontInputRef} type="file" accept="image/*" onChange={handleFileUpload('front')} style={{ display: 'none' }} />
                {fullscreen === 'front' ? (
                  <div style={styles.fullscreenControls}>
                    <button style={styles.zoomBtn} onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}>-</button>
                    <span style={styles.zoomLabel}>{Math.round(zoom * 100)}%</span>
                    <button style={styles.zoomBtn} onClick={() => setZoom((z) => Math.min(4, z + 0.25))}>+</button>
                    <button style={styles.doneBtn} onClick={() => { setFullscreen(null); setZoom(1); }}>Done</button>
                  </div>
                ) : (
                  <>
                    <button style={styles.fullscreenBtn} onClick={() => setFullscreen('front')}>&#x26F6;</button>
                    <label style={styles.uploadBtn} onClick={() => frontInputRef.current?.click()}>
                      Upload
                    </label>
                  </>
                )}
              </div>
              <div style={styles.rotationBar}>
                <span style={styles.rotationLabel}>{frontRotation}°</span>
                <input type="range" min="0" max="180" value={frontRotation} onChange={(e) => setFrontRotation(Number(e.target.value))} style={styles.rotationSlider} />
              </div>
              <div onDrop={handleDrop('front')} onDragOver={preventDefault} style={styles.dropZone}>
                <ImageCanvas label="front" imageUrl={frontImage} onChange={handleFrontChange} rotation={frontRotation} onClickPlaceholder={() => frontInputRef.current?.click()} isFullscreen={fullscreen === 'front'} zoom={fullscreen === 'front' ? zoom : 1} />
              </div>
            </div>

            <div style={fullscreen === 'back' ? styles.imageCardFullscreen : styles.imageCard}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>Back</span>
                <label style={styles.includeCheckbox}>
                  <input type="checkbox" checked={includeBack} onChange={() => setIncludeBack((v) => !v)} />
                  <span>Include in grade</span>
                </label>
                <input ref={backInputRef} type="file" accept="image/*" onChange={handleFileUpload('back')} style={{ display: 'none' }} />
                {fullscreen === 'back' ? (
                  <div style={styles.fullscreenControls}>
                    <button style={styles.zoomBtn} onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}>-</button>
                    <span style={styles.zoomLabel}>{Math.round(zoom * 100)}%</span>
                    <button style={styles.zoomBtn} onClick={() => setZoom((z) => Math.min(4, z + 0.25))}>+</button>
                    <button style={styles.doneBtn} onClick={() => { setFullscreen(null); setZoom(1); }}>Done</button>
                  </div>
                ) : (
                  <>
                    <button style={styles.fullscreenBtn} onClick={() => setFullscreen('back')}>&#x26F6;</button>
                    <label style={styles.uploadBtn} onClick={() => backInputRef.current?.click()}>
                      Upload
                    </label>
                  </>
                )}
              </div>
              <div style={styles.rotationBar}>
                <span style={styles.rotationLabel}>{backRotation}°</span>
                <input type="range" min="0" max="180" value={backRotation} onChange={(e) => setBackRotation(Number(e.target.value))} style={styles.rotationSlider} />
              </div>
              <div onDrop={handleDrop('back')} onDragOver={preventDefault} style={styles.dropZone}>
                <ImageCanvas label="back" imageUrl={backImage} onChange={handleBackChange} rotation={backRotation} onClickPlaceholder={() => backInputRef.current?.click()} isFullscreen={fullscreen === 'back'} zoom={fullscreen === 'back' ? zoom : 1} />
              </div>
            </div>

            {/* Ratios panel */}
            <div style={styles.ratioPanel}>
              <div style={styles.ratioPanelTitle}>Measured Ratios</div>
              <RatioRow label="Front L/R" ratio={frontRatios?.lr} color="#c084fc" />
              <RatioRow label="Front T/B" ratio={frontRatios?.tb} color="#34d399" />
              <RatioRow label="Back L/R" ratio={backRatios?.lr} color="#c084fc" />
              <RatioRow label="Back T/B" ratio={backRatios?.tb} color="#34d399" />
              <div style={styles.ratioHint}>
                Drag <span style={{ color: '#c084fc' }}>purple</span> L/R, <span style={{ color: '#34d399' }}>green</span> T/B
              </div>
            </div>
          </div>

          {/* Bottom: all 5 company grades in one row */}
          <GradeResults
            allStandards={allStandards}
            frontRatios={frontRatios}
            backRatios={backRatios}
            includeFront={includeFront}
            includeBack={includeBack}
          />
        </main>
      ) : (
        <main style={styles.guidelinesMain}>
          <Guidelines allStandards={allStandards} />
        </main>
      )}
      <footer style={styles.footer}>© {new Date().getFullYear()} Perfect Centering</footer>
    </div>
  );
}

function RatioRow({ label, ratio, color }) {
  return (
    <div style={styles.ratioRow}>
      <span style={{ ...styles.ratioLabel, color }}>{label}</span>
      <span style={styles.ratioValue}>
        {ratio ? `${ratio.larger}/${ratio.smaller}` : '—'}
      </span>
    </div>
  );
}

const styles = {
  root: {
    height: '100vh',
    overflow: 'hidden',
    background: '#0c0a14',
    color: '#fff',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    borderBottom: '1px solid #1e1b2e',
    background: '#0e0c16',
    flexShrink: 0,
  },
  headerInner: {
    maxWidth: 1600,
    margin: '0 auto',
    padding: '6px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    margin: 0,
    fontSize: 17,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logoImg: { width: 44, height: 44, borderRadius: 8 },
  nav: { display: 'flex', gap: 4 },
  navBtn: {
    padding: '5px 14px',
    borderRadius: 6,
    border: '1px solid transparent',
    background: 'transparent',
    color: '#777',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  navBtnActive: {
    background: '#1e1b2e',
    color: '#fff',
    border: '1px solid #2e2a45',
  },
  authPlaceholder: {},
  footer: {
    flexShrink: 0,
    textAlign: 'center',
    padding: '6px 0',
    fontSize: 11,
    color: '#444',
    borderTop: '1px solid #1e1b2e',
  },
  main: {
    flex: 1,
    minHeight: 0,
    maxWidth: 1600,
    width: '100%',
    margin: '0 auto',
    padding: '8px 20px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  guidelinesMain: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    maxWidth: 1600,
    width: '100%',
    margin: '0 auto',
    padding: '16px 20px 40px',
  },
  topRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr auto',
    gap: 8,
    flex: '1 1 0',
    minHeight: 0,
    overflow: 'hidden',
  },
  imageCard: {
    background: '#110f1a',
    borderRadius: 10,
    padding: '8px 12px',
    border: '1px solid #1e1b2e',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minHeight: 0,
    maxHeight: '100%',
  },
  imageCardFullscreen: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 1000,
    background: '#0c0a14',
    padding: '12px 20px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexShrink: 0,
  },
  cardTitle: { fontSize: 14, fontWeight: 700 },
  rotationBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    flexShrink: 0,
    maxWidth: 140,
  },
  rotationLabel: {
    fontSize: 9,
    fontWeight: 600,
    color: '#555',
    whiteSpace: 'nowrap',
    minWidth: 22,
    textAlign: 'right',
  },
  rotationSlider: {
    flex: 1,
    height: 2,
    accentColor: '#7c3aed',
    cursor: 'pointer',
  },
  dropZone: {
    flex: '1 1 0',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  fullscreenBtn: {
    padding: '3px 8px',
    borderRadius: 5,
    border: '1px solid #333',
    background: '#1a1a1a',
    color: '#aaa',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
    lineHeight: 1,
    marginRight: 6,
  },
  fullscreenControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto',
  },
  zoomBtn: {
    width: 28, height: 28,
    borderRadius: 5,
    border: '1px solid #333',
    background: '#1a1a1a',
    color: '#ccc',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  zoomLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#777',
    minWidth: 36,
    textAlign: 'center',
  },
  doneBtn: {
    padding: '5px 16px',
    borderRadius: 5,
    border: '1px solid #7c3aed',
    background: '#7c3aed',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginLeft: 'auto',
  },
  includeCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    fontWeight: 600,
    color: '#777',
    cursor: 'pointer',
    marginRight: 'auto',
  },
  uploadBtn: {
    padding: '4px 12px',
    borderRadius: 5,
    border: '1px solid #333',
    background: '#1a1a1a',
    color: '#ccc',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  ratioPanel: {
    width: 200,
    flexShrink: 0,
    background: '#110f1a',
    borderRadius: 10,
    padding: '12px 14px',
    border: '1px solid #1e1b2e',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  ratioPanelTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 2,
  },
  ratioRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 10px',
    background: '#0c0a14',
    borderRadius: 6,
  },
  ratioLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  ratioValue: {
    fontSize: 16,
    fontWeight: 800,
    color: '#fff',
    fontVariantNumeric: 'tabular-nums',
  },
  ratioHint: {
    fontSize: 11,
    color: '#444',
    marginTop: 'auto',
    lineHeight: 1.4,
  },
};
