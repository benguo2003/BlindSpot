import { FIREBASE_DB } from "./FirebaseConfig";
import {doc, updateDoc, arrayUnion} from 'firebase/firestore';
async function addMicrotaskInfo(userID, name, time){
    if(name != 'laundry' && name != 'groceries' && name != 'exercise' && name != 'meditation' && name != 'dishes' && name != 'trash')
    {
        console.log('invalid microtask name');
        return false;
    }
    const taskReference = doc(FIREBASE_DB, 'gptconext', userID);
    try{
        await updateDoc(taskReference,{
            [`${name}.time_history`]: arrayUnion(time)
        });
        console.log(`Added ${time} to ${name} for user ${userID}.`);
        return true;
    } catch(error){
        console.error('error adding time: ', error);
        return false;
    }
}
export {addMicrotaskInfo}