export const defaultState = {
  dataSource: 'live',
  qrText: 'https://example.com',
  qrType: 'url',
  vcardFields: { fn: '', tel: '', email: '', org: '', url: '' },
  wifiFields: { auth: 'WPA', ssid: '', pwd: '' },
  smsFields: { number: '', body: '' },
  emailFields: { to: '', subject: '', body: '' },
  bitcoinFields: { address: '', amount: '', label: '', message: '' },
  calendarFields: { summary: '', dtstart: '', dtend: '', description: '' },
  ecLevel: 'H',
  rotation: 0,
  outerPattern: 'qr_blend',
  badgePadding: 2.0,
  quietZoneGap: 4.0,
  dotRadiusRatio: 0.47,
  finderStyle: 'dots',
  centerHoleRadius: 3.4,
  centerDotRing: true,
  centerRingCount: 18,
  centerIcon: 'rub_el_hizb',
  centerInitials: 'M',
  keepIconUpright: true,
  borderStyle: 'double_stitch',
  transparentBg: false,
  fgColor: '#000000',
  bgColor: '#ffffff',
  themeId: 'bw',
  previewMode: 'vector',
  capPlacement: 'right',
  dpi: 300,
  pdfFormat: 'A4',
  darkMode: true,
};

export let state = { ...defaultState };

export function loadState() {
  try {
    const hash = window.location.hash.replace(/^#d=/, '');
    if (hash) {
      const parsed = JSON.parse(decodeURIComponent(hash));
      state = { ...defaultState, ...parsed };
      return state;
    }
    const stored = localStorage.getItem('qrstudio_state');
    if (stored) {
      state = { ...defaultState, ...JSON.parse(stored) };
    }
  } catch (e) {
    state = { ...defaultState };
  }
  return state;
}

export function saveState() {
  try {
    localStorage.setItem('qrstudio_state', JSON.stringify(state));
  } catch (e) {
    // ignore quota errors
  }
  const hashVal = 'd=' + encodeURIComponent(JSON.stringify(state));
  window.history.replaceState(null, '', '#' + hashVal);
}

export function resetState() {
  state = { ...defaultState };
  localStorage.removeItem('qrstudio_state');
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
}
