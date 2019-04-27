const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const server = express();
const dbname = 'IMDBLocal';
const dbroute = 'mongodb://localhost:27017/${dbname}';                // URL to DB

let db;
MongoClient.connect(dbroute, (err, client) => {                       // start express server after connection to DB
  if (err) throw err;
  db = client.db(dbname);
  server.listen(8080, () => console.log('Listening on port 8080}'));  // start the server on port 8080
});

// ENDPOINTS

server.get('/api/movies', (req, res) => {                             // retrieve all movies from DB
  db.collection('movies').find().toArray((err, result) => {
    if (err) throw err;

    console.log(result);
    res.send(result);
  });
});



// retrieve user with specific ID from DB
server.get('/api/users/:id', (req, res) => {
  db.collection('users').findOne({_id: new ObjectID(req.params.id) }, (err, result) => {
    if (err) throw err;

    console.log(result);
    res.send(result);
  });
});

// delete user with specific ID from DB
server.delete('/api/users', (req, res) => {
  db.collection('users').deleteOne( {_id: new ObjectID(req.body.id) }, err => {
    if (err) return res.send(err);

    console.log('deleted from database');
    return res.send({ success: true });
  });
});

// create new user based on info supplied in request body
server.post('/api/users', (req, res) => {
  db.collection('users').insertOne(req.body, (err, result) => {
    if (err) throw err;

    console.log('created in database');
    return res.send({ success: true });
    // res.redirect('/');
  });
});

// update user based on info supplied in request body
server.put('/api/users', (req, res) => {
  // get the ID of the user to be updated
  const id  = req.body._id;
  // remove the ID so as not to overwrite it when updating
  delete req.body._id;
  // find a user matching this ID and update their details
  db.collection('users').updateOne( {_id: new ObjectID(id) }, {$set: req.body}, (err, result) => {
    if (err) throw err;

    console.log('updated in database');
    return res.send({ success: true });
  });
});
