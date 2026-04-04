// src/pages/StudentDashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../utils/firebase';
import toast from 'react-hot-toast';
import './StudentDashboard.css';

const NAV_ITEMS = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
  { id: 'courses', icon: '🎓', label: 'My Courses' },
  { id: 'application', icon: '📋', label: 'Application' },
  { id: 'documents', icon: '📂', label: 'Documents' },
  { id: 'certificates', icon: '🏆', label: 'Certificates' },
  { id: 'profile', icon: '👤', label: 'Profile' },
];

const STATUS_STEPS = ['Inquiry', 'Documents Submitted', 'Under Review', 'Enrolled', 'In Progress', 'Completed'];

export default function StudentDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileEdit, setProfileEdit] = useState({});

  useEffect(() => {
    if (!currentUser?.uid) return;
    loadProfile();
  }, [currentUser]);

  async function loadProfile() {
    try {
      const snap = await getDoc(doc(db, 'users', currentUser.uid));
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setProfile(data);
        setProfileEdit({ name: data.name || '', phone: data.phone || '', interest: data.interest || '', address: data.address || '' });
      }
    } catch (e) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
    toast.success('Logged out successfully');
  }

  async function handleProfileSave() {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { ...profileEdit, updatedAt: serverTimestamp() });
      setProfile(p => ({ ...p, ...profileEdit }));
      setEditingProfile(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Update failed');
    }
  }

  async function handleDocUpload(e, docType) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('File too large (max 5MB)');
    setUploadingDoc(true);
    try {
      const storageRef = ref(storage, `documents/${currentUser.uid}/${docType}_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      const newDoc = { type: docType, name: file.name, url, uploadedAt: new Date().toISOString() };
      const updatedDocs = [...(profile.documents || []), newDoc];
      await updateDoc(doc(db, 'users', currentUser.uid), { documents: updatedDocs, updatedAt: serverTimestamp() });
      setProfile(p => ({ ...p, documents: updatedDocs }));
      toast.success(`${docType} uploaded successfully!`);
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploadingDoc(false);
    }
  }

  const appStatusIndex = STATUS_STEPS.findIndex(s =>
    s.toLowerCase().includes((profile?.applicationStatus || 'inquiry').toLowerCase())
  );
  const currentStatusIndex = appStatusIndex >= 0 ? appStatusIndex : 0;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Loading your portal...</div>
    </div>
  );

  return (
    <div className="student-dashboard">
      {/* Sidebar */}
      <aside className={`s-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="s-sidebar-logo">
          <Link to="/"><img src="/images/logo/ilmora-white.png" alt="ILMORA" /></Link>
        </div>
        <nav className="s-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`s-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            >
              <span className="s-nav-icon">{item.icon}</span>
              <span className="s-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="s-sidebar-footer">
          <Link to="/brochure" className="s-nav-item" style={{textDecoration:'none'}}>
            <span className="s-nav-icon">📄</span>
            <span className="s-nav-label">Get Brochure</span>
          </Link>
          <button className="s-nav-item logout-btn" onClick={handleLogout}>
            <span className="s-nav-icon">🚪</span>
            <span className="s-nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Main */}
      <main className="s-main">
        {/* Topbar */}
        <div className="s-topbar">
          <button className="s-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="s-topbar-title">{NAV_ITEMS.find(n => n.id === activeTab)?.label}</div>
          <div className="s-topbar-user">
            <div className="s-user-avatar">{(profile?.name || currentUser?.email || 'S')[0].toUpperCase()}</div>
            <span className="s-user-name hide-mobile">{profile?.name?.split(' ')[0] || 'Student'}</span>
          </div>
        </div>

        <div className="s-content">
          {/* ── DASHBOARD TAB ── */}
          {activeTab === 'dashboard' && (
            <div className="tab-content">
              <div className="welcome-banner">
                <div>
                  <h1 className="welcome-title">Welcome back, <span className="gold">{profile?.name?.split(' ')[0] || 'Student'}</span> 👋</h1>
                  <p className="welcome-sub">Track your academic journey and manage everything from here.</p>
                </div>
                <div className="gold-badge">{profile?.applicationStatus || 'Pending'}</div>
              </div>

              {/* Stats Cards */}
              <div className="student-stats-grid">
                {[
                  { icon: '📚', label: 'Enrolled Courses', value: (profile?.enrolledCourses || []).length || '0' },
                  { icon: '📂', label: 'Documents', value: (profile?.documents || []).length || '0' },
                  { icon: '🏆', label: 'Certificates', value: (profile?.certificates || []).length || '0' },
                  { icon: '📊', label: 'Progress', value: profile?.progress || '0%' },
                ].map(stat => (
                  <div className="student-stat-card" key={stat.label}>
                    <div className="student-stat-icon">{stat.icon}</div>
                    <div className="student-stat-value">{stat.value}</div>
                    <div className="student-stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Application Status */}
              <div className="glass-card" style={{marginTop:'2rem'}}>
                <h3 className="card-section-title">Application Status</h3>
                <div className="status-timeline">
                  {STATUS_STEPS.map((step, i) => (
                    <div key={step} className={`timeline-step ${i <= currentStatusIndex ? 'done' : ''} ${i === currentStatusIndex ? 'current' : ''}`}>
                      <div className="timeline-dot"></div>
                      <div className="timeline-label">{step}</div>
                      {i < STATUS_STEPS.length - 1 && <div className="timeline-line"></div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-grid" style={{marginTop:'2rem'}}>
                <button className="quick-action-card" onClick={() => setActiveTab('documents')}>
                  <span>📤</span> Upload Document
                </button>
                <button className="quick-action-card" onClick={() => setActiveTab('courses')}>
                  <span>📚</span> View Courses
                </button>
                <Link to="/brochure" className="quick-action-card">
                  <span>📄</span> Download Brochure
                </Link>
                <a href="https://wa.me/971529682123" target="_blank" rel="noopener noreferrer" className="quick-action-card whatsapp-action">
                  <span>💬</span> WhatsApp Advisor
                </a>
              </div>
            </div>
          )}

          {/* ── COURSES TAB ── */}
          {activeTab === 'courses' && (
            <div className="tab-content">
              <h2 className="tab-title">My Courses</h2>
              {(profile?.enrolledCourses || []).length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📚</div>
                  <h3>No Courses Enrolled Yet</h3>
                  <p>Contact your ILMORA advisor to enroll in a program.</p>
                  <a href="https://wa.me/971529682123" target="_blank" rel="noopener noreferrer" className="btn-gold" style={{marginTop:'1rem', display:'inline-flex'}}>
                    💬 Contact Advisor
                  </a>
                </div>
              ) : (
                <div className="courses-grid">
                  {(profile?.enrolledCourses || []).map((course, i) => (
                    <div className="course-card glass-card" key={i}>
                      <div className="course-icon">🎓</div>
                      <div className="course-title">{course.name || course}</div>
                      <div className="course-uni">{course.university || 'ILMORA Partner University'}</div>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar-label">
                          <span>Progress</span>
                          <span>{course.progress || 0}%</span>
                        </div>
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{width: `${course.progress || 0}%`}}></div>
                        </div>
                      </div>
                      <div className={`status-badge ${course.status === 'completed' ? 'status-completed' : 'status-active'}`}>
                        {course.status || 'Active'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── APPLICATION TAB ── */}
          {activeTab === 'application' && (
            <div className="tab-content">
              <h2 className="tab-title">My Application</h2>
              <div className="glass-card application-detail">
                <div className="app-row"><span className="app-label">Name</span><span className="app-val">{profile?.name || '—'}</span></div>
                <div className="app-row"><span className="app-label">Email</span><span className="app-val">{profile?.email || '—'}</span></div>
                <div className="app-row"><span className="app-label">Phone</span><span className="app-val">{profile?.phone || '—'}</span></div>
                <div className="app-row"><span className="app-label">Program Interest</span><span className="app-val">{profile?.interest || 'Not specified'}</span></div>
                <div className="app-row"><span className="app-label">Application Status</span>
                  <span className={`status-badge ${
                    profile?.applicationStatus === 'active' ? 'status-active' :
                    profile?.applicationStatus === 'completed' ? 'status-completed' :
                    profile?.applicationStatus === 'rejected' ? 'status-rejected' : 'status-pending'
                  }`}>{profile?.applicationStatus || 'Pending'}</span>
                </div>
                <div className="app-row"><span className="app-label">Applied On</span>
                  <span className="app-val">{profile?.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString() : '—'}</span>
                </div>
              </div>
              <div className="glass-card" style={{marginTop:'1.5rem'}}>
                <h3 className="card-section-title">Application Timeline</h3>
                <div className="status-timeline">
                  {STATUS_STEPS.map((step, i) => (
                    <div key={step} className={`timeline-step ${i <= currentStatusIndex ? 'done' : ''} ${i === currentStatusIndex ? 'current' : ''}`}>
                      <div className="timeline-dot"></div>
                      <div className="timeline-label">{step}</div>
                      {i < STATUS_STEPS.length - 1 && <div className="timeline-line"></div>}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{marginTop:'2rem'}}>
                <p style={{color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:'1rem'}}>Need help? Contact your advisor directly.</p>
                <a href="https://wa.me/971529682123?text=Hi%20ILMORA%2C%20I%20want%20to%20check%20my%20application%20status" target="_blank" rel="noopener noreferrer" className="whatsapp-btn" style={{display:'inline-flex', gap:'0.5rem', alignItems:'center', padding:'0.85rem 1.5rem', background:'linear-gradient(135deg,#1a7a4a,#25d366)', color:'#fff', borderRadius:'10px', textDecoration:'none', fontWeight:'700', fontSize:'0.88rem'}}>
                  💬 WhatsApp Advisor
                </a>
              </div>
            </div>
          )}

          {/* ── DOCUMENTS TAB ── */}
          {activeTab === 'documents' && (
            <div className="tab-content">
              <h2 className="tab-title">My Documents</h2>
              <div className="doc-upload-grid">
                {['10th Certificate', '12th Certificate', 'Graduation Certificate', 'Passport Copy', 'Emirates ID', 'Passport Photo', 'Experience Letter', 'Other Document'].map(docType => (
                  <div className="doc-upload-card glass-card" key={docType}>
                    <div className="doc-type-icon">
                      {docType.includes('Certificate') ? '📜' : docType.includes('Passport') ? '🛂' : docType.includes('ID') ? '🪪' : docType.includes('Photo') ? '📷' : '📄'}
                    </div>
                    <div className="doc-type-name">{docType}</div>
                    {(profile?.documents || []).some(d => d.type === docType) ? (
                      <div className="doc-uploaded">
                        <span className="status-badge status-active">✓ Uploaded</span>
                        <a href={(profile.documents.find(d => d.type === docType))?.url} target="_blank" rel="noopener noreferrer" className="doc-view-link">View →</a>
                      </div>
                    ) : (
                      <label className="doc-upload-btn">
                        {uploadingDoc ? '⌛ Uploading...' : '📤 Upload'}
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleDocUpload(e, docType)} disabled={uploadingDoc} style={{display:'none'}} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
              <p style={{color:'var(--text-dim)', fontSize:'0.78rem', marginTop:'1.5rem'}}>Accepted formats: PDF, JPG, PNG. Max file size: 5MB.</p>
            </div>
          )}

          {/* ── CERTIFICATES TAB ── */}
          {activeTab === 'certificates' && (
            <div className="tab-content">
              <h2 className="tab-title">My Certificates</h2>
              {(profile?.certificates || []).length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🏆</div>
                  <h3>No Certificates Yet</h3>
                  <p>Complete your program to earn certificates. Your ILMORA advisor will upload them here once ready.</p>
                  <Link to="/brochure" className="btn-gold" style={{marginTop:'1rem', display:'inline-flex'}}>📄 Download Brochure</Link>
                </div>
              ) : (
                <div className="certificates-grid">
                  {(profile.certificates || []).map((cert, i) => (
                    <div className="cert-card glass-card" key={i}>
                      <div className="cert-badge">🏆</div>
                      <div className="cert-name">{cert.name}</div>
                      <div className="cert-date">{cert.issuedDate}</div>
                      <a href={cert.url} download className="btn-gold" style={{fontSize:'0.8rem', padding:'0.6rem 1.2rem', display:'inline-flex', marginTop:'1rem'}}>
                        ⬇ Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <div className="tab-content">
              <h2 className="tab-title">My Profile</h2>
              <div className="profile-layout">
                <div className="profile-avatar-card glass-card">
                  <div className="profile-avatar-big">{(profile?.name || 'S')[0].toUpperCase()}</div>
                  <div className="profile-name-big">{profile?.name}</div>
                  <div className="profile-email-big">{profile?.email}</div>
                  <div className="gold-badge" style={{marginTop:'0.75rem'}}>Student</div>
                  <div style={{marginTop:'1.5rem', fontSize:'0.78rem', color:'var(--text-dim)'}}>
                    Member since {profile?.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString() : '—'}
                  </div>
                </div>
                <div className="profile-form-card glass-card">
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
                    <h3 className="card-section-title" style={{margin:0}}>Personal Information</h3>
                    {!editingProfile ? (
                      <button className="btn-ghost" onClick={() => setEditingProfile(true)}>✏️ Edit</button>
                    ) : (
                      <div style={{display:'flex', gap:'0.5rem'}}>
                        <button className="btn-gold" style={{padding:'0.5rem 1rem', fontSize:'0.8rem'}} onClick={handleProfileSave}>Save</button>
                        <button className="btn-ghost" onClick={() => setEditingProfile(false)}>Cancel</button>
                      </div>
                    )}
                  </div>
                  <div className="profile-fields">
                    {[
                      {label:'Full Name', key:'name', type:'text'},
                      {label:'Phone Number', key:'phone', type:'tel'},
                      {label:'Program Interest', key:'interest', type:'text'},
                      {label:'Address', key:'address', type:'text'},
                    ].map(field => (
                      <div className="form-group" key={field.key}>
                        <label className="form-label">{field.label}</label>
                        {editingProfile ? (
                          <input
                            className="form-input"
                            type={field.type}
                            value={profileEdit[field.key] || ''}
                            onChange={e => setProfileEdit(p => ({...p, [field.key]: e.target.value}))}
                          />
                        ) : (
                          <div className="profile-field-value">{profile?.[field.key] || '—'}</div>
                        )}
                      </div>
                    ))}
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <div className="profile-field-value">{profile?.email} <span style={{color:'var(--gold)', fontSize:'0.72rem'}}>(cannot change)</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
