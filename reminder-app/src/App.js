import './App.css';
import React, {useState, useEffect} from "react"
import axios from "axios" //to call apis
import DateTimePicker from 'react-datetime-picker'
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';

function App() {

  const[reminderMsg, setReminderMsg] = useState("")
  const[remindAt, setRemindAt] = useState()
  const[reminderList, setReminderList] = useState([])

  useEffect(() => {
    axios.get("http://localhost:9000/getAllReminder").then(res => setReminderList(res.data))
  }, []) //if any change in variable inside, then function is called, if kept empty then at loading of component

  const addReminder = () => {
    axios.post("http://localhost:9000/addReminder",{reminderMsg, remindAt})
    .then(res => setReminderList(res.data)) 
    setReminderMsg ("")
    setRemindAt("")
  }

  const deleteReminder = (id) => {
      axios.post("http://localhost:9000/deleteReminder",{id})
      .then(res => setReminderList(res.data)) //reupdate the list
  }

  return (
    <div className="App">
      <div className = "homepage">
        
        <div className="homepage_header">

          <h1> REMIND ME </h1>
          <input type = "text" placeholder = "Add Reminder Description" value ={reminderMsg} onChange={e => setReminderMsg(e.target.value)}/>
          <DateTimePicker
            value = {remindAt}
            onChange={setRemindAt}
            minDate={new Date()} //present to future, no past dates allowed
            minutePlaceholder="mm"
            hourPlaceholder="hh"
            dayPlaceholder="DD"
            monthPlaceholder="MM"
            yearPlaceholder="YYYY"
          />
          <div className="button" onClick={addReminder}>Add Reminder</div>
        </div>

        <div className="homepage_body">
        {
          reminderList.map(reminder => (
            <div className = "reminder_card" key={reminder._id}>
            <h2>{reminder.reminderMsg}</h2>
            <p>{String(new Date(reminder.remindAt.toLocaleString(undefined, {timezone:"Asia/Kolkata"})))}</p>
            <div className="button" onClick = {() => deleteReminder(reminder._id)}>Delete</div>
          </div>
          ))
        }
          
        </div>
      </div>
    </div>
  );
}

export default App;
