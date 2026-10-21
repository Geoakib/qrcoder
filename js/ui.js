import { CONFIG } from './config.js';
import { state, loadState, saveState, resetState, defaultState } from './state.js';
import { encodePayload, getFormFields } from './encoder.js';
import { computeMatrix } from './matrix.js';
import { generateSVGString } from './svggen.js';
import { runDiagnostics } from './diagnostics.js';
import { downloadSVG, downloadPNG, downloadPDF } from './export.js';
import { renderVectorStage, renderCapStage, renderCardStage, renderStickerStage } from './mockups.js';

let renderTimeout = null;
let activeMatrix = [];

function el(id) {
  return document.getElementById(id);
}

function computeActiveMatrix() {
  let text = '';
  if (state.dataSource === 'preset') {
    activeMatrix = MAURI_PRESET_MATRIX;
    return activeMatrix.length;
  }
  text = encodePayload(state.qrType, state[`${state.qrType}Fields`] || { value: state.qrText });
  state.qrText = text;
  const res = computeMatrix(text, state.ecLevel);
  activeMatrix = res.modules;
  return res.size;
}

const MAURI_PRESET_MATRIX = [
  [1,1,1,1,1,1,1,0,1,1,0,0,0,0,1,1,0,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,1,0,0,1,0,0,0,1,0,1,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,1,1,0,0,0,1,1,1,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,1,0,1,1,0,0,1,1,0,1,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,0,1,1,0,0,1,0,0,1,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,0,1,1,0,0,0,0,0,0,0],
  [1,1,0,1,1,1,1,1,1,0,1,1,0,0,1,1,0,1,1,1,0,0,1,1,1],
  [1,0,1,1,0,1,1,1,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0],
  [1,1,1,0,1,0,0,1,1,1,0,1,0,0,1,1,0,0,1,1,0,0,1,0,0],
  [0,1,0,1,1,1,0,0,0,1,0,1,0,1,1,1,1,0,1,0,1,1,1,0,1],
  [1,0,0,0,1,1,1,1,0,0,0,1,1,0,1,0,1,0,0,1,1,1,1,1,1],
  [0,0,0,0,0,1,0,1,1,0,0,1,0,1,0,0,0,0,1,1,0,0,1,0,1],
  [1,1,0,1,1,0,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,0],
  [1,1,1,0,1,0,1,0,0,0,0,1,0,1,1,0,1,0,1,1,1,1,0,0,1],
  [1,1,0,0,0,1,0,0,1,1,0,1,1,1,1,0,1,0,0,1,1,1,1,0,0],
  [0,0,0,0,0,0,0,0,1,1,0,0,1,0,1,1,1,0,0,0,1,0,0,1,0],
  [1,1,1,1,1,1,1,0,1,1,1,0,1,0,0,1,1,1,1,1,1,0,1,1,0],
  [1,0,0,0,0,0,1,0,1,1,1,1,0,1,1,0,1,0,0,0,1,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,1,1,1,0,0,1,0,1,0,1,0,1,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,1,0,1,1,1,0,0,1,1,1,1,1,0,0,1,1],
  [1,0,1,1,1,0,1,0,0,1,1,0,0,1,0,0,0,0,0,0,0,0,1,0,1],
  [1,0,1,1,1,0,1,0,0,1,0,1,0,1,1,0,0,0,1,0,1,1,0,1,1],
  [1,1,1,1,1,1,1,0,1,0,0,1,0,1,1,0,0,1,1,1,1,0,1,0,0],
];

function buildDataForm() {
  const container = el('dataForm');
  if (!container) return;
  const fields = getFormFields(state.qrType);
  let html = '';
  fields.forEach((f) => {
    if (f.type === 'select') {
      html += `
        <div class="mb-3">
          <label class="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">${f.label}</label>
          <select id="field_${f.label.replace(/\s+/g, '_')}" class="w-full bg-slate-950 text-slate-100 text-xs rounded-lg pl-3 pr-10 py-2 border border-slate-700 focus:border-amber-500 focus:outline-none">
            ${f.options.map((o) => `<option value="${o}" ${state.wifiFields && f.label === 'Security' && state.wifiFields.auth === o ? 'selected' : ''}>${o}</option>`).join('')}
          </select>
        </div>
      `;
    } else {
      const key = f.label.replace(/\s+/g, '_').toLowerCase();
      let curVal = '';
      if (state[`${state.qrType}Fields`]) curVal = state[`${state.qrType}Fields`][key] || '';
      else if (state.qrText && f.label.toLowerCase().includes('url')) curVal = state.qrText;
      html += `
        <div class="mb-3">
          <label class="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">${f.label}</label>
          <input id="field_${key}" type="${f.type}" placeholder="${f.placeholder}" value="${curVal}"
            class="w-full bg-slate-950 text-slate-100 text-xs rounded-lg pl-3 pr-10 py-2 border border-slate-700 focus:border-amber-500 focus:outline-none font-mono">
        </div>
      `;
    }
  });
  container.innerHTML = html;
  fields.forEach((f) => {
    const key = f.label.replace(/\s+/g, '_').toLowerCase();
    const input = el(`field_${key}`);
    if (!input) return;
    input.addEventListener('input', (e) => {
      if (!state[`${state.qrType}Fields`]) state[`${state.qrType}Fields`] = {};
      state[`${state.qrType}Fields`][key] = e.target.value;
      if (state.qrType === 'url' || state.qrType === 'text') state.qrText = e.target.value;
      requestRender();
    });
  });
}

function requestRender() {
  if (renderTimeout) clearTimeout(renderTimeout);
  renderTimeout = setTimeout(render, 120);
  saveState();
}

function render() {
  const N = computeActiveMatrix();
  const { svg, removedCenterModules } = generateSVGString(activeMatrix);
  const diag = runDiagnostics(N, removedCenterModules);

  el('svgContainer').innerHTML = svg;
  renderCapStage(svg, state.capPlacement);
  renderCardStage(svg);
  renderStickerStage(svg);

  el('headerMatrixPill').textContent = `${N}×${N} Matrix • EC: ${diag.activeEc} (${diag.ecPct}%)`;
  el('statMatrixSize').textContent = `Matrix: ${N}×${N}`;
  el('statRedundancy').textContent = `Redundancy: ${diag.activeEc} (${diag.ecPct}%)`;
  el('statCutout').textContent = `Cutout: ${diag.cutoutAreaPct.toFixed(1)}%`;

  const dot = el('healthDot');
  const title = el('healthTitle');
  if (diag.status === 'optimal') {
    dot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]';
    title.textContent = `Scannability: Optimal (${removedCenterModules} dots cleared)`;
  } else if (diag.status === 'moderate') {
    dot.className = 'w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]';
    title.textContent = `Scannability: Moderate — Use EC 'H' or test scan`;
  } else {
    dot.className = 'w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]';
    title.textContent = `Warning: Cutout exceeds ${diag.activeEc} (${diag.ecPct}%) safety margin!`;
  }

  el('footerDataPreview').textContent = state.qrText;
  el('activeSourceBadge').textContent = state.dataSource === 'live' ? 'Live URL / Text Mode' : 'Uploaded 25×25 Preset';
}

function switchTab(tabName) {
  ['geometry', 'center', 'style'].forEach((t) => {
    const panel = el(`tab-${t}`);
    const btn = el(`tab-btn-${t}`);
    if (t === tabName) {
      panel.classList.remove('hidden');
      btn.className = 'py-2.5 px-2 text-center border-b-2 border-amber-500 text-amber-400 bg-slate-800/40 transition';
    } else {
      panel.classList.add('hidden');
      btn.className = 'py-2.5 px-2 text-center border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition';
    }
  });
}

function setDataSource(source) {
  state.dataSource = source;
  el('src-btn-live').className = source === 'live'
    ? 'px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 transition'
    : 'px-2.5 py-1 rounded-md text-slate-400 hover:text-slate-200 transition';
  el('src-btn-preset').className = source === 'preset'
    ? 'px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 transition'
    : 'px-2.5 py-1 rounded-md text-slate-400 hover:text-slate-200 transition';
  el('liveInputPanel').classList.toggle('hidden', source !== 'live');
  el('presetInfoPanel').classList.toggle('hidden', source !== 'preset');
  el('activeSourceBadge').textContent = source === 'live' ? 'Live URL / Text Mode' : 'Uploaded 25×25 Preset';
  el('activeSourceBadge').className = source === 'live'
    ? 'text-[11px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium'
    : 'text-[11px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium';
  render();
}

function setECLevel(level) {
  state.ecLevel = level;
  ['L', 'M', 'Q', 'H'].forEach((l) => {
    const btn = el(`ec-btn-${l}`);
    btn.className = l === level
      ? 'px-2 py-1 rounded text-[11px] font-semibold border border-amber-500 bg-amber-500/15 text-amber-300 transition'
      : 'px-2 py-1 rounded text-[11px] font-semibold border border-slate-700 bg-slate-800 text-slate-300 transition';
  });
  requestRender();
}

function applyTheme(fg, bg, id) {
  state.fgColor = fg;
  state.bgColor = bg;
  state.themeId = id;
  el('fgColorPicker').value = fg;
  el('bgColorPicker').value = bg;
  CONFIG.THEME_PRESETS.forEach((t) => {
    const btn = el(`theme-btn-${t.id}`);
    btn.className = t.id === id
      ? 'p-2 rounded-xl border border-amber-500 bg-slate-800/90 flex items-center gap-2 text-left transition'
      : 'p-2 rounded-xl border border-slate-700 bg-slate-800/40 flex items-center gap-2 text-left transition';
  });
  requestRender();
}

function setCustomColor(type, hex) {
  if (type === 'fg') state.fgColor = hex;
  if (type === 'bg') state.bgColor = hex;
  CONFIG.THEME_PRESETS.forEach((t) => {
    const btn = el(`theme-btn-${t.id}`);
    btn.className = 'p-2 rounded-xl border border-slate-700 bg-slate-800/40 flex items-center gap-2 text-left transition';
  });
  requestRender();
}

function setRotation(angle) {
  state.rotation = angle;
  el('rotationSlider').value = angle;
  el('rotationLabel').textContent = `${angle}°`;
  requestRender();
}

function setCapPlacement(pos) {
  state.capPlacement = pos;
  render();
}

function setPreviewMode(mode) {
  state.previewMode = mode;
  ['vector', 'cap', 'card', 'sticker'].forEach((m) => {
    el(`${m}Stage`).classList.toggle('hidden', m !== mode);
    el(`view-btn-${m}`).className = m === mode
      ? 'px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500 text-slate-950 shadow transition'
      : 'px-3 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 transition';
  });
  render();
}

function clearOrSampleUrl() {
  const sampleUrls = [
    'https://example.com',
    'https://maps.google.com/?q=Dhaka',
    'https://instagram.com/mybrand',
    'TEL:+8801700000000',
  ];
  let idx = 0;
  const next = sampleUrls[idx];
  el('qrDataInput').value = next;
  if (!state[`${state.qrType}Fields`]) state[`${state.qrType}Fields`] = {};
  state[`${state.qrType}Fields`].value = next;
  state.qrText = next;
  requestRender();
}

function handleInitialsInput(val) {
  state.centerInitials = val;
  if (state.centerIcon !== 'custom_text') {
    updateState('centerIcon', 'custom_text');
  } else {
    requestRender();
  }
}

function updateState(key, value) {
  state[key] = value;
  if (key === 'badgePadding') el('badgePaddingLabel').textContent = `+${value.toFixed(1)} modules`;
  else if (key === 'quietZoneGap') el('quietZoneLabel').textContent = `${value.toFixed(1)} module`;
  else if (key === 'dotRadiusRatio') {
    const pct = Math.round(value * 100);
    el('dotRadiusPctLabel').textContent = `${pct}% (${pct * 2}% dia)`;
  } else if (key === 'centerHoleRadius') el('centerHoleLabel').textContent = `${value.toFixed(1)} modules`;
  else if (key === 'centerRingCount') el('centerRingCountLabel').textContent = `${value} dots`;
  else if (key === 'outerPattern') {
    CONFIG.OUTER_PATTERNS.forEach((p) => {
      const btn = el(`outer-pat-${p.id}`);
      if (!btn) return;
      const spanClass = p.colSpan ? 'col-span-2 text-center ' : 'text-left ';
      btn.className = spanClass + (p.id === value
        ? 'p-2 text-xs rounded-lg border border-amber-500 bg-amber-500/10 text-amber-300 font-medium transition'
        : 'p-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-300 font-medium transition');
    });
  } else if (key === 'finderStyle') {
    CONFIG.CENTER_ICONS.forEach(() => {});
    ['dots', 'rounded'].forEach((f) => {
      const btn = el(`finder-btn-${f}`);
      btn.className = f === value
        ? 'py-2 px-3 text-xs rounded-lg border border-amber-500 bg-amber-500/10 text-amber-300 font-medium transition'
        : 'py-2 px-3 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-300 font-medium transition';
    });
  } else if (key === 'centerIcon') {
    CONFIG.CENTER_ICONS.forEach((ic) => {
      const btn = el(`icon-btn-${ic.id}`);
      if (!btn) return;
      const isWide = ic.wide;
      const base = isWide
        ? 'col-span-2 p-2 text-xs rounded-xl font-medium text-left flex items-center justify-between transition '
        : 'p-2 text-xs rounded-xl font-medium text-left flex items-center gap-2 transition ';
      btn.className = base + (ic.id === value
        ? 'border border-amber-500 bg-amber-500/10 text-amber-300'
        : 'border border-slate-700 bg-slate-800 text-slate-300');
    });
    el('customInitialsBox').classList.toggle('hidden', value !== 'custom_text');
  } else if (key === 'borderStyle') {
    CONFIG.BORDER_STYLES.forEach((b) => {
      const btn = el(`border-btn-${b.id}`);
      btn.className = b.id === value
        ? 'py-2 px-2.5 text-xs rounded-lg border border-amber-500 bg-amber-500/10 text-amber-300 font-medium transition'
        : 'py-2 px-2.5 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-300 font-medium transition';
    });
  }
  requestRender();
}

function init() {
  loadState();

  el('qrDataInput').value = state.qrText;
  el('rotationSlider').value = state.rotation;
  el('rotationLabel').textContent = `${state.rotation}°`;
  el('badgePaddingSlider').value = state.badgePadding;
  el('quietZoneSlider').value = state.quietZoneGap;
  el('dotRadiusSlider').value = state.dotRadiusRatio;
  el('centerHoleSlider').value = state.centerHoleRadius;
  el('centerRingToggle').checked = state.centerDotRing;
  el('centerRingCountSlider').value = state.centerRingCount;
  el('centerInitialsInput').value = state.centerInitials;
  el('keepIconUprightToggle').checked = state.keepIconUpright;
  el('transparentBgToggle').checked = state.transparentBg;
  el('fgColorPicker').value = state.fgColor;
  el('bgColorPicker').value = state.bgColor;
  el('dpiSlider').value = state.dpi;
  el('pdfFormatSelect').value = state.pdfFormat;

  setDataSource(state.dataSource);
  setECLevel(state.ecLevel);
  updateState('outerPattern', state.outerPattern);
  updateState('finderStyle', state.finderStyle);
  updateState('centerIcon', state.centerIcon);
  updateState('borderStyle', state.borderStyle);
  applyTheme(state.fgColor, state.bgColor, state.themeId);
  setPreviewMode(state.previewMode);

  el('qrDataInput').addEventListener('input', (e) => {
    if (!state[`${state.qrType}Fields`]) state[`${state.qrType}Fields`] = {};
    state[`${state.qrType}Fields`].value = e.target.value;
    state.qrText = e.target.value;
    requestRender();
  });

  el('rotationSlider').addEventListener('input', (e) => setRotation(parseInt(e.target.value, 10)));
  el('badgePaddingSlider').addEventListener('input', (e) => updateState('badgePadding', parseFloat(e.target.value)));
  el('quietZoneSlider').addEventListener('input', (e) => updateState('quietZoneGap', parseFloat(e.target.value)));
  el('dotRadiusSlider').addEventListener('input', (e) => updateState('dotRadiusRatio', parseFloat(e.target.value)));
  el('centerHoleSlider').addEventListener('input', (e) => updateState('centerHoleRadius', parseFloat(e.target.value)));
  el('centerRingToggle').addEventListener('change', (e) => updateState('centerDotRing', e.target.checked));
  el('centerRingCountSlider').addEventListener('input', (e) => updateState('centerRingCount', parseInt(e.target.value, 10)));
  el('centerInitialsInput').addEventListener('input', (e) => handleInitialsInput(e.target.value));
  el('keepIconUprightToggle').addEventListener('change', (e) => updateState('keepIconUpright', e.target.checked));
  el('transparentBgToggle').addEventListener('change', (e) => updateState('transparentBg', e.target.checked));
  el('fgColorPicker').addEventListener('input', (e) => setCustomColor('fg', e.target.value));
  el('bgColorPicker').addEventListener('input', (e) => setCustomColor('bg', e.target.value));
  el('dpiSlider').addEventListener('input', (e) => { state.dpi = parseInt(e.target.value, 10); saveState(); });
  el('pdfFormatSelect').addEventListener('change', (e) => { state.pdfFormat = e.target.value; saveState(); });

  el('btnDownloadSVG').addEventListener('click', () => downloadSVG(state.rotation));
  el('btnDownloadPNG').addEventListener('click', () => downloadPNG(state.rotation, state.dpi, state.transparentBg));
  el('btnDownloadPDF').addEventListener('click', () => downloadPDF(state.rotation, state.pdfFormat));
  el('btnReset').addEventListener('click', () => {
    resetState();
    init();
    render();
  });

  el('btnCopyLink').addEventListener('click', async () => {
    const url = window.location.origin + window.location.pathname + window.location.hash;
    try {
      await navigator.clipboard.writeText(url);
      const btn = el('btnCopyLink');
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = orig; }, 1500);
    } catch (e) {
      alert('Copy failed');
    }
  });

  buildDataForm();
  render();
}

window.init = init;
init();
