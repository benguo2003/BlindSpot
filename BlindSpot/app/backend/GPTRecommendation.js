import {FIREBASE_DB, chatGPTRequest} from './FirebaseConfig';
import {addEvent} from './addEvent';
import {updateTime, displayEvents} from './updateEvent';


/* 
  For each microtask we suggest, we gather information on how long it actually took our user to complete the task.
  In this function, given a string list of microtasks, we pull from DB the last 3 recorded times it took our user to 
  complete the task. If there less than 3 times recorded, pull whatever is there.
  
  Then, we put this information into a list of JSON objects (look at sample output below)

  Sample JSON Object:

  {
    "name": "Laundry",
    "time_history": [15, 20, 18]
  }

  This means in the last 3 occurences of this microtask, it took the user 15 min, 20 min, and 18 min. The LLM will use this info to suggest 
  an event start and end time.
*/
function getTaskHistory(user_id, micro_tasks){
  
    // sample output
    var events = [
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
    ]
  
    return events;
  }
  
function getSampleEvents(){

    var sample_events = [
        { 
            "task_name": "1:1 Sraavya / Jake", 
            "task_desc": "Meeting with Manager", 
            "rec_freq": "bi-weekly",
            "rec_num": 1,
            "start_time": "13:30",
            "end_time": "14:00"
        },
        { 
            "task_name": "Dinner with Friends", 
            "task_desc": "Meeting at Killer Noodle", 
            "rec_freq": "none",
            "rec_num": 0,
            "start_time": "17:00",
            "end_time": "20:00"
        } 
    ]

    return sample_events;

}
  
/*
    Query the DB to get the user's preferred start (wake) and end (sleep) time. 
    We should gather this information when the user first joins the app.
*/
function getStartEndTime(user_id){

    // sample response
    var start_time = "07:00";
    var end_time = "23:00";

    return [start_time, end_time];
}


/*
    Inputs: 
    (1) user_id (tells us who's calendar we want)
    (2) questionType: The options are 1, 2, and 3
        1 is for the initial microtask suggestion, where we do not have any prior information about the user to provide
        2 is for task suggestion with some history (this is where we use getTaskHistory() func for better recommendations)
    (3) microTasks: This is a string array of all the microtasks we want to add for a given day.
*/
async function askGPT(user_id, questionType, microTasks, day, month, year) {

    async function parseResponse(user_id, response, event_names){

        const jsonArray = JSON.parse(response);
        for (let i = 0; i < jsonArray.length; i++){
            var event = jsonArray[i]
            if (!event_names.includes(event.task_name)){
                addEvent(user_id, 
                        null, // event id
                        event.task_name, 
                        event.task_desc, 
                        null, // location
                        (event.rec_freq === "none") ? false : true,
                        (event.rec_freq === "none") ? null : event.rec_freq, 
                        (event.rec_freq === "none") ? 0 : event.rec_num, 
                        event.start_time, 
                        event.end_time)
            }
            
        }
    
    }

    system_prompt = "You are an assistant that provides calendar suggestions for maximum productivity."

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

    var events = displayEvents(user_id, day, month, year);
    var event_names = [];
    for (let i = 0; i < events.length; i++) {
        eventInstructions += JSON.stringify(events[i], null, 0);
        eventInstructions += '\n'
        event_names.append(events[i].title);
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

    eventInstructions += `Only respond with the list of JSON objects, nothing else. The objects must be in order of chronological time.`

    response = chatGPTRequest(eventInstructions);
    return parseResponse(user_id, response, event_names);

}

/*
    Inputs: 
    (1) user_id (tells us who's calendar we want)
    (2) task_name: This is the event that was modified
    (3) new_start: The new start time
    (4) new_end: The new end time
    (5) isDelete: true/false value, if the event has been deleted or not
*/
async function scheduleMod(user_id, task_name, new_start, new_end, isDelete) {

    async function parseResponse(user_id, response, microtask_events){

        const jsonArray = JSON.parse(response);
        for (let i = 0; i < jsonArray.length; i++){
            var event = jsonArray[i]
            if (microtask_events.includes(event.task_name)){
                updateTime(user_id, event.task_name, event.start_time, event.end_time);
            }
            
        }
    
    }

    
    system_prompt = "You are an assistant that provides calendar suggestions for maximum productivity."

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

    var events = displayEvents(user_id, day, month, year);
    var event_names = [];
    var microtask_events = [];
    for (let i = 0; i < events.length; i++) {
        eventInstructions += JSON.stringify(events[i], null, 0);
        eventInstructions += '\n'
        event_names.append(events[i].title);
        // TODO: If a task is a microtask, append its name to the microtasks array
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

    eventInstructions += `Only respond with the list of JSON objects, nothing else. The objects must be in order of chronological time.`

    response = chatGPTRequest(eventInstructions);
    return parseResponse(user_id, response, event_names);
}
  

  
//   askGPT(null, 1, ["Laundry", "Folding Clothes, Dishes"]);
//   askGPT(null, 2, ["Laundry", "Folding Clothes, Dishes"]);
  
  
  