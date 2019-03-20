let axios = require('axios');
let moment = require('moment')
let keys = require("./keys.js");
let Spotify = require('node-spotify-api');
let fs = require('fs');

let userInput = process.argv[2].toLowerCase();
let userQuery = process.argv[3];

let spotify = new Spotify({
  id:keys.SPOTIFY_ID,
  secret:keys.SPOTIFY_SECRET
});
 
const spotifySearch = function(){
    spotify.search({ type: 'track', query: userQuery }, function(err, data) {
        if (err) {
          return console.log('Error occurred: ' + err);
        }
        console.log(`
            ${userQuery} returned: ${data.tracks.items[0].name}
            by: ${data.tracks.items[0].artists[0].name}
            from the album: ${data.tracks.items[0].album.name}
            check it on spotify: ${data.tracks.items[0].external_urls.spotify}
        `);
    });
}

const concertThis = function() {
    axios.get("https://rest.bandsintown.com/artists/" + userQuery + "/events?app_id=" + keys.BAND_KEY).then(
        function(response) {
            console.log(`
                ${userQuery} 's Next Gig is
                ${moment(response.data[0].datetime).format("MMM Do YYYY")}; 
                at
                ${response.data[0].venue.name}
                in
                ${response.data[0].venue.city}
                ${response.data[0].venue.country}
            `)    
        }
        ).catch(function (error) {
            console.log(error);
        });
};

const movieThis = function(){
    axios.get(`http://www.omdbapi.com/?t=${userQuery}&y=&plot=short&apikey=${keys.OMDB_KEY}`).then(
        function(response) {
            let actors = response.data.Actors.split(",").join(" ");
            // console.log(response.data);
            console.log(`
            Your search of ${userQuery} returned the film  - ${response.data.Title}
            made in: ${response.data.Year} from ${response.data.Country}
            language: ${response.data.Language} 
            staring: ${actors}
            Plot summary: ${response.data.Plot} 
            ${response.data.Ratings[0].Source} : ${response.data.Ratings[0].Value} 
            ${response.data.Ratings[1].Source} : ${response.data.Ratings[1].Value} 
            
            `);
        }
    );
}

const doWhatItSays = function(){
    fs.readFile('./random.txt', 'utf-8', function(err, res, data) {
        let textToArr = res.split(',');
        userInput = textToArr[0];
        userQuery = textToArr[1];
        spotifySearch();
    });
}

if(userInput === "spotify-this-song"){
    spotifySearch();
}else if(userInput === "concert-this"){
    concertThis();
}else if(userInput === "movie-this"){
    movieThis();
}else if(userInput === "do-what-it-says"){
    doWhatItSays();
}

