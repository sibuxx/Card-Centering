import React, { useState, useRef, useEffect, useCallback } from 'react';

const HIT = 12;

const INIT = {
  leftEdge: 0.02, leftBorder: 0.14,
  rightBorder: 0.90, rightEdge: 0.98,
  topEdge: 0.02, topBorder: 0.14,
  bottomBorder: 0.90, bottomEdge: 0.98,
};

const VERT = ['leftEdge', 'leftBorder', 'rightBorder', 'rightEdge'];
const HORIZ = ['topEdge', 'topBorder', 'bottomBorder', 'bottomEdge'];

function lc(key, active) {
  if (active) return '#a78bfa';
  if (key.includes('Edge')) return '#fbbf24';
  if (key.includes('Border') && (key.startsWith('left') || key.startsWith('right'))) return '#c084fc';
  return '#34d399';
}


export default function ImageCanvas({ label, imageUrl, onChange, rotation = 0, onClickPlaceholder, isFullscreen = false, zoom = 1 }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [lines, setLines] = useState({ ...INIT });
  const draggingRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [imgBox, setImgBox] = useState(null); // { x, y, w, h } relative to container
  const baseSize = useRef(null); // { w, h } at zoom=1

  useEffect(() => { draggingRef.current = dragging; }, [dragging]);

  useEffect(() => {
    setLines({ ...INIT });
    setImgBox(null);
    baseSize.current = null;
  }, [imageUrl]);

  const measure = useCallback(() => {
    const img = imgRef.current;
    const ct = containerRef.current;
    if (!img || !ct || !img.naturalWidth) return;
    // Temporarily remove rotation to get unrotated bounding box
    const savedTransform = img.style.transform;
    img.style.transform = 'none';
    const cr = ct.getBoundingClientRect();
    const ir = img.getBoundingClientRect();
    img.style.transform = savedTransform;
    setImgBox({
      x: ir.left - cr.left + ct.scrollLeft,
      y: ir.top - cr.top + ct.scrollTop,
      w: ir.width,
      h: ir.height,
    });
  }, []);

  const onImgLoad = useCallback(() => {
    // Capture base size on first load (zoom is always 1 on load)
    const img = imgRef.current;
    if (img) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (img.naturalWidth && !baseSize.current) {
          baseSize.current = { w: img.clientWidth, h: img.clientHeight };
        }
        measure();
      }));
    }
  }, [measure]);

  useEffect(() => {
    if (!imageUrl) return;
    const fn = () => requestAnimationFrame(measure);
    window.addEventListener('resize', fn);
    // ResizeObserver catches container size changes (e.g. fullscreen toggle)
    const ro = containerRef.current ? new ResizeObserver(fn) : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);
    return () => {
      window.removeEventListener('resize', fn);
      ro?.disconnect();
    };
  }, [imageUrl, measure]);


  // Reset baseSize when fullscreen changes so we recapture at the new container size
  useEffect(() => {
    baseSize.current = null;
  }, [isFullscreen]);

  // Re-measure when zoom changes (image width changes)
  useEffect(() => {
    if (!imageUrl) return;
    // Capture base size if we don't have it yet (at zoom=1, before any scaling)
    const img = imgRef.current;
    if (img && img.naturalWidth && !baseSize.current && zoom === 1) {
      requestAnimationFrame(() => {
        if (!baseSize.current && img.clientWidth) {
          baseSize.current = { w: img.clientWidth, h: img.clientHeight };
        }
        requestAnimationFrame(measure);
      });
      return;
    }
    requestAnimationFrame(() => requestAnimationFrame(measure));
  }, [zoom, imageUrl, measure, isFullscreen]);

  // Emit ratios
  useEffect(() => {
    if (!imgBox) return;
    const lW = lines.leftBorder - lines.leftEdge;
    const rW = lines.rightEdge - lines.rightBorder;
    const tW = lines.topBorder - lines.topEdge;
    const bW = lines.bottomEdge - lines.bottomBorder;

    let lr = null, tb = null;
    if (lW + rW > 0) {
      const p = (lW / (lW + rW)) * 100;
      const big = Math.max(p, 100 - p), sm = Math.min(p, 100 - p);
      lr = { larger: r1(big), smaller: r1(sm), rawLarger: big };
    }
    if (tW + bW > 0) {
      const p = (tW / (tW + bW)) * 100;
      const big = Math.max(p, 100 - p), sm = Math.min(p, 100 - p);
      tb = { larger: r1(big), smaller: r1(sm), rawLarger: big };
    }
    onChange?.({ lr, tb });
  }, [lines, imgBox, onChange]);

  // Convert page coords to 0-1 within image
  const toNorm = useCallback((clientX, clientY) => {
    if (!imgBox || !containerRef.current) return { x: 0.5, y: 0.5 };
    const ct = containerRef.current;
    const cr = ct.getBoundingClientRect();
    return {
      x: clamp((clientX - cr.left + ct.scrollLeft - imgBox.x) / imgBox.w, 0, 1),
      y: clamp((clientY - cr.top + ct.scrollTop - imgBox.y) / imgBox.h, 0, 1),
    };
  }, [imgBox]);

  const onDown = useCallback((e) => {
    e.preventDefault();
    if (!imgBox) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const p = toNorm(cx, cy);
    const xPx = p.x * imgBox.w;
    const yPx = p.y * imgBox.h;

    const cands = [
      ...VERT.map((k) => ({ key: k, dist: Math.abs(xPx - lines[k] * imgBox.w) })),
      ...HORIZ.map((k) => ({ key: k, dist: Math.abs(yPx - lines[k] * imgBox.h) })),
    ];
    cands.sort((a, b) => a.dist - b.dist);
    if (cands[0].dist < HIT * 2) setDragging(cands[0].key);
  }, [lines, imgBox, toNorm]);

  // Global move/up while dragging
  useEffect(() => {
    if (!dragging) return;

    const onMove = (e) => {
      const d = draggingRef.current;
      if (!d || !imgBox) return;
      e.preventDefault();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const ct = containerRef.current;
      if (!ct) return;
      const cr = ct.getBoundingClientRect();
      const pos = {
        x: clamp((cx - cr.left + ct.scrollLeft - imgBox.x) / imgBox.w, 0, 1),
        y: clamp((cy - cr.top + ct.scrollTop - imgBox.y) / imgBox.h, 0, 1),
      };

      setLines((prev) => {
        const n = { ...prev };
        const G = 0.01;
        switch (d) {
          case 'leftEdge': n.leftEdge = clamp(pos.x, 0, prev.leftBorder - G); break;
          case 'leftBorder': n.leftBorder = clamp(pos.x, prev.leftEdge + G, prev.rightBorder - G); break;
          case 'rightBorder': n.rightBorder = clamp(pos.x, prev.leftBorder + G, prev.rightEdge - G); break;
          case 'rightEdge': n.rightEdge = clamp(pos.x, prev.rightBorder + G, 1); break;
          case 'topEdge': n.topEdge = clamp(pos.y, 0, prev.topBorder - G); break;
          case 'topBorder': n.topBorder = clamp(pos.y, prev.topEdge + G, prev.bottomBorder - G); break;
          case 'bottomBorder': n.bottomBorder = clamp(pos.y, prev.topBorder + G, prev.bottomEdge - G); break;
          case 'bottomEdge': n.bottomEdge = clamp(pos.y, prev.bottomBorder + G, 1); break;
        }
        return n;
      });
    };

    const onUp = () => setDragging(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging, imgBox]);

  if (!imageUrl) {
    return (
      <div style={styles.placeholder} onClick={onClickPlaceholder}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        <span style={{ color: '#94a3b8', fontSize: 12 }}>Upload or drop {label} image</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={isFullscreen ? styles.containerFullscreen : styles.container} onMouseDown={onDown} onTouchStart={onDown}>
      <img
        ref={imgRef}
        src={imageUrl}
        alt={label}
        onLoad={onImgLoad}
        style={{
          ...(isFullscreen ? styles.imageFullscreen : styles.image),
          ...(isFullscreen && zoom !== 1 && baseSize.current ? { maxWidth: 'none', maxHeight: 'none', width: baseSize.current.w * zoom, height: baseSize.current.h * zoom, objectFit: 'fill' } : {}),
          transform: rotation ? `rotate(${rotation}deg)` : undefined,
        }}
        draggable={false}
      />
      {imgBox && (
        <>
          {/* Shade areas outside the edge lines */}
          {/* Left shade */}
          <div style={{ position: 'absolute', top: imgBox.y, left: imgBox.x, width: lines.leftEdge * imgBox.w, height: imgBox.h, background: 'rgba(0,0,0,0.5)', pointerEvents: 'none', zIndex: 5 }} />
          {/* Right shade */}
          <div style={{ position: 'absolute', top: imgBox.y, left: imgBox.x + lines.rightEdge * imgBox.w, width: (1 - lines.rightEdge) * imgBox.w, height: imgBox.h, background: 'rgba(0,0,0,0.5)', pointerEvents: 'none', zIndex: 5 }} />
          {/* Top shade (between left and right edges) */}
          <div style={{ position: 'absolute', top: imgBox.y, left: imgBox.x + lines.leftEdge * imgBox.w, width: (lines.rightEdge - lines.leftEdge) * imgBox.w, height: lines.topEdge * imgBox.h, background: 'rgba(0,0,0,0.5)', pointerEvents: 'none', zIndex: 5 }} />
          {/* Bottom shade (between left and right edges) */}
          <div style={{ position: 'absolute', top: imgBox.y + lines.bottomEdge * imgBox.h, left: imgBox.x + lines.leftEdge * imgBox.w, width: (lines.rightEdge - lines.leftEdge) * imgBox.w, height: (1 - lines.bottomEdge) * imgBox.h, background: 'rgba(0,0,0,0.5)', pointerEvents: 'none', zIndex: 5 }} />

          {/* Border percentage labels (shown when not dragging) */}
          {!dragging && (() => {
            const lW = lines.leftBorder - lines.leftEdge;
            const rW = lines.rightEdge - lines.rightBorder;
            const tW = lines.topBorder - lines.topEdge;
            const bW = lines.bottomEdge - lines.bottomBorder;
            const lrTotal = lW + rW;
            const tbTotal = tW + bW;
            const lPct = lrTotal > 0 ? r1((lW / lrTotal) * 100) : 0;
            const rPct = lrTotal > 0 ? r1((rW / lrTotal) * 100) : 0;
            const tPct = tbTotal > 0 ? r1((tW / tbTotal) * 100) : 0;
            const bPct = tbTotal > 0 ? r1((bW / tbTotal) * 100) : 0;
            const pctStyle = { position: 'absolute', fontSize: 10, fontWeight: 700, color: '#fff', pointerEvents: 'none', zIndex: 15, textShadow: '0 1px 3px rgba(0,0,0,0.8)' };
            const midY = imgBox.y + ((lines.topEdge + lines.bottomEdge) / 2) * imgBox.h;
            const midX = imgBox.x + ((lines.leftEdge + lines.rightEdge) / 2) * imgBox.w;
            return (
              <>
                {/* Left % */}
                <div style={{ ...pctStyle, top: midY - 6, left: imgBox.x + ((lines.leftEdge + lines.leftBorder) / 2) * imgBox.w, transform: 'translateX(-50%)' }}>{lPct}%</div>
                {/* Right % */}
                <div style={{ ...pctStyle, top: midY - 6, left: imgBox.x + ((lines.rightBorder + lines.rightEdge) / 2) * imgBox.w, transform: 'translateX(-50%)' }}>{rPct}%</div>
                {/* Top % */}
                <div style={{ ...pctStyle, top: imgBox.y + ((lines.topEdge + lines.topBorder) / 2) * imgBox.h - 6, left: midX, transform: 'translateX(-50%)' }}>{tPct}%</div>
                {/* Bottom % */}
                <div style={{ ...pctStyle, top: imgBox.y + ((lines.bottomBorder + lines.bottomEdge) / 2) * imgBox.h - 6, left: midX, transform: 'translateX(-50%)' }}>{bPct}%</div>
              </>
            );
          })()}

          {VERT.map((key) => {
            const px = imgBox.x + lines[key] * imgBox.w;
            return (
              <div key={key} style={{
                position: 'absolute', top: imgBox.y, height: imgBox.h,
                left: px, width: 0,
                borderLeft: `2px dashed ${lc(key, dragging === key)}`,
                cursor: 'ew-resize', zIndex: 10,
                pointerEvents: 'none',
              }} />
            );
          })}
          {HORIZ.map((key) => {
            const py = imgBox.y + lines[key] * imgBox.h;
            return (
              <div key={key} style={{
                position: 'absolute', left: imgBox.x, width: imgBox.w,
                top: py, height: 0,
                borderTop: `2px dashed ${lc(key, dragging === key)}`,
                cursor: 'ns-resize', zIndex: 10,
                pointerEvents: 'none',
              }} />
            );
          })}
        </>
      )}
    </div>
  );
}

function r1(n) { return Math.round(n * 10) / 10; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

const styles = {
  placeholder: {
    flex: '1 1 0', minHeight: 200,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    border: '2px dashed #334155', borderRadius: 8, background: '#0f172a',
    cursor: 'pointer',
  },
  container: {
    position: 'relative',
    flex: '1 1 0', minHeight: 200,
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    cursor: 'crosshair',
    userSelect: 'none', touchAction: 'none',
  },
  containerFullscreen: {
    position: 'relative',
    flex: '1 1 0',
    minHeight: 0,
    overflow: 'auto',
    display: 'flex',
    cursor: 'crosshair',
    userSelect: 'none', touchAction: 'none',
  },
  image: {
    maxWidth: '100%', maxHeight: '100%',
    objectFit: 'contain', display: 'block',
    borderRadius: 4, pointerEvents: 'none',
  },
  imageFullscreen: {
    maxWidth: '100%',
    objectFit: 'contain', display: 'block',
    borderRadius: 4, pointerEvents: 'none',
    margin: 'auto',
  },
};
