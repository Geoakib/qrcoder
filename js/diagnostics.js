import { state } from './state.js';

const EC_PERCENT_MAP = { L: 7, M: 15, Q: 25, H: 30 };

export function runDiagnostics(N, removedModules) {
  const totalModules = N * N;
  const cutoutAreaPct = ((Math.PI * state.centerHoleRadius * state.centerHoleRadius) / totalModules) * 100;
  const activeEc = state.dataSource === 'preset' ? 'M' : state.ecLevel;
  const ecPct = EC_PERCENT_MAP[activeEc];
  const safeLimit = ecPct * 0.65;
  const warnLimit = ecPct * 0.95;

  let status = 'optimal';
  if (cutoutAreaPct > warnLimit) status = 'danger';
  else if (cutoutAreaPct > safeLimit) status = 'moderate';

  function luminance(c) {
    c = c.replace('#', '');
    const rgb = c.match(/.{2}/g).map((h) => parseInt(h, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }
  const l1 = luminance(state.fgColor);
  const l2 = luminance(state.bgColor);
  const contrastRatio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  const contrastPass = contrastRatio >= 3;

  const recommendations = [];
  if (status === 'danger') recommendations.push('Switch to EC H or reduce center cutout size.');
  else if (status === 'moderate') recommendations.push('Consider EC H for safer scanning.');
  if (!contrastPass) recommendations.push('Increase foreground / background contrast.');
  if (state.quietZoneGap < 2) recommendations.push('Increase quiet zone to at least 2 modules.');

  return {
    cutoutAreaPct,
    ecPct,
    activeEc,
    safeLimit,
    warnLimit,
    status,
    contrastRatio,
    contrastPass,
    recommendations,
  };
}
