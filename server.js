require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
var mongoose = require('mongoose');
const dns = require('dns');
const urlparser = require('url')
const { Schema } = mongoose;

const uri = process.env['MONGO_URI']

mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });

console.log(mongoose.connection.readyState)

const modelSchema = new Schema ({ url: 'string'
})

const UrlTest= mongoose.model('UrlTest', modelSchema);

mongoose.connection.on('error', function(error) {
  console.log(error);
});
mongoose.connection.on('open', function() {
  console.log('Connected to MongoDB database.');
});

app.use(bodyParser.urlencoded({ extended: false}));
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', async function(req, res) {
  console.log(req.body)
  const bodyurl = req.body.url

  const something = dns.lookup(urlparser.parse(bodyurl).hostname, (error, address)=> {
    if(!address) {
      res.json({ error: "Invalid URL" })
    } else {
      const url = new UrlTest({url: bodyurl})
      url.save((err, data)=>{
        res.json({original_url: data.url , short_url: data.id })
      })
    }
  })

});

app.get("/api/shorturl/:id", (req, res)=> {
  const id = req.params.id;
  UrlTest.findById(id, (err, data)=> {
    if(!data){
      res.json({error: "Invalid URL"})
    } else {
      res.redirect(data.url)
    }
  })
}) 

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
