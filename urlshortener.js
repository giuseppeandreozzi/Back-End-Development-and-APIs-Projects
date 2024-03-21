require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require("dns");
var site = [];

const port = process.env.PORT || 3000;

app.use(cors({ optionsSuccessStatus: 200 }));

app.use(express.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', function(req, res) {
  let re = /https?:\/\/[A-Za-z0-9]+.[A-Za-z0-9]+[.]*/;
  if(!re.test(req.body.url))
    return res.json({ error: 'invalid url' });

  let indexOfLastSlash = req.body.url.search(/\/\//) + 2;

  dns.lookup(req.body.url.slice(indexOfLastSlash), {family: 4}, (err, address, family) => {
    site.push(req.body.url);
    res.json({ original_url: req.body.url, short_url: site.length });
  })

});

app.get('/api/shorturl/:number', function(req, res) {
  return res.redirect(site[Number(req.params.number) - 1]);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
