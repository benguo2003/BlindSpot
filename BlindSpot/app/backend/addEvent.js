import { FIREBASE_DB } from './FirebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

async function addEvent(user_id, title, description, location, recurring, recurrence_type, recurrence_num, start_time, end_time) {
    try {
        const userRef = doc(FIREBASE_DB, 'users', user_id);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            console.error("User does not exist.");
            return {
                success: false,
                message: "User does not exist.",
            };
        }

        const calendar_id = userSnap.data().calendar_id;

        // Generate a new document reference without an event_id; Firestore will automatically generate one
        const event_ref = doc(FIREBASE_DB, 'events'); // Firestore generates a random event_id

        await setDoc(event_ref, {
            calendar_id: calendar_id,
            title: title,
            description: description,
            location: location,
            recurring: recurring,
            recurrence_type: recurrence_type,
            recurrence_num: recurrence_num,
            start_time: start_time,
            end_time: end_time,
        });

        console.log(`Event "${title}" added successfully.`);
        return {
            success: true,
            message: `Event "${title}" added successfully.`,
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
