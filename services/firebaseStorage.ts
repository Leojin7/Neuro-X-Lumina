
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
const firebaseConfig = window.firebaseConfig;
// Initialize Firebase
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();
const storage = firebase.storage();
export const uploadProfilePicture = (file: File, userId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const storageRef = storage.ref(`profile_pictures/${userId}/${file.name}`);
        const uploadTask = storageRef.put(file);
        uploadTask.on(
            'state_changed',
            (snapshot) => {

            },
            (error) => {

                console.error("Firebase Storage upload error:", error);
                reject(error);
            },
            () => {
                // Handle successful uploads on complete.

                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    resolve(downloadURL);
                }).catch(reject);
            }
        );
    });
};