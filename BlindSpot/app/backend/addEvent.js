import { FIREBASE_DB } from './FirebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

async function addEvent(user_id, single_time_event, recurring_event) {
    try {
        const calendar_id = user_id + "_calendar";

        if (single_time_event !== null) {
            console.log("Adding Single Time Event");
            const event_ref = doc(FIREBASE_DB, 'events');
            await setDoc(event_ref, {
                calendar_id: calendar_id,
                title: single_time_event.title,
                description: single_time_event.description,
                location: single_time_event.location,
                start_time: single_time_event.start_time,
                end_time: single_time_event.end_time,
                change: single_time_event.change,
                
            });
            console.log(`Single Time Event: "${single_time_event.title}" added successfully.`);
        }
        else if (recurring_event !== null) {
            console.log("Adding Recurring Event");
            const recurring_ref = doc(FIREBASE_DB, 'recurring');
            await setDoc(recurring_ref, {
                calendar_id: calendar_id,
                title: recurring_event.title,
                description: recurring_event.description,
                location: recurring_event.location,
                start_time: recurring_event.start_time,
                end_time: recurring_event.end_time,
                change: recurring_event.change,
                days: recurring_event.days,
                start_date: recurring_event.start_date,
                end_date: recurring_event.end_date,
                week_frequency: recurring_event.week_frequency,
            });
            console.log(`Recurring Event: "${single_time_event.title}" added successfully.`);
        }
        else {
            console.error("No event data provided.");
            return {
                success: false,
                message: "No event data provided.",
            };
        }
        return {
            success: true,
            message: `Event added successfully.`,
        };
    } catch (error) {
        console.error("Error adding event to collection: ", error);
        return {
            success: false,
            message: "An error occurred adding this event",
        };
    }
}

export { addEvent };

