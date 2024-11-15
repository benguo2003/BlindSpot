// this file is for accessing user data
// establish this as a baseline and organize the repo to where the implementation for this feature can begin
import { FIREBASE_DB} from './FirebaseConfig';
import {doc, setDoc, getDoc} from 'firebase/firestore';
async function addUserToUsersCollection(userID, email, name, age){
    calendar_id = userID + 'calendar';
    try{
        const calendarRef = doc(FIREBASE_DB, 'calendars', calendar_id);
        const calendarSnap = await getDoc(calendarRef);
        console.log(typeof calendarSnap);
        //if(!calendarSnap.exists()){
            //throw new Error('Calendar does not exist');
        //}

        //adding the user to the users collection
        const userRef = doc(FIREBASE_DB, 'users', userID);
        await setDoc(userRef, {
            name: name,
            email: email,
            age: age,
            calendar_id: calendar_id,
        });
        await setDoc(calendarRef, {
            name: 'calendarTest',
        })
        console.log(`User "${name}" added with calendar id "${calendar_id}".`);
    }
    catch (error) {
        console.log(error);
        console.error('Error adding user to users collection.');
    }
}

export {addUserToUsersCollection};
//addUserToUsersCollection("testuser123", "name@example.com", "testUser", 30);
