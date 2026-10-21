export function computeMatrix(text, ecLevel) {
  try {
    const qr = qrcode(0, ecLevel);
    qr.addData(text);
    qr.make();
    const count = qr.getModuleCount();
    const mat = [];
    for (let r = 0; r < count; r++) {
      const row = [];
      for (let c = 0; c < count; c++) {
        row.push(qr.isDark(r, c) ? 1 : 0);
      }
      mat.push(row);
    }
    return { modules: mat, size: count };
  } catch (err) {
    return { modules: [], size: 0 };
  }
}

export function isFinderModule(r, c, N) {
  if (r >= 0 && r <= 6 && c >= 0 && c <= 6) return true;
  if (r >= 0 && r <= 6 && c >= N - 7 && c <= N - 1) return true;
  if (r >= N - 7 && r <= N - 1 && c >= 0 && c <= 6) return true;
  return false;
}
