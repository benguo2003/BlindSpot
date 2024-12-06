import { FIREBASE_DB} from './FirebaseConfig';
import {doc, getDoc, query, where, getDocs, deleteDoc, collection} from 'firebase/firestore';

/**
 * Removes a calendar event from the database. Returns success/error message.
 * @param {string} userID - The unique identifier for the current user
 * @param {string} event_title - Title of the event to be removed
*/
async function removeEvent(userID, event_title){
    try{
        const userRef = doc(FIREBASE_DB, 'users', userID);
        const userSnap = await getDoc(userRef);
        const calendar_id = userSnap.data().calendar_id;

        const events_query = query(
            collection(FIREBASE_DB, 'events'),
            where('calendar_id', '==', calendar_id),
            where('title', '==', event_title)
        );
        const querySnapshot = await getDocs(events_query);
        querySnapshot.forEach(async (eventDoc) =>{
            await deleteDoc(doc(FIREBASE_DB, 'events', eventDoc.id));
            console.log(`Event "${event_title}" deleted successfully.`)
        });
        return {
            success: true,
            message: `Event "${event_title}" deleted successfully.`,
        };
    } catch(error){
        console.log("Error removing event: ", error);
        return {
            success: false,
            message: "An error occurred while removing the event",
        };
    }
}

export {removeEvent};