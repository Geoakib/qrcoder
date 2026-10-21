import { state } from './state.js';
import { isFinderModule } from './matrix.js';

const SVG_SIZE = 600;

function shouldDrawOuterDot(r, c, distFromCenter, centerIdx) {
  const pattern = state.outerPattern;
  if (pattern === 'empty') return false;
  const dr = Math.round(r - centerIdx);
  const dc = Math.round(c - centerIdx);
  if (pattern === 'checkerboard') return Math.abs(dr + dc) % 2 === 0;
  if (pattern === 'concentric') return Math.round(distFromCenter) % 2 === 0;
  if (pattern === 'tapa_geo') {
    return ((Math.abs(dr) + Math.abs(dc)) % 2 === 0) || (Math.abs(dr) === Math.abs(dc));
  }
  const ar = r + 60;
  const ac = c + 60;
  const hash = Math.sin(ar * 12.9898 + ac * 78.233) * 43758.5453;
  const frac = hash - Math.floor(hash);
  return frac > 0.45;
}

export function buildCenterIconSVG(cx, cy, maxR, fg, bg) {
  if (state.centerIcon === 'empty' || maxR < 6) return '';
  const r = maxR * 0.72;
  let motif = '';

  if (state.centerIcon === 'rub_el_hizb') {
    const s = r * 1.15;
    const half = s / 2;
    motif = `
      <g transform="translate(${cx}, ${cy})">
        <rect x="${-half}" y="${-half}" width="${s}" height="${s}" rx="${s * 0.1}" fill="none" stroke="${fg}" stroke-width="${Math.max(2.5, r * 0.18)}"/>
        <rect x="${-half}" y="${-half}" width="${s}" height="${s}" rx="${s * 0.1}" transform="rotate(45)" fill="none" stroke="${fg}" stroke-width="${Math.max(2.5, r * 0.18)}"/>
        <circle cx="0" cy="0" r="${r * 0.22}" fill="${fg}"/>
      </g>
    `;
  } else if (state.centerIcon === 'moana_wave') {
    const w = r * 1.25;
    const h = r * 0.52;
    motif = `
      <path d="M ${cx - w} ${cy - h * 0.5} Q ${cx - w * 0.5} ${cy - h * 1.4}, ${cx} ${cy - h * 0.5} T ${cx + w} ${cy - h * 0.5}" fill="none" stroke="${fg}" stroke-width="${Math.max(2.8, r * 0.22)}" stroke-linecap="round"/>
      <path d="M ${cx - w * 0.85} ${cy + h * 0.55} Q ${cx - w * 0.42} ${cy - h * 0.35}, ${cx} ${cy + h * 0.55} T ${cx + w * 0.85} ${cy + h * 0.55}" fill="none" stroke="${fg}" stroke-width="${Math.max(2.8, r * 0.22)}" stroke-linecap="round"/>
    `;
  } else if (state.centerIcon === 'tapa_diamond') {
    const d = r * 1.05;
    motif = `
      <g transform="translate(${cx}, ${cy})">
        <polygon points="0,${-d} ${d},0 0,${d} ${-d},0" fill="none" stroke="${fg}" stroke-width="${Math.max(2.5, r * 0.18)}" stroke-linejoin="round"/>
        <polygon points="0,${-d * 0.52} ${d * 0.52},0 0,${d * 0.52} ${-d * 0.52},0" fill="${fg}"/>
      </g>
    `;
  } else if (state.centerIcon === 'palm_flora') {
    let petals = '';
    for (let angle = 0; angle < 360; angle += 72) {
      petals += `<path d="M 0 0 C ${-r * 0.38} ${-r * 0.4}, ${-r * 0.38} ${-r * 0.92}, 0 ${-r} C ${r * 0.38} ${-r * 0.92}, ${r * 0.38} ${-r * 0.4}, 0 0" fill="${fg}" transform="rotate(${angle})"/>`;
    }
    motif = `<g transform="translate(${cx}, ${cy})">${petals}<circle cx="0" cy="0" r="${r * 0.18}" fill="${state.transparentBg ? 'none' : bg}"/></g>`;
  } else if (state.centerIcon === 'geo_pin') {
    const pr = r * 0.95;
    motif = `
      <g transform="translate(${cx}, ${cy})">
        <path d="M 0 ${pr} C ${-pr * 0.75} ${pr * 0.2}, ${-pr * 0.85} ${-pr * 0.95}, 0 ${-pr * 0.95} C ${pr * 0.85} ${-pr * 0.95}, ${pr * 0.75} ${pr * 0.2}, 0 ${pr} Z" fill="none" stroke="${fg}" stroke-width="${Math.max(2.5, r * 0.2)}" stroke-linejoin="round"/>
        <circle cx="0" cy="${-pr * 0.22}" r="${pr * 0.26}" fill="${fg}"/>
      </g>
    `;
  } else if (state.centerIcon === 'custom_text') {
    const txt = (state.centerInitials || 'M').toUpperCase().slice(0, 3);
    const fontSize = txt.length === 1 ? r * 1.35 : (txt.length === 2 ? r * 1.05 : r * 0.82);
    motif = `<text x="${cx}" y="${cy}" fill="${fg}" font-family="Inter, sans-serif" font-weight="800" font-size="${fontSize.toFixed(1)}" text-anchor="middle" dominant-baseline="central" letter-spacing="1">${txt}</text>`;
  }

  if (state.keepIconUpright && state.rotation !== 0) {
    return `<g transform="rotate(${-state.rotation} ${cx} ${cy})">${motif}</g>`;
  }
  return motif;
}

export function generateSVGString(matrix) {
  const N = matrix.length;
  const centerIdx = (N - 1) / 2;
  const cx = SVG_SIZE / 2;
  const cy = SVG_SIZE / 2;

  const halfCornerDiag = Math.SQRT2 * (N / 2);
  const badgeRadiusModules = halfCornerDiag + state.badgePadding;
  const maxSpanModules = badgeRadiusModules * 2 + 3.2;
  const cellSize = SVG_SIZE / maxSpanModules;
  const dotRadius = cellSize * state.dotRadiusRatio;

  const fg = state.fgColor;
  const bg = state.bgColor;
  const outerCirclePx = badgeRadiusModules * cellSize;

  let svg = `<svg id="customQrSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_SIZE} ${SVG_SIZE}" width="100%" height="100%">`;

  if (!state.transparentBg) {
    svg += `<circle cx="${cx}" cy="${cy}" r="${(outerCirclePx + cellSize * 1.15).toFixed(2)}" fill="${bg}"/>`;
  }

  if (state.borderStyle === 'solid') {
    svg += `<circle cx="${cx}" cy="${cy}" r="${(outerCirclePx + cellSize * 0.55).toFixed(2)}" fill="none" stroke="${fg}" stroke-width="${(cellSize * 0.45).toFixed(2)}"/>`;
  } else if (state.borderStyle === 'dotted') {
    const ringR = outerCirclePx + cellSize * 0.55;
    const dotCount = Math.round((2 * Math.PI * ringR) / (cellSize * 1.25));
    for (let i = 0; i < dotCount; i++) {
      const a = (i / dotCount) * Math.PI * 2;
      svg += `<circle cx="${(cx + Math.cos(a) * ringR).toFixed(2)}" cy="${(cy + Math.sin(a) * ringR).toFixed(2)}" r="${(dotRadius * 0.72).toFixed(2)}" fill="${fg}"/>`;
    }
  } else if (state.borderStyle === 'double_stitch') {
    svg += `<circle cx="${cx}" cy="${cy}" r="${(outerCirclePx + cellSize * 0.85).toFixed(2)}" fill="none" stroke="${fg}" stroke-width="${(cellSize * 0.32).toFixed(2)}"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="${(outerCirclePx + cellSize * 0.28).toFixed(2)}" fill="none" stroke="${fg}" stroke-width="${(cellSize * 0.28).toFixed(2)}" stroke-dasharray="${(cellSize * 0.75).toFixed(2)} ${(cellSize * 0.48).toFixed(2)}" stroke-linecap="round"/>`;
  }

  svg += `<g transform="rotate(${state.rotation} ${cx} ${cy})">`;

  if (state.finderStyle === 'rounded') {
    const drawSmoothFinder = (centerRow, centerCol) => {
      const fx = cx + (centerCol - centerIdx - 3) * cellSize;
      const fy = cy + (centerRow - centerIdx - 3) * cellSize;
      const fSize = 6 * cellSize;
      const innerSize = 3 * cellSize;
      const ix = cx + (centerCol - centerIdx - 1.5) * cellSize;
      const iy = cy + (centerRow - centerIdx - 1.5) * cellSize;
      svg += `<rect x="${fx.toFixed(2)}" y="${fy.toFixed(2)}" width="${fSize.toFixed(2)}" height="${fSize.toFixed(2)}" rx="${(cellSize * 1.4).toFixed(2)}" fill="none" stroke="${fg}" stroke-width="${(cellSize * 0.92).toFixed(2)}"/>`;
      svg += `<rect x="${ix.toFixed(2)}" y="${iy.toFixed(2)}" width="${innerSize.toFixed(2)}" height="${innerSize.toFixed(2)}" rx="${(cellSize * 0.75).toFixed(2)}" fill="${fg}"/>`;
    };
    drawSmoothFinder(3, 3);
    drawSmoothFinder(3, N - 4);
    drawSmoothFinder(N - 4, 3);
  }

  const margin = Math.ceil(badgeRadiusModules - (N / 2)) + 2;
  const minIdx = -margin;
  const maxIdx = N - 1 + margin;
  let removedCenterModules = 0;

  for (let r = minIdx; r <= maxIdx; r++) {
    for (let c = minIdx; c <= maxIdx; c++) {
      const dr = r - centerIdx;
      const dc = c - centerIdx;
      const distModules = Math.hypot(dr, dc);
      if (distModules > badgeRadiusModules - 0.35) continue;
      const insideOriginalQR = (r >= 0 && r < N && c >= 0 && c < N);
      if (insideOriginalQR) {
        const inFinder = isFinderModule(r, c, N);
        if (!inFinder && state.centerHoleRadius > 0 && distModules <= state.centerHoleRadius) {
          if (matrix[r][c] === 1) removedCenterModules++;
          continue;
        }
        if (state.finderStyle === 'rounded' && inFinder) continue;
        if (matrix[r][c] === 1) {
          const x = cx + dc * cellSize;
          const y = cy + dr * cellSize;
          svg += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${dotRadius.toFixed(2)}" fill="${fg}"/>`;
        }
      } else if (state.outerPattern !== 'empty') {
        const distOutsideRow = r < 0 ? -r : (r > N - 1 ? r - (N - 1) : 0);
        const distOutsideCol = c < 0 ? -c : (c > N - 1 ? c - (N - 1) : 0);
        const chebyshevOutside = Math.max(distOutsideRow, distOutsideCol);
        if (chebyshevOutside <= state.quietZoneGap) continue;
        if (shouldDrawOuterDot(r, c, distModules, centerIdx)) {
          const x = cx + dc * cellSize;
          const y = cy + dr * cellSize;
          svg += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${dotRadius.toFixed(2)}" fill="${fg}"/>`;
        }
      }
    }
  }

  if (state.centerHoleRadius > 0.8 && state.centerDotRing) {
    const ringR = (state.centerHoleRadius - 0.35) * cellSize;
    const count = state.centerRingCount;
    const ringDotR = dotRadius * 0.82;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const rx = cx + Math.cos(angle) * ringR;
      const ry = cy + Math.sin(angle) * ringR;
      svg += `<circle cx="${rx.toFixed(2)}" cy="${ry.toFixed(2)}" r="${ringDotR.toFixed(2)}" fill="${fg}"/>`;
    }
  }

  const iconMaxRadiusPx = (state.centerHoleRadius - (state.centerDotRing ? 0.72 : 0.22)) * cellSize;
  svg += buildCenterIconSVG(cx, cy, iconMaxRadiusPx, fg, bg);

  svg += `</g></svg>`;
  return { svg, removedCenterModules };
}
