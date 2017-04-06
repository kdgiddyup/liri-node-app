// grab keys for twitter api
var twitterAuth = require("./keys.js");
var Twitter = require("twitter");
var spotify = require("spotify");
var request = require("request");
var omdb = require("omdb");
var inquirer = require("inquirer");
var fs = require("fs");
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
    var client = new Twitter(
        twitterAuth.keys
    );

    var params = {screen_name: 'kdavis2001'};
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
        // trim to last 20 elements in the array (here, tweet objects) with <array>.slice(-20);
        var tweets = tweets.slice(-20);
        for (var i=19;i>-1;i--){
            console.log('\n\nTweet '+(20-i)+': '+tweets[i].text);
            console.log('Created: '+tweets[i].created_at)
        }
        goBack();
    }
    else  
        console.log(error)
    });

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
        if (!title)
            title='The Sign';
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
            songData = data.tracks.items;
            console.log('\nWe found at least '+songData.length+' possible matches for "'+what+'".\n');
            
            var numToList = inquirer.prompt([
                {
                    type: 'input',
                    name: 'numSongs',
                    message: 'Show how many?'
                }   
            ]).then(function(trackCount){
                displaySongs(songData,trackCount.numSongs);
                });  // end spotify request call
            }
    });
} // end doSpotify function

function displaySongs(songArray, searchNum){
    // reduce songData array by number of songs user inputs
    // 1. parse input as an integer called tracksToShow
    var tracksToShow = parseInt(searchNum);
    
    // error checking: if greater than tracks available, set to tracks available
    if (tracksToShow > songArray.length) {
        tracksToShow = songArray.length
    }

    // or, if user inputs 0 or negative, set tracksToShow to 1 
    else if (tracksToShow <= 0) {
        tracksToShow = 1;
    }
    
    // reduce songData array to this length
    var songArray = songArray.slice(0,tracksToShow);
        
    for (var i=0;i<songArray.length;i++){
    console.log(' Track '+(i+1)+'\n**********\nArtist(s): '+songArray[i].album.artists[0].name+'\nPreview URL: '+songArray[i].preview_url+'\nAlbum: '+songArray[i].album.name+'\n\n')
    }
    // return to main menu
    goBack();
} // end displaySongs function

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
        if (title == '')
            title = "Mr. Nobody";
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