import React, { useState, useEffect, useCallback, useRef } from 'react';
import ImageCanvas from './components/ImageCanvas.jsx';
import GradeResults from './components/GradeResults.jsx';
import Guidelines from './components/Guidelines.jsx';
import { STANDARDS_DATA } from './data/standards.js';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
}

export default function App() {
  const isMobile = useIsMobile();
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
  const [showRatios, setShowRatios] = useState(false);
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
      .catch(() => setAllStandards(STANDARDS_DATA));
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

  const mobileStyles = getMobileStyles(isMobile);

  return (
    <div style={isMobile ? mobileStyles.root : styles.root}>
      {/* Sidebar - desktop only */}
      {!isMobile && (
        <aside style={styles.sidebar}>
          <div style={styles.sidebarTop}>
            <div style={styles.sidebarLogo}>
              <img src="/logo.svg" alt="" style={styles.sidebarLogoImg} />
            </div>
            <nav style={styles.sidebarNav}>
              <button
                onClick={() => setPage('grader')}
                style={{ ...styles.sidebarNavBtn, ...(page === 'grader' ? styles.sidebarNavBtnActive : {}) }}
                title="Grader"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                <span style={styles.sidebarNavLabel}>Grader</span>
              </button>
              <button
                onClick={() => setPage('guidelines')}
                style={{ ...styles.sidebarNavBtn, ...(page === 'guidelines' ? styles.sidebarNavBtnActive : {}) }}
                title="Guidelines"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <span style={styles.sidebarNavLabel}>Guide</span>
              </button>
            </nav>
          </div>

          {/* Measured Ratios panel inside sidebar */}
          {page === 'grader' && (
            <div style={styles.ratioPanel}>
              <div style={styles.ratioPanelTitle}>Ratios</div>
              <RatioRow label="F L/R" ratio={frontRatios?.lr} color="#c084fc" />
              <RatioRow label="F T/B" ratio={frontRatios?.tb} color="#34d399" />
              <RatioRow label="B L/R" ratio={backRatios?.lr} color="#c084fc" />
              <RatioRow label="B T/B" ratio={backRatios?.tb} color="#34d399" />
              <div style={styles.ratioHint}>
                <span style={{ color: '#c084fc' }}>Purple</span> L/R
                <br />
                <span style={{ color: '#34d399' }}>Green</span> T/B
              </div>
            </div>
          )}
        </aside>
      )}

      {/* Main Content */}
      <div style={isMobile ? mobileStyles.mainWrapper : styles.mainWrapper}>
        <main style={{ ...(isMobile ? mobileStyles.main : styles.main), display: page === 'grader' ? 'flex' : 'none' }}>
            {/* Mobile: inline ratios panel (collapsible) */}
            {isMobile && page === 'grader' && (
              <div style={mobileStyles.ratioInline}>
                <button
                  onClick={() => setShowRatios((v) => !v)}
                  style={mobileStyles.ratioToggle}
                >
                  Ratios {showRatios ? '\u25B2' : '\u25BC'}
                </button>
                {showRatios && (
                  <div style={mobileStyles.ratioGrid}>
                    <RatioRow label="F L/R" ratio={frontRatios?.lr} color="#c084fc" />
                    <RatioRow label="F T/B" ratio={frontRatios?.tb} color="#34d399" />
                    <RatioRow label="B L/R" ratio={backRatios?.lr} color="#c084fc" />
                    <RatioRow label="B T/B" ratio={backRatios?.tb} color="#34d399" />
                  </div>
                )}
              </div>
            )}

            {/* Top: images side by side (desktop) or stacked (mobile) */}
            <div style={isMobile ? mobileStyles.topRow : styles.topRow}>
              <div style={fullscreen === 'front' ? styles.imageCardFullscreen : (isMobile ? mobileStyles.imageCard : styles.imageCard)}>
                {/* Floating toolbar */}
                <div style={isMobile ? mobileStyles.floatingToolbar : styles.floatingToolbar}>
                  <span style={isMobile ? mobileStyles.cardTitle : styles.cardTitle}>Front</span>
                  <label style={styles.includeCheckbox}>
                    <input type="checkbox" checked={includeFront} onChange={() => setIncludeFront((v) => !v)} style={styles.checkboxInput} />
                    <span>Include</span>
                  </label>
                  <div style={styles.toolbarSpacer} />
                  <input type="number" min="-90" max="90" value={frontRotation} onChange={(e) => { const v = Number(e.target.value); if (v >= -90 && v <= 90) setFrontRotation(v); }} style={isMobile ? mobileStyles.rotationInput : styles.rotationInput} />
                  <input type="range" min="-90" max="90" value={frontRotation} onChange={(e) => setFrontRotation(Number(e.target.value))} style={isMobile ? mobileStyles.rotationSlider : styles.rotationSlider} />
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
                      <label style={isMobile ? mobileStyles.uploadBtn : styles.uploadBtn} onClick={() => frontInputRef.current?.click()}>
                        Upload
                      </label>
                    </>
                  )}
                </div>
                <div onDrop={handleDrop('front')} onDragOver={preventDefault} style={styles.dropZone}>
                  <ImageCanvas label="front" imageUrl={frontImage} onChange={handleFrontChange} rotation={frontRotation} onClickPlaceholder={() => frontInputRef.current?.click()} isFullscreen={fullscreen === 'front'} zoom={fullscreen === 'front' ? zoom : 1} />
                </div>
              </div>

              <div style={fullscreen === 'back' ? styles.imageCardFullscreen : (isMobile ? mobileStyles.imageCard : styles.imageCard)}>
                {/* Floating toolbar */}
                <div style={isMobile ? mobileStyles.floatingToolbar : styles.floatingToolbar}>
                  <span style={isMobile ? mobileStyles.cardTitle : styles.cardTitle}>Back</span>
                  <label style={styles.includeCheckbox}>
                    <input type="checkbox" checked={includeBack} onChange={() => setIncludeBack((v) => !v)} style={styles.checkboxInput} />
                    <span>Include</span>
                  </label>
                  <div style={styles.toolbarSpacer} />
                  <input type="number" min="-90" max="90" value={backRotation} onChange={(e) => { const v = Number(e.target.value); if (v >= -90 && v <= 90) setBackRotation(v); }} style={isMobile ? mobileStyles.rotationInput : styles.rotationInput} />
                  <input type="range" min="-90" max="90" value={backRotation} onChange={(e) => setBackRotation(Number(e.target.value))} style={isMobile ? mobileStyles.rotationSlider : styles.rotationSlider} />
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
                      <label style={isMobile ? mobileStyles.uploadBtn : styles.uploadBtn} onClick={() => backInputRef.current?.click()}>
                        Upload
                      </label>
                    </>
                  )}
                </div>
                <div onDrop={handleDrop('back')} onDragOver={preventDefault} style={styles.dropZone}>
                  <ImageCanvas label="back" imageUrl={backImage} onChange={handleBackChange} rotation={backRotation} onClickPlaceholder={() => backInputRef.current?.click()} isFullscreen={fullscreen === 'back'} zoom={fullscreen === 'back' ? zoom : 1} />
                </div>
              </div>
            </div>

            {/* Bottom: grade results */}
            <GradeResults
              allStandards={allStandards}
              frontRatios={frontRatios}
              backRatios={backRatios}
              includeFront={includeFront}
              includeBack={includeBack}
              isMobile={isMobile}
            />
          </main>
        <main style={{ ...(isMobile ? mobileStyles.guidelinesMain : styles.guidelinesMain), display: page === 'guidelines' ? 'block' : 'none' }}>
            <Guidelines allStandards={allStandards} isMobile={isMobile} />
          </main>
        <footer style={isMobile ? mobileStyles.footer : styles.footer}>&copy; {new Date().getFullYear()} Perfect Centering</footer>
      </div>

      {/* Mobile bottom tab bar */}
      {isMobile && (
        <nav style={mobileStyles.bottomBar}>
          <button
            onClick={() => setPage('grader')}
            style={{ ...mobileStyles.bottomBarBtn, ...(page === 'grader' ? mobileStyles.bottomBarBtnActive : {}) }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <span style={mobileStyles.bottomBarLabel}>Grader</span>
          </button>
          <button
            onClick={() => setPage('guidelines')}
            style={{ ...mobileStyles.bottomBarBtn, ...(page === 'guidelines' ? mobileStyles.bottomBarBtnActive : {}) }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span style={mobileStyles.bottomBarLabel}>Guide</span>
          </button>
        </nav>
      )}
    </div>
  );
}

function RatioRow({ label, ratio, color }) {
  return (
    <div style={styles.ratioRow}>
      <span style={{ ...styles.ratioLabelText, color }}>{label}</span>
      <span style={styles.ratioValue}>
        {ratio ? `${ratio.larger}/${ratio.smaller}` : '\u2014'}
      </span>
    </div>
  );
}

/* ---- Mobile-specific styles (returned as a function so they can be conditional) ---- */
function getMobileStyles(isMobile) {
  if (!isMobile) return {};
  return {
    root: {
      height: '100vh',
      overflow: 'hidden',
      background: '#0f172a',
      color: '#fff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      display: 'flex',
      flexDirection: 'column',
    },
    mainWrapper: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      overflow: 'hidden',
      paddingBottom: 56, // space for bottom bar
    },
    main: {
      flex: 1,
      minHeight: 0,
      padding: '6px 8px 6px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      overflow: 'auto',
    },
    guidelinesMain: {
      flex: 1,
      minHeight: 0,
      overflow: 'auto',
      padding: '12px 10px 40px',
    },
    topRow: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      flexShrink: 0,
    },
    imageCard: {
      background: '#1e293b',
      borderRadius: 10,
      border: '1px solid #334155',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      minHeight: 300,
      position: 'relative',
    },
    floatingToolbar: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 8px',
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      borderRadius: '0 0 8px 8px',
      margin: '0 4px',
      flexShrink: 0,
      zIndex: 20,
      flexWrap: 'wrap',
    },
    cardTitle: {
      fontSize: 12,
      fontWeight: 700,
      color: '#fff',
    },
    rotationInput: {
      width: 34,
      fontSize: 9,
      fontWeight: 600,
      color: '#94a3b8',
      background: '#0f172a',
      border: '1px solid #334155',
      borderRadius: 4,
      padding: '1px 2px',
      textAlign: 'center',
      fontFamily: 'inherit',
      outline: 'none',
      MozAppearance: 'textfield',
    },
    rotationSlider: {
      width: 44,
      height: 2,
      accentColor: '#10b981',
      cursor: 'pointer',
    },
    uploadBtn: {
      padding: '3px 8px',
      borderRadius: 5,
      border: '1px solid #334155',
      background: '#1e293b',
      color: '#cbd5e1',
      fontSize: 11,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit',
    },
    footer: {
      flexShrink: 0,
      textAlign: 'center',
      padding: '4px 0',
      fontSize: 10,
      color: '#475569',
      borderTop: '1px solid #334155',
    },
    /* ---- Bottom Tab Bar ---- */
    bottomBar: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 56,
      background: '#1e293b',
      borderTop: '1px solid #334155',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 200,
    },
    bottomBarBtn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      padding: '6px 20px',
      borderRadius: 8,
      border: 'none',
      background: 'transparent',
      color: '#94a3b8',
      fontSize: 10,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit',
    },
    bottomBarBtnActive: {
      color: '#10b981',
    },
    bottomBarLabel: {
      fontSize: 10,
      fontWeight: 600,
    },
    /* ---- Inline Ratios (mobile) ---- */
    ratioInline: {
      background: '#1e293b',
      borderRadius: 8,
      border: '1px solid #334155',
      padding: '4px 8px',
      flexShrink: 0,
    },
    ratioToggle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      width: '100%',
      padding: '4px 0',
      border: 'none',
      background: 'transparent',
      color: '#94a3b8',
      fontSize: 11,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'inherit',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    },
    ratioGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: 4,
      paddingTop: 4,
    },
  };
}

const styles = {
  root: {
    height: '100vh',
    overflow: 'hidden',
    background: '#0f172a',
    color: '#fff',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    display: 'flex',
    flexDirection: 'row',
  },

  /* ---- Sidebar ---- */
  sidebar: {
    width: 60,
    flexShrink: 0,
    background: '#1e293b',
    borderRight: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 8,
    zIndex: 100,
  },
  sidebarTop: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  sidebarLogo: {
    width: 40,
    height: 40,
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarLogoImg: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  sidebarNav: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    width: '100%',
  },
  sidebarNavBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: 52,
    padding: '8px 0 6px',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.15s, color 0.15s',
  },
  sidebarNavBtnActive: {
    background: '#10b981',
    color: '#fff',
  },
  sidebarNavLabel: {
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: '0.02em',
  },

  /* ---- Ratio Panel (in sidebar) ---- */
  ratioPanel: {
    marginTop: 'auto',
    width: '100%',
    padding: '8px 6px 10px',
    borderTop: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  ratioPanelTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    textAlign: 'center',
    marginBottom: 2,
  },
  ratioRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3px 4px',
    background: '#0f172a',
    borderRadius: 6,
    gap: 1,
  },
  ratioLabelText: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  ratioValue: {
    fontSize: 12,
    fontWeight: 800,
    color: '#fff',
    fontVariantNumeric: 'tabular-nums',
  },
  ratioHint: {
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 1.4,
    marginTop: 4,
  },

  /* ---- Main Content Wrapper ---- */
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
  },

  /* ---- Main (Grader) ---- */
  main: {
    flex: 1,
    minHeight: 0,
    padding: '8px 12px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  guidelinesMain: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    padding: '16px 20px 40px',
  },

  /* ---- Top Row: 2 image columns ---- */
  topRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    flex: '1 1 0',
    minHeight: 0,
    overflow: 'hidden',
  },

  /* ---- Image Cards ---- */
  imageCard: {
    background: '#1e293b',
    borderRadius: 10,
    border: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minHeight: 0,
    maxHeight: '100%',
    position: 'relative',
  },
  imageCardFullscreen: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 1000,
    background: '#0f172a',
    padding: '12px 20px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },

  /* ---- Floating Toolbar ---- */
  floatingToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 10px',
    background: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(8px)',
    borderRadius: '0 0 8px 8px',
    margin: '0 8px',
    flexShrink: 0,
    zIndex: 20,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#fff',
  },
  toolbarSpacer: {
    flex: 1,
  },
  checkboxInput: {
    accentColor: '#10b981',
  },

  /* ---- Rotation ---- */
  rotationInput: {
    width: 38,
    fontSize: 10,
    fontWeight: 600,
    color: '#94a3b8',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 4,
    padding: '1px 3px',
    textAlign: 'center',
    fontFamily: 'inherit',
    outline: 'none',
    MozAppearance: 'textfield',
  },
  rotationSlider: {
    width: 60,
    height: 2,
    accentColor: '#10b981',
    cursor: 'pointer',
  },

  dropZone: {
    flex: '1 1 0',
    minHeight: 200,
    display: 'flex',
    flexDirection: 'column',
  },

  /* ---- Buttons ---- */
  fullscreenBtn: {
    padding: '3px 8px',
    borderRadius: 5,
    border: '1px solid #334155',
    background: '#1e293b',
    color: '#94a3b8',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
    lineHeight: 1,
  },
  fullscreenControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  zoomBtn: {
    width: 28, height: 28,
    borderRadius: 5,
    border: '1px solid #334155',
    background: '#1e293b',
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  zoomLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#94a3b8',
    minWidth: 36,
    textAlign: 'center',
  },
  doneBtn: {
    padding: '5px 16px',
    borderRadius: 5,
    border: '1px solid #10b981',
    background: '#10b981',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  includeCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 10,
    fontWeight: 600,
    color: '#94a3b8',
    cursor: 'pointer',
  },
  uploadBtn: {
    padding: '4px 12px',
    borderRadius: 5,
    border: '1px solid #334155',
    background: '#1e293b',
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  /* ---- Footer ---- */
  footer: {
    flexShrink: 0,
    textAlign: 'center',
    padding: '6px 0',
    fontSize: 11,
    color: '#475569',
    borderTop: '1px solid #334155',
  },
};
