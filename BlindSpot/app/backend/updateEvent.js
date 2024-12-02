import { FIREBASE_APP, FIREBASE_DB } from "./FirebaseConfig";
import { doc, getDoc, query, where, getDocs, updateDoc, collection } from "firebase/firestore";

// given the user id, old event title, and new event title (strings)
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

//user id and event title are strings, recurring is a boolean, recurrence type is a string such as 'daily', 'weekly', 'monthly', etc., recurrence num is an int corresponding to how often this is (ex: daily and 2 means every 2 days)
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
//start and end time parameters should be timestamps
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
//all string parameters
async function updateDescription(user_id, event_id, new_description) {
    try {
        // Get the user calendar id
        const userRef = doc(FIREBASE_DB, 'users', user_id);
        const userSnap = await getDoc(userRef);
        const calendar_id = userSnap.data().calendar_id;

        // Reference the specific event document by event_id
        const eventRef = doc(FIREBASE_DB, 'events', event_id);

        // Get the event document
        const eventDoc = await getDoc(eventRef);

        // Check if the event belongs to the user's calendar
        if (eventDoc.exists() && eventDoc.data().calendar_id === calendar_id) {
            // Update the event description
            await updateDoc(eventRef, {
                description: new_description,
            });
            console.log(`Event description updated.`);
            return true;
        } else {
            console.error('Event not found or does not belong to the user.');
            return false;
        }
    } catch (error) {
        console.error('Error updating description: ', error);
        return false;
    }
} 

//event title and new location 
async function updateLocation(user_id, event_title, new_location){
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
                location: new_location,
            });
        });
        console.log(`Event location updated.`);
        return true;    
        } catch(error){
        console.error('Error updating location: ', error);
        return false;
        }
    
}
//all update functions return boolean for whether or not the function was successful or not

//both string parameters
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
            const start_time = data.start_time.toDate();
            const end_time = data.end_time.toDate();
            event_data.push({
                id: doc.id,
                title: data.title,
                description: data.description,
                location: data.location,
                start_time: start_time.toLocaleString(),
                end_time: end_time.toLocaleString(),
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
// returns a json with all the fields for the event
//start and end times formatted like for example: "start_time": "3/31/2025, 2:00:00 PM"

//day, month, year all numbers (ex: displayEvents(user_id, 22, 11, 2025) means events for november 22, 2025)
async function displayEvents(user_id, day, month, year) {
    try {
        const userRef = doc(FIREBASE_DB, 'users', user_id);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            console.log('No user found');
            return [];
        }
        
        const calendar_id = userSnap.data().calendar_id;
        const events = [];

        // Get regular events
        const eventQuery = query(
            collection(FIREBASE_DB, 'events'),
            where('calendar_id', '==', calendar_id)
        );
        
        const queryResult = await getDocs(eventQuery);

        queryResult.forEach(doc => {
            const data = doc.data();
            const date_start = data.start_time?.toDate();
            const date_end = data.end_time?.toDate();
            
            if (!date_start || !date_end) {
                console.log('Skipping event with invalid dates:', doc.id);
                return;
            }

            if (date_start.getFullYear() == year && 
                date_start.getMonth() === month && 
                date_start.getDate() === day) {
                
                events.push({
                    id: doc.id,
                    title: data.title || 'Untitled Event',
                    description: data.description || '',
                    location: data.location || '',
                    start_time: date_start,
                    end_time: date_end,
                    change: data.change || 1,
                    category: data.category || 'Uncategorized',
                });
            }
        });

        // Get recurring events
        const recurringQuery = query(
            collection(FIREBASE_DB, 'recurring'),
            where('calendar_id', '==', calendar_id)
        );

        console.log("Recurrence query:", recurringQuery);

        const recurringResult = await getDocs(recurringQuery);
        const targetDate = new Date(year, month, day);
        const targetDayIndex = targetDate.getDay(); // 0 for Sunday, 6 for Saturday

        recurringResult.forEach(doc => {
            console.log("Successful recurring query: " + doc.data());
            const data = doc.data();
            const start_date = data.start_date?.toDate();
            const end_date = data.end_date?.toDate();
            console.log("Target: " + data.days[targetDayIndex]);
            
            if (!start_date || !end_date || !data.days || data.days[targetDayIndex] !== 1) {
                return;
            }

            // Check if target date is within range
            if (targetDate >= start_date && targetDate <= end_date) {
                // Check week frequency
                const weeksDiff = Math.floor((targetDate - start_date) / (7 * 24 * 60 * 60 * 1000));
                if (weeksDiff % (data.week_frequency || 1) === 0) {
                    // Create event instance for this day
                    const eventStartTime = new Date(year, month, day, 
                        data.start_time.toDate().getHours(),
                        data.start_time.toDate().getMinutes());
                    
                    const eventEndTime = new Date(year, month, day,
                        data.end_time.toDate().getHours(),
                        data.end_time.toDate().getMinutes());

                    events.push({
                        id: doc.id + '_' + targetDate.toISOString(),
                        title: data.title || 'Untitled Event',
                        description: data.description || '',
                        location: data.location || '',
                        start_time: eventStartTime,
                        end_time: eventEndTime,
                        change: data.change || 0,
                        category: data.category || 'Uncategorized'
                    });
                }
            }
        });

        console.log(`Found ${events.length} events for ${month}/${day}/${year}`);
        return events.sort((a, b) => a.start_time - b.start_time);
    } catch (error) {
        console.error('Error retrieving events: ', error);
        return [];
    }
} //returns a list of json objects with each json having each of the event fields (title, description, start and end times, etc.)

async function displayEvents2(user_id, day, month, year) {
    try {
        const userRef = doc(FIREBASE_DB, 'users', user_id);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            console.log('No user found');
            return [];
        }
        
        const calendar_id = userSnap.data().calendar_id;

        const eventQuery = query(
            collection(FIREBASE_DB, 'events'),
            where('calendar_id', '==', calendar_id)
        );
        
        const queryResult = await getDocs(eventQuery);
        const events = [];

        queryResult.forEach(doc => {
            const data = doc.data();
            
            // Safely convert Firebase Timestamp to Date
            const date_start = data.start_time?.toDate();
            const date_end = data.end_time?.toDate();
            
            if (!date_start || !date_end) {
                console.log('Skipping event with invalid dates:', doc.id);
                return;
            }

            if (date_start.getFullYear() == year && 
                date_start.getMonth() === month) {
                
                events.push({
                    id: doc.id,
                    title: data.title || 'Untitled Event',
                    description: data.description || '',
                    location: data.location || '',
                    start_time: date_start,
                    end_time: date_end,
                    change: data.change || 1,
                    category: data.category || 'Uncategorized',
                });
            }
        });

        console.log(`Found ${events.length} events for ${month}/${day}/${year}`);
        return events;
    } catch (error) {
        console.error('Error retrieving events: ', error);
        return [];
    }
}
export {updateTitle, updateRecurrence, updateTime, updateDescription,updateLocation, findEvent, displayEvents, displayEvents2};