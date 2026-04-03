// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const { login, resetPassword } = useAuth();

  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      // Navigation happens via App.js protected route
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential' ? 'Invalid email or password'
        : err.code === 'auth/user-not-found' ? 'No account found with this email'
        : err.code === 'auth/wrong-password' ? 'Incorrect password'
        : 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (!email) return toast.error('Enter your email first');
    try {
      await resetPassword(email);
      toast.success('Password reset email sent!');
      setShowReset(false);
    } catch {
      toast.error('Failed to send reset email');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb orb-1"></div>
        <div className="auth-bg-orb orb-2"></div>
      </div>
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <img src="/images/logo/ilmora-white.png" alt="ILMORA Education" />
        </Link>
        {!showReset ? (
          <>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-sub">Sign in to your ILMORA account</p>
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button type="button" className="forgot-link" onClick={() => setShowReset(true)}>Forgot password?</button>
              <button className="btn-gold" type="submit" style={{width:'100%', justifyContent:'center', padding:'1rem'}} disabled={loading}>
                {loading ? '⌛ Signing In...' : 'Sign In →'}
              </button>
            </form>
            <p className="auth-switch">Don't have an account? <Link to="/register">Register here</Link></p>
            <p className="auth-switch"><Link to="/">← Back to website</Link></p>
          </>
        ) : (
          <>
            <h1 className="auth-title">Reset Password</h1>
            <p className="auth-sub">Enter your email to receive a reset link</p>
            <form onSubmit={handleReset} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button className="btn-gold" type="submit" style={{width:'100%', justifyContent:'center', padding:'1rem'}}>Send Reset Email</button>
            </form>
            <p className="auth-switch"><button className="forgot-link" onClick={() => setShowReset(false)}>← Back to Login</button></p>
          </>
        )}
      </div>
    </div>
  );
}
