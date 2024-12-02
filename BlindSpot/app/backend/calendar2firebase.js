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
                        console.log('RecurrenceRule', event.recurrenceRule)
                        if(event.description === undefined){
                            event.description = ""
                        }
                        if(event.location === undefined){
                            event.location = ""
                        }
                        if(event.start_time === undefined){
                            event.start_time = 0
                        }
                        if(event.end_time === undefined){
                            event.end_time = 0
                        }
                        //For no recurrance
                        if (event.recurrenceRule !== undefined){
                           console.log("Recurrance");
                           recurrence_num = event.recurrenceRule.interval 
                           if(event.recurrenceRule.interval === undefined){
                                event.recurrenceRule.interval = 1
                           }
                           recurrence_num = event.recurrenceRule.interval 
                           if(event.recurrenceRule.interval === undefined){
                                event.recurrenceRule.interval = 1
                           }
                           addEvent(user_id, event.id, event.title, event.description, event.location, true, event.recurrenceRule.frequency, event.recurrenceRule.interval, event.start_time, event.end_time);
                     
                        } else {
                            console.log("No Recurrance");
                            addEvent(user_id, event.id, event.title, event.description, event.location, false, null, "never", event.start_time, event.end_time);
                         
                        }
                    }
                }
            }
        }
    }
}

export {calendar2firebase}
