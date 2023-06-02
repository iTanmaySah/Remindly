require('dotenv').config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

//APP config
const app = express()  
app.use(express.json()) //to use json
app.use(express.urlencoded()) //to use url encoded, while calling api
app.use(cors()) 

//database config
mongoose.connect('mongodb://127.0.0.1:27017/reminderAppDB',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//now we create a schema for reminder
//using that schema we create a model using which we will do CRUD operations
const reminderSchema = new mongoose.Schema({
    reminderMsg: String,
    remindAt: String,
    isReminded: Boolean
})

//now model:
const Reminder = new mongoose.model("reminder", reminderSchema)

//whatsapp reminding functionality
setInterval(async () => {
  try {
    const reminderList = await Reminder.find({});
    if (reminderList) {
      await Promise.all(
        reminderList.map(async reminder => {
          if (!reminder.isReminded) {
            const now = new Date();
            if ((new Date(reminder.remindAt) - now) < 0) {
              await Reminder.findByIdAndUpdate(reminder._id, { isReminded: true });

              const accountSid = process.env.ACCOUNT_SID;
              const authToken = process.env.AUTH_TOKEN;
              const client = require('twilio')(accountSid, authToken);

              const message = await client.messages.create({
                body: reminder.reminderMsg,
                from: 'whatsapp:+14155238886',
                to: 'whatsapp:+918171097122'
              });

              console.log(message.sid);
            }
          }
        })
      );
    }
  } catch (err) {
    console.log(err);
  }
}, 60000);




//now, specify route to the backend using app.get / app.post
//API routes
//1. find all reminders added by user
app.get("/getAllReminder", async (req, res) => {
    try {
      const reminderList = await Reminder.find({});
      res.send(reminderList); //send the reminder list to frontend
    } catch (err) {
      console.log(err);
    }
  });
  

//2. addreminder msg and time to db and store it in db
app.post("/addReminder", (req, res) => {
  const { reminderMsg, remindAt } = req.body;

  // Check if any field is empty
  if (!reminderMsg || !remindAt) {
    alert('button click catched')
    return res.status(400).json({ error: "All fields are required" });
  }

  const reminder = new Reminder({
    reminderMsg,
    remindAt,
    isReminded: false
  });

  reminder
    .save()
    .then(() => Reminder.find({}).maxTimeMS(20000))
    .then(reminderList => {
      res.send(reminderList); // send the updated reminder list to frontend
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: "Failed to add reminder" });
    });
});

  

  app.post("/deleteReminder", (req, res) => {
    Reminder
      .deleteOne({ _id: req.body.id })
      .then(() => Reminder.find({}).maxTimeMS(20000))
      .then(reminderList => {
        res.send(reminderList); //send the updated reminder list to frontend
      })
      .catch(err => {
        console.log(err);
      });
  });
  


app.listen(9000, () => console.log("BE started"))