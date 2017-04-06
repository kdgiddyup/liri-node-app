// grab keys for twitter api
var twitterAuth = require("./keys.js");
// get these NPM modules
var Twitter = require("twitter");
var spotify = require("spotify");
var request = require("request");
var omdb = require("omdb");
var inquirer = require("inquirer");
var fs = require("fs");
var command = [];
// set up an object for a later inquirer prompt for which action LIRI should take
var menu = {
        type: "list",
        message: "Ask LIRI to ... ",
        choices: [
            "Show my latest Tweets",
            "Spotify a song",
            "Spill it about a movie",
            "Do whatever it wants",
            "Go away"
        ],
        name: "choice"
};


// we place the action prompt in a standalone function because we'll need it over and over
// get things going by passing the menu object to the start function:
start(menu);

function start(userMenu){
    inquirer.prompt([
        userMenu
    ]).then(function(userChoice){

        // the callback gets the choice and sends it to a switch; 
        //we make the switch a standalone function so we can send commands to it from other branches of code
        inputSwitch(userChoice.choice)
        });
}

function inputSwitch(input) {

    // log each command by its string and a date/time stamp
    log('\n\n************************\nCommand: "'+input+'"\n[at '+new Date().toLocaleString()+']');
    switch (input) {
        case "Go away":
            console.log("Bye Felicia!");
            break;
        case "Show my latest Tweets":
            fTwitter();
            break;
        case "Spotify a song":
            fSpotify();
            break;
        case "Spill it about a movie":
            fOMDB();
            break;
        case "Do whatever it wants":
            fRandom();
            break;
    }
}

// then we code out each action as a function

// twitter function 
function fTwitter(){
    // set up a client object with our authorization keys
    var client = new Twitter(
        twitterAuth.keys
    );

    var params = {screen_name: 'kdavis2001'};
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
        // trim to last 20 elements in the array (here, each element is a tweet objects) with <array>.slice(-20);
        var tweets = tweets.slice(-20);
        // we don't use the normal for-loop order because we want to present the tweets in chronological rather than reverse chronological order
        // that is, the last tweet in the array is the oldest but we want that to show first, numbered "1"
        // but first start a line in the log
        log('\n****OUTPUT****\n');
        for (var i=19;i>-1;i--){
            var output = '\n\nTweet '+(20-i)+': '+tweets[i].text+'\nCreated: '+tweets[i].created_at;
            // output to the screen and log.txt
            console.log(output);
            log(output);
        }
        // goBack() is a function that prompts the user to exit or return to the action menu
        goBack();
    }
    else  
        console.log(error)
    });

}

// spotify function
function fSpotify(){
    // in the user chooses the 'random' option, an array "command" is created that has the contents of random.txt
    // we first check to see if it has values, and use them
    if (command[1] != null) {
        // this was a LIRI choice
        var title = command[1];
        // reset command array
        command = [];
        // do Spotify call
        doSpotify(title); 
    }
    
    // if not letting LIRI choose, we now ask the user what song they want info for
    else {
        inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "And the song is?"
        }
    ]).then(function(query){
        // log the song choice as user input
        log('\nUser input: Search Spotify for "'+query.title+'"');
        var title=query.title;
        if (!title)
            title='The Sign';
        doSpotify(title);
    })
    }
}
// we keep the actual spotify call separate because we come at it from a couple different places
function doSpotify(what){
    spotify.search({ type: 'track', query: what }, function(err, data) {
        if ( err ) {
            console.log('Error occurred: ' + err);
        }
        else {
            // Do something with 'data'
            songData = data.tracks.items;
            
            // usually, spotify returns multiple tracks for a song title search, up to 20 per call
            // here we tell user results and seek input on how many results to show 
           
            console.log('\nWe found at least '+songData.length+' possible matches for "'+what+'".\n');
            
            var numToList = inquirer.prompt([
                {
                    type: 'input',
                    name: 'numSongs',
                    message: 'Show how many?'
                }   
            ]).then(function(trackCount){
                // log response as user input
                log('\nUser input: Show '+trackCount.numSongs+' results');
                // separate the actual console logging so we can send the songData array; otherwise it is undefined in this callback function
                displaySongs(songData,trackCount.numSongs);
                });  // end spotify request call
            }
    });
} // end doSpotify function

function displaySongs(songArray, searchNum){
    // start a line in the log.txt file
    log('\n\n****OUTPUT****\n');
  
    // reduce songData array (now an argument called songArray) by number of songs user inputs
    // 1. parse input as an integer called tracksToShow
    var tracksToShow = parseInt(searchNum);
    
    // 2. error checking
    // if greater than tracks available, set to tracks available
    if (tracksToShow > songArray.length) {
        tracksToShow = songArray.length
    }

    // or, if user inputs 0 or negative, set tracksToShow to 1 
    else if (tracksToShow <= 0) {
        tracksToShow = 1;
    }
    
    // reduce songData array to this length
    var songArray = songArray.slice(0,tracksToShow);
   
    // loop through tracks and output to screen and log.txt
    for (var i=0;i<songArray.length;i++){
        var output = '\nTrack '+(i+1)+'\n**********\nArtist(s): '+songArray[i].album.artists[0].name+'\nPreview URL: '+songArray[i].preview_url+'\nAlbum: '+songArray[i].album.name+'\n';
        console.log(output);
        log(output);
    }
    // return to exit/return prompt
    goBack();
} // end displaySongs function

// OMDB function
function fOMDB(){
    // in case we want our random choice to make a movie call, check that command array:
    if (command[1] != null) {
        // this was a LIRI choice
        var movie = command[1];
        // reset command array
        command = [];
        doMovie(movie)
    }
    // otherwise, get user's input on which movie to search for
    else {
        inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "And the movie is?"
        }
    ]).then(function(query){
        
        // log movie title as user input
        log('\nUser input: Search OMBD for movie "'+query.title+'"');
        var title=query.title
        
        // in case user enters no title we have a default choice
        if (title == '')
            title = "Mr. Nobody";
        doMovie(title)    
        });
    }
}

// as with spotify, separate the omdb call since we come to it from more than one place
function doMovie(what){
    omdb.get(what,{tomatoes:true}, function(err, movies) {
        if(err) {
            return console.error(err);
        }
        // 'movies' is the response object; display relevant values from it:
        else {
            log('\n****OUTPUT****\n');
            var output = 'Top result\n"'+movies.title+'"\nYear: '+movies.year+'\nIMDB rating: '+movies.imdb.rating+'\nWhere produced: '+movies.countries.toString()+'\nPlot summary: '+movies.plot; 
            if (movies.tomato){
                output+= '\nRotten Tomatoes rating: '+movies.tomato.rating+'\nRotten Tomatoes link: '+ movies.tomato.url
            };
            console.log(output);
            log(output);
            };
        // return to exit/go again prompt
        goBack();
    })
}

// random command function
function fRandom(){
    // look at random.txt
    fs.readFile('./random.txt','utf8',function(err,text){
        if(err)
            console.log('There was a problem: '+err)
        else {
            // parse text file to obtain LIRI's stored command
            command = text.split(',');
            // send stored command to input switch
            inputSwitch(command[0]);
        }
    })
}
// prompt to allow user to exit LIRI or take additional actions
function goBack(){
    inquirer.prompt([
        {
        type: 'confirm',
        name: 'confirm',
        message: 'Go again?',
        default: true
        }
    ]).then(function(goBack){
        // if user wishes to continue, send them back to start menu, otherwise script exits to command line
        if (goBack.confirm)
            start(menu)
    })
}

function log(command){
    // append passed-in command or user input to 'log.txt'; if log.txt doesn't exist, it will be created
    fs.appendFile('log.txt',command,function(err){
        if (err)
            console.log('/nThere was a logging error. Message: '+err)
    });
}