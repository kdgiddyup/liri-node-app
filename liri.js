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
var q1 = {
        type: "list",
        message: "Ask LIRI to ... ",
        choices: [
            "show my latest Tweets",
            "provide Spotify a song",
            "spill it about a movie",
            "do whatever it wants",
            "go away"
        ],
        name: "choice"
    };
inquirer.prompt([
    q1
    // the promise callback checks the choice object (sent in as'input') with a switch
]).then(function(input) {
    console.log(input.choice);
    switch (input.choice) {
        case "go away":
            console.log("Bye Felicia!");
            break;
        case "show my latest Tweets":
            fTwitter();
            break;
        case "provide Spotify a song":
            fSpotify();
            break;
        case "spill it about a movie":
            fOMDB();
            break;
        case "do whatever it wants":
            fRandom();
            break;
    }
});

// twitter function 
function fTwitter(){
    console.log("Twitter stuff");
}

// spotify function
function fSpotify(){
    console.log("Spotify stuff");
}

// OMDB function
function fOMDB(){
    console.log("OMDB stuff");
}

// random runction
function fRandom(){
    console.log("Random stuff");
}