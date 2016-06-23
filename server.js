var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var CONTACTS_COLLECTION = "contacts";

var app = express();
app.use(express.static(__dirname + "/app"));
app.use(bodyParser.json());

var db;
var connection_host = 'localhost/contactlist';
var connection_port = process.env.OPENSHIFT_MONGODB_DB_PORT || process.env.PORT || 8080;

if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_host = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
    process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
    process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
    process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
    process.env.OPENSHIFT_APP_NAME;
}

mongodb.MongoClient.connect('mongodb://'+ connection_host, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  db = database;
  console.log("Database conectado!\n", "Basename "+ db.s.databaseName);

  var server = app.listen(connection_port, function () {
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