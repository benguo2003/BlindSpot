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
//user id as string 
async function retrieveInfo(user_id){
    const userRef = doc(FIREBASE_DB, 'users', user_id);
    const userSnapshot = await getDoc(userRef);
    const userData = userSnapshot.data();
    return userData;
}

export {updateProfile, retrieveInfo};
