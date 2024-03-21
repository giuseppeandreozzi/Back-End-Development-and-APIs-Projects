const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require("mongoose");
require('dotenv').config()


app.use(cors({
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

app.use(express.urlencoded({extended: false}));

const userSchema = mongoose.Schema({
  username: String,
  exercise: [{
    description: String,
    duration: Number,
    date: Date
  }]
});

const User = mongoose.model("user", userSchema);

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', async (req, res) => {
  let users = await User.find();

  for (let user of users){
    delete user.exercise
  }

  res.json(users);
});

app.post('/api/users', async (req, res) => {
  let user = new User({
    username: req.body.username
  });

  let userSaved = await user.save();

  res.json({username: userSaved.username, _id: userSaved._id});
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  let user = await User.findOne({_id: req.params._id});

  let date = (req.body.date) ? new Date(req.body.date) : new Date();
  user.exercise.push({
    description: req.body.description,
    duration: Number(req.body.duration),
    date: date
  });

  let userSaved = await user.save();

  res.json({username: userSaved.username, description: req.body.description, duration: Number(req.body.duration), date: date.toDateString(), _id: userSaved._id});
});

app.get('/api/users/:_id/logs', async (req, res) => {
  let fromDate = (req.query.from) ? new Date(req.query.from) : new Date(0, 0, 0);
  let toDate = (req.query.to) ? new Date(req.query.to) : new Date();
  var exercises = [];

  let user = await User.findOne({_id: req.params._id});
  let limit = (req.query.limit) ? Number(req.query.limit) : user.exercise.length;
  for(let exercise of user.exercise){
    if(limit == 0)
      break;

    if(exercise.date >= fromDate && exercise.date <= toDate){
      exercises.push({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString()
      });
      limit--;
    }
  }

  res.json({username: user.username, count: user.exercise.length, _id: user._id, log: exercises});
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
  });
});
