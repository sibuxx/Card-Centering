import React, { useState, useRef, useEffect, useCallback } from 'react';

const LINE_HIT_ZONE = 12;

export default function ImageCanvas({ label, imageUrl, onChange }) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [lines, setLines] = useState({ left: 0.1, right: 0.9, top: 0.1, bottom: 0.9 });
  const [dragging, setDragging] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset lines when image changes
  useEffect(() => {
    setLines({ left: 0.1, right: 0.9, top: 0.1, bottom: 0.9 });
    setImageLoaded(false);
  }, [imageUrl]);

  const handleImageLoad = useCallback((e) => {
    const img = e.target;
    const container = containerRef.current;
    if (!container) return;

    const maxW = container.clientWidth;
    const maxH = 520;
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    setDims({ w, h });
    setImageLoaded(true);
  }, []);

  // Emit ratios whenever lines change
  useEffect(() => {
    if (!imageLoaded) return;

    const leftBorder = lines.left;
    const rightBorder = 1 - lines.right;
    const topBorder = lines.top;
    const bottomBorder = 1 - lines.bottom;

    const lrTotal = leftBorder + rightBorder;
    const tbTotal = topBorder + bottomBorder;

    let lrRatio = null;
    let tbRatio = null;

    if (lrTotal > 0) {
      const lPct = (leftBorder / lrTotal) * 100;
      const rPct = (rightBorder / lrTotal) * 100;
      const larger = Math.max(lPct, rPct);
      const smaller = Math.min(lPct, rPct);
      lrRatio = { larger: round1(larger), smaller: round1(smaller) };
    }

    if (tbTotal > 0) {
      const tPct = (topBorder / tbTotal) * 100;
      const bPct = (bottomBorder / tbTotal) * 100;
      const larger = Math.max(tPct, bPct);
      const smaller = Math.min(tPct, bPct);
      tbRatio = { larger: round1(larger), smaller: round1(smaller) };
    }

    onChange?.({ lr: lrRatio, tb: tbRatio });
  }, [lines, imageLoaded, onChange]);

  const getPos = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
  }, []);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    const pos = getPos(e);
    const rect = e.currentTarget.getBoundingClientRect();
    const xPx = pos.x * rect.width;
    const yPx = pos.y * rect.height;

    // Find closest line within hit zone
    const candidates = [
      { key: 'left', dist: Math.abs(xPx - lines.left * rect.width), axis: 'x' },
      { key: 'right', dist: Math.abs(xPx - lines.right * rect.width), axis: 'x' },
      { key: 'top', dist: Math.abs(yPx - lines.top * rect.height), axis: 'y' },
      { key: 'bottom', dist: Math.abs(yPx - lines.bottom * rect.height), axis: 'y' },
    ];

    candidates.sort((a, b) => a.dist - b.dist);
    if (candidates[0].dist < LINE_HIT_ZONE) {
      setDragging(candidates[0].key);
    }
  }, [lines, getPos]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return;
    e.preventDefault();
    const pos = getPos(e);

    setLines((prev) => {
      const next = { ...prev };
      if (dragging === 'left') {
        next.left = Math.min(pos.x, prev.right - 0.02);
      } else if (dragging === 'right') {
        next.right = Math.max(pos.x, prev.left + 0.02);
      } else if (dragging === 'top') {
        next.top = Math.min(pos.y, prev.bottom - 0.02);
      } else if (dragging === 'bottom') {
        next.bottom = Math.max(pos.y, prev.top + 0.02);
      }
      return next;
    });
  }, [dragging, getPos]);

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  // Global pointer-up listener for reliability
  useEffect(() => {
    if (dragging) {
      const up = () => setDragging(null);
      window.addEventListener('mouseup', up);
      window.addEventListener('touchend', up);
      return () => {
        window.removeEventListener('mouseup', up);
        window.removeEventListener('touchend', up);
      };
    }
  }, [dragging]);

  if (!imageUrl) {
    return (
      <div ref={containerRef} style={styles.placeholder}>
        <div style={styles.placeholderInner}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <span style={styles.placeholderText}>Upload {label} image</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={styles.canvasContainer}>
      <div
        style={{
          ...styles.imageWrapper,
          width: dims.w || '100%',
          height: dims.h || 'auto',
          cursor: dragging ? 'grabbing' : 'default',
        }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        <img
          src={imageUrl}
          alt={label}
          onLoad={handleImageLoad}
          style={styles.image}
          draggable={false}
        />

        {imageLoaded && (
          <>
            {/* Left line */}
            <div
              style={{
                ...styles.lineVertical,
                left: `${lines.left * 100}%`,
                borderColor: dragging === 'left' ? '#00e5ff' : '#ff4081',
              }}
            >
              <div style={{ ...styles.lineLabel, top: 4, left: 6 }}>L</div>
            </div>

            {/* Right line */}
            <div
              style={{
                ...styles.lineVertical,
                left: `${lines.right * 100}%`,
                borderColor: dragging === 'right' ? '#00e5ff' : '#ff4081',
              }}
            >
              <div style={{ ...styles.lineLabel, top: 4, right: 6 }}>R</div>
            </div>

            {/* Top line */}
            <div
              style={{
                ...styles.lineHorizontal,
                top: `${lines.top * 100}%`,
                borderColor: dragging === 'top' ? '#00e5ff' : '#76ff03',
              }}
            >
              <div style={{ ...styles.lineLabel, left: 6, top: 4 }}>T</div>
            </div>

            {/* Bottom line */}
            <div
              style={{
                ...styles.lineHorizontal,
                top: `${lines.bottom * 100}%`,
                borderColor: dragging === 'bottom' ? '#00e5ff' : '#76ff03',
              }}
            >
              <div style={{ ...styles.lineLabel, left: 6, bottom: 4 }}>B</div>
            </div>

            {/* Border dimension overlays */}
            <div style={{ ...styles.dimLabel, left: lines.left * 50 + '%', top: '50%', transform: 'translate(-50%, -50%)' }}>
              {round1(lines.left * 100)}%
            </div>
            <div style={{ ...styles.dimLabel, left: (lines.right + (1 - lines.right) / 2) * 100 + '%', top: '50%', transform: 'translate(-50%, -50%)' }}>
              {round1((1 - lines.right) * 100)}%
            </div>
            <div style={{ ...styles.dimLabel, top: lines.top * 50 + '%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              {round1(lines.top * 100)}%
            </div>
            <div style={{ ...styles.dimLabel, top: (lines.bottom + (1 - lines.bottom) / 2) * 100 + '%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              {round1((1 - lines.bottom) * 100)}%
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

const styles = {
  canvasContainer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  placeholder: {
    width: '100%',
    height: 380,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed #333',
    borderRadius: 12,
    background: '#111',
  },
  placeholderInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  placeholderText: {
    color: '#555',
    fontSize: 14,
    fontWeight: 500,
  },
  imageWrapper: {
    position: 'relative',
    userSelect: 'none',
    touchAction: 'none',
    flexShrink: 0,
  },
  image: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: 4,
  },
  lineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 0,
    borderLeft: '2px dashed',
    cursor: 'ew-resize',
    zIndex: 10,
    // Wider hit area via padding
    paddingLeft: LINE_HIT_ZONE,
    paddingRight: LINE_HIT_ZONE,
    marginLeft: -LINE_HIT_ZONE,
  },
  lineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0,
    borderTop: '2px dashed',
    cursor: 'ns-resize',
    zIndex: 10,
    paddingTop: LINE_HIT_ZONE,
    paddingBottom: LINE_HIT_ZONE,
    marginTop: -LINE_HIT_ZONE,
  },
  lineLabel: {
    position: 'absolute',
    fontSize: 11,
    fontWeight: 700,
    color: '#fff',
    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
    pointerEvents: 'none',
  },
  dimLabel: {
    position: 'absolute',
    fontSize: 11,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.7)',
    textShadow: '0 1px 4px rgba(0,0,0,0.9)',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  },
};
