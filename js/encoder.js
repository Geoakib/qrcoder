export function encodePayload(type, fields) {
  switch (type) {
    case 'url':
    case 'text':
      return (fields.value || 'https://example.com').trim() || 'https://example.com';
    case 'vcard': {
      const { fn, tel, email, org, url } = fields;
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        fn ? 'FN:' + fn : '',
        tel ? 'TEL:' + tel : '',
        email ? 'EMAIL:' + email : '',
        org ? 'ORG:' + org : '',
        url ? 'URL:' + url : '',
        'END:VCARD',
      ].filter(Boolean).join('\n');
    }
    case 'wifi': {
      const { auth, ssid, pwd } = fields;
      return `WIFI:T:${auth};S:${ssid};P:${pwd};;`;
    }
    case 'sms': {
      const { number, body } = fields;
      return `SMTO:${number}:${body}`;
    }
    case 'email': {
      const { to, subject, body } = fields;
      return `MATMSG:TO:${to};SUB:${subject};BODY:${body};;`;
    }
    case 'bitcoin': {
      const { address, amount, label, message } = fields;
      let out = 'bitcoin:' + address;
      const params = [];
      if (amount) params.push('amount=' + amount);
      if (label) params.push('label=' + encodeURIComponent(label));
      if (message) params.push('message=' + encodeURIComponent(message));
      if (params.length) out += '?' + params.join('&');
      return out;
    }
    case 'calendar': {
      const { summary, dtstart, dtend, description } = fields;
      return [
        'BEGIN:VEVENT',
        summary ? 'SUMMARY:' + summary : '',
        dtstart ? 'DTSTART:' + dtstart : '',
        dtend ? 'DTEND:' + dtend : '',
        description ? 'DESCRIPTION:' + description : '',
        'END:VEVENT',
      ].filter(Boolean).join('\n');
    }
    default:
      return (fields.value || 'https://example.com').trim() || 'https://example.com';
  }
}

export function getFormFields(type) {
  const field = (label, placeholder, inputType = 'text') => ({ label, placeholder, type: inputType });
  switch (type) {
    case 'url':
    case 'text':
      return [field('URL or Text', 'https://example.com or any text...')];
    case 'vcard':
      return [
        field('Full Name', 'John Doe'),
        field('Phone', '+1 555-000-0000', 'tel'),
        field('Email', 'john@example.com', 'email'),
        field('Organization', 'Acme Inc.'),
        field('Website', 'https://acme.com', 'url'),
      ];
    case 'wifi':
      return [
        { label: 'Security', options: ['WPA', 'WEP', 'nopass'], type: 'select' },
        field('SSID (Network Name)', 'MyWiFi'),
        field('Password', '••••••••', 'password'),
      ];
    case 'sms':
      return [
        field('Phone Number', '+1 555-000-0000', 'tel'),
        field('Message', 'Hello from QR!'),
      ];
    case 'email':
      return [
        field('To', 'john@example.com', 'email'),
        field('Subject', 'Hello'),
        field('Body', 'This is a message from the QR code.'),
      ];
    case 'bitcoin':
      return [
        field('Bitcoin Address', 'bc1q...'),
        field('Amount (BTC)', '0.001', 'number'),
        field('Label', 'Payment'),
        field('Message', 'Thanks!'),
      ];
    case 'calendar':
      return [
        field('Event Title', 'Team Meeting'),
        field('Start Date/Time', '', 'datetime-local'),
        field('End Date/Time', '', 'datetime-local'),
        field('Description', 'Quarterly sync'),
      ];
    default:
      return [field('URL or Text', 'https://example.com')];
  }
}
