export const MAX_INPUT_LENGTH = 5000;

export function validateInput(input) {
  if (typeof input !== 'string' || !input.trim()) throw new Error('Paste a message or link to check.');
  if (input.length > MAX_INPUT_LENGTH) throw new Error('Keep your message under 5,000 characters.');
  return input.trim();
}

// Parse strings only. Never resolve DNS, fetch a submitted link, or render input as HTML.
export function extractUrls(text) {
  const matches = text.match(/(?:https?:\/\/|www\.)[^\s<>"']+|\b(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?::\d+)?(?:\/[^\s<>"']*)?/gi) || [];
  const results = new Map();
  for (const raw of matches.slice(0, 30)) {
    const cleaned = raw.replace(/[.,;!?)\]}]+$/, '');
    try {
      const url = new URL(/^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`);
      if (url.protocol === 'https:' || url.protocol === 'http:') results.set(url.href, url);
    } catch { /* Malformed text is not a navigable URL. */ }
  }
  return [...results.values()];
}

const brands = [
  { name: 'NSFAS', token: 'nsfas', domains: ['nsfas.org.za'] },
  { name: 'TUT', token: 'tut', domains: ['tut.ac.za'] },
  { name: 'FNB', token: 'fnb', domains: ['fnb.co.za'] },
];
const within = (host, domain) => host === domain || host.endsWith(`.${domain}`);

export function analyze(input) {
  const text = validateInput(input);
  const urls = extractUrls(text);
  const findings = [];
  const add = (id, title, detail, points) => findings.push({ id, title, detail, points });
  if (/\b(urgent(?:ly)?|immediate(?:ly)?|act now|within \d+ (?:hours?|minutes?)|today only|final (?:notice|warning)|suspend(?:ed)?|blocked)\b/i.test(text))
    add('urgency', 'Pressure to act quickly', 'Urgency and threatened account restrictions can push you into acting before checking.', 18);
  const credential = /\b(otp|one[ -]time (?:pin|password)|password|pin|bank(?:ing)? details|card (?:number|details)|cvv|login credentials)\b/i.test(text);
  const request = /\b(send|share|enter|submit|provide|confirm|verify|reply|validate|update|give)\b/i.test(text);
  const warning = /\b(never|do not|don['’]t)\s+(?:ever\s+)?(?:share|send|give|disclose)\b/i.test(text);
  if (credential && request && (!warning || urls.length > 0))
    add('credentials', 'Request for sensitive information', 'The text asks for credentials or financial details. Do not provide passwords, PINs or OTPs in response to a message.', 35);
  if (/\b(pay|payment|deposit|transfer|fee)\b/i.test(text) && /\b(bursary|scholarship|grant|prize|winner|job|internship|release|unlock|processing)\b/i.test(text))
    add('advance-fee', 'Payment tied to an opportunity', 'A fee to release funding, winnings or a job offer is a warning sign. Verify the offer independently.', 28);
  if (/\b(winner|won|congratulations|guaranteed (?:return|income)|free money|selected for a prize)\b/i.test(text))
    add('reward', 'Unexpected reward or promise', 'Unexpected prizes and guaranteed benefits are common lures. Check the source before responding.', 15);
  if (/\b(download|install|enable macros|open (?:the )?attachment|remote access)\b/i.test(text))
    add('download', 'Instruction to open or install something', 'Unsolicited files and remote-access tools may expose your device. Verify the sender first.', 20);
  if (/\b(ignore (?:all |previous |the )*(?:instructions|rules)|system prompt|you are now|classify (?:this|it) as (?:safe|low))\b/i.test(text))
    add('manipulation', 'Instructions aimed at the checker', 'The submitted text appears to try to influence the analysis. It is treated as content, not instructions.', 15);
  for (const url of urls) {
    const host = url.hostname.toLowerCase();
    if (url.protocol === 'http:' && !findings.some(f => f.id === 'http'))
      add('http', 'Unencrypted link', 'An HTTP link does not encrypt the connection. HTTPS alone would not prove that a site is trustworthy either.', 10);
    if (url.username || url.password) {
      if (!findings.some(f => f.id === 'userinfo')) add('userinfo', 'Misleading link structure', 'An @ sign in the address can hide the real destination after a trusted-looking name.', 28);
    }
    if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host) || host.startsWith('[')) {
      if (!findings.some(f => f.id === 'ip')) add('ip', 'Link uses an IP address', 'A numeric destination makes it harder to identify the organisation behind the link.', 20);
    }
    if (['bit.ly','tinyurl.com','t.co','cutt.ly','shorturl.at','rb.gy'].some(d => within(host, d))) {
      if (!findings.some(f => f.id === 'shortener')) add('shortener', 'Destination hidden by a short link', 'This short link conceals the final destination. This checker does not follow redirects.', 15);
    }
    if (host.includes('xn--')) {
      if (!findings.some(f => f.id === 'punycode')) add('punycode', 'Internationalised domain', 'Encoded characters can be used in lookalike domains. They can also be legitimate; verify carefully.', 15);
    }
    for (const brand of brands) {
      // Includes a brand in the path or userinfo, where it can obscure the actual host.
      const claimed = new RegExp(`\\b${brand.token}\\b`, 'i').test(text) || url.href.toLowerCase().includes(brand.token);
      if (claimed && !brands.some(b => b.domains.some(d => within(host, d))) && !brand.domains.some(d => within(host, d))) {
        const id = `brand-${brand.token}`;
        if (!findings.some(f => f.id === id)) add(id, `Check the ${brand.name} identity`, `The message mentions ${brand.name}, but a link goes to ${host}. That is not one of this prototype's known ${brand.name} domains. This is a clue, not proof of impersonation.`, 28);
      }
    }
  }
  const score = Math.min(100, findings.reduce((sum, f) => sum + f.points, 0));
  const risk = score >= 50 ? 'High' : score >= 15 ? 'Medium' : 'Low';
  const summary = risk === 'High' ? 'Several warning signs need your attention. Pause before you respond.' : risk === 'Medium' ? 'There are signals worth checking before you act.' : 'Few known warning signs were found. This does not establish that the message is safe.';
  return {
    risk, score, summary, findings, domains: [...new Set(urls.map(u => u.hostname))],
    actions: [
      'Open the organisation’s official app or type its known website address yourself.',
      'Verify the request through a trusted contact you already have, not contact details in the message.',
      'Do not share your password, PIN, OTP or banking details in response to an unsolicited message.',
      ...(risk === 'High' ? ['If you already shared banking information, contact your bank through its official app or trusted number promptly.'] : []),
    ],
    source: 'rules',
  };
}
