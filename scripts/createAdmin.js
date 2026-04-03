// scripts/createAdmin.js
// Run ONCE after setting up Firebase to create your admin account
// Usage: node scripts/createAdmin.js
// Requires: npm install firebase-admin dotenv

require('dotenv').config();
const admin = require('firebase-admin');

// Download your service account key from:
// Firebase Console → Project Settings → Service Accounts → Generate new private key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function createAdmin() {
  const ADMIN_EMAIL = 'admin@ilmora.com'; // Change this
  const ADMIN_PASSWORD = 'IlmoraAdmin2025!'; // Change this — use a strong password
  const ADMIN_NAME = 'ILMORA Admin';

  try {
    // Create Firebase Auth user
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        displayName: ADMIN_NAME,
      });
      console.log('✅ Auth user created:', userRecord.uid);
    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        userRecord = await auth.getUserByEmail(ADMIN_EMAIL);
        console.log('ℹ️ Auth user already exists:', userRecord.uid);
      } else throw err;
    }

    // Create Firestore document with admin role
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      phone: '+971529682123',
      role: 'admin',
      status: 'active',
      enrolledCourses: [],
      documents: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Admin Firestore document created');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 Admin Login Credentials:');
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Change your password after first login!');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  process.exit(0);
}

createAdmin();
