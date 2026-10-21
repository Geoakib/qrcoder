import { state } from './state.js';

export function downloadSVG(rotation) {
  const svgEl = document.getElementById('customQrSvg');
  if (!svgEl) return;
  const serializer = new XMLSerializer();
  let source = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' + serializer.serializeToString(svgEl);
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `circular_qr_patch_${rotation}deg.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadPNG(rotation, dpi, transparentBg) {
  const svgEl = document.getElementById('customQrSvg');
  if (!svgEl) return;
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgEl);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = function () {
    const scale = dpi / 72;
    const canvas = document.getElementById('exportCanvas');
    const size = Math.round(1600 * scale);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (transparentBg) {
      ctx.clearRect(0, 0, size, size);
    } else {
      ctx.fillStyle = state.bgColor;
      ctx.fillRect(0, 0, size, size);
    }
    ctx.drawImage(img, 0, 0, size, size);
    URL.revokeObjectURL(url);
    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = `circular_qr_patch_${rotation}deg.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  img.src = url;
}

export function downloadPDF(rotation, format) {
  const jsPDF = window.jspdf || window.jsPDF;
  if (!jsPDF) {
    alert('PDF library not loaded. Please refresh the page.');
    return;
  }
  const { jsPDF: PDFConstructor } = jsPDF;
  const pageW = format === 'A4' ? 210 : 215.9;
  const pageH = format === 'A4' ? 297 : 279.4;
  const doc = new PDFConstructor({ unit: 'mm', format: [pageW, pageH] });

  const svgEl = document.getElementById('customQrSvg');
  if (!svgEl) return;
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgEl);
  const svgData = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));

  const qrSize = 55;
  const x = (pageW - qrSize) / 2;
  const y = (pageH - qrSize) / 2 - 8;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, pageH, 'F');
  doc.addImage(svgData, 'SVG', x, y, qrSize, qrSize);

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  const m = 3;
  doc.line(x - m, y, x - m + 6, y);
  doc.line(x, y - m, x, y - m + 6);
  doc.line(x + qrSize + m, y, x + qrSize + m - 6, y);
  doc.line(x + qrSize, y - m, x + qrSize, y - m + 6);
  doc.line(x - m, y + qrSize, x - m + 6, y + qrSize);
  doc.line(x, y + qrSize + m, x, y + qrSize + m - 6);
  doc.line(x + qrSize + m, y + qrSize, x + qrSize + m - 6, y + qrSize);
  doc.line(x + qrSize, y + qrSize + m, x + qrSize, y + qrSize + m - 6);

  doc.setFontSize(10);
  doc.text(`Circular QR Patch — ${rotation}°`, pageW / 2, pageH - 10, { align: 'center' });

  doc.save(`circular_qr_patch_${rotation}deg.pdf`);
}
