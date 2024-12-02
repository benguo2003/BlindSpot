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
                endDate.setMonth(endDate.getMonth() +  1)
                const events = await Calendar.getEventsAsync([calendar.id], startDate, endDate);
                if (events.length > 0) {
                    console.log(`Events in ${calendar.title} from the last month:`);
                    for (const event of events) {
                        console.log('Title:', event.title);
                        console.log('Location:', event.location);
                        console.log('Description:', event.description);
                        console.log('Start Date ', event.startDate)
                        console.log('End Date ', event.endDate)
                        if(event.description === undefined){
                            event.description = ""
                        }
                        if(event.location === undefined){
                            event.location = ""
                        }
                        
                        if (!event.isRecurring) {
                            const event_obj = {
                                title: event.title,
                                description: event.description,
                                location: event.location,
                                start_time: event.startDate,
                                end_time: event.endDate,
                                change: 1,
                            }

                            addEvent(user_id, event_obj, null);
                        }
                    }
                }
            }
        }
    }
}

export {calendar2firebase}
