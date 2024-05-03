# Noteboxd

Noteboxd is a simpler version of the well-known movie rating platform, [Letterboxd](https://letterboxd.com/). This application is designed to add movies to a basic watchlist. Movies are added to from search and can also be removed.

The applications uses a node.js and SQLite backend with three tables: users (username, password), sessions (username, session_id), and movies (username, movie_id). We modify the users with GET and POST. The sessions and movies table are modified using using GET, POST, and DELETE requests. State is maintained using the session and a cookie.

Searching for movies is done using The Movie Database (TMDB) API. In our database, we only store the movie_id which we get from TMDB, so the movie poster image, synopsis etc. are all taken from the API and then cached client-side.

The node folder had to be deleted in our gradescope submission and needs to be re-added for the code to run. Run the back-end using `node server.mjs` and access the front-end from the browser using `http://localhost:3001/`.

Link to demonstration: [https://youtu.be/JJnVPKTce9s](https://youtu.be/JJnVPKTce9s)

