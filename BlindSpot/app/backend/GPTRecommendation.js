// const { FIREBASE_DB, chatGPTRequest } = require('./FirebaseConfig');

function getTaskHistory(user_id, tasks){
    // given a list of tasks (param), pull the time it took the user to complete task the last 3 or less times
  
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
  
  function getEvents(user_id){
  
      // try{
      //     const userRef = doc(FIREBASE_DB, 'users', user_id);
      //     const userSnap = await getDoc(userRef);
      //     const calendar_id = userSnap.data().calendar_id;
  
      //     const events_query = query(
      //         collection(FIREBASE_DB, 'events'),
      //         where('calendar_id', '==', calendar_id),
      //     );
      //     const querySnapshot = await getDocs(events_query);
      //     querySnapshot.forEach(async (eventDoc) =>{
              
      //     });
      //     return {
      //         success: true,
      //         message: `Events parsed successfully.`,
      //     };
      // } catch(error){
      //     console.log("Error getting events: ", error);
      //     return {
      //         success: false,
      //         message: "An error occurred while getting the event",
      //     };
      // }
  
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
  
  function getStartEndTime(user_id){
      // get the users start and end time (wake up/sleep)
  
      // sample response
      var start_time = "07:00";
      var end_time = "23:00";
  
      return [start_time, end_time];
  }
  
  async function askGPT(user_id, questionType, microTasks) {
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
  
      var events = getEvents(user_id);
      for (let i = 0; i < events.length; i++) {
          eventInstructions += JSON.stringify(events[i], null, 0);
          eventInstructions += '\n'
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
  
      console.log(eventInstructions)  
  }
  
  
  async function parseResponse(response){
  
  }
  
  askGPT(null, 1, ["Laundry", "Folding Clothes"]);
  askGPT(null, 2, ["Laundry", "Folding Clothes"]);
  
  
  