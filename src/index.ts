//require('./index.html');

// import angular = require('angular');
// import angularRoute = require('angular-route');
import angular from 'angular';
import angularRoute from 'angular-route';
angular.module("app", [angularRoute]);

//import mainController = require("./app/main.controller");
import mainController  from "./app/main.controller";
angular.module("app").controller("app.MainController", mainController );

//import homeController = require('./app/home/home.controller');
import homeController from './app/home/home.controller';
angular.module("app").controller("app.HomeController", homeController);

//import demoController =  require('./app/demo/demo.controller');
import demoController  from './app/demo/demo.controller';


angular.module("app").controller("app.DemoController", demoController);

config.$inject = ["$routeProvider","$locationProvider"];

function config($routeProvider: ng.route.IRouteProvider, $locationProvider: ng.ILocationProvider) {
    // Configure the routes.
    $routeProvider
        .when("/home", {
            templateUrl: './app/home/home.html',
            controller: homeController,
            controllerAs: "vm"
        })
        .when("/demo", {
            templateUrl: './app/demo/demo.html',
            controller: demoController,
            controllerAs: "vm"
        })
        .otherwise({
            redirectTo: "/home"
        })

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}
angular.module("app").config(config);
