const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const bodyParser = require('body-parser');

const server = express();
const dbname = 'IMDBLocal';

server.use(express.static('dist'));

const dbroute = process.env.DB_URL                            // URL to DB
    || `mongodb://localhost:27017/${dbname}`;

let db;
MongoClient.connect(dbroute, (err, client) => {               // start express server after connection to DB
   if (err) throw err;
   db = client.db(dbname);
   server.listen(process.env.PORT || 8080, () => console.log(`Started on ${process.env.PORT}`));        // start server
});

server.use(bodyParser.urlencoded({extended: false}));         // used to parse the request body (api request may not work without it)
server.use(bodyParser.json());

server.get('/api/movies', (req, res) => {                     // endpoint to retrieve all movies from DB
   db.collection('movies').find().toArray((err, result) => {
      if (err) throw err;
      res.send(result);
   });
});

server.put('/api/movies', (req, res) => {                     // endpoint to update movie based on info supplied in request body
   const id = req.body._id;
   delete req.body._id;

   db.collection('movies').updateOne({_id: new ObjectID(id)},
      {$set: {'info.runtime': req.body.runtime}},             // update nested property 'runtime'
      (err) => {
         if (err) throw err;
         console.log('Updated in DB');
         return res.send({success: true});
      }
   );
});

