"use strict";
var MainController = (function () {
    //
    function MainController() {
        // The initialize function must be run each time a new page is loaded
        Office.initialize = function (reason) {
            $(document).ready(function () {
                // Use this to check whether the new API is supported in the Word client.
                if (Office.context.requirements.isSetSupported("WordApi", 1.2)) {
                    console.log("This code is using Word 2016 or greater.");
                }
                else {
                    // Just letting you know that this code will not work with your version of Word.
                    console.log("This add-in requires the WordAPI 1.2 requirement set or greater. Check your version of Word and the requirement set version.");
                }
                var url = location.href;
                var path = location.pathname;
            });
        };
    }
    return MainController;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MainController;
//export = MainController;
