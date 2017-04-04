// grab keys for twitter api
var twitterClient = require("./keys.js");
var twitter = require("twitter");
var spotify = require("spotify");
var request = require("request");
var omdb = require("omdb");
var inquirer = require("inquirer");
var fs = require("fs");
var Base64 = require("Base64");
var command = [];

// start with an inquirer prompt for LIRI's action to take
var menu = {
        type: "list",
        message: "Ask LIRI to ... ",
        choices: [
            "show my latest Tweets",
            "Spotify a song",
            "spill it about a movie",
            "do whatever it wants",
            "go away"
        ],
        name: "choice"
};

start(menu);

function start(userMenu){
    inquirer.prompt([
        userMenu
        // the promise callback sends the choice object (as'input') with a switch; 
        //we make the switch a standalone function so we can send  commands to it from other branches of code
    ]).then(function(userChoice){
        inputSwitch(userChoice.choice)
        });
}
function inputSwitch(input) {
    switch (input) {
        case "go away":
            console.log("Bye Felicia!");
            break;
        case "show my latest Tweets":
            fTwitter();
            break;
        case "Spotify a song":
            fSpotify();
            break;
        case "spill it about a movie":
            fOMDB();
            break;
        case "do whatever it wants":
            fRandom();
            break;
    }
}

// twitter function 
function fTwitter(){
    var auth = new Buffer(encodeURI(twitterClient.twitterKeys.consumer_key)+':'+encodeURI(twitterClient.twitterKeys.consumer_secret)).toString('base64');

    request({
        headers: {
        'Authorization': 'Basic '+auth,
        'Content_Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: 'grant_type=client_credentials',
        uri: 'https://api.twitter.com/oauth/request_token',
        method: 'POST'
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                console.log('Body: '+ body)
            }
            else
                console.log('Error: '+error)
  });

/*

    var queryUrl ="https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=kdavis2001&count=20";
    request(queryUrl,function(error, response, body){
        // success
        if (!error && response.statusCode === 200) {
            body = JSON.parse(body);
            console.log(body);
        }
        else 
            console.log('Error: '+error)
    })

    */
}

// spotify function
function fSpotify(){
    if (command[1] != null) {
        // this was a LIRI choice
        var title = command[1];
        // reset command array
        command = [];
        // do Spotify call
        doSpotify(title); 
        }
    else {
        inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "And the song is?"
        }
    ]).then(function(query){
        var title=query.title;
        doSpotify(title);
    })
    }
}
function doSpotify(what){
    spotify.search({ type: 'track', query: what }, function(err, data) {
        if ( err ) {
            console.log('Error occurred: ' + err);
        }
        else {
            // Do something with 'data'
           
            var songData = data.tracks.items[0];
            console.log('**********');
            console.log('Top result');
            console.log('Artist(s): '+songData.album.artists[0].name);
            console.log('Preview URL: '+songData.preview_url);
            console.log('Album: '+songData.album.name)
        }
        goBack();
        });
}

// OMDB function
function fOMDB(){
    if (command[1] != null) {
        // this was a LIRI choice
        var movie = command[1];
        // reset command array
        command = [];
        doMovie(movie)
    }
    else {
        inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "And the movie is?"
        }
    ]).then(function(query){
        var title=query.title
        doMovie(title)    
        });
    }
}

function doMovie(what){
    omdb.get(what,{tomatoes:true}, function(err, movies) {
        if(err) {
            return console.error(err);
        }
        else {
            console.log('**********');
            console.log('Top result');
            console.log('"'+movies.title+'"');
            console.log('Year: '+movies.year);
            console.log('IMDB rating: '+movies.imdb.rating);
            console.log('Where produced: '+movies.countries.toString());
            console.log('Plot summary: '+movies.plot)
            if (movies.tomato){
                console.log('Rotten Tomatoes rating: '+movies.tomato.rating);
                console.log('Rotten Tomatoes link: '+ movies.tomato.url)
            };
        goBack();
        }
    })
}

// random function
function fRandom(){
    fs.readFile('./random.txt','utf8',function(err,text){
        if(err)
            console.log('There was a problem: '+err)
        else {
            // read text file to obtain LIRI's stored command
            command = text.split(',');
            // send stored command to inputSwitch
            inputSwitch(command[0]);
        }
    })
    
}
function goBack(){
    inquirer.prompt([
        {
        type: 'confirm',
        name: 'confirm',
        message: 'Start over?',
        default: true
        }
    ]).then(function(goBack){
        if (goBack.confirm)
            start(menu)
    })
}