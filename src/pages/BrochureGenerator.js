// src/pages/BrochureGenerator.js
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './BrochureGenerator.css';

const PROGRAMS = [
  { label: 'MBA (Master of Business Administration)', type: 'PG', duration: '2 Years', university: 'OSGU / Lingaya\'s Vidyapeeth' },
  { label: 'BBA (Bachelor of Business Administration)', type: 'UG', duration: '3 Years', university: 'OSGU / Arni University' },
  { label: 'MCA (Master of Computer Applications)', type: 'PG', duration: '2 Years', university: 'OSGU / RNTU' },
  { label: 'BCA (Bachelor of Computer Applications)', type: 'UG', duration: '3 Years', university: 'OSGU / Arni University' },
  { label: 'BTech (Bachelor of Technology)', type: 'UG', duration: '4 Years', university: 'RNTU / RGU' },
  { label: 'MTech (Master of Technology)', type: 'PG', duration: '2 Years', university: 'RNTU / RGU' },
  { label: 'MSc (Master of Science)', type: 'PG', duration: '2 Years', university: 'Jamia Urdu / OSGU' },
  { label: 'MA (Master of Arts)', type: 'PG', duration: '2 Years', university: 'Jamia Urdu Aligarh' },
  { label: 'BA (Bachelor of Arts)', type: 'UG', duration: '3 Years', university: 'Jamia Urdu Aligarh' },
  { label: 'PhD (Doctor of Philosophy)', type: 'PhD', duration: '3-5 Years', university: 'RNTU / RGU' },
  { label: 'Short Certification Course', type: 'Certificate', duration: '3-6 Months', university: 'Multiple Partners' },
  { label: 'UAE Equivalency Service', type: 'Service', duration: 'N/A', university: 'All Partners' },
];

export default function BrochureGenerator() {
  const [form, setForm] = useState({
    studentName: '', phone: '', email: '', program: '', city: '', nationality: ''
  });
  const [generating, setGenerating] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectedProgram = PROGRAMS.find(p => p.label === form.program);

  async function generatePDF() {
    if (!form.studentName || !form.program) {
      return toast.error('Please fill Student Name and Program');
    }
    setGenerating(true);

    try {
      // Dynamically import jsPDF
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = 210, H = 297;

      // ── BACKGROUND ──
      doc.setFillColor(13, 13, 13);
      doc.rect(0, 0, W, H, 'F');

      // Gold side stripe
      doc.setFillColor(201, 168, 76);
      doc.rect(0, 0, 6, H, 'F');

      // Header area
      doc.setFillColor(20, 20, 30);
      doc.rect(6, 0, W - 6, 55, 'F');

      // Gold accent line under header
      doc.setFillColor(201, 168, 76);
      doc.rect(6, 55, W - 6, 0.8, 'F');

      // ── ILMORA LOGO TEXT (since we can't embed image easily) ──
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(201, 168, 76);
      doc.text('ILMORA', 20, 22);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(180, 180, 180);
      doc.text('EDUCATION', 20, 30);

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text('UAE & India  ·  Premium Education Consultancy', 20, 37);

      // Document type badge
      doc.setFillColor(201, 168, 76);
      doc.roundedRect(130, 12, 65, 10, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text('PERSONALIZED BROCHURE', 162.5, 18.5, { align: 'center' });

      // Date
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Generated: ' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), 162.5, 30, { align: 'center' });

      // ── STUDENT GREETING ──
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text(`Dear ${form.studentName},`, 20, 75);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(160, 160, 160);
      const greeting = 'Thank you for your interest in ILMORA Education. We have prepared this personalized brochure to guide you through your academic journey with us.';
      const greetLines = doc.splitTextToSize(greeting, W - 40);
      doc.text(greetLines, 20, 85);

      // ── PROGRAM HIGHLIGHT BOX ──
      doc.setFillColor(25, 25, 38);
      doc.roundedRect(14, 100, W - 28, 65, 4, 4, 'F');
      doc.setDrawColor(201, 168, 76);
      doc.setLineWidth(0.5);
      doc.roundedRect(14, 100, W - 28, 65, 4, 4, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(201, 168, 76);
      doc.text('YOUR SELECTED PROGRAM', 20, 112);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      const progLines = doc.splitTextToSize(form.program, W - 50);
      doc.text(progLines, 20, 122);

      // Program details grid
      const details = [
        ['Program Type', selectedProgram?.type || 'N/A'],
        ['Duration', selectedProgram?.duration || 'N/A'],
        ['University', selectedProgram?.university || 'ILMORA Partner University'],
        ['Mode', 'Weekend & Online'],
      ];
      let detailY = 140;
      details.forEach(([label, val]) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(label.toUpperCase(), 20, detailY);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 220, 220);
        doc.setFontSize(9);
        doc.text(val, 75, detailY);
        detailY += 8;
      });

      // ── KEY BENEFITS ──
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text('Why Choose ILMORA?', 20, 182);

      doc.setFillColor(201, 168, 76);
      doc.rect(20, 185, 30, 0.5, 'F');

      const benefits = [
        ['✓', 'No need to quit your job — weekend & online classes'],
        ['✓', 'UGC-recognized, NAAC-accredited university degrees'],
        ['✓', '100% attestation & UAE equivalency handled by us'],
        ['✓', 'Dedicated advisor from enrollment to certification'],
        ['✓', 'Flexible monthly payment plans — no hidden costs'],
        ['✓', 'Internationally recognized certificates'],
      ];

      let benY = 195;
      benefits.forEach(([icon, text]) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(201, 168, 76);
        doc.text(icon, 20, benY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(180, 180, 180);
        doc.text(text, 28, benY);
        benY += 8;
      });

      // ── PROCESS STEPS ──
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text('Your Journey in 5 Steps', 20, 257);
      doc.setFillColor(201, 168, 76);
      doc.rect(20, 260, 30, 0.5, 'F');

      const steps = ['Choose Program', 'Enroll & Start', 'Graduate', 'We Handle Docs', 'Career Growth'];
      let stepX = 14;
      steps.forEach((step, i) => {
        doc.setFillColor(201, 168, 76);
        doc.circle(stepX + 18, 270, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`${i + 1}`, stepX + 18, 273, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(160, 160, 160);
        const stepLines = doc.splitTextToSize(step, 32);
        doc.text(stepLines, stepX + 18, 281, { align: 'center' });
        if (i < 4) {
          doc.setDrawColor(201, 168, 76, 0.3);
          doc.setLineWidth(0.3);
          doc.line(stepX + 25, 270, stepX + 33, 270);
        }
        stepX += 38;
      });

      // ── FOOTER ──
      doc.setFillColor(20, 20, 30);
      doc.rect(6, H - 30, W - 6, 30, 'F');
      doc.setFillColor(201, 168, 76);
      doc.rect(6, H - 30, W - 6, 0.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(201, 168, 76);
      doc.text('ILMORA Education — Contact Us', 20, H - 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text('📞 UAE: +971 52 968 2123  |  📞 India: +91 74830 08412', 20, H - 13);
      doc.text('✉ Ilmoraeducationgroup@gmail.com  |  @ilmora_education', 20, H - 7);

      doc.setTextColor(80, 80, 80);
      doc.setFontSize(7);
      doc.text(`© ${new Date().getFullYear()} ILMORA Education. UAE & India. All rights reserved.`, W - 14, H - 7, { align: 'right' });

      // Download
      const filename = `ILMORA_Brochure_${form.studentName.replace(/\s+/g, '_')}.pdf`;
      doc.save(filename);
      toast.success('Brochure downloaded! 🎓');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="brochure-page">
      <div className="brochure-bg-orb"></div>

      {/* Header */}
      <div className="brochure-header">
        <Link to="/" className="brochure-logo">
          <img src="/images/logo/ilmora-white.png" alt="ILMORA" />
        </Link>
        <div>
          <h1 className="brochure-page-title">📄 Brochure Generator</h1>
          <p className="brochure-page-sub">Create a personalized ILMORA brochure in seconds</p>
        </div>
        <Link to="/" className="btn-ghost">← Back to Home</Link>
      </div>

      <div className="brochure-layout">
        {/* Form Panel */}
        <div className="brochure-form-panel glass-card">
          <h2 className="panel-title">Student Information</h2>
          <p className="panel-sub">Fill in the details to personalize the brochure</p>

          <div className="brochure-form">
            <div className="form-group">
              <label className="form-label">Student Full Name *</label>
              <input className="form-input" placeholder="Enter full name" value={form.studentName} onChange={e => set('studentName', e.target.value)} />
            </div>
            <div className="brochure-row-2">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" type="tel" placeholder="+971 or +91" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="email@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Select Program *</label>
              <select className="form-input" value={form.program} onChange={e => set('program', e.target.value)}>
                <option value="">Choose a program...</option>
                {PROGRAMS.map(p => (
                  <option key={p.label} value={p.label}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="brochure-row-2">
              <div className="form-group">
                <label className="form-label">City / Location</label>
                <input className="form-input" placeholder="Dubai, Mumbai..." value={form.city} onChange={e => set('city', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Nationality</label>
                <input className="form-input" placeholder="Indian, Pakistani..." value={form.nationality} onChange={e => set('nationality', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Program Preview Card */}
          {selectedProgram && (
            <div className="program-preview-card">
              <div className="pp-label">Selected Program</div>
              <div className="pp-name">{selectedProgram.label}</div>
              <div className="pp-meta">
                <span className="gold-badge">{selectedProgram.type}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>⏱ {selectedProgram.duration}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>🏛️ {selectedProgram.university}</span>
              </div>
            </div>
          )}

          <button
            className="btn-gold"
            style={{ width: '100%', justifyContent: 'center', padding: '1rem', marginTop: '1.5rem', fontSize: '0.95rem' }}
            onClick={generatePDF}
            disabled={generating}
          >
            {generating ? '⌛ Generating PDF...' : '📥 Download Personalized Brochure'}
          </button>
        </div>

        {/* Preview Panel */}
        <div className="brochure-preview-panel">
          <h2 className="panel-title">Brochure Preview</h2>
          <p className="panel-sub">A4 dark luxury design with your details auto-filled</p>

          <div className="brochure-mock">
            {/* Mock brochure visual */}
            <div className="mock-header">
              <div className="mock-gold-stripe"></div>
              <div className="mock-header-content">
                <div className="mock-logo-text">ILMORA</div>
                <div className="mock-logo-sub">EDUCATION</div>
                <div className="mock-badge">PERSONALIZED BROCHURE</div>
              </div>
            </div>
            <div className="mock-body">
              <div className="mock-greeting">
                Dear <span className="mock-name">{form.studentName || 'Student Name'}</span>,
              </div>
              <div className="mock-text-line"></div>
              <div className="mock-text-line short"></div>

              <div className="mock-program-box">
                <div className="mock-program-label">YOUR SELECTED PROGRAM</div>
                <div className="mock-program-name">{form.program || 'Program Name'}</div>
                <div className="mock-program-details">
                  <span>{selectedProgram?.type || 'Type'}</span>
                  <span>{selectedProgram?.duration || 'Duration'}</span>
                  <span>Weekend & Online</span>
                </div>
              </div>

              <div className="mock-benefits">
                {['UGC-Recognized Degrees', 'UAE Equivalency Handled', '100% Documentation Support', 'Weekend Classes Available'].map(b => (
                  <div className="mock-benefit" key={b}>
                    <span className="mock-check">✓</span> {b}
                  </div>
                ))}
              </div>
            </div>
            <div className="mock-footer">
              <div className="mock-footer-line"></div>
              <div className="mock-contact">📞 +971 52 968 2123 | ✉ Ilmoraeducationgroup@gmail.com</div>
            </div>
          </div>

          <div className="brochure-features">
            {['🎨 Dark luxury design', '🏛️ Partner university logos', '📋 Your details auto-filled', '📥 Instant PDF download'].map(f => (
              <div className="brochure-feature" key={f}>{f}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
