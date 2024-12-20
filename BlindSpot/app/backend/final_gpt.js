import axios from 'axios';
const { addEvent } = require('./addEvent');
import { displayEvents } from "./updateEvent";
import {
    OPENAI_API_KEY,
    OPENAI_PROJECT_ID,
} from '@env';

/**
 * Gets all of the user's microtasks based on their context and history. Returns array of relevant tasks.
 * @param {string} user_id - The unique identifier for the current user
 * @param {Array} micro_tasks - List of microtasks to filter against
*/
function getTaskHistory(user_id, micro_tasks){
  
    // sample output
    var micro_events = [
      {
          "name": "Laundry",
          "time_history": [15, 20, 18]
      }, 
      {
          "name": "Fold Clothes",
          "time_history": [20, 24, 28]
      }, 
      {
          "name": "Dishes",
          "time_history": [15, 17, 12]
      }, 
      {
        "name": "Showering",
        "time_history": [15, 17, 12]
      }, 
      {
        "name": "Trash",
        "time_history": [5, 3, 7]
      }
    ]

    relevant_micro_tasks = []
    for (let i = 0; i < micro_events.length; i++){
        if (micro_tasks.includes(micro_events[i].name)){
            relevant_micro_tasks.push(micro_events[i])
        }
    }
  
    return relevant_micro_tasks;
}

/**
 * Retrieve the start and end times of the user. Returns array with [start_time, end_time].
 * @param {string} user_id - The unique identifier for the current user
*/
function getStartEndTime(user_id){

    // sample response
    var start_time = "07:00";
    var end_time = "23:00";

    return [start_time, end_time];
}

/**
 * Makes an API request to OpenAI's ChatGPT. Returns the response text from GPT.
 * @param {string} system_prompt - The system context for ChatGPT
 * @param {string} question - The actual query to send to ChatGPT
*/
async function chatGPTRequest(system_prompt, question) {
    const url = 'https://api.openai.com/v1/chat/completions';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Openai-Project': OPENAI_PROJECT_ID,
    };
  
    const data = {
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: system_prompt },
            { role: 'user', content: question }
        ]
    };

    try {
        const response = await axios.post(url, data, { headers });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error);
    }
}

/**
 * Parses ChatGPT's response and stores events in database. Returns void.
 * @param {string} user_id - The unique identifier for the current user
 * @param {number} questionType - Type of scheduling question to ask GPT
 * @param {Array} microTasks - List of microtasks to schedule
 * @param {number} day - Day of month
 * @param {number} month - Month number
 * @param {number} year - Year number
*/
export async function askGPT(user_id, questionType, microTasks, day, month, year) {

    async function parseResponse(user_id, response, event_names) {
        response = "[" + response.split("[")[1].split("]")[0] + "]";
        const jsonArray = JSON.parse(response);
        
        for (let i = 0; i < jsonArray.length; i++) {
            if (microTasks.includes(jsonArray[i].task_name)) {
                const [startHour, startMinute] = jsonArray[i].start_time.split(":").map(Number);
                const [endHour, endMinute] = jsonArray[i].end_time.split(":").map(Number);
                
                const startDate = new Date(year, month, day);
                startDate.setHours(startHour, startMinute, 0, 0);
                
                const endDate = new Date(year, month, day);
                endDate.setHours(endHour, endMinute, 0, 0);
                
                let new_format = {
                    "category": "Microtask",
                    "change": 0,
                    "description": jsonArray[i].task_desc,
                    "end_time": endDate,
                    "start_time": startDate,
                    "calendar_id": user_id + "_calendar",
                    "location": "",
                    "title": jsonArray[i].task_name
                };
                
                await addEvent(user_id, new_format, null);
            }
        }
    }
    var system_prompt = "You are an assistant that provides calendar suggestions for maximum productivity."

    var eventInstructions = `
You are given a set of events in the following format: 

Task Name, Description, Recurring Frequency, Recurring Number, Start Time, End Time

Here is an example with its interpretation:
“Breakfast, Eating and making food, Daily, 1, 2024-12-03T12:50:00.000Z, 2024-12-03T13:10:00.000Z” means, “The Breakfast events which involves eating and making food, occurs 1 time daily. The event start at 12:50, and ends at 1:10. Notice the time is a Timestamp Object”

For a particular day, you will be given a set of events that exist, and a set of events that must be added. It is your job to estimate the amount of time these additional events will take, and provide a schedule that includes all existing and desired events. 

You must structure your answer as a list of JSON objects, that have the following keys: 
Task Name, titled task_name
Task Description (less than 10 words), titled task_desc,
Recurring Frequency (can only be one of the following "none", “daily”, “weekly”, “monthly”, “bi-weekly”), titled rec_freq,
Recurring Number, titled rec_num, 
Start Time (must be in the format of “hh:mm” using military time), titled start_time,
End Time (must be in the format of “hh:mm” using military time), titled end_time

Details of Day:
`;

    var times = getStartEndTime(user_id);

    eventInstructions += `Day Begins: ${times[0]} \nDay Ends: ${times[1]}\n`;
    eventInstructions += `Here are the existing events:\n`;

    var events = await displayEvents(user_id, day, month, year);

    var formattedEvents = events.map(event => {
        let startTime = new Date(event.start_time);
        let endTime = new Date(event.end_time);

        // Subtract 8 hours for PDT
        startTime.setHours(startTime.getHours() - 8);
        endTime.setHours(endTime.getHours() - 8);

        // Adjust the day if the time goes to the previous day
        if (startTime.getDate() !== new Date(event.start_time).getDate()) {
            startTime.setDate(startTime.getDate() - 1);
        }
        if (endTime.getDate() !== new Date(event.end_time).getDate()) {
            endTime.setDate(endTime.getDate() - 1);
        }

        return {
            event_id: event.id,
            event_category: event.category || 'Uncategorized',
            event_title: event.title || 'Untitled Event',
            start_time: startTime,
            end_time: endTime,
            priority: event.priority || 1,
            description: event.description || '',
            location: event.location || ''
        };
    });

    // Use formattedEvents as needed
    console.log("FORMATTED:");
    console.log(formattedEvents);


    var event_names = [];
    for (let i = 0; i < formattedEvents.length; i++) {
        eventInstructions += JSON.stringify(formattedEvents[i], null, 0);
        eventInstructions += '\n'
        event_names.push(formattedEvents[i].title);
    }

    switch (questionType) {
        case 1:
            eventInstructions += 'Events to be Added:\n';
            eventInstructions += microTasks.join('\n');
        break;
        case 2:
            eventInstructions += 'Events to be Added, along with an estimate of how long the user took (in minutes) the last few times to help you with your prediction: \n';
            time_hist = getTaskHistory(user_id, microTasks);
            for (let i = 0; i < time_hist.length; i++){
                eventInstructions += `${time_hist[i].name}: ${(time_hist[i].time_history).join(", ")}`
                eventInstructions += '\n'
            }
        break;
        default:
        console.log("Invalid Question Type");
    }

    eventInstructions += `Only respond with the list of JSON objects, nothing else. The objects must be in order of chronological time, and you must include all the events to be added. Do not add any other events. Do not let any events overlap.`


    var response = await chatGPTRequest(system_prompt, eventInstructions);
    console.log(response);
    console.log(eventInstructions);
    await parseResponse(user_id, response, event_names);

}

/**
 * Updates the timing of a microtask event. Returns void.
 * @param {string} user_id - The unique identifier for the current user
 * @param {string} task_name - Name of task to modify 
 * @param {string} new_start - New start time
 * @param {string} new_end - New end time
 * @param {boolean} isDelete - Whether to delete instead of update
*/
async function scheduleMod(user_id, task_name, new_start, new_end, isDelete) {

    async function parseResponse(user_id, response, microtask_events){

        response = "[" + response.split("[")[1].split("]")[0] + "]"
        const jsonArray = JSON.parse(response);
        console.log(jsonArray);

        for (let i = 0; i < jsonArray.length; i++){
            var event = jsonArray[i]
            if (microtask_events.includes(event.task_name)){
                updateTime(user_id, event.task_name, event.start_time.split(":")[0],  new Date(year, month, day, event.start_time.split(":")[1]).getTime(),  new Date(year, month, day, event.end_time.split(":")[0], event.end_time.split(":")[1]).getTime());
            }
            
        }
    }

    
    var system_prompt = "You are an assistant that provides calendar suggestions for maximum productivity."

    var eventInstructions = `
You are given a set of events in the following format: 

Task Name, Description, Recurring Frequency, Recurring Number, Start Time, End Time

Here is an example with its interpretation:
“Breakfast, Eating and making food, Daily, 1, 12:50, 13:10” means, “The Breakfast events which involves eating and making food, occurs 1 time daily. The event start at 12:50, and ends at 1:10.”

For a particular day, you will be given a set of events that exist, and a set of events that must be added. It is your job to estimate the amount of time these additional events will take, and provide a schedule that includes all existing and desired events. 

You must structure your answer as a list of JSON objects, that have the following keys: 
Task Name, titled task_name
Task Description (less than 10 words), titled task_desc,
Recurring Frequency (can only be one of the following "none", “daily”, “weekly”, “monthly”, “bi-weekly”), titled rec_freq,
Recurring Number, titled rec_num, 
Start Time (must be in the format of “hh:mm” using military time), titled start_time,
End Time (must be in the format of “hh:mm” using military time), titled end_time

Details of Day:
`;

    
    var times = getStartEndTime(user_id);

    eventInstructions += `Day Begins: ${times[0]} \nDay Ends: ${times[1]}\n`;
    eventInstructions += `Here are the existing events:\n`;

    var events = await displayEvents(user_id, day, month, year);
    // var events = getSampleEvents2();

    var event_names = [];
    var microtask_events = [];
    for (let i = 0; i < events.length; i++) {
        eventInstructions += JSON.stringify(events[i], null, 0);
        eventInstructions += '\n'
        event_names.push(events[i].title);
        if (events[i].change == 0){
            microtask_events.push(events[i].title)
        }
    }


    if (isDelete){
        eventInstructions += `There has been a change to the event with task_name ${task_name}, it has now been deleted.`
        if (microtask_events.includes(task_name)){
            microtask_events = microtask_events.filter(item => item !== task_name);
        }
    } else {
        eventInstructions += `There has been a change to the event with task_name ${task_name}, it now has start_time ${new_start} and end_time ${new_end}.`
    }
    
    eventInstructions += `Please reorganize the day's events, to include all current events and account for this new change. You can only move the following task_names: ${microtask_events.join('\n')}`

    eventInstructions += `Only respond with the list of JSON objects, nothing else. The objects must be in order of chronological time, and you must include all the events to be added. Do not add any other events. Make sure this is an Array of JSON objects. Do not let any events overlap.`

    response = await chatGPTRequest(system_prompt, eventInstructions);
    console.log(response)
    await parseResponse(user_id, response, microtask_events);
}