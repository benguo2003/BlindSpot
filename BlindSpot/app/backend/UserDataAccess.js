// this file is for accessing user data
// establish this as a baseline and organize the repo to where the implementation for this feature can begin
import { FIREBASE_APP, FIREBASE_DB } from "./FirebaseConfig";
import { doc, getDoc, query, where, getDocs, updateDoc, collection } from "firebase/firestore";

/**
 * Gets user data from Firebase database. Returns user data object or null if error.
 * @param {string} user_id - The unique identifier for the user to look up
*/
export async function getUserData(user_id) {
    try {
        const userRef = doc(FIREBASE_DB, "users", user_id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data();
        } else {
            console.error("No such user document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting user document: ", error);
        return null;
    }
}