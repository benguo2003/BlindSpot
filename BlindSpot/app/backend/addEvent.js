import { FIREBASE_DB} from './FirebaseConfig';
import {doc, addDoc, collection, setDoc, getDoc} from 'firebase/firestore';
async function addEvent(event_data)
{
    try{
        const event_ref = collection(FIREBASE_DB, 'events');
        await addDoc(event_ref,event_data);
        console.log(`Event "${event_data.title}" added successfully.`);
        return {
            success: true,
            message: `Event "${event_data.title}" added successfully.`,
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
async function addRecurringEvent(event_data){
    try{
        const event_ref = collection(FIREBASE_DB, 'recurring');
        await addDoc(event_ref,event_data);
        console.log(`Recurring event "${event_data.title}" added successfully.`);
        return {
            success: true,
            message: `Recurring event "${event_data.title}" added successfully.`,
        };
    }
    catch(error){
        console.error("Error adding  recurring event to collection: ", error);
        return{
            success: false,
            message: "An error occurred adding this event",
        };
    }
}
export {addEvent, addRecurringEvent};