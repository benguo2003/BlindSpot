import { FIREBASE_APP, FIREBASE_DB } from "./FirebaseConfig";
import { doc, getDoc,updateDoc} from "firebase/firestore";

//age is an int, rest are stings
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

//user id as string 
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
