// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  collection, getDocs, doc, updateDoc, deleteDoc,
  addDoc, serverTimestamp, query, orderBy
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebase';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const NAV_ITEMS = [
  { id: 'overview', icon: '📊', label: 'Overview' },
  { id: 'students', icon: '👥', label: 'Students' },
  { id: 'leads', icon: '📥', label: 'Leads' },
  { id: 'courses', icon: '🎓', label: 'Courses' },
  { id: 'documents', icon: '📂', label: 'Documents' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

const STATUS_OPTIONS = ['pending', 'under review', 'enrolled', 'in progress', 'completed', 'rejected'];
const COURSE_OPTIONS = [
  'UG Program (Bachelor Degree)', 'PG Program (Master Degree)',
  'BTech / MTech (Technical Degree)', 'PhD Program',
  'Short Certification Course', 'UAE Equivalency Support', 'Certificate Attestation'
];

export default function AdminDashboard() {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [leads, setLeads] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, pending: 0 });
  const [newLead, setNewLead] = useState({ name: '', phone: '', email: '', interest: '', notes: '', status: 'new' });
  const [newCourse, setNewCourse] = useState({ name: '', university: '', duration: '', type: '', description: '' });

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      await Promise.all([loadStudents(), loadLeads(), loadCourses()]);
    } finally {
      setLoading(false);
    }
  }

  async function loadStudents() {
    const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === 'student' || !u.role);
    setStudents(data);
    setStats({
      total: data.length,
      active: data.filter(s => s.applicationStatus === 'active' || s.applicationStatus === 'in progress' || s.applicationStatus === 'enrolled').length,
      completed: data.filter(s => s.applicationStatus === 'completed').length,
      pending: data.filter(s => !s.applicationStatus || s.applicationStatus === 'pending').length,
    });
  }

  async function loadLeads() {
    try {
      const snap = await getDocs(query(collection(db, 'leads'), orderBy('createdAt', 'desc')));
      setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch { setLeads([]); }
  }

  async function loadCourses() {
    try {
      const snap = await getDocs(collection(db, 'courses'));
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch { setCourses([]); }
  }

  async function updateStudentStatus(uid, status) {
    await updateDoc(doc(db, 'users', uid), { applicationStatus: status, updatedAt: serverTimestamp() });
    setStudents(s => s.map(st => st.id === uid ? { ...st, applicationStatus: status } : st));
    if (selectedStudent?.id === uid) setSelectedStudent(s => ({ ...s, applicationStatus: status }));
    toast.success('Status updated!');
  }

  async function handleDeleteStudent(uid) {
    if (!window.confirm('Delete this student record? This cannot be undone.')) return;
    await deleteDoc(doc(db, 'users', uid));
    setStudents(s => s.filter(st => st.id !== uid));
    setShowStudentModal(false);
    toast.success('Student deleted');
  }

  async function handleAddLead(e) {
    e.preventDefault();
    if (!newLead.name || !newLead.phone) return toast.error('Name and phone are required');
    await addDoc(collection(db, 'leads'), { ...newLead, createdAt: serverTimestamp() });
    toast.success('Lead added!');
    setShowAddLead(false);
    setNewLead({ name: '', phone: '', email: '', interest: '', notes: '', status: 'new' });
    loadLeads();
  }

  async function updateLeadStatus(id, status) {
    await updateDoc(doc(db, 'leads', id), { status, updatedAt: serverTimestamp() });
    setLeads(l => l.map(lead => lead.id === id ? { ...lead, status } : lead));
    toast.success('Lead status updated');
  }

  async function deleteLead(id) {
    if (!window.confirm('Delete this lead?')) return;
    await deleteDoc(doc(db, 'leads', id));
    setLeads(l => l.filter(lead => lead.id !== id));
    toast.success('Lead deleted');
  }

  async function handleAddCourse(e) {
    e.preventDefault();
    if (!newCourse.name) return toast.error('Course name required');
    await addDoc(collection(db, 'courses'), { ...newCourse, createdAt: serverTimestamp() });
    toast.success('Course added!');
    setShowAddCourse(false);
    setNewCourse({ name: '', university: '', duration: '', type: '', description: '' });
    loadCourses();
  }

  async function deleteCourse(id) {
    if (!window.confirm('Delete this course?')) return;
    await deleteDoc(doc(db, 'courses', id));
    setCourses(c => c.filter(course => course.id !== id));
    toast.success('Course deleted');
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const filteredStudents = students.filter(s =>
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLeads = leads.filter(l =>
    (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ color:'var(--gold)', fontFamily:'var(--font-display)', fontSize:'1.5rem' }}>Loading Admin Panel...</div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className={`a-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="a-sidebar-logo">
          <Link to="/"><img src="/images/logo/ilmora-white.png" alt="ILMORA" /></Link>
          <div className="admin-badge">ADMIN</div>
        </div>
        <nav className="a-nav">
          {NAV_ITEMS.map(item => (
            <button key={item.id} className={`a-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); setSearchTerm(''); }}>
              <span className="a-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="a-sidebar-footer">
          <Link to="/poster" className="a-nav-item" style={{textDecoration:'none'}}>
            <span className="a-nav-icon">🎨</span><span>Poster Generator</span>
          </Link>
          <Link to="/brochure" className="a-nav-item" style={{textDecoration:'none'}}>
            <span className="a-nav-icon">📄</span><span>Brochure Generator</span>
          </Link>
          <button className="a-nav-item logout-btn" onClick={handleLogout}>
            <span className="a-nav-icon">🚪</span><span>Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <main className="a-main">
        {/* Topbar */}
        <div className="a-topbar">
          <button className="a-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="a-topbar-title">{NAV_ITEMS.find(n => n.id === activeTab)?.label}</div>
          <div className="a-topbar-right">
            <div className="a-user-info">
              <div className="a-user-avatar">{(currentUser?.email || 'A')[0].toUpperCase()}</div>
              <span className="hide-mobile" style={{fontSize:'0.82rem', color:'var(--text-muted)'}}>Admin</span>
            </div>
          </div>
        </div>

        <div className="a-content">
          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              <div className="admin-stats-grid">
                {[
                  { icon:'👥', label:'Total Students', value: stats.total, color:'var(--gold)' },
                  { icon:'✅', label:'Active Students', value: stats.active, color:'#4CAF50' },
                  { icon:'🏆', label:'Completed', value: stats.completed, color:'#2196F3' },
                  { icon:'⏳', label:'Pending', value: stats.pending, color:'#FF9800' },
                  { icon:'📥', label:'Total Leads', value: leads.length, color:'#9C27B0' },
                  { icon:'🎓', label:'Courses', value: courses.length, color:'var(--gold)' },
                ].map(stat => (
                  <div className="admin-stat-card" key={stat.label}>
                    <div className="admin-stat-icon">{stat.icon}</div>
                    <div className="admin-stat-value" style={{color: stat.color}}>{stat.value}</div>
                    <div className="admin-stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Recent Students */}
              <div className="glass-card" style={{marginTop:'2rem'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem'}}>
                  <h3 className="card-section-title">Recent Students</h3>
                  <button className="btn-ghost" onClick={() => setActiveTab('students')}>View All →</button>
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Joined</th></tr>
                    </thead>
                    <tbody>
                      {students.slice(0, 5).map(s => (
                        <tr key={s.id} style={{cursor:'pointer'}} onClick={() => { setSelectedStudent(s); setShowStudentModal(true); }}>
                          <td style={{color:'var(--text)', fontWeight:600}}>{s.name || '—'}</td>
                          <td>{s.email}</td>
                          <td>{s.phone || '—'}</td>
                          <td><span className={`status-badge status-${s.applicationStatus || 'pending'}`}>{s.applicationStatus || 'Pending'}</span></td>
                          <td>{s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                      {students.length === 0 && (
                        <tr><td colSpan={5} style={{textAlign:'center', padding:'2rem', color:'var(--text-dim)'}}>No students yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Leads */}
              <div className="glass-card" style={{marginTop:'1.5rem'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem'}}>
                  <h3 className="card-section-title">Recent Leads</h3>
                  <button className="btn-ghost" onClick={() => setActiveTab('leads')}>View All →</button>
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr><th>Name</th><th>Phone</th><th>Interest</th><th>Status</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {leads.slice(0, 5).map(l => (
                        <tr key={l.id}>
                          <td style={{color:'var(--text)', fontWeight:600}}>{l.name}</td>
                          <td>{l.phone}</td>
                          <td>{l.interest || '—'}</td>
                          <td><span className={`status-badge ${l.status === 'converted' ? 'status-completed' : l.status === 'contacted' ? 'status-active' : 'status-pending'}`}>{l.status || 'new'}</span></td>
                          <td>{l.createdAt?.toDate ? l.createdAt.toDate().toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                      {leads.length === 0 && (
                        <tr><td colSpan={5} style={{textAlign:'center', padding:'2rem', color:'var(--text-dim)'}}>No leads yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── STUDENTS TAB ── */}
          {activeTab === 'students' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2 className="tab-title">Students</h2>
                <input className="form-input search-input" placeholder="🔍 Search students..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="glass-card" style={{padding:0, overflow:'hidden'}}>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr><th>Name</th><th>Email</th><th>Phone</th><th>Interest</th><th>Status</th><th>Docs</th><th>Joined</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map(s => (
                        <tr key={s.id}>
                          <td style={{color:'var(--text)', fontWeight:600}}>{s.name || '—'}</td>
                          <td style={{maxWidth:'160px', overflow:'hidden', textOverflow:'ellipsis'}}>{s.email}</td>
                          <td>{s.phone || '—'}</td>
                          <td style={{maxWidth:'120px', overflow:'hidden', textOverflow:'ellipsis', fontSize:'0.78rem'}}>{s.interest || '—'}</td>
                          <td>
                            <select
                              className="status-select"
                              value={s.applicationStatus || 'pending'}
                              onChange={e => updateStudentStatus(s.id, e.target.value)}
                            >
                              {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </td>
                          <td style={{textAlign:'center'}}>{(s.documents || []).length}</td>
                          <td>{s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString() : '—'}</td>
                          <td>
                            <div style={{display:'flex', gap:'0.5rem'}}>
                              <button className="action-btn view-btn" onClick={() => { setSelectedStudent(s); setShowStudentModal(true); }}>👁️</button>
                              <button className="action-btn delete-btn" onClick={() => handleDeleteStudent(s.id)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredStudents.length === 0 && (
                        <tr><td colSpan={8} style={{textAlign:'center', padding:'2.5rem', color:'var(--text-dim)'}}>No students found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── LEADS TAB ── */}
          {activeTab === 'leads' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2 className="tab-title">Leads</h2>
                <div style={{display:'flex', gap:'0.75rem'}}>
                  <input className="form-input search-input" placeholder="🔍 Search leads..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  <button className="btn-gold" onClick={() => setShowAddLead(true)}>+ Add Lead</button>
                </div>
              </div>
              <div className="glass-card" style={{padding:0, overflow:'hidden'}}>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr><th>Name</th><th>Phone</th><th>Email</th><th>Interest</th><th>Notes</th><th>Status</th><th>Date</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map(l => (
                        <tr key={l.id}>
                          <td style={{color:'var(--text)', fontWeight:600}}>{l.name}</td>
                          <td><a href={`tel:${l.phone}`} style={{color:'var(--gold)'}}>{l.phone}</a></td>
                          <td style={{fontSize:'0.78rem'}}>{l.email || '—'}</td>
                          <td style={{fontSize:'0.78rem', maxWidth:'120px'}}>{l.interest || '—'}</td>
                          <td style={{fontSize:'0.78rem', maxWidth:'140px', color:'var(--text-dim)'}}>{l.notes || '—'}</td>
                          <td>
                            <select className="status-select" value={l.status || 'new'} onChange={e => updateLeadStatus(l.id, e.target.value)}>
                              {['new','contacted','interested','converted','not interested'].map(o => <option key={o}>{o}</option>)}
                            </select>
                          </td>
                          <td>{l.createdAt?.toDate ? l.createdAt.toDate().toLocaleDateString() : '—'}</td>
                          <td>
                            <div style={{display:'flex', gap:'0.5rem'}}>
                              <a href={`https://wa.me/${(l.phone || '').replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="action-btn view-btn" title="WhatsApp">💬</a>
                              <button className="action-btn delete-btn" onClick={() => deleteLead(l.id)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredLeads.length === 0 && (
                        <tr><td colSpan={8} style={{textAlign:'center', padding:'2.5rem', color:'var(--text-dim)'}}>No leads found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── COURSES TAB ── */}
          {activeTab === 'courses' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2 className="tab-title">Courses</h2>
                <button className="btn-gold" onClick={() => setShowAddCourse(true)}>+ Add Course</button>
              </div>
              <div className="courses-admin-grid">
                {courses.map(c => (
                  <div className="course-admin-card glass-card" key={c.id}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                      <div className="course-icon" style={{fontSize:'1.8rem'}}>🎓</div>
                      <button className="action-btn delete-btn" onClick={() => deleteCourse(c.id)}>🗑️</button>
                    </div>
                    <div className="course-title" style={{marginTop:'0.75rem'}}>{c.name}</div>
                    <div style={{fontSize:'0.78rem', color:'var(--text-muted)', marginTop:'0.3rem'}}>{c.university || 'ILMORA Partner University'}</div>
                    <div style={{display:'flex', gap:'0.5rem', marginTop:'0.75rem', flexWrap:'wrap'}}>
                      {c.type && <span className="gold-badge" style={{fontSize:'0.68rem'}}>{c.type}</span>}
                      {c.duration && <span className="gold-badge" style={{fontSize:'0.68rem'}}>⏱ {c.duration}</span>}
                    </div>
                    {c.description && <div style={{fontSize:'0.78rem', color:'var(--text-muted)', marginTop:'0.75rem', lineHeight:'1.5'}}>{c.description}</div>}
                  </div>
                ))}
                {courses.length === 0 && (
                  <div style={{gridColumn:'1/-1', textAlign:'center', padding:'3rem', color:'var(--text-dim)'}}>
                    No courses added yet. Click "+ Add Course" to get started.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── DOCUMENTS TAB ── */}
          {activeTab === 'documents' && (
            <div className="tab-content">
              <h2 className="tab-title">Student Documents</h2>
              <div className="glass-card" style={{padding:0, overflow:'hidden'}}>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr><th>Student</th><th>Email</th><th>Documents Uploaded</th><th>Document Types</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {students.filter(s => (s.documents || []).length > 0).map(s => (
                        <tr key={s.id}>
                          <td style={{color:'var(--text)', fontWeight:600}}>{s.name || '—'}</td>
                          <td>{s.email}</td>
                          <td style={{textAlign:'center'}}>
                            <span className="status-badge status-active">{s.documents.length} files</span>
                          </td>
                          <td style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>
                            {s.documents.slice(0, 3).map(d => d.type).join(', ')}{s.documents.length > 3 ? '...' : ''}
                          </td>
                          <td>
                            <button className="action-btn view-btn" onClick={() => { setSelectedStudent(s); setShowStudentModal(true); }}>👁️ View</button>
                          </td>
                        </tr>
                      ))}
                      {students.filter(s => (s.documents || []).length > 0).length === 0 && (
                        <tr><td colSpan={5} style={{textAlign:'center', padding:'2.5rem', color:'var(--text-dim)'}}>No documents uploaded yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── SETTINGS TAB ── */}
          {activeTab === 'settings' && (
            <div className="tab-content">
              <h2 className="tab-title">Settings</h2>
              <div className="settings-grid">
                <div className="glass-card">
                  <h3 className="card-section-title">Contact Information</h3>
                  <div style={{display:'flex', flexDirection:'column', gap:'1rem', marginTop:'1rem'}}>
                    {[
                      {label:'UAE Phone', value:'+971 52 968 2123'},
                      {label:'India Phone', value:'+91 74830 08412'},
                      {label:'Email', value:'Ilmoraeducationgroup@gmail.com'},
                      {label:'Instagram', value:'@ilmora_education'},
                    ].map(item => (
                      <div key={item.label}>
                        <div className="form-label">{item.label}</div>
                        <div style={{color:'var(--text)', fontSize:'0.9rem', marginTop:'0.35rem'}}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-card">
                  <h3 className="card-section-title">Quick Tools</h3>
                  <div style={{display:'flex', flexDirection:'column', gap:'0.75rem', marginTop:'1rem'}}>
                    <Link to="/brochure" className="btn-outline" style={{justifyContent:'center'}}>📄 Open Brochure Generator</Link>
                    <Link to="/poster" className="btn-outline" style={{justifyContent:'center'}}>🎨 Open Poster Generator</Link>
                    <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{justifyContent:'center', textDecoration:'none'}}>🔥 Firebase Console</a>
                  </div>
                </div>
                <div className="glass-card">
                  <h3 className="card-section-title">Admin Info</h3>
                  <div style={{marginTop:'1rem', display:'flex', flexDirection:'column', gap:'0.75rem'}}>
                    <div><span className="form-label">Logged in as</span><div style={{color:'var(--text)', marginTop:'0.3rem'}}>{currentUser?.email}</div></div>
                    <div><span className="form-label">Role</span><div style={{marginTop:'0.3rem'}}><span className="gold-badge">{userRole?.toUpperCase()}</span></div></div>
                    <button className="btn-outline" style={{marginTop:'0.5rem', justifyContent:'center', color:'var(--danger)', borderColor:'rgba(244,67,54,0.3)'}} onClick={handleLogout}>🚪 Logout</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── STUDENT DETAIL MODAL ── */}
      {showStudentModal && selectedStudent && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowStudentModal(false)}>
          <div className="modal-box" style={{maxWidth:'640px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
              <h2 className="modal-title">Student Details</h2>
              <button className="chat-close" onClick={() => setShowStudentModal(false)}>✕</button>
            </div>
            <div className="student-modal-grid">
              <div><span className="form-label">Full Name</span><div className="modal-val">{selectedStudent.name || '—'}</div></div>
              <div><span className="form-label">Email</span><div className="modal-val">{selectedStudent.email}</div></div>
              <div><span className="form-label">Phone</span><div className="modal-val">{selectedStudent.phone || '—'}</div></div>
              <div><span className="form-label">Interest</span><div className="modal-val">{selectedStudent.interest || '—'}</div></div>
              <div><span className="form-label">Address</span><div className="modal-val">{selectedStudent.address || '—'}</div></div>
              <div>
                <span className="form-label">Application Status</span>
                <select className="form-input" style={{marginTop:'0.4rem'}}
                  value={selectedStudent.applicationStatus || 'pending'}
                  onChange={e => updateStudentStatus(selectedStudent.id, e.target.value)}>
                  {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            {(selectedStudent.documents || []).length > 0 && (
              <div style={{marginTop:'1.5rem'}}>
                <div className="form-label" style={{marginBottom:'0.75rem'}}>Documents ({selectedStudent.documents.length})</div>
                <div className="modal-docs-grid">
                  {selectedStudent.documents.map((d, i) => (
                    <a key={i} href={d.url} target="_blank" rel="noopener noreferrer" className="modal-doc-link">
                      📄 {d.type}
                    </a>
                  ))}
                </div>
              </div>
            )}
            <div style={{display:'flex', gap:'0.75rem', marginTop:'2rem'}}>
              <a href={`https://wa.me/${(selectedStudent.phone || '').replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="btn-gold" style={{flex:1, justifyContent:'center', fontSize:'0.85rem'}}>
                💬 WhatsApp
              </a>
              <a href={`mailto:${selectedStudent.email}`} className="btn-outline" style={{flex:1, justifyContent:'center', fontSize:'0.85rem'}}>
                ✉️ Email
              </a>
              <button className="btn-ghost" style={{color:'var(--danger)', borderColor:'rgba(244,67,54,0.2)'}} onClick={() => handleDeleteStudent(selectedStudent.id)}>
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD LEAD MODAL ── */}
      {showAddLead && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddLead(false)}>
          <div className="modal-box">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
              <h2 className="modal-title">Add New Lead</h2>
              <button className="chat-close" onClick={() => setShowAddLead(false)}>✕</button>
            </div>
            <form onSubmit={handleAddLead} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
              <div className="name-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={newLead.name} onChange={e => setNewLead(l=>({...l, name:e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" value={newLead.phone} onChange={e => setNewLead(l=>({...l, phone:e.target.value}))} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={newLead.email} onChange={e => setNewLead(l=>({...l, email:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Program Interest</label>
                <select className="form-input" value={newLead.interest} onChange={e => setNewLead(l=>({...l, interest:e.target.value}))}>
                  <option value="">Select...</option>
                  {COURSE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows="2" value={newLead.notes} onChange={e => setNewLead(l=>({...l, notes:e.target.value}))}></textarea>
              </div>
              <button className="btn-gold" type="submit" style={{width:'100%', justifyContent:'center', padding:'0.9rem'}}>Add Lead</button>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD COURSE MODAL ── */}
      {showAddCourse && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddCourse(false)}>
          <div className="modal-box">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
              <h2 className="modal-title">Add New Course</h2>
              <button className="chat-close" onClick={() => setShowAddCourse(false)}>✕</button>
            </div>
            <form onSubmit={handleAddCourse} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
              <div className="form-group">
                <label className="form-label">Course Name *</label>
                <input className="form-input" placeholder="e.g. MBA in Finance" value={newCourse.name} onChange={e => setNewCourse(c=>({...c, name:e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">University</label>
                <input className="form-input" placeholder="Partner university name" value={newCourse.university} onChange={e => setNewCourse(c=>({...c, university:e.target.value}))} />
              </div>
              <div className="name-row">
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input className="form-input" placeholder="e.g. 2 Years" value={newCourse.duration} onChange={e => setNewCourse(c=>({...c, duration:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-input" value={newCourse.type} onChange={e => setNewCourse(c=>({...c, type:e.target.value}))}>
                    <option value="">Select type...</option>
                    <option>UG</option><option>PG</option><option>BTech</option><option>MTech</option><option>PhD</option><option>Certification</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="2" value={newCourse.description} onChange={e => setNewCourse(c=>({...c, description:e.target.value}))}></textarea>
              </div>
              <button className="btn-gold" type="submit" style={{width:'100%', justifyContent:'center', padding:'0.9rem'}}>Add Course</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
