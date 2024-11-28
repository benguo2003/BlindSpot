import { FIREBASE_APP, FIREBASE_DB } from "./FirebaseConfig";
import { doc, getDoc, query, where, getDocs, updateDoc, collection } from "firebase/firestore";

async function updateTitle(user_id, oldTitle, newTitle){
    try{
        //get the user calendar id
        const userRef = doc(FIREBASE_DB, 'users', user_id);
        const userSnap = await getDoc(userRef);
        const calendar_id = userSnap.data().calendar_id;
        
        //search the events collection for the desired event to update
        const eventQuery = query(
            collection(FIREBASE_DB, 'events'),
            where('calendar_id', '==', calendar_id),
            where('title', '==', oldTitle)
        );
        // make the update
        const queryResult = await getDocs(eventQuery);
        queryResult.forEach(async (eventDoc) =>{
            const eventRef = doc(FIREBASE_DB, 'events', eventDoc.id)
            await updateDoc(eventRef,{
                title: newTitle,
            });
        });
        console.log(`Event title updated to "${newTitle}".`);
        return true;
    } catch(error){
        console.error('Error updating title: ', error);
        return false;
    }
}

async function updateRecurrence(user_id, event_title, recurring, recurrence_type, recurrence_num){
    try{
    //get the user calendar id
    const userRef = doc(FIREBASE_DB, 'users', user_id);
    const userSnap = await getDoc(userRef);
    const calendar_id = userSnap.data().calendar_id;
    //search the events collection for the desired event to update
    const eventQuery = query(
        collection(FIREBASE_DB, 'events'),
        where('calendar_id', '==', calendar_id),
        where('title', '==', event_title)
    );
    // make the update
    const queryResult = await getDocs(eventQuery);
    queryResult.forEach(async (eventDoc) =>{
        const eventRef = doc(FIREBASE_DB, 'events', eventDoc.id)
        await updateDoc(eventRef,{
            recurring: recurring,
            recurrence_type: recurrence_type,
            recurrence_num: recurrence_num,
        });
    });
    console.log(`Event recurrence updated.`);
    return true;    
    } catch(error){
    console.error('Error updating recurrence: ', error);
    return false;
    }

}

async function updateTime(user_id, event_title, start_time, end_time){
    try{
        //get the user calendar id
        const userRef = doc(FIREBASE_DB, 'users', user_id);
        const userSnap = await getDoc(userRef);
        const calendar_id = userSnap.data().calendar_id;
        //search the events collection for the desired event to update
        const eventQuery = query(
            collection(FIREBASE_DB, 'events'),
            where('calendar_id', '==', calendar_id),
            where('title', '==', event_title)
        );
        // make the update
        const queryResult = await getDocs(eventQuery);
        queryResult.forEach(async (eventDoc) =>{
            const eventRef = doc(FIREBASE_DB, 'events', eventDoc.id)
            await updateDoc(eventRef,{
                start_time: start_time,
                end_time: end_time,
            });
        });
        console.log(`Event timing updated.`);
        return true;    
        } catch(error){
        console.error('Error updating event time: ', error);
        return false;
        }
    
}

async function updateDescription(user_id, event_title, new_description)
{
    try{
        //get the user calendar id
        const userRef = doc(FIREBASE_DB, 'users', user_id);
        const userSnap = await getDoc(userRef);
        const calendar_id = userSnap.data().calendar_id;
        //search the events collection for the desired event to update
        const eventQuery = query(
            collection(FIREBASE_DB, 'events'),
            where('calendar_id', '==', calendar_id),
            where('title', '==', event_title)
        );
        // make the update
        const queryResult = await getDocs(eventQuery);
        queryResult.forEach(async (eventDoc) =>{
            const eventRef = doc(FIREBASE_DB, 'events', eventDoc.id)
            await updateDoc(eventRef,{
                description: new_description,
            });
        });
        console.log(`Event description updated.`);
        return true;    
        } catch(error){
        console.error('Error updating description: ', error);
        return false;
        }
    
}

async function findEvent(user_id, event_title){
    try{
        //get the user calendar id
        const userRef = doc(FIREBASE_DB, 'users', user_id);
        const userSnap = await getDoc(userRef);
        const calendar_id = userSnap.data().calendar_id;
        //search the events collection for the desired event to update
        const eventQuery = query(
            collection(FIREBASE_DB, 'events'),
            where('calendar_id', '==', calendar_id),
            where('title', '==', event_title)
        );
        // make the update
        const queryResult = await getDocs(eventQuery);
        const event_data = [];
        queryResult.forEach(async (doc) =>{
            const data = doc.data();
            const start_time = data.start_time?.toDate();
            const end_time = data.end_time?.toDate();
            event_data.push({
                id: doc.id,
                title: data.title,
                description: data.description,
                start_time: start_time,
                end_time: end_time,
                recurring: data.recurring,
                recurrence_type: data.recurrence_type,
                recurrence_num: data.recurrence_num,
            });
        });
        console.log(`Event retrieved.`);
        return event_data;  
        } catch(error){
        console.error('Error retrieving event: ', error);
        return false;
        }
}

async function displayEvents(user_id){
    try{
        //get the user calendar id
        const userRef = doc(FIREBASE_DB, 'users', user_id);
        const userSnap = await getDoc(userRef);
        const calendar_id = userSnap.data().calendar_id;
        //search the events collection for the desired event to update
        const eventQuery = query(
            collection(FIREBASE_DB, 'events'),
            where('calendar_id', '==', calendar_id)
        );
        const queryResult = await getDocs(eventQuery);
        const events = [];
        //queryResult.forEach((doc) =>{
            //events.push({id: doc.id,...doc.data()});
        //});
        queryResult.forEach(async (doc) =>{
            const data = doc.data();
            const start_time = data.start_time;
            const date_start = start_time.toDate().toLocaleString();
            const end_time = data.end_time;
            const date_end = end_time.toDate().toLocaleString();
            events.push({
                id: doc.id,
                title: data.title,
                description: data.description,
                start_time: date_start,
                end_time: date_end,
                recurring: data.recurring,
                recurrence_type: data.recurrence_type,
                recurrence_num: data.recurrence_num,
            });
        });
        console.log(`Events retrieved.`);
        return events;
        } catch(error){
        console.error('Error retrieving events: ', error);
        return false;
        }
}

export {updateTitle, updateRecurrence, updateTime, updateDescription, findEvent, displayEvents};