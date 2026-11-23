import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "./firebase.js";

export const ADMIN_EMAILS = [
  "adityasinghworks1612@gmail.com",
  "roommate.work@gmail.com"
];

export function isAdmin(user) {
  return Boolean(
    user &&
    user.emailVerified &&
    ADMIN_EMAILS.includes(user.email?.toLowerCase())
  );
}

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    await saveUserProfile(user);

    return user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function saveUserProfile(user) {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  const profile = {
    uid: user.uid,
    name: user.displayName || "Student",
    email: user.email,
    photoURL: user.photoURL || "",
    emailVerified: user.emailVerified,
    lastLogin: serverTimestamp()
  };

  if (!snapshot.exists()) {
    profile.createdAt = serverTimestamp();
    profile.role = "student";
    profile.favorites = [];
    profile.recentlyViewed = [];

    await setDoc(userRef, profile);
  } else {
    await setDoc(userRef, profile, { merge: true });
  }
}

export async function logout() {
  await signOut(auth);
  window.location.href = "./index.html";
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export function requireLogin() {
  watchAuth(user => {
    if (!user) {
      window.location.href = "./login.html";
    }
  });
}

export function requireAdmin() {
  watchAuth(user => {
    if (!user) {
      window.location.href = "./login.html";
      return;
    }

    if (!isAdmin(user)) {
      alert("You are not authorized to access Admin Studio.");
      window.location.href = "./dashboard.html";
    }
  });
}
