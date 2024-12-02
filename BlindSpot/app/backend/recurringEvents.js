import { FIREBASE_DB} from './FirebaseConfig';
import {doc, addDoc, setDoc, getDoc, collection} from 'firebase/firestore';
async function addRecurringEvent(userID, event_data)
{
    try{
        const document = await addDoc(collection(FIREBASE_DB, 'recurring'), event_data);
        console.log('document created with id: ', document.id);
    } catch(error){
        console.error('error adding document to recurring collection: ', error);
    }
}
export {addRecurringEvent}