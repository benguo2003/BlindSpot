import { FIREBASE_DB} from './FirebaseConfig';
import {doc, setDoc, getDoc, query, where, getDocs, deleteDoc, collection} from 'firebase/firestore';
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