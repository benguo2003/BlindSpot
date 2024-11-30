import * as Calendar from 'expo-calendar';
import {addEvent}from "./addEvent";
async function calendar2firebase(user_id)
{
    const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        for (const calendar of calendars) {
            if(calendar.title !== "US Holidays"){
                const startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);
                const endDate = new Date();
    
                const events = await Calendar.getEventsAsync([calendar.id], startDate, endDate);
                if (events.length > 0) {
                    console.log(`Events in ${calendar.title} from the last month:`);
                    for (const event of events) {
                        console.log('Title:', event.title);
                        console.log('Location:', event.location);
                        console.log('Description:', event.description);
                        console.log('Event ID', event.id)
                        //console.log('Calendar ID', calendar.id)
                        console.log('RecurrenceRule', event.recurrenceRule)
                        //For no recurrance
                        if (event.recurrenceRule !== undefined){
                           console.log("Recurrance");
                           addEvent(user_id, event.id, event.title, event.description, event.location, true, event.recurrenceRule.frequency, event.recurrenceRule.interval, event.start_time, event.end_time);
                     
                        } else {
                            console.log("No Recurrance");
                            addEvent(user_id, event.id, event.title, event.description, event.location, false, "never", 0, event.start_time, event.end_time);
                         
                        }
                    }
                }
            }
        }
    }
}

export {calendar2firebase}
