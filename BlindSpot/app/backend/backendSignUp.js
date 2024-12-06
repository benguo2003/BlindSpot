import { FIREBASE_DB} from './FirebaseConfig';
import {doc, setDoc, getDoc} from 'firebase/firestore';

/** 
 * Adds a user to the users collection in the database upon sign up. Does not return anything.
 * @param {string} userID - the current logged in user's unique identifier
 * @param {string} email - the current logged in user's email
 * @param {string} name - the current logged in user's name
 * @param {number} age - the current logged in user's age 
*/
async function addUserToUsersCollection(userID, email, name, age){
    calendar_id = userID + '_calendar';
    try{
        const calendarRef = doc(FIREBASE_DB, 'calendars', calendar_id);
        const calendarSnap = await getDoc(calendarRef);
        console.log(typeof calendarSnap);
        const userRef = doc(FIREBASE_DB, 'users', userID);
        await setDoc(userRef, {
            name: name,
            email: email,
            age: age,
            calendar_id: calendar_id,
        });
        const calendar_name = userID + '_calendar'
        await setDoc(calendarRef, {
            name: calendar_name,
        })
        console.log(`User "${name}" added with calendar id "${calendar_id}".`);
    }
    catch (error) {
        console.log(error);
        console.error('Error adding user to users collection.');
    }
}

export {addUserToUsersCollection};
