import { state } from './state.js';

export function renderVectorStage(svgMarkup) {
  const container = document.getElementById('svgContainer');
  if (!container) return;
  container.innerHTML = svgMarkup;
}

export function renderCapStage(svgMarkup, placement) {
  const mirror = document.getElementById('capSvgMirror');
  const holder = document.getElementById('capPatchHolder');
  if (!mirror || !holder) return;
  mirror.innerHTML = svgMarkup.replace('id="customQrSvg"', 'id="capQrSvg"');

  if (placement === 'right') {
    holder.className = 'relative z-10 w-48 h-48 rounded-full shadow-[0_12px_28px_rgba(0,0,0,0.6)] transition-all duration-300 translate-x-20 translate-y-2 flex items-center justify-center';
  } else {
    holder.className = 'relative z-10 w-52 h-52 rounded-full shadow-[0_12px_28px_rgba(0,0,0,0.6)] transition-all duration-300 translate-x-0 translate-y-2 flex items-center justify-center';
  }
}

export function renderCardStage(svgMarkup) {
  const container = document.getElementById('cardStageContent');
  if (!container) return;
  container.innerHTML = `
    <div class="w-64 h-40 bg-white rounded-lg shadow-2xl border border-slate-200 relative overflow-hidden flex">
      <div class="h-1/2 border-b border-slate-100 flex items-center justify-center">${svgMarkup.replace('width="100%" height="100%"', 'width="32" height="32"')}</div>
      <div class="h-1/2 p-3 flex flex-col justify-center">
        <div class="text-xs font-bold text-slate-800">John Doe</div>
        <div class="text-[10px] text-slate-500">Acme Inc. • Designer</div>
        <div class="text-[10px] text-slate-500 mt-1">john@example.com • +1 555-000-0000</div>
      </div>
    </div>
  `;
}

export function renderStickerStage(svgMarkup) {
  const container = document.getElementById('stickerStageContent');
  if (!container) return;
  container.innerHTML = `
    <div class="w-64 h-64 bg-white rounded-full shadow-2xl border-4 border-slate-200 relative overflow-hidden flex items-center justify-center">
      <div class="absolute inset-0 border-2 border-dashed border-slate-300 rounded-full"></div>
      ${svgMarkup.replace('width="100%" height="100%"', 'width="40" height="40"')}
    </div>
  `;
}
