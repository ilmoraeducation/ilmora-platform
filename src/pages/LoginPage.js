// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const { login, resetPassword } = useAuth();
  const location = useLocation();
  const isAdminLogin = location.search.includes('role=admin');

  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (err) {
      const msg =
        err.code === 'auth/invalid-credential' ? 'Invalid email or password' :
        err.code === 'auth/user-not-found' ? 'No account found with this email' :
        err.code === 'auth/wrong-password' ? 'Incorrect password' :
        err.code === 'auth/invalid-email' ? 'Invalid email address' :
        'Login failed. Please try again.';
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
      toast.success('Password reset email sent! Check your inbox.');
      setShowReset(false);
    } catch {
      toast.error('Failed to send reset email. Check the email address.');
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

        {/* Login type toggle */}
        <div className="login-type-toggle">
          <Link
            to="/login"
            className={`login-type-btn ${!isAdminLogin ? 'active' : ''}`}
          >
            🎓 Student Login
          </Link>
          <Link
            to="/login?role=admin"
            className={`login-type-btn ${isAdminLogin ? 'active' : ''}`}
          >
            🔐 Admin Login
          </Link>
        </div>

        {!showReset ? (
          <>
            <h1 className="auth-title">
              {isAdminLogin ? 'Admin Access' : 'Welcome Back'}
            </h1>
            <p className="auth-sub">
              {isAdminLogin
                ? 'Sign in to your ILMORA Admin Dashboard'
                : 'Sign in to your student portal'}
            </p>

            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="button"
                className="forgot-link"
                onClick={() => setShowReset(true)}
              >
                Forgot password?
              </button>
              <button
                className="btn-gold"
                type="submit"
                style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
                disabled={loading}
              >
                {loading ? '⌛ Signing In...' : isAdminLogin ? '🔐 Access Dashboard →' : '🎓 Sign In →'}
              </button>
            </form>

            {!isAdminLogin && (
              <p className="auth-switch">
                Don't have an account? <Link to="/register">Register here</Link>
              </p>
            )}
            {isAdminLogin && (
              <p className="auth-switch" style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                Admin access is restricted to authorized ILMORA staff only.
              </p>
            )}
            <p className="auth-switch"><Link to="/">← Back to website</Link></p>
          </>
        ) : (
          <>
            <h1 className="auth-title">Reset Password</h1>
            <p className="auth-sub">Enter your email to receive a reset link</p>
            <form onSubmit={handleReset} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                className="btn-gold"
                type="submit"
                style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
              >
                Send Reset Email
              </button>
            </form>
            <p className="auth-switch">
              <button className="forgot-link" onClick={() => setShowReset(false)}>← Back to Login</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
