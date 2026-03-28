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
              <RatioRow label="Front L/R" ratio={frontRatios?.lr} color="#C5975B" />
              <RatioRow label="Front T/B" ratio={frontRatios?.tb} color="#7A9E7E" />
              <RatioRow label="Back L/R" ratio={backRatios?.lr} color="#C5975B" />
              <RatioRow label="Back T/B" ratio={backRatios?.tb} color="#7A9E7E" />
              <div style={styles.ratioHint}>
                Drag <span style={{ color: '#C5975B' }}>gold</span> L/R, <span style={{ color: '#7A9E7E' }}>sage</span> T/B
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
    background: '#F7F3ED',
    color: '#2C1810',
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    borderBottom: '1px solid #E2D9CC',
    background: 'linear-gradient(180deg, #FFFDF9 0%, #F7F3ED 100%)',
    flexShrink: 0,
    boxShadow: '0 1px 8px rgba(44, 24, 16, 0.04)',
  },
  headerInner: {
    maxWidth: 1600,
    margin: '0 auto',
    padding: '8px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    margin: 0,
    fontSize: 19,
    fontWeight: 700,
    fontFamily: "'Playfair Display', Georgia, serif",
    letterSpacing: '-0.01em',
    color: '#2C1810',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoImg: { width: 44, height: 44, borderRadius: 8 },
  nav: { display: 'flex', gap: 4 },
  navBtn: {
    padding: '6px 16px',
    borderRadius: 6,
    border: '1px solid transparent',
    background: 'transparent',
    color: '#9E8E7E',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s ease',
  },
  navBtnActive: {
    background: '#2C1810',
    color: '#F7F3ED',
    border: '1px solid #2C1810',
    boxShadow: '0 2px 8px rgba(44, 24, 16, 0.15)',
  },
  authPlaceholder: {},
  footer: {
    flexShrink: 0,
    textAlign: 'center',
    padding: '8px 0',
    fontSize: 11,
    color: '#B5A898',
    borderTop: '1px solid #E2D9CC',
    fontFamily: "'Playfair Display', Georgia, serif",
    letterSpacing: '0.04em',
  },
  main: {
    flex: 1,
    minHeight: 0,
    maxWidth: 1600,
    width: '100%',
    margin: '0 auto',
    padding: '10px 24px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  guidelinesMain: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    maxWidth: 1600,
    width: '100%',
    margin: '0 auto',
    padding: '20px 24px 40px',
  },
  topRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr auto',
    gap: 10,
    flex: '1 1 0',
    minHeight: 0,
    overflow: 'hidden',
  },
  imageCard: {
    background: '#FFFDF9',
    borderRadius: 12,
    padding: '10px 14px',
    border: '1px solid #E2D9CC',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minHeight: 0,
    maxHeight: '100%',
    boxShadow: '0 2px 12px rgba(44, 24, 16, 0.04), 0 1px 3px rgba(44, 24, 16, 0.03)',
  },
  imageCardFullscreen: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 1000,
    background: '#F7F3ED',
    padding: '14px 24px',
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
  cardTitle: {
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'Playfair Display', Georgia, serif",
    color: '#2C1810',
  },
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
    color: '#B5A898',
    whiteSpace: 'nowrap',
    minWidth: 22,
    textAlign: 'right',
  },
  rotationSlider: {
    flex: 1,
    height: 2,
    accentColor: '#C5975B',
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
    border: '1px solid #E2D9CC',
    background: '#F7F3ED',
    color: '#9E8E7E',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
    lineHeight: 1,
    marginRight: 6,
    transition: 'all 0.2s ease',
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
    border: '1px solid #E2D9CC',
    background: '#FFFDF9',
    color: '#6B5B4E',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s ease',
  },
  zoomLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#9E8E7E',
    minWidth: 36,
    textAlign: 'center',
  },
  doneBtn: {
    padding: '5px 16px',
    borderRadius: 5,
    border: '1px solid #C5975B',
    background: 'linear-gradient(135deg, #C5975B 0%, #A67B45 100%)',
    color: '#FFFDF9',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginLeft: 'auto',
    boxShadow: '0 2px 6px rgba(197, 151, 91, 0.3)',
    transition: 'all 0.2s ease',
  },
  includeCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    fontWeight: 600,
    color: '#9E8E7E',
    cursor: 'pointer',
    marginRight: 'auto',
  },
  uploadBtn: {
    padding: '4px 12px',
    borderRadius: 5,
    border: '1px solid #E2D9CC',
    background: '#F7F3ED',
    color: '#6B5B4E',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
  },
  ratioPanel: {
    width: 210,
    flexShrink: 0,
    background: '#FFFDF9',
    borderRadius: 12,
    padding: '14px 16px',
    border: '1px solid #E2D9CC',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    boxShadow: '0 2px 12px rgba(44, 24, 16, 0.04)',
  },
  ratioPanelTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#B5A898',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    marginBottom: 2,
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  ratioRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '7px 10px',
    background: '#F7F3ED',
    borderRadius: 6,
    border: '1px solid #EDE6DC',
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
    color: '#2C1810',
    fontVariantNumeric: 'tabular-nums',
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  ratioHint: {
    fontSize: 11,
    color: '#B5A898',
    marginTop: 'auto',
    lineHeight: 1.4,
  },
};
