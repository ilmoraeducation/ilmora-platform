// src/pages/PosterGenerator.js
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './PosterGenerator.css';

const TEMPLATES = [
  {
    id: 'gold-luxury',
    name: 'Gold Luxury',
    bg: 'linear-gradient(145deg, #0D0D0D 0%, #1a1200 50%, #0D0D0D 100%)',
    accent: '#C9A84C',
    textColor: '#fff',
    subColor: '#C9A84C',
  },
  {
    id: 'blue-pro',
    name: 'Blue Professional',
    bg: 'linear-gradient(145deg, #060d1f 0%, #0a1628 50%, #060d1f 100%)',
    accent: '#4FC3F7',
    textColor: '#fff',
    subColor: '#4FC3F7',
  },
  {
    id: 'dark-minimal',
    name: 'Dark Minimal',
    bg: 'linear-gradient(145deg, #111 0%, #1a1a1a 100%)',
    accent: '#fff',
    textColor: '#fff',
    subColor: 'rgba(255,255,255,0.65)',
  },
  {
    id: 'emerald',
    name: 'Emerald Elite',
    bg: 'linear-gradient(145deg, #061208 0%, #0d2016 50%, #061208 100%)',
    accent: '#4CAF50',
    textColor: '#fff',
    subColor: '#81C784',
  },
];

const POSTER_SIZES = [
  { label: 'Instagram Post', w: 540, h: 540, ratio: '1:1' },
  { label: 'Instagram Story', w: 405, h: 720, ratio: '9:16' },
  { label: 'Facebook Post', w: 600, h: 315, ratio: '~2:1' },
  { label: 'A4 Print', w: 480, h: 678, ratio: 'A4' },
];

export default function PosterGenerator() {
  const canvasRef = useRef(null);
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [size, setSize] = useState(POSTER_SIZES[0]);
  const [form, setForm] = useState({
    headline: 'Get Your Degree.',
    subheadline: 'We Handle the Rest.',
    program: 'MBA · BTech · MTech · PhD · BA · MA',
    badge: 'UAE Equivalency Handled',
    contact: '+971 52 968 2123',
    footer: 'Ilmoraeducationgroup@gmail.com  |  @ilmora_education',
    showLogo: true,
    showBadge: true,
    showContact: true,
  });
  const [downloading, setDownloading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Draw poster on canvas
  useEffect(() => {
    drawPoster();
  }, [template, form, size]);

  function drawPoster() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = size.w, H = size.h;
    canvas.width = W;
    canvas.height = H;

    // Background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    if (template.id === 'gold-luxury') {
      grad.addColorStop(0, '#0D0D0D');
      grad.addColorStop(0.5, '#1a1200');
      grad.addColorStop(1, '#0D0D0D');
    } else if (template.id === 'blue-pro') {
      grad.addColorStop(0, '#060d1f');
      grad.addColorStop(0.5, '#0a1628');
      grad.addColorStop(1, '#060d1f');
    } else if (template.id === 'dark-minimal') {
      grad.addColorStop(0, '#111');
      grad.addColorStop(1, '#1a1a1a');
    } else {
      grad.addColorStop(0, '#061208');
      grad.addColorStop(0.5, '#0d2016');
      grad.addColorStop(1, '#061208');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Noise texture overlay
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < W * H * 0.1; i++) {
      ctx.fillStyle = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
      ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
    }
    ctx.globalAlpha = 1;

    // Left accent stripe
    const stripeGrad = ctx.createLinearGradient(0, 0, 0, H);
    stripeGrad.addColorStop(0, template.accent + '00');
    stripeGrad.addColorStop(0.5, template.accent);
    stripeGrad.addColorStop(1, template.accent + '00');
    ctx.fillStyle = stripeGrad;
    ctx.fillRect(0, 0, 4, H);

    // Glow circle (top-right)
    const glowR = ctx.createRadialGradient(W, 0, 0, W, 0, W * 0.6);
    glowR.addColorStop(0, template.accent + '18');
    glowR.addColorStop(1, 'transparent');
    ctx.fillStyle = glowR;
    ctx.fillRect(0, 0, W, H);

    const pad = Math.round(W * 0.07);
    let y = Math.round(H * 0.1);

    // ILMORA logo text
    if (form.showLogo) {
      ctx.font = `900 ${Math.round(W * 0.055)}px 'Arial Black', Arial, sans-serif`;
      ctx.fillStyle = template.accent;
      ctx.letterSpacing = '4px';
      ctx.fillText('ILMORA', pad, y);
      ctx.font = `400 ${Math.round(W * 0.022)}px Arial, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillText('E D U C A T I O N', pad, y + Math.round(W * 0.032));
      y += Math.round(W * 0.065);
    }

    // Divider
    ctx.strokeStyle = template.accent;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(W - pad, y);
    ctx.stroke();
    ctx.globalAlpha = 1;
    y += Math.round(H * 0.06);

    // Badge
    if (form.showBadge && form.badge) {
      const badgeText = form.badge;
      ctx.font = `700 ${Math.round(W * 0.028)}px Arial, sans-serif`;
      const bW = ctx.measureText(badgeText).width + Math.round(W * 0.06);
      const bH = Math.round(W * 0.055);
      ctx.fillStyle = template.accent;
      roundRect(ctx, pad, y - bH * 0.75, bW, bH, 4);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.fillText(badgeText, pad + Math.round(W * 0.03), y);
      y += Math.round(H * 0.06);
    }

    // Headline
    ctx.font = `800 ${Math.round(W * 0.085)}px Georgia, serif`;
    ctx.fillStyle = '#fff';
    const headLines = wrapText(ctx, form.headline, W - pad * 2);
    headLines.forEach(line => {
      ctx.fillText(line, pad, y);
      y += Math.round(W * 0.095);
    });

    // Subheadline
    ctx.font = `700 ${Math.round(W * 0.065)}px Georgia, serif`;
    ctx.fillStyle = template.accent;
    const subLines = wrapText(ctx, form.subheadline, W - pad * 2);
    subLines.forEach(line => {
      ctx.fillText(line, pad, y);
      y += Math.round(W * 0.075);
    });

    y += Math.round(H * 0.025);

    // Program list
    if (form.program) {
      ctx.font = `600 ${Math.round(W * 0.032)}px Arial, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      const progLines = wrapText(ctx, form.program, W - pad * 2);
      progLines.forEach(line => {
        ctx.fillText(line, pad, y);
        y += Math.round(W * 0.042);
      });
    }

    // Contact
    if (form.showContact && form.contact) {
      const contactY = H - Math.round(H * 0.22);
      ctx.font = `700 ${Math.round(W * 0.038)}px Arial, sans-serif`;
      ctx.fillStyle = template.accent;
      ctx.fillText(form.contact, pad, contactY);

      // Footer line
      ctx.strokeStyle = template.accent;
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, contactY + Math.round(W * 0.02));
      ctx.lineTo(W - pad, contactY + Math.round(W * 0.02));
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.font = `400 ${Math.round(W * 0.025)}px Arial, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      const footLines = wrapText(ctx, form.footer, W - pad * 2);
      footLines.forEach((line, i) => {
        ctx.fillText(line, pad, contactY + Math.round(W * 0.05) + i * Math.round(W * 0.035));
      });
    }

    // Watermark bottom-right corner
    ctx.font = `400 ${Math.round(W * 0.02)}px Arial, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillText(`© ${new Date().getFullYear()} ILMORA Education`, W - pad, H - Math.round(H * 0.025), W - pad * 2);
  }

  function wrapText(ctx, text, maxW) {
    const words = text.split(' ');
    const lines = [];
    let current = '';
    words.forEach(word => {
      const test = current ? current + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    });
    if (current) lines.push(current);
    return lines;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  async function downloadPoster() {
    setDownloading(true);
    await new Promise(r => setTimeout(r, 200));
    try {
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.download = `ILMORA_Poster_${template.name.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      toast.success('Poster downloaded! 🎨');
    } catch {
      toast.error('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="poster-page">
      <div className="brochure-bg-orb" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', top: '-150px', right: '-150px', width: '500px', height: '500px', position: 'fixed', borderRadius: '50%', pointerEvents: 'none' }}></div>

      {/* Header */}
      <div className="brochure-header">
        <Link to="/" className="brochure-logo"><img src="/images/logo/ilmora-white.png" alt="ILMORA" /></Link>
        <div>
          <h1 className="brochure-page-title">🎨 Poster Generator</h1>
          <p className="brochure-page-sub">Create stunning marketing posters — download as PNG instantly</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }}>
          <Link to="/brochure" className="btn-ghost">📄 Brochure</Link>
          <Link to="/" className="btn-ghost">← Home</Link>
        </div>
      </div>

      <div className="poster-layout">
        {/* Controls */}
        <div className="poster-controls">
          {/* Template Selection */}
          <div className="control-section glass-card">
            <div className="control-title">🎨 Template</div>
            <div className="template-grid">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  className={`template-btn ${template.id === t.id ? 'active' : ''}`}
                  onClick={() => setTemplate(t)}
                  style={{ background: t.bg, borderColor: template.id === t.id ? t.accent : 'transparent' }}
                >
                  <span style={{ color: t.accent, fontWeight: 700, fontSize: '0.75rem' }}>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="control-section glass-card">
            <div className="control-title">📐 Size</div>
            <div className="size-grid">
              {POSTER_SIZES.map(s => (
                <button
                  key={s.label}
                  className={`size-btn ${size.label === s.label ? 'active' : ''}`}
                  onClick={() => setSize(s)}
                >
                  <div className="size-label">{s.label}</div>
                  <div className="size-ratio">{s.ratio}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="control-section glass-card">
            <div className="control-title">✏️ Content</div>
            <div className="poster-form">
              {[
                { label: 'Headline', key: 'headline', placeholder: 'Get Your Degree.' },
                { label: 'Sub-headline', key: 'subheadline', placeholder: 'We Handle the Rest.' },
                { label: 'Programs Line', key: 'program', placeholder: 'MBA · BTech · PhD...' },
                { label: 'Badge Text', key: 'badge', placeholder: 'UAE Equivalency Handled' },
                { label: 'Phone / Contact', key: 'contact', placeholder: '+971 52 968 2123' },
                { label: 'Footer Text', key: 'footer', placeholder: 'email | @handle' },
              ].map(f => (
                <div className="form-group" key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <input
                    className="form-input"
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => set(f.key, e.target.value)}
                  />
                </div>
              ))}

              <div className="toggle-row">
                {[
                  { label: 'Show Logo', key: 'showLogo' },
                  { label: 'Show Badge', key: 'showBadge' },
                  { label: 'Show Contact', key: 'showContact' },
                ].map(t => (
                  <label className="toggle-label" key={t.key}>
                    <input type="checkbox" checked={form[t.key]} onChange={e => set(t.key, e.target.checked)} />
                    {t.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            className="btn-gold"
            style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '0.95rem' }}
            onClick={downloadPoster}
            disabled={downloading}
          >
            {downloading ? '⌛ Processing...' : '📥 Download PNG Poster'}
          </button>
        </div>

        {/* Canvas Preview */}
        <div className="poster-canvas-wrap">
          <div className="poster-preview-label">Live Preview</div>
          <div className="poster-canvas-container">
            <canvas ref={canvasRef} className="poster-canvas" />
          </div>
          <div className="poster-size-note">
            {size.label} — {size.w}×{size.h}px · High-quality PNG
          </div>
        </div>
      </div>
    </div>
  );
}
