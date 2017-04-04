// grab keys for twitter api
var keys = require("./keys.js");
var twitter = require("twitter");
var spotify = require("spotify");
var request = require("request");
var inquirer = require("inquirer");
/* commands are:
my-tweets
spotify-this-song
movie-this
do-what-it-says
*/

// start with an inquirer prompt for LIRI's action to take
var choice = {
        type: "list",
        message: "Ask LIRI to ... ",
        choices: [
            "show my latest Tweets",
            "provide Spotify a song",
            "spill it about a movie",
            "do whatever it wants"
        ],
        name: "choice"
    };
inquirer.prompt([
    choice
]);


