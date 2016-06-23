angular.module('app', ['ngRoute'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: "views/list.html",
        controller: "ListController",
        resolve: {
          contacts: function (ServiceContacts) {
            return ServiceContacts.getContacts();
          }
        }
      })
      .when("/new-contact", {
        controller: "NewContactController",
        templateUrl: "views/new-contact.html"
      })
      .otherwise({redirectTo: '/'});
  })
  .service("ServiceContacts", function ($http) {

    this.getContacts = function () {
      return $http.get("/contacts").then(function (response) {
        return response;
      }, function (response) {
        alert("Error retrieving contacts.");
      });
    };

    this.createContact = function (contact) {
      return $http.post('/contacts', contact).then(function (resp) {
        return resp;
      }, function (resp) {
        console.log("Erro não foi possivel criar o contato.");
      });
    };
  })
  .controller("ListController", function (contacts, $scope) {
    $scope.contacts = contacts.data;
  })
  .controller("NewContactController", function ($scope, ServiceContacts) {
    
    $scope.newContact = function (contact) {
      ServiceContacts.createContact(contact)
        .then(function (resp) {
          console.log('contato registrado com sucesso!');
        }, function (resp) {
          console.log('Erro na inclusao!');
        })
    }
    
  })

;
