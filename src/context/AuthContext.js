// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchUserRole(uid) {
    // Try up to 3 times in case Firestore is slow
    for (let i = 0; i < 3; i++) {
      try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const role = (data.role || 'student').trim().toLowerCase();
          return { role, data };
        }
      } catch (error) {
        console.error('Attempt', i + 1, 'failed:', error);
        // Wait before retry
        await new Promise(r => setTimeout(r, 500));
      }
    }
    return { role: 'student', data: {} };
  }

  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  }

  async function register(email, password, name, phone) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      name,
      email,
      phone,
      role: 'student',
      status: 'active',
      applicationStatus: 'pending',
      enrolledCourses: [],
      documents: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return result;
  }

  async function logout() {
    setCurrentUser(null);
    setUserRole(null);
    return signOut(auth);
  }

  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { role, data } = await fetchUserRole(user.uid);
        setUserRole(role);
        setCurrentUser({ ...user, ...data, uid: user.uid });
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const isAdmin = userRole === 'admin' || userRole === 'staff';

  const value = {
    currentUser,
    userRole,
    isAdmin,
    isStudent: userRole === 'student',
    login,
    register,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
