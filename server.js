var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
var CONTACTS_COLLECTION = "contacts";

var app = express();
app.use(express.static(__dirname + "/app"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect('mongodb://'$OPENSHIFT_MONGODB_DB_HOST:$OPENSHIFT_MONGODB_DB_PORT/*'mongodb://localhost/contactlist'*/, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database conectado!");

  // Initialize the app.
  var server = app.listen($OPENSHIFT_MONGODB_DB_PORT /*process.env.PORT */ || 8080, function () {
    var port = server.address().port;
    console.log("App funcionando na porta", port);
  });
});

// RestFul API - Lista de contatos

function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/contacts"
 *    GET: listar todos os contatos
 *    POST: novo contato
 */

app.get("/contacts", function (req, res) {
  db.collection(CONTACTS_COLLECTION).find({}).toArray(function (err, docs) {
    if (err) {
      handleError(res, err.message, "Error get contatos");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post("/contacts", function (req, res) {
  var newContact = req.body;
  newContact.createDate = new Date();

  if (!(req.body.firstName || req.body.lastName)) {
    handleError(res, "Campos obrigatorios", "Preencher nome ou sobrenome.", 400);
  }

  db.collection(CONTACTS_COLLECTION).insertOne(newContact, function (err, doc) {
    if (err) {
      handleError(res, err.message, "Erro ao criar o novo contato.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});