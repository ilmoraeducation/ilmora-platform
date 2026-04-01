// src/pages/HomePage.js
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import ChatBot from '../components/shared/ChatBot';

// University logos data
const UNIVERSITIES = [
  { name: 'OSGU', fullName: 'Om Sterling Global University', country: 'Rajasthan, India · NAAC', img: '/images/universities/osgu.png', url: 'https://osgu.ac.in' },
  { name: 'Jamia Urdu', fullName: 'Jamia Urdu Aligarh', country: 'Aligarh, India · UGC Recognized', img: '/images/universities/jamia-urdu.png', url: 'https://www.jamiaurdu.ac.in' },
  { name: "Lingaya's", fullName: "Lingaya's Vidyapeeth", country: 'Deemed-to-be University · NAAC', img: '/images/universities/lingayas.png', url: 'https://lingayasuniversity.edu.in' },
  { name: 'Arni University', fullName: 'Arni University', country: 'Himachal Pradesh · UGC Approved', img: '/images/universities/arni.png', url: 'https://www.arniuniversity.edu.in' },
  { name: 'RNTU', fullName: 'Rabindranath Tagore University', country: 'Madhya Pradesh · NAAC', img: '/images/universities/rntu.png', url: 'https://www.rntu.ac.in' },
  { name: 'RGU', fullName: 'Rajiv Gandhi University', country: 'Arunachal Pradesh · Central University', img: '/images/universities/rgu.png', url: 'https://www.rgu.ac.in' },
];

const PROGRAMS = [
  { icon: '🎓', title: 'UG Programs', subtitle: 'Bachelor Degrees', desc: 'BA, BCom, BSc, BCA, BBA and more. Weekend & online classes for working professionals.' },
  { icon: '🏛️', title: 'PG Programs', subtitle: 'Master Degrees', desc: 'MA, MCom, MSc, MCA, MBA programs with flexible scheduling. 1–2 year completion.' },
  { icon: '⚙️', title: 'BTech / MTech', subtitle: 'Engineering Degrees', desc: 'Full UAE equivalency support included. Recognized for engineering roles across the UAE.' },
  { icon: '🔬', title: 'PhD Programs', subtitle: 'Doctoral Research', desc: 'Research-based PhD programs from accredited universities. Full mentorship support.' },
  { icon: '📜', title: 'Certifications', subtitle: 'Short Courses', desc: 'Professional certifications in months. Instantly boost your credentials and career.' },
  { icon: '🌐', title: 'UAE Equivalency', subtitle: 'Recognition Service', desc: '100% handled by ILMORA. We manage HEC/MOHE submissions and all paperwork for you.' },
];

const SERVICES = [
  { icon: '📋', title: 'Certificate Attestation', desc: 'Complete state-level, MEA, and UAE embassy attestation — handled entirely by ILMORA.' },
  { icon: '🇦🇪', title: 'UAE Equivalency', desc: 'Full MOHE equivalency process for BTech/MTech. We handle every submission and follow-up.' },
  { icon: '🤝', title: 'Personal Advisor', desc: 'Dedicated education advisor from enrollment to certificate recognition — you are never alone.' },
  { icon: '📦', title: 'Document Logistics', desc: 'We courier all your documents and handle collection, verification, and international dispatch.' },
];

const FAQS = [
  { q: 'Are the certificates internationally recognized?', a: 'Yes. All certificates are from UGC-recognized, NAAC-accredited institutions — accepted internationally including for UAE equivalency, overseas employment, and further studies abroad.' },
  { q: 'Do I need to handle attestation myself?', a: 'Absolutely not. This is ILMORA\'s biggest differentiator. We handle 100% of the attestation, equivalency, and documentation process on your behalf. You provide documents — we do the rest.' },
  { q: 'Can I study while working full time?', a: 'Yes — that\'s exactly who we built this for. All programs have weekend classes and flexible online learning options. You never need to take leave or disrupt your current job.' },
  { q: 'How affordable are the programs?', a: 'ILMORA programs are significantly more affordable than traditional universities. We offer flexible monthly payment plans with no hidden costs. Contact us for a free consultation.' },
  { q: 'What is UAE equivalency and do you support it?', a: 'UAE equivalency is getting your Indian degree recognized by UAE authorities — required for many professional roles and visa categories. ILMORA specializes in this — we handle the entire process for BTech and MTech graduates.' },
  { q: 'How long does it take to complete a degree?', a: 'UG degrees typically take 3 years, PG programs 1–2 years, and certifications a few months. ILMORA designs intensive, focused programs to minimize duration without compromising quality.' },
  { q: 'What happens after I enroll?', a: 'You get a dedicated advisor who guides you through classes, assignments, and exams. After graduation, ILMORA handles all your post-degree documentation — from day one to international recognition.' },
];

export default function HomePage() {
  const canvasRef = useRef(null);
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', interest: '', message: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const cursorRef = useRef(null);
  const cursorRingRef = useRef(null);
  const scrollBarRef = useRef(null);

  // Three.js particle background
  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const THREE = window.THREE;
    if (!THREE) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 5;

    // Create particles
    const geometry = new THREE.BufferGeometry();
    const count = window.innerWidth < 768 ? 600 : 1400;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      sizes[i] = Math.random() * 2 + 0.5;
      const isGold = Math.random() > 0.65;
      colors[i * 3] = isGold ? 0.79 : 0.3;
      colors[i * 3 + 1] = isGold ? 0.66 : 0.3;
      colors[i * 3 + 2] = isGold ? 0.30 : 0.9;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.04, vertexColors: true, transparent: true, opacity: 0.7,
      sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.3;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 0.3;
    };
    window.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      particles.rotation.y = t * 0.015 + mouseX;
      particles.rotation.x = t * 0.008 + mouseY;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  // Custom cursor
  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = cursorRingRef.current;
    if (!cursor || !ring) return;
    let rx = 0, ry = 0;
    const move = (e) => {
      cursor.style.left = e.clientX - 4 + 'px';
      cursor.style.top = e.clientY - 4 + 'px';
      rx += (e.clientX - 18 - rx) * 0.18;
      ry += (e.clientY - 18 - ry) * 0.18;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
    };
    const onHover = () => { ring.style.width = '60px'; ring.style.height = '60px'; ring.style.borderColor = 'rgba(201,168,76,0.8)'; };
    const onLeave = () => { ring.style.width = '36px'; ring.style.height = '36px'; ring.style.borderColor = 'rgba(201,168,76,0.5)'; };
    document.querySelectorAll('a, button, .faq-item').forEach(el => {
      el.addEventListener('mouseenter', onHover);
      el.addEventListener('mouseleave', onLeave);
    });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  // Scroll bar + reveal animations
  useEffect(() => {
    const onScroll = () => {
      const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollBarRef.current) scrollBarRef.current.style.width = pct + '%';
      document.querySelectorAll('.reveal').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.88) {
          el.classList.add('visible');
        }
      });
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Animated counters
  useEffect(() => {
    const counters = document.querySelectorAll('.stat-num');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target || '0');
        const suffix = el.dataset.suffix || '';
        if (!target) return;
        let current = 0;
        const increment = target / 80;
        const timer = setInterval(() => {
          current = Math.min(current + increment, target);
          el.textContent = Math.floor(current).toLocaleString() + suffix;
          if (current >= target) clearInterval(timer);
        }, 20);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setFormSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setFormSubmitting(false);
    setFormSuccess(true);
    setFormData({ name: '', phone: '', email: '', interest: '', message: '' });
    setTimeout(() => setFormSuccess(false), 5000);
  }

  return (
    <div className="home-page">
      {/* Custom Cursor */}
      <div className="cursor" ref={cursorRef}></div>
      <div className="cursor-ring" ref={cursorRingRef}></div>

      {/* Scroll Progress */}
      <div className="scroll-progress-bar" ref={scrollBarRef}></div>

      {/* ══ NAVBAR ══ */}
      <NavBar />

      {/* ══ HERO ══ */}
      <section className="hero" id="home">
        <canvas ref={canvasRef} id="hero-canvas"></canvas>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="gold-badge reveal">Premium Education Consultancy &nbsp;·&nbsp; UAE &amp; India</div>
          <h1 className="hero-title reveal reveal-delay-1">
            Get Your Degree.<br />
            <span className="hero-gold-line">We Handle the Rest.</span>
          </h1>
          <p className="hero-sub reveal reveal-delay-2">
            Flexible UG, PG &amp; PhD programs for working professionals — with complete attestation, equivalency, and documentation support handled by us, A to Z.
          </p>
          <div className="hero-btns reveal reveal-delay-3">
            <a href="#programs" className="btn-gold">Explore Programs →</a>
            <a href="#contact" className="btn-outline">📞 Request a Callback</a>
          </div>
          <div className="hero-badges reveal">
            {['Authorized Universities','UAE Equivalency Support','Affordable Fees','Complete Documentation Handled'].map(b => (
              <span className="badge" key={b}><span className="badge-check">✓</span> {b}</span>
            ))}
          </div>
          <div className="hero-portal-links reveal">
            <Link to="/login" className="portal-link">Student Portal →</Link>
            <Link to="/admin" className="portal-link admin-link">Admin Access →</Link>
          </div>
        </div>
        <div className="scroll-hint">
          <span>Scroll</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <div className="stats-strip">
        <div className="container">
          <div className="stats-grid">
            {[
              { target: 50000, suffix: 'k+', label: 'Students Reached' },
              { target: 200, suffix: '+', label: 'Institutions' },
              { target: 25, suffix: '+', label: 'Countries' },
              { target: 100, suffix: '%', label: 'Documentation Handled' },
            ].map(s => (
              <div className="stat-item" key={s.label}>
                <div className="stat-num" data-target={s.target} data-suffix={s.suffix}>0</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ ABOUT ══ */}
      <section className="about-section section-pad" id="about">
        <div className="container">
          <div className="about-grid">
            <div className="reveal">
              <div className="section-label">About ILMORA</div>
              <h2 className="section-title">Why Thousands<br /><span className="gold">Trust ILMORA</span></h2>
              <div className="gold-divider"></div>
              <p className="section-body" style={{marginBottom:'1.5rem'}}>ILMORA is not just a course platform — it is your complete A-to-Z career development partner. We make quality, accredited education accessible to working professionals worldwide, with <strong style={{color:'#fff'}}>zero administrative burden</strong> on our students.</p>
              <p className="section-body">From enrollment to the day your certificate is internationally recognized, we handle every step. Attestation, equivalency, university documentation — you focus on learning, we handle the rest.</p>
              <div style={{marginTop:'2.5rem', display:'flex', gap:'1rem', flexWrap:'wrap'}}>
                <a href="#contact" className="btn-gold">Start Your Journey →</a>
                <Link to="/register" className="btn-outline">Create Account</Link>
              </div>
            </div>
            <div className="about-cards reveal reveal-delay-2">
              {[
                { icon: '💼', title: 'No Need to Quit Your Job', desc: 'Weekend classes and flexible online schedules designed around your career' },
                { icon: '🏛️', title: 'Authorized University Certificates', desc: 'Degrees from accredited, recognized institutions accepted worldwide' },
                { icon: '💰', title: 'Affordable, Transparent Fees', desc: 'World-class education at prices built for everyone — no hidden costs' },
                { icon: '📋', title: 'We Handle All Paperwork', desc: 'Attestation, equivalency, documentation — completely managed by us' },
              ].map(card => (
                <div className="glass-card" key={card.title}>
                  <div className="card-icon-lg">{card.icon}</div>
                  <div className="card-title">{card.title}</div>
                  <div className="card-desc">{card.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="how-section section-pad" id="how">
        <div className="container">
          <div style={{textAlign:'center'}} className="reveal">
            <div className="section-label" style={{justifyContent:'center'}}>Your Journey</div>
            <h2 className="section-title">How It Works With <span className="gold">ILMORA</span></h2>
            <div className="gold-divider" style={{margin:'1.5rem auto'}}></div>
            <p className="section-body" style={{maxWidth:'540px',margin:'0 auto'}}>Five simple steps from enrollment to internationally recognized career success.</p>
          </div>
          <div className="steps-grid">
            {[
              { n:'1', title:'Choose Your Program', desc:'Browse flexible UG, PG, PhD, or certification programs that fit your career goals' },
              { n:'2', title:'Enroll & Start Learning', desc:'Weekend classes, online support, assignment help — study completely at your pace' },
              { n:'3', title:'Graduate', desc:'Complete your degree from an authorized, accredited university with full support' },
              { n:'4', title:'We Handle Everything', desc:'ILMORA manages your attestation, UAE equivalency, and all international recognition paperwork' },
              { n:'5', title:'Career Growth', desc:'Your certified, recognized qualification opens new doors globally' },
            ].map((s, i) => (
              <div className={`step-item reveal reveal-delay-${i % 3 + 1}`} key={s.n}>
                <div className="step-num-wrap"><div className="step-num">{s.n}</div></div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROGRAMS ══ */}
      <section className="programs-section section-pad" id="programs">
        <div className="container">
          <div className="reveal">
            <div className="section-label">Study Options</div>
            <h2 className="section-title">Flexible Programs for <span className="gold">Every Stage</span></h2>
            <div className="gold-divider"></div>
          </div>
          <div className="programs-grid">
            {PROGRAMS.map((p, i) => (
              <div className={`program-card reveal reveal-delay-${i % 3 + 1}`} key={p.title}>
                <span className="program-icon">{p.icon}</span>
                <div className="program-title">{p.title}</div>
                <div className="program-subtitle">{p.subtitle}</div>
                <div className="program-desc">{p.desc}</div>
                <a href="#contact" className="program-cta">Enquire Now →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══ */}
      <section className="services-section section-pad" id="services">
        <div className="container">
          <div className="reveal" style={{textAlign:'center', marginBottom:'4rem'}}>
            <div className="section-label" style={{justifyContent:'center'}}>Our Services</div>
            <h2 className="section-title">Everything Handled <span className="gold">By Us</span></h2>
            <div className="gold-divider" style={{margin:'1.5rem auto'}}></div>
          </div>
          <div className="services-grid">
            {SERVICES.map((s, i) => (
              <div className={`service-card reveal reveal-delay-${i % 3 + 1}`} key={s.title}>
                <div className="service-icon">{s.icon}</div>
                <div className="service-title">{s.title}</div>
                <div className="service-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ UNIVERSITIES ══ */}
      <section className="uni-section section-pad" id="universities">
        <div className="container">
          <div className="reveal" style={{textAlign:'center', marginBottom:'4rem'}}>
            <div className="section-label" style={{justifyContent:'center'}}>Our Network</div>
            <h2 className="section-title">Partner <span className="gold">Universities</span></h2>
            <div className="gold-divider" style={{margin:'1.5rem auto'}}></div>
            <p className="section-body" style={{maxWidth:'540px', margin:'0 auto'}}>UGC-recognized, NAAC-accredited institutions whose degrees are accepted internationally — including for UAE equivalency.</p>
          </div>
          <div className="uni-grid">
            {UNIVERSITIES.map((u, i) => (
              <a href={u.url} target="_blank" rel="noopener noreferrer" className={`uni-card reveal reveal-delay-${i % 3 + 1}`} key={u.name}>
                <div className="uni-logo-wrap">
                  <img src={u.img} alt={u.name} className="uni-logo" />
                </div>
                <div className="uni-name">{u.fullName}</div>
                <div className="uni-country">{u.country}</div>
                <div className="uni-visit">Visit Website →</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="faq-section section-pad" id="faq">
        <div className="container">
          <div className="reveal">
            <div className="section-label">Common Questions</div>
            <h2 className="section-title">Everything You<br /><span className="gold">Need to Know</span></h2>
            <div className="gold-divider"></div>
          </div>
          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <div
                className={`faq-item ${activeFAQ === i ? 'open' : ''}`}
                key={i}
                onClick={() => setActiveFAQ(activeFAQ === i ? null : i)}
              >
                <div className="faq-question">
                  {faq.q}
                  <span className="faq-icon">{activeFAQ === i ? '−' : '+'}</span>
                </div>
                {activeFAQ === i && <div className="faq-answer"><p>{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CONTACT ══ */}
      <section className="contact-section section-pad" id="contact">
        <div className="container">
          <div className="reveal" style={{textAlign:'center', marginBottom:'4rem'}}>
            <div className="section-label" style={{justifyContent:'center'}}>Get In Touch</div>
            <h2 className="section-title">Start Your Journey <span className="gold">Today</span></h2>
            <div className="gold-divider" style={{margin:'1.5rem auto'}}></div>
            <p className="section-body" style={{maxWidth:'500px', margin:'0 auto'}}>Talk to our advisors — free consultation, no commitment. We'll find the right program for you and explain exactly how we handle everything.</p>
          </div>
          <div className="contact-grid">
            <div className="contact-form-wrap reveal">
              {formSuccess ? (
                <div className="form-success">
                  <div className="success-icon">✅</div>
                  <h3>Thank You!</h3>
                  <p>Our advisor will contact you within 24 hours for your free consultation.</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" placeholder="Your full name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input className="form-input" type="tel" placeholder="+971 or +91 number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-input" type="email" placeholder="your@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">I'm Interested In</label>
                    <select className="form-input" value={formData.interest} onChange={e => setFormData({...formData, interest: e.target.value})}>
                      <option value="">Select a program or service...</option>
                      <option>UG Program (Bachelor Degree)</option>
                      <option>PG Program (Master Degree)</option>
                      <option>PhD Program</option>
                      <option>BTech / MTech (Technical Degree)</option>
                      <option>Short Certification Course</option>
                      <option>UAE Equivalency Support</option>
                      <option>Certificate Attestation</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message (Optional)</label>
                    <textarea className="form-input" rows="3" placeholder="Tell us about your situation..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
                  </div>
                  <button className="btn-gold" type="submit" style={{width:'100%', justifyContent:'center', padding:'1rem'}} disabled={formSubmitting}>
                    {formSubmitting ? '⌛ Submitting...' : '📞 Request a Free Callback'}
                  </button>
                </form>
              )}
            </div>

            <div className="contact-info-col reveal reveal-delay-2">
              <div className="contact-main-num">+971 52 968 2123</div>
              <div className="contact-tagline">Call or WhatsApp us anytime — free consultation</div>
              <div className="contact-items">
                {[
                  { icon:'📞', label:'UAE Phone', val:'+971 52 968 2123', href:'tel:+971529682123' },
                  { icon:'📞', label:'India Phone', val:'+91 74830 08412', href:'tel:+917483008412' },
                  { icon:'✉️', label:'Email', val:'Ilmoraeducationgroup@gmail.com', href:'mailto:Ilmoraeducationgroup@gmail.com' },
                  { icon:'📍', label:'Office', val:'India & UAE Operations', href:null },
                ].map(item => (
                  item.href ? (
                    <a href={item.href} className="contact-item" key={item.label}>
                      <div className="contact-item-icon">{item.icon}</div>
                      <div><div className="contact-item-label">{item.label}</div><span className="contact-item-val">{item.val}</span></div>
                    </a>
                  ) : (
                    <div className="contact-item" key={item.label}>
                      <div className="contact-item-icon">{item.icon}</div>
                      <div><div className="contact-item-label">{item.label}</div><span className="contact-item-val">{item.val}</span></div>
                    </div>
                  )
                ))}
              </div>
              <a href="https://wa.me/971529682123?text=Hi%20ILMORA%2C%20I%27m%20interested%20in%20your%20programs." target="_blank" rel="noopener noreferrer" className="whatsapp-btn">
                💬 Chat on WhatsApp — Instant Response
              </a>
              <div className="social-links-row">
                <a href="https://www.instagram.com/ilmora_education" target="_blank" rel="noopener noreferrer" className="social-btn instagram">📷 Instagram</a>
                <a href="mailto:Ilmoraeducationgroup@gmail.com" className="social-btn">✉ Email Us</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <img src="/images/logo/ilmora-white.png" alt="ILMORA Education" className="footer-logo" />
              <p className="footer-brand-desc">Your complete A-to-Z career development partner. Flexible degrees, affordable fees, and full documentation support — from enrollment to international recognition.</p>
              <div className="footer-tagline">UAE &amp; India · Serving 25+ Countries</div>
              <div className="footer-social-row">
                <a href="https://www.instagram.com/ilmora_education" target="_blank" rel="noopener noreferrer" className="footer-social-icon">📷</a>
                <a href="https://wa.me/971529682123" target="_blank" rel="noopener noreferrer" className="footer-social-icon">💬</a>
                <a href="mailto:Ilmoraeducationgroup@gmail.com" className="footer-social-icon">✉️</a>
              </div>
            </div>
            <div>
              <div className="footer-col-head">Quick Links</div>
              <ul className="footer-links">
                {['#about:About Us','#programs:Programs','#services:Services','#universities:Universities','#faq:FAQ','#contact:Contact'].map(l => {
                  const [href, label] = l.split(':');
                  return <li key={href}><a href={href}>{label}</a></li>;
                })}
              </ul>
            </div>
            <div>
              <div className="footer-col-head">Programs</div>
              <ul className="footer-links">
                {['UG Programs','PG Programs','BTech / MTech','PhD Programs','Certifications','UAE Equivalency'].map(p => (
                  <li key={p}><a href="#programs">{p}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="footer-col-head">Contact Us</div>
              <ul className="footer-links">
                <li><a href="tel:+971529682123">+971 52 968 2123 (UAE)</a></li>
                <li><a href="tel:+917483008412">+91 74830 08412 (India)</a></li>
                <li><a href="mailto:Ilmoraeducationgroup@gmail.com">Ilmoraeducationgroup@gmail.com</a></li>
                <li><a href="https://wa.me/971529682123" target="_blank" rel="noopener noreferrer">WhatsApp Us (UAE)</a></li>
              </ul>
              <div style={{marginTop:'1.5rem'}}>
                <Link to="/login" className="btn-gold" style={{fontSize:'0.78rem', padding:'0.6rem 1.2rem'}}>Student Login</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© 2025 ILMORA Education. All rights reserved. · UAE &amp; India</div>
            <div className="footer-legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <ChatBot />
    </div>
  );
}

// NavBar Component
function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <a href="#" className="nav-logo">
        <img src="/images/logo/ilmora-white.png" alt="ILMORA Education" />
      </a>
      <ul className={`nav-links ${mobileOpen ? 'mobile-open' : ''}`}>
        {['#about:About','#programs:Programs','#services:Services','#universities:Universities','#contact:Contact'].map(l => {
          const [href, label] = l.split(':');
          return <li key={href}><a href={href} onClick={() => setMobileOpen(false)}>{label}</a></li>;
        })}
        <li><Link to="/login" className="nav-portal-link" onClick={() => setMobileOpen(false)}>Portal</Link></li>
      </ul>
      <a href="#contact" className="nav-cta">Get a Free Callback</a>
      <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
        <span></span><span></span><span></span>
      </button>
    </nav>
  );
}
