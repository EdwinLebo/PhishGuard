import { useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronRight, CircleHelp, Copy, Fingerprint, GraduationCap, Link2, LockKeyhole, Menu, MessageSquareText, ScanLine, Shield, ShieldCheck, Sparkles, TriangleAlert, X } from 'lucide-react';
import { analyze, MAX_INPUT_LENGTH } from '../supabase/functions/_shared/analyze.mjs';
import AwarenessQuiz from './AwarenessQuiz';
type Result = ReturnType<typeof analyze> & { aiExplanation?: string; source: string };
const examples = [
  { category: 'BURSARY SCAM', title: 'The funding that comes with a fee', text: 'NSFAS: Congratulations! Your bursary has been approved. Pay a R250 processing fee today to release your funds. Verify your banking details at https://nsfas-funding.example/claim', tone: 'rose' },
  { category: 'ACCOUNT IMPERSONATION', title: 'The urgent account warning', text: 'FNB FINAL WARNING: Your account will be blocked within 30 minutes. Enter your password and OTP immediately at https://fnb-secure.example/verify', tone: 'amber' },
  { category: 'EVERYDAY MESSAGE', title: 'The ordinary study group update', text: 'Hi everyone, our study group meets in the library at 14:00 tomorrow. Please bring your notes from the last lecture.', tone: 'mint' },
];
export default function App() {
  const [input, setInput] = useState(''); const [mode, setMode] = useState('Message');
  const [result, setResult] = useState<Result | null>(null); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(''); const [copied, setCopied] = useState(false);
  const [menu, setMenu] = useState(false); const [aiConsent, setAiConsent] = useState(false); const [aiNotice, setAiNotice] = useState('');
  const textarea = useRef<HTMLTextAreaElement>(null); const resultRef = useRef<HTMLDivElement>(null);
  const endpoint = import.meta.env.VITE_ANALYSIS_API as string | undefined;
  function loadExample(text: string) {
    setInput(text); setResult(null); setError(''); setMode('Message'); setAiNotice('');
    document.getElementById('checker')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); textarea.current?.focus({ preventScroll: true });
  }
  async function check(event: React.FormEvent) {
    event.preventDefault(); setError(''); setCopied(false); setAiNotice('');
    try {
      const local = analyze(input); setBusy(true); setResult(null); let next: Result = local;
      if (endpoint && aiConsent) {
        try {
          const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: input, consent: true }), signal: AbortSignal.timeout(18000) });
          if (!response.ok) throw new Error('API unavailable'); const remote = await response.json();
          if (remote.source === 'rules+ai' && typeof remote.aiExplanation === 'string' && remote.aiExplanation.length <= 1400) next = { ...local, source: 'rules+ai', aiExplanation: remote.aiExplanation };
          else if (remote.source === 'rules' && remote.risk === local.risk) { next = { ...local, source: 'cloud-rules' }; setAiNotice('Supabase cloud check complete. AI explanations are not configured; this result uses detection rules.'); }
          else throw new Error('Unexpected server result');
        } catch { setAiNotice('The cloud check could not be completed. Your local rule-based result is ready.'); }
      }
      setResult(next); setTimeout(() => { resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); resultRef.current?.focus({ preventScroll: true }); }, 0);
    } catch (e) { setError(e instanceof Error ? e.message : 'Please check your input.'); } finally { setBusy(false); }
  }
  async function copyResult() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText([`PhishGuard assessment: ${result.risk} risk`, result.summary, ...result.findings.map(f => `${f.title}: ${f.detail}`), ...result.actions, 'Advisory only. This assessment can be wrong. Submitted message not included.'].join('\n'));
      setCopied(true);
    } catch { setError('Clipboard access is unavailable in this browser. You can select the result text to copy it.'); }
  }
  return <>
    <header className="site-header"><a href="#" className="brand" aria-label="PhishGuard home"><span className="brand-icon"><ShieldCheck size={23}/></span>PhishGuard<span className="brand-ai">AI</span></a>
      <button className="menu-button" onClick={() => setMenu(!menu)} aria-label="Toggle navigation" aria-expanded={menu}>{menu ? <X/> : <Menu/>}</button>
      <nav className={menu ? 'open' : ''} aria-label="Main navigation"><a href="#checker" onClick={() => setMenu(false)}>Message checker</a><a href="#how-it-works" onClick={() => setMenu(false)}>How it works</a><a href="#quiz" onClick={() => setMenu(false)}>Awareness quiz <ArrowUpRight size={14}/></a></nav>
      <span className="header-note"><span className="status-dot"/> Built for safer clicks</span>
    </header>
    <main>
      <section className="hero"><div className="hero-copy"><span className="eyebrow"><span className="small-line"/> YOUR SECOND OPINION, BEFORE YOU CLICK</span>
        <h1>A convincing message.<br/>A <span>safer next move.</span></h1><p className="intro">That bursary offer. That urgent bank alert. That link that feels a little off. Take a moment to check it.</p>
        <div className="hero-actions"><a className="primary" href="#checker">Check a message <ArrowDown size={17}/></a><span><GraduationCap size={20}/> Made for SA students</span></div>
        <div className="hero-trust"><span><Check size={14}/> No sign-up</span><span><Check size={14}/> No links opened</span><span><Check size={14}/> Private local checks</span></div>
      </div><div className="hero-art" aria-label="Illustration of a suspicious bursary message being checked"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><span className="art-label">A LITTLE PAUSE. A LOT OF PROTECTION.</span>
        <div className="floating-message"><div className="message-top"><span className="message-icon"><MessageSquareText size={20}/></span><div><strong>New message</strong><small>Unknown sender · now</small></div><span className="message-dots">•••</span></div><p>“Your bursary is approved! Pay a small processing fee to release your funds…”</p><span className="suspicious-link">nsfas-funding.example/claim</span></div>
        <div className="scan-beam"/><div className="shield-art"><ShieldCheck size={62} strokeWidth={1.4}/></div><div className="floating-verdict"><span className="warning-circle"><TriangleAlert size={20}/></span><div><strong>Something doesn’t add up.</strong><small>Pause. Check. Verify independently.</small></div><span className="verdict-dot"/></div><span className="illustration-label">ILLUSTRATIVE EXAMPLE · FICTIONAL MESSAGE</span>
      </div></section>
      <section className="workspace" id="checker"><div className="section-heading"><div><span className="eyebrow muted">THE MESSAGE CHECKER</span><h2>Let’s take a closer look.</h2><p>Paste the message or link. We’ll help you spot the warning signs.</p></div><span className="mode-badge"><span className="status-dot"/> Local checks ready</span></div>
        <div className="checker-grid"><form className="checker-card" onSubmit={check}><div className="input-top"><div className="tabs" role="group" aria-label="Input type">{['Message', 'Link'].map(t => <button type="button" className={mode === t ? 'tab active' : 'tab'} key={t} onClick={() => { setMode(t); setResult(null); }}>{t === 'Message' ? <MessageSquareText size={16}/> : <Link2 size={16}/>} {t}</button>)}</div><span className="formats">{mode === 'Message' ? 'SMS · WhatsApp · Email' : 'Website address'}</span></div>
          <label htmlFor="message" className="sr-only">{mode === 'Message' ? 'Suspicious message' : 'Suspicious link'}</label><textarea id="message" ref={textarea} value={input} onChange={e => { setInput(e.target.value); setResult(null); setError(''); setAiNotice(''); }} maxLength={MAX_INPUT_LENGTH} placeholder={mode === 'Message' ? 'Paste the message you’re unsure about here…' : 'Paste a link here, for example: https://website.example'} aria-describedby="privacy-note input-error" disabled={busy}/>
          <div className="input-meta"><button className="text-button" type="button" onClick={() => loadExample(examples[0].text)}>Try an example <ArrowRight size={14}/></button><span>{input.length.toLocaleString()} / 5,000</span></div><div id="privacy-note" className="privacy-note"><LockKeyhole size={15}/><p>Remove names, ID numbers and personal details. Never paste passwords, PINs or OTPs.</p></div>
          {endpoint && <label className="consent"><input type="checkbox" disabled={busy} checked={aiConsent} onChange={e => setAiConsent(e.target.checked)}/> Check with Supabase. I agree to send this redacted message to the server. If AI is configured, its rule findings may also go to Google Gemini. PhishGuard won’t save the message; provider data policies apply.</label>}
          <div id="input-error" role="alert">{error && <p className="error">{error}</p>}</div><button className="primary check-button" disabled={busy || !input.trim()}><ScanLine size={18}/>{busy ? 'Checking your message…' : 'Check for warning signs'}{!busy && <ArrowRight size={17}/>}</button><p className="local-note"><Fingerprint size={13}/>{aiConsent && endpoint ? 'Cloud check selected · no scan history stored' : 'Your message stays in this browser during local checks.'}</p>
        </form><aside className="result-card" ref={resultRef} tabIndex={-1} aria-label="Analysis result" aria-live="polite" aria-busy={busy}>
          {result ? <div className="result-content"><div className="result-top"><span className={`risk-badge ${result.risk.toLowerCase()}`}>{result.risk === 'Low' ? <CircleHelp size={16}/> : <TriangleAlert size={16}/>} {result.risk} risk</span><button className="icon-button" title="Copy assessment without the submitted message" onClick={copyResult} aria-label="Copy assessment">{copied ? <Check size={17}/> : <Copy size={17}/>}</button></div><h3>{result.risk === 'High' ? 'Pause before you proceed.' : result.risk === 'Medium' ? 'Take a moment to verify.' : 'Keep your guard up.'}</h3><p>{result.summary}</p><div className="result-source"><span className="status-dot"/>{result.source === 'rules+ai' ? 'Rules + AI explanation' : result.source === 'cloud-rules' ? 'Checked on Supabase · rules' : 'Local rule-based assessment'} · {result.findings.length} signal{result.findings.length === 1 ? '' : 's'}</div>
            {aiNotice && <p className="service-notice">{aiNotice}</p>}{result.findings.length > 0 ? <ul className="findings">{result.findings.map(f => <li key={f.id}><TriangleAlert size={15}/><div><strong>{f.title}</strong><p>{f.detail}</p></div></li>)}</ul> : <p className="no-findings">No matching indicators in our limited rule set. Sender identity, destination content and redirects have not been verified.</p>}
            {result.domains.length > 0 && <div className="domains"><strong>Domains found · not opened</strong>{result.domains.map(d => <code key={d}>{d}</code>)}</div>}{result.aiExplanation && <div className="ai-explanation"><strong><Sparkles size={14}/> AI explanation</strong><p>{result.aiExplanation}</p></div>}
            <div className="next-steps"><h4>Your safest next steps</h4><ol>{result.actions.map(a => <li key={a}>{a}</li>)}</ol></div><p className="advisory">Advisory only. This checker can miss scams and flag legitimate messages. A low rating is not a safety guarantee.</p>
          </div> : <div className="empty-result"><div className={busy ? 'result-orb checking' : 'result-orb'}><ShieldCheck size={38} strokeWidth={1.4}/></div><span className="eyebrow muted">{busy ? 'TAKING A CLOSER LOOK' : 'A LITTLE CLARITY GOES A LONG WAY'}</span><h3>{busy ? 'Looking for warning signs…' : <>Your second opinion<br/>starts here.</>}</h3><p>{busy ? 'Checking the message for known risk indicators.' : 'Your assessment will appear here with clear reasons and practical next steps.'}</p><div className="empty-features"><span><ScanLine size={15}/> Understand the signals</span><span><ShieldCheck size={15}/> Know what to do next</span></div></div>}
        </aside></div></section>
      <section className="how-section" id="how-it-works"><div className="how-heading"><span className="eyebrow muted">FROM DOUBT TO DIRECTION</span><h2>Three steps.<br/>One safer decision.</h2></div><div className="how-step"><span>01</span><MessageSquareText size={24}/><h3>Paste it</h3><p>Bring the message or link. Leave personal information out.</p></div><div className="how-step"><span>02</span><ScanLine size={24}/><h3>Understand it</h3><p>See the warning signs behind an advisory risk rating.</p></div><div className="how-step"><span>03</span><ShieldCheck size={24}/><h3>Verify it</h3><p>Use an independent, trusted channel before taking action.</p></div></section>
      <section className="learn-section" id="learn"><div className="section-heading"><div><span className="eyebrow muted">A SHARPER EYE STARTS HERE</span><h2>Familiar messages. Hidden signals.</h2><p>Explore fictional examples inspired by everyday student experiences.</p></div><span className="example-note">Learn with an example <ChevronRight size={17}/></span></div><div className="example-grid">{examples.map((e,i) => <button className={`example-card ${e.tone}`} key={e.category} onClick={() => loadExample(e.text)}><div className="example-top"><span className="example-icon">{i === 0 ? <GraduationCap size={23}/> : i === 1 ? <LockKeyhole size={22}/> : <MessageSquareText size={22}/>}</span><ArrowUpRight size={20}/></div><span className="eyebrow">{e.category}</span><h3>{e.title}</h3><span className="example-cta">Check this example <ArrowRight size={15}/></span></button>)}</div></section>
      <AwarenessQuiz/>
      <section className="safety-strip"><Shield size={24}/><div><strong>A helpful signal. Always verify.</strong><p>PhishGuard checks patterns in text. It does not verify senders, visit links, or guarantee that a message is safe.</p></div></section>
    </main><footer><a href="#" className="brand"><ShieldCheck size={21}/>PhishGuard<span className="brand-ai">AI</span></a><p>Think before you click. Verify before you trust.</p><span>Built by CyberSentinels <span className="footer-dot">/</span> Hackathon prototype</span></footer>
  </>;
}
