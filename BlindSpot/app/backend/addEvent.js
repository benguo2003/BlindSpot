import { FIREBASE_DB} from './FirebaseConfig';
import {doc, setDoc, getDoc, query, where, getDocs, deleteDoc} from 'firebase/firestore';
async function addEvent(user_id, event_id, title, description, recurring, recurrence_type, recurrence_num)
{
    try{
        const userRef = doc(FIREBASE_DB, 'users', user_id);
        const userSnap = await getDoc(userRef);

        const calendar_id = userSnap.data().calendar_id;

        const event_ref = doc(FIREBASE_DB, 'events', event_id);
        await setDoc(event_ref,{
            calendar_id: calendar_id,
            title: title,
            description: description,
            recurring: recurring,
            recurrence_type: recurrence_type,
            recurrence_num: recurrence_num,
        }
        );
        console.log(`Event "${title}" added successfully.`);
        return {
            success: true,
            message: `Event "${title}" added successfully.`,
        };
    }
    catch(error){
        console.error("Error adding event to collection: ", error);
        return{
            success: false,
            message: "An error occurred adding this event",
        };
    }
}

export {addEvent};