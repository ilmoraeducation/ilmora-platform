// src/components/shared/ChatBot.js
import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

const FAQS = [
  { triggers: ['hello','hi','hey','salam'], answer: '👋 Hello! Welcome to ILMORA Education. I\'m your virtual assistant. How can I help you today?\n\nYou can ask me about:\n• Programs & Courses\n• UAE Equivalency\n• Fees & Admissions\n• Certificate Attestation' },
  { triggers: ['program','course','degree','ug','pg','phd','btech','mtech','bachelor','master'], answer: '🎓 **ILMORA Programs**\n\n• **UG (Bachelor)** — BA, BCom, BSc, BCA, BBA\n• **PG (Master)** — MA, MCom, MSc, MBA, MCA\n• **BTech / MTech** — With UAE Equivalency support\n• **PhD** — Research-based doctoral programs\n• **Certifications** — Short professional courses\n• **UAE Equivalency** — Full process handled by us\n\nAll programs are from UGC-recognized, NAAC-accredited universities!' },
  { triggers: ['fee','cost','price','afford','cheap','expensive','payment'], answer: '💰 **Fees at ILMORA**\n\nOur programs are significantly more affordable than traditional universities. We offer:\n\n• Flexible monthly payment plans\n• No hidden costs\n• Transparent pricing\n\nContact us for exact pricing: **+971 52 968 2123** or WhatsApp us!' },
  { triggers: ['equivalency','uae','mohe','hec','recognition','recognize'], answer: '🇦🇪 **UAE Equivalency Support**\n\nThis is ILMORA\'s biggest specialty! We handle the COMPLETE equivalency process:\n\n✅ MOHE submission\n✅ HEC verification\n✅ All documentation\n✅ Follow-ups\n✅ Certificate delivery\n\nYou provide your documents — we handle everything else!' },
  { triggers: ['attest','attestation','document','paperwork'], answer: '📋 **Certificate Attestation**\n\nILMORA manages the full attestation chain:\n\n1️⃣ University attestation\n2️⃣ State HRD attestation\n3️⃣ MEA (Ministry of External Affairs)\n4️⃣ UAE Embassy attestation\n5️⃣ MOFA UAE (if needed)\n\nWe handle every step — you don\'t have to worry about a thing!' },
  { triggers: ['work','job','professional','weekend','flexible','online'], answer: '💼 **Study While Working**\n\nYes! ILMORA is built for working professionals:\n\n• Weekend classes available\n• Flexible online schedule\n• Assignment support\n• No need to take leave from work\n\nThousands of UAE professionals have graduated through ILMORA without disrupting their careers!' },
  { triggers: ['duration','long','time','year','month','complete','finish'], answer: '⏱️ **Program Duration**\n\n• **UG Degrees** — 3 years\n• **PG Programs** — 1–2 years\n• **PhD** — 2–4 years\n• **Certifications** — 3–6 months\n\nILMORA designs intensive programs to minimize duration without compromising quality.' },
  { triggers: ['university','partner','naac','ugc','accredited','recognized'], answer: '🏛️ **Partner Universities**\n\nAll universities are UGC-recognized and NAAC-accredited:\n\n• Om Sterling Global University (OSGU)\n• Jamia Urdu Aligarh\n• Lingaya\'s Vidyapeeth\n• Arni University\n• Rabindranath Tagore University (RNTU)\n• Rajiv Gandhi University (RGU)\n\nDegrees accepted internationally including UAE!' },
  { triggers: ['contact','phone','call','whatsapp','email','reach'], answer: '📞 **Contact ILMORA**\n\n• **UAE:** +971 52 968 2123\n• **India:** +91 74830 08412\n• **Email:** Ilmoraeducationgroup@gmail.com\n• **Instagram:** @ilmora_education\n\n💬 [WhatsApp Us](https://wa.me/971529682123?text=Hi%20ILMORA%2C%20I%27m%20interested%20in%20your%20programs)\n\nWe offer FREE consultations — no commitment!' },
  { triggers: ['register','enroll','join','apply','admission','start'], answer: '📝 **How to Enroll**\n\n1. Contact us for a FREE consultation\n2. Choose your program\n3. Submit documents\n4. ILMORA handles university enrollment\n5. Classes begin!\n\n👉 **Register now** on our student portal or call +971 52 968 2123' },
];

const QUICK_REPLIES = ['Tell me about programs', 'UAE Equivalency', 'Fees & Payment', 'How to Enroll', 'Contact ILMORA'];

function getBotReply(message) {
  const lower = message.toLowerCase();
  for (const faq of FAQS) {
    if (faq.triggers.some(t => lower.includes(t))) {
      return faq.answer;
    }
  }
  return '🤔 I\'m not sure about that specific question. For the best answer, please contact our advisors directly:\n\n📞 **UAE:** +971 52 968 2123\n📧 **Email:** Ilmoraeducationgroup@gmail.com\n\nOr type one of the quick reply buttons below to get instant answers!';
}

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n/g, '<br/>');
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: '👋 Hi! I\'m the ILMORA Assistant. Ask me anything about our programs, fees, UAE equivalency, or admissions!', time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [pulse, setPulse] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    const t = setTimeout(() => setPulse(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const send = async (text) => {
    if (!text.trim()) return;
    const userMsg = { from: 'user', text, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    const reply = getBotReply(text);
    setMessages(prev => [...prev, { from: 'bot', text: reply, time: new Date() }]);
    setTyping(false);
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } };

  return (
    <>
      {/* Chat Window */}
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-avatar">🎓</div>
            <div>
              <div className="chat-name">ILMORA Assistant</div>
              <div className="chat-status"><span className="status-dot"></span> Online</div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.from}`}>
                {msg.from === 'bot' && <div className="msg-avatar">🎓</div>}
                <div className="msg-bubble" dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}></div>
              </div>
            ))}
            {typing && (
              <div className="chat-msg bot">
                <div className="msg-avatar">🎓</div>
                <div className="msg-bubble typing-indicator"><span></span><span></span><span></span></div>
              </div>
            )}
            <div ref={bottomRef}></div>
          </div>
          <div className="quick-replies">
            {QUICK_REPLIES.map(q => (
              <button key={q} className="quick-reply-btn" onClick={() => send(q)}>{q}</button>
            ))}
          </div>
          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="Ask about programs, fees, UAE equivalency..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button className="chat-send" onClick={() => send(input)}>→</button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        className={`chat-fab ${pulse && !open ? 'pulse' : ''}`}
        onClick={() => { setOpen(!open); setPulse(false); }}
        title="Chat with ILMORA"
      >
        {open ? '✕' : '💬'}
        {!open && <span className="chat-fab-label">Chat</span>}
      </button>
    </>
  );
}
