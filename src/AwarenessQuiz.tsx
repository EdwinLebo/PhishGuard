import { useState } from 'react';
const questions = [
  { prompt: 'A bursary message asks for a processing fee before releasing your funding. What is the safest next step?', options: ['Pay quickly to secure the funding', 'Verify the offer through the official funding organisation', 'Reply with your banking details'], correct: 1, explanation: 'A payment demand tied to funding is a warning sign. Use an official website or a contact you already trust to verify it.' },
  { prompt: 'Which website does https://fnb.co.za@verify.example actually point to?', options: ['fnb.co.za', 'Both websites', 'verify.example'], correct: 2, explanation: 'In this link, the destination is after the @ sign: verify.example. A familiar name at the start does not establish who owns the site.' },
  { prompt: 'PhishGuard returns Low risk. What does that mean?', options: ['Few known warning signs matched; still verify the sender', 'The message is guaranteed safe', 'It is safe to share an OTP'], correct: 0, explanation: 'Low risk is not verified safety. Rules can miss new scams, and a message can be harmful even when it looks ordinary.' },
];
export default function AwarenessQuiz() {
  const [index, setIndex] = useState(0); const [answer, setAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0); const [done, setDone] = useState(false);
  const question = questions[index];
  function choose(option: number) { if (answer !== null) return; setAnswer(option); if (option === question.correct) setScore(s => s + 1); }
  function next() { if (index === questions.length - 1) setDone(true); else { setIndex(i => i + 1); setAnswer(null); } }
  return <section className="quiz-section" id="quiz" aria-label="Phishing awareness quiz"><span className="eyebrow muted">PRACTISE BEFORE THE NEXT MESSAGE</span><h2>Can you spot the warning sign?</h2><p className="quiz-intro">Three quick questions. Your answers stay in this browser and disappear when you leave.</p>
    {done ? <div className="quiz-finish" aria-live="polite"><h3>You scored {score} out of {questions.length}</h3><p>Keep practising independent verification. A quiz score does not measure whether a real message is safe.</p><button className="primary" onClick={() => { setIndex(0); setAnswer(null); setScore(0); setDone(false); }}>Try the quiz again</button></div> : <>
      <p className="quiz-progress">Question {index + 1} of {questions.length}</p><h3>{question.prompt}</h3><div className="quiz-options">{question.options.map((option,i) => <button key={option} disabled={answer !== null} aria-pressed={answer === i} className={answer === i ? 'quiz-option selected' : 'quiz-option'} onClick={() => choose(i)}>{option}</button>)}</div>
      {answer !== null && <div className="quiz-feedback" role="status"><strong>{answer === question.correct ? 'That’s right.' : 'Let’s look at the safer answer.'}</strong><p>{question.explanation}</p><button className="primary" onClick={next}>{index === questions.length - 1 ? 'See my score' : 'Next question'}</button></div>}
    </>}
  </section>;
}
