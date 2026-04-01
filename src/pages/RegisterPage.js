// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', interest: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  async function handleRegister(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) return toast.error('Please fill all required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await register(form.email, form.password, form.name, form.phone);
      toast.success('Account created! Welcome to ILMORA');
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use' ? 'This email is already registered.'
        : err.code === 'auth/weak-password' ? 'Password is too weak'
        : 'Registration failed. Please try again.';
      toast.error(msg);
    } finally { setLoading(false); }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb orb-1"></div>
        <div className="auth-bg-orb orb-2"></div>
      </div>
      <div className="auth-card auth-card-wide">
        <Link to="/" className="auth-logo"><img src="/images/logo/ilmora-white.png" alt="ILMORA Education" /></Link>
        <h1 className="auth-title">Create Your Account</h1>
        <p className="auth-sub">Join thousands of professionals advancing their careers with ILMORA</p>
        <form onSubmit={handleRegister} className="auth-form">
          <div className="auth-form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input className="form-input" type="tel" placeholder="+971 or +91 number" value={form.phone} onChange={e => set('phone', e.target.value)} required />
            </div>
            <div className="form-group" style={{gridColumn:'1/-1'}}>
              <label className="form-label">Email Address *</label>
              <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="form-input" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input className="form-input" type="password" placeholder="Repeat your password" value={form.confirm} onChange={e => set('confirm', e.target.value)} required />
            </div>
            <div className="form-group" style={{gridColumn:'1/-1'}}>
              <label className="form-label">I'm Interested In</label>
              <select className="form-input" value={form.interest} onChange={e => set('interest', e.target.value)}>
                <option value="">Select a program (optional)</option>
                <option>UG Program (Bachelor Degree)</option>
                <option>PG Program (Master Degree)</option>
                <option>PhD Program</option>
                <option>BTech / MTech</option>
                <option>Short Certification Course</option>
                <option>UAE Equivalency Support</option>
                <option>Certificate Attestation</option>
              </select>
            </div>
          </div>
          <div className="auth-terms">By registering, you agree to ILMORA's <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</div>
          <button className="btn-gold" type="submit" style={{width:'100%',justifyContent:'center',padding:'1rem'}} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in here</Link></p>
        <p className="auth-switch"><Link to="/">Back to website</Link></p>
      </div>
    </div>
  );
}
