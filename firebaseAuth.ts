
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
// Your web app's Firebase configuration is in window.firebaseConfig
const firebaseConfig = window.firebaseConfig;
// Initialize Firebase
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();
const auth = firebase.auth();
// --- AUTH FUNCTIONS ---
const signUpWithEmail = async (email, password, displayName) => {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    if (userCredential.user) {
        await userCredential.user.updateProfile({ displayName });
    }
    return userCredential.user;
}
const signInWithEmail = async (email, password) => {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    return userCredential.user;
}
const logOut = async () => {
    await auth.signOut();
}
const updateUserProfile = async (updates: { displayName?: string, photoURL?: string }) => {
    if (auth.currentUser) {
        await auth.currentUser.updateProfile(updates);
    } else {
        throw new Error("No user is currently signed in.");
    }
}
type User = firebase.User;
export { 
    auth, 
    signUpWithEmail,
    signInWithEmail,
    logOut,
    updateUserProfile,
    type User 
};