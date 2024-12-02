import { FIREBASE_DB} from './FirebaseConfig';
import {doc, getDoc, query, where, getDocs, deleteDoc, collection} from 'firebase/firestore';
//both parameters as strings
async function removeEvent(userID, event_title, day='', one_time_thing=false){
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
        if(querySnapshot.exists())
        {
            querySnapshot.forEach(async (eventDoc) =>{
                await deleteDoc(doc(FIREBASE_DB, 'events', eventDoc.id));
                console.log(`Event "${event_title}" deleted successfully.`)
            });
            return {
                success: true,
                message: `Event "${event_title}" deleted successfully.`,
            };
        }
        else{
            const rec_query = query(collection(FIREBASE_DB, 'recurring'),
            where('calendar_id','==', calendar_id),
            where('title', '==', event_title));
            const rec_result = await getDoc(rec_query);
            
            if(one_time_thing == false){
                rec_result.forEach(async (document)=>{
                    await deleteDoc(doc(FIREBASE_DB, 'recurring', document.id));
                    console.log('recurring event deleted successfully');
                })
            }
        }
    } catch(error){
        console.log("Error removing event: ", error);
        return {
            success: false,
            message: "An error occurred while removing the event",
        };
    }
}

export {removeEvent};