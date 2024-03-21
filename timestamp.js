var express = require('express');
var app = express();

var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

app.use(express.static('public'));

app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get("/api/:date?", function (req, res) {
  let date;
  try{
    if(req.params.date)
      date = new Date((isNaN(req.params.date)) ? req.params.date : Number(req.params.date));
    else
      date = new Date();

      if(!date.valueOf())
        throw new Error();

    res.json({unix: date.valueOf(), utc: date.toUTCString()});
  }catch(err){
    res.json({ error : "Invalid Date" });
  }
});

var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
