let axios = require('axios');
let moment = require('moment')
let keys = require("./keys.js");
let Spotify = require('node-spotify-api');
let fs = require('fs');
let processVars = process.argv.slice(2);
let userInput = processVars.slice(0,1).join();
let userQuery = processVars.slice(1).join(" ");


let spotify = new Spotify({
  id:keys.SPOTIFY_ID,
  secret:keys.SPOTIFY_SECRET
});
 
const spotifySearch = function(){
    spotify.search({ type: 'track', query: userQuery, limit:5 }, function(err, data) {
        if (err) {
          return console.log('Error occurred: ' + err);
        }
        let spotifyData = [];
        spotifyData.push(`Search Type: ${userInput}`);
        spotifyData.push(`User Query: ${userQuery}`);
            
        for(let i = 0; i < data.tracks.items.length; i++){
            spotifyData.push(
                {
                 songtitle:data.tracks.items[i].name,
                 artist:data.tracks.items[i].artists[0].name,
                 album:data.tracks.items[i].album.name,
                 spotifylink:data.tracks.items[i].external_urls.spotify
                });
        }
        let spotDataFormatted = JSON.stringify(spotifyData, null, 4) + "\n";
        fs.appendFile("log.txt", spotDataFormatted, function(err){
            if(err){
                console.log(err);
            }
        });
    });
}

const concertThis = function() {
    axios.get("https://rest.bandsintown.com/artists/" + userQuery + "/events?app_id=" + keys.BAND_KEY).then(
        function(response) {
            // console.log(response.data[0]);
            if(response.data[0] === undefined){
                console.log(`
                ${userQuery} has no upcoming dates
                
                `);
            }else{
                let concertData = [];
                concertData.push(`Search Type ${userInput}`);
                concertData.push(`Search Term ${userQuery}`);
                concertData.push({
                    date:moment(response.data[0].datetime).format("MMM Do YYYY"),
                    venue:response.data[0].venue.name,
                    city:response.data[0].venue.city,
                    country:response.data[0].venue.country
                });

                let concertDataFormatted = JSON.stringify(concertData, null, 4) + "\n";

                fs.appendFile("log.txt", concertDataFormatted, function(err){
                    if(err){
                        console.log(err);
                    }
                });

            }

         
          
        }
        ).catch(function (error) {
            console.log(error);
        });
};

const movieThis = function(){
    axios.get(`http://www.omdbapi.com/?t=${userQuery}&y=&plot=short&apikey=${keys.OMDB_KEY}`).then(
        function(response) {
          
            let movieData = [];
            movieData.push(`Search Type ${userInput}`);
            movieData.push(`Search term ${userQuery}`);
            movieData.push({
                movietitle:response.data.Title,
                year:response.data.Year,
                language:response.data.Language,
                country:response.data.Country,
                actors:response.data.Actors,
                plot:response.data.Plot,
                ratings:[
                    `${response.data.Ratings[0].Source}:${response.data.Ratings[0].Value}`,
                    `${response.data.Ratings[1].Source}:${response.data.Ratings[1].Value}`
                ]
            });
    

            let movieDataFormatted = JSON.stringify(movieData, null, 4) + "\n";

            fs.appendFile("log.txt", movieDataFormatted, function(err){
                if(err){
                    console.log(err);
                }
            });
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

