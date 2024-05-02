// import {db} from './db.mjs';

// api calls and display
const server_url = 'http://localhost:3001';

// called by the submit search button
async function get_movie_by_name() {
    let name = document.getElementById("searchInput").value;
    if(name == "" || name == null || name == undefined) {
        console.log("The name is empty");
        return;
    }
    try {
        const response = await fetch('https://api.themoviedb.org/3/search/movie?query=' + name + '&api_key=3c86f49ada9b34f379ca5d429d95bd66', {
            method: 'GET'
        });
        let data = await response.json();
        console.log(data.results[0]);
        display_movie(data.results[0]);
    }
    catch (error) {
        console.error("Error: in get_movie_by_name()", error);
    }
}

async function get_movie_by_id(id) {
    try {
    const response = await fetch('https://api.themoviedb.org/3/movie/' + id + '?api_key=3c86f49ada9b34f379ca5d429d95bd66', {
        method: 'GET'
    });
    display_movie(await response.json());
}
catch (error) {
    console.error("Error:", error);
}
}

// Problem: these two functions work like kind of like game of hearts
// in that they save everything on the client-side. 

// This function displays the movie info on the left side
// could be called by search or by clicking on a button
// will query db and add an add or remove button accordingly
async function display_movie(data) {
    const movie_div = document.getElementById('movie_display');
    movie_div.innerHTML = `
    <img src= "https://image.tmdb.org/t/p/w500${data.poster_path}" alt="MOVIE">
    <h2>${data.title}</h2>
    <h3>${data.release_date}</h3>
    <p>${data.overview}</p>
    <p>${data.vote_average}</p>
    `;

    let addRemoveButton = document.createElement('button');

    // how best to have this username?

    let my_movies = (await db.all('select movie_id from movies where username = ? and movie_id = ?', username, data.id)).map(s => s.movie_id);

    
    if(my_movies[0] != undefined) { // if this movie exists
        addRemoveButton.appendChild(document.createTextNode("Remove from list"));
        addRemoveButton.addEventListener('click', () => {
            deleteNewMovie(data);
        });
        movie_div.appendChild(addMovieButton);
        return;
    }
    // else: this movie does not yet exist
    addRemoveButton.appendChild(document.createTextNode("Add to list"));
        addRemoveButton.addEventListener('click', () => {
            addMovieButton(data);
        });
        movie_div.appendChild(addMovieButton);
        return;
}

// This functions adds a new button for a movie with title and
// an event handler that calls display_movie when clicked.
function addMovieButton(data) {
    let watchList = document.getElementById("watchlist");
    let newButton = document.appendChild(watchList);
    newButton.appendChild(document.createTextNode(data.title));
    newButton.setAttribute('id', data.id);
    // this could also be the title
    buttons4.addEventListener('click', () => {
        display_movie(data);
    });

    watchList.appendChild(newButton);
}

// this is an async function that draws all buttons for the movies
// the user already has in the database. They may have movies from 
// a previous session.
// btw if this was legit we would need to do a GET http request to 
// the backend database server instead of just db.all
async function drawAllButtons(username) {

    try {
        const response = await fetch(`${server_url}/dashboard`, {
            method: 'GET'
        });
        let listOfMovieIds = await response.json();
        console.log(listOfMovieIds);

        listOfMovieIds.forEach(async movie => {
            let data = await get_movie_by_id(movie.id);
            addMovieButton(data);
        });
    }
    catch (error) {
        console.error("Error: in drawAllButtons()", error);
    }

    // this is the old version: 
    // let my_movies = (await db.all('select movie_id from movies where username = ?', username)).map(s => s.movie_id);
    // my_movies.forEach(async movie => {
    //     let data = await get_movie_by_id(movie.id);
    //     addMovieButton(data);
    // });
}


// this function should be run when we click the add new movie button
// we need to store this data variable somewhere, maybe globally or
// with the button idk.
// since we only have one movie at time(which is displayed on left)
// which we could potentially add.
async function addNewMovie(username, data) {

    try {
        const response = await fetch(`${server_url}/dashboard`, {
            method: 'POST'
        });
        let listOfMovieIds = await response.json();
        console.log(listOfMovieIds);
        addMovieButton(data);
    }
    catch (error) {
        console.error("Error: in drawAllButtons()", error);
    }

    // The old version: 
    // await db.run('INSERT INTO movies VALUES (?,?)', username, data.id);
    // addMovieButton(data);
}

async function deleteNewMovie(username, data) {
    try {
        const response = await fetch(`${server_url}/dashboard/?movie_id=${data.id}`, {
            method: 'DELETE'
        });
        let watchList = document.getElementById("watchlist");
        let buttonToBeDeleted = document.getElementById(data.id);
        watchList.removeChild(buttonToBeDeleted);

        }
    catch (error) {
        console.error("Error: in deleteNewMovie()", error);
    }

    // The old version: 
    // await db.run('delete from movies where username = ? AND movie_id = ?', username, movie_id);
    // let watchList = document.getElementById("watchlist");
    // let buttonToBeDeleted = document.getElementById(data.id);
    // watchList.removeChild(buttonToBeDeleted);

    
}
    










// const movie_api_url = 'http://localhost:3000/quack';
// const name_api_url = 'http://localhost:3000/'

// async function get_data() {
//     const get_gender = document.getElementById('genderSelect').value;
//     console.log(get_gender);
//     try {
//         const duck_call = await fetch(duck_api_url);
//         const name_call = await fetch(name_api_url + `${get_gender}`);
//         const duck_data = await duck_call.json();
//         const name_data = await name_call.json();
//         console.log(duck_data, name_data);
//         display_duck_name(duck_data, name_data, get_gender);
//     }
//     catch (error) {
//         console.error("Error:", error);
//     }
// }

// function display_duck_name(duck_data, name_data, get_gender) {
//     const duck_div = document.getElementById('duck_display');
//     const name_div = document.getElementById('name_display');
//     const intro_div = document.getElementById('intro');
//     const display_name = name_data.name.substring(0, name_data.name.indexOf(' '));
//     duck_div.innerHTML = `
//     <img src=${duck_data.url} alt="DUCK">
//     `;
    
//     name_div.innerHTML = `
//     <h2>${display_name}</h2>
//     `;
    
//     intro_div.innerHTML = '';
//     setTimeout(_ => {
//         intro_div.innerHTML = `This is ${display_name}, ${get_gender === "female" ? "she" : "he"} is your friend now.`;
//     }, 1000);
// }