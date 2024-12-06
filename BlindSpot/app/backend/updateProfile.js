import { FIREBASE_APP, FIREBASE_DB } from "./FirebaseConfig";
import { doc, getDoc,updateDoc} from "firebase/firestore";

/**
 * Updates a user's profile in Firebase. Returns true if successful.
 * @param {string} user_id - The unique identifier for the current user
 * @param {number} age - User's age in years
 * @param {string} name - User's name
*/
async function updateProfile(user_id, age, name){
    try{
        const userRef = doc(FIREBASE_DB, 'users', user_id);
        await updateDoc(userRef,{
            age: age,
            name: name,
        });
        console.log('User Profile updated successfully');
        return true;
    } catch(error){
        console.error('error updating user profile: ', error);
    }
}

/**
 * Updates a user's profile with a user object. Returns true if successful.
 * @param {string} user_id - The unique identifier for the current user
 * @param {Object} userObj - Object containing user profile fields to update
*/
async function updateProfileObject(user_id, userObj){
    try{
        const userRef = doc(FIREBASE_DB, 'users', user_id);
        await updateDoc(userRef,{
            ...userObj,
        });
        console.log('User Profile updated successfully');
        return true;
    } catch(error){
        console.error('error updating user profile: ', error);
    }
}

/**
 * Retrieves a user's information from Firebase. Returns user data object or null if error.
 * @param {string} user_id - The unique identifier for the current user
*/
async function retrieveInfo(user_id) {
    try {
        const userRef = doc(FIREBASE_DB, 'users', user_id);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
            return userSnapshot.data();
        } else {
            console.error('User data does not exist');
            return null;
        }
    } catch (error) {
        console.error('Error retrieving user info:', error);
        return null;
    }
}


export {updateProfile, retrieveInfo, updateProfileObject};
