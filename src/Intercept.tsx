import { useState } from 'react';
import { ShieldCheck, Share2, Smartphone, ArrowRight, TriangleAlert } from 'lucide-react';
import { analyze, extractUrls } from '../supabase/functions/_shared/analyze.mjs';

const samples = [
  { name: 'Bank impersonation', text: 'FNB FINAL WARNING: Your account will be blocked. Verify your password and OTP at https://fnb.co.za@account-check.example/verify' },
  { name: 'Bursary fee', text: 'NSFAS: Congratulations! Pay a R250 processing fee today to release your bursary at https://nsfas-funding.example/claim' },
  { name: 'Hidden destination', text: 'Your parcel is waiting. See delivery details at https://bit.ly/parcel-example' },
  { name: 'Ordinary message', text: 'Study group meets at the library tomorrow at 14:00. Bring your notes.' },
];
export default function Intercept({ onCheck }: { onCheck: (text: string) => void }) {
  const [text, setText] = useState(samples[0].text);
  const [screen, setScreen] = useState<'message' | 'guard'>('message');
  const [recovery, setRecovery] = useState(false);
  const result = text.trim() ? analyze(text) : null;
  const urls = extractUrls(text);
  function choose(value: string) { setText(value); setScreen('message'); }
  return <section className="intercept-section" id="intercept">
    <div className="intercept-copy"><span className="eyebrow">PHISHGUARD INTERCEPT / WORKING DEMO</span><h2>A pause between<br/>the message and the mistake.</h2><p>Share it. Reveal the destination. Decide with the warning signs in front of you.</p>
      <div className="scenario-buttons" aria-label="Demo scenarios">{samples.map(s => <button key={s.name} onClick={() => choose(s.text)} aria-pressed={text === s.text}>{s.name}</button>)}</div>
      <label htmlFor="intercept-message">Try your own message · checked on this device</label><textarea id="intercept-message" maxLength={5000} value={text} onChange={e => choose(e.target.value)} />
      <p className="intercept-disclosure">This phone is an interactive demonstration. It does not monitor your inbox or block other apps. The assessment uses the real detection engine.</p>
      <button className="text-button" onClick={() => setRecovery(!recovery)} aria-expanded={recovery}>Already clicked or shared something? <ArrowRight size={15}/></button>
      {recovery && <div className="recovery"><h3>Take back control</h3><ol><li>Stop replying and close the suspicious page.</li><li>If you shared banking details or made a payment, contact your bank using its official app or a number you already trust.</li><li>If you shared a password, change it through the genuine service and end other sessions. Change reused passwords too.</li><li>Save evidence for a report. Do not send more money to someone promising to recover it.</li></ol></div>}
    </div>
    <div className="phone-shell"><div className="phone-status"><span>9:41</span><span>● ● ●</span></div><div className="phone-app-title"><ShieldCheck size={20}/>{screen === 'message' ? 'Message preview' : 'PhishGuard Intercept'}</div>
      {screen === 'message' ? <><span className="phone-kicker">FICTIONAL INBOX · LIVE ANALYSIS</span><div className="message-bubble"><strong>Unknown sender</strong><p>{text || 'Enter a message to try the guard.'}</p></div><div className="phone-action"><p>Before you follow that request…</p><button className="primary" disabled={!result} onClick={() => setScreen('guard')}><Share2 size={17}/> Share to PhishGuard</button></div></> : result && <div className="guard-screen" aria-live="polite"><span className={`risk-badge ${result.risk.toLowerCase()}`}><TriangleAlert size={17}/>{result.risk} risk · advisory</span><h3>{result.risk === 'High' ? 'Stop. Verify this first.' : result.risk === 'Medium' ? 'The destination needs a closer look.' : 'Few signals. Still verify.'}</h3><p>{result.summary}</p>
        {urls.map((url, i) => <div className="destination" key={i}><span>ACTUAL HOSTNAME · NOT OPENED</span><strong>{url.hostname}</strong>{url.username && <p>The name before @ is not the destination.</p>}<small>Website ownership and redirects are not verified.</small></div>)}
        <ul>{result.findings.slice(0, 3).map(f => <li key={f.id}>{f.title}</li>)}</ul><div className="safe-route"><strong>Choose a trusted route</strong><p>Close this message. Open your bank or funding provider’s official app yourself, and check the request there.</p></div><button className="primary" onClick={() => onCheck(text)}>See the full assessment <ArrowRight size={16}/></button><button className="phone-back" onClick={() => setScreen('message')}>Back to message preview</button></div>}
      <div className="phone-home"/>
    </div>
    <div className="install-card"><Smartphone size={27}/><div><h3>Keep Intercept on your phone</h3><p>On Android Chrome, use the browser menu → Install app / Add to Home screen. Once installed as an app, select text in another app and use Share → PhishGuard where supported. Shared text is checked locally. On iPhone or unsupported browsers, open PhishGuard and paste the message.</p><p><strong>User-initiated sharing, not automatic inbox access.</strong> Phone share-menu availability depends on your browser and installation method.</p></div></div>
    <div className="install-card" id="android-watch"><ShieldCheck size={27}/><div><span className="eyebrow">ANDROID WATCH / EARLY TEST BUILD</span><h3>Let your phone watch for warning signs.</h3><p>The native Android app can check available notifications from WhatsApp and your default SMS app, with your permission. Checks happen on the phone. Monitoring starts off; you choose the sources and enable it.</p><a className="primary" href={import.meta.env.BASE_URL + 'downloads/PhishGuard-Watch-demo.apk'} download>Download Android demo APK <ArrowRight size={16}/></a><p>Android 8 or newer. Debug-signed hackathon build, not a Play Store release. Real-phone validation is still required. Hidden previews and missing notifications can cause misses; warnings cannot guarantee protection before a tap. If Android blocks installation or access, use the web checker rather than bypassing its protections.</p><p>After installing: read the disclosure → choose sources → grant notification access and warning permission → switch Watch on. Use the labelled test alert, then test with a fictional incoming message.</p></div></div>
  </section>;
}
