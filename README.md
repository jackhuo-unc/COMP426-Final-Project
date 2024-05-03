# Noteboxd

Noteboxd is a simpler version of the well-known movie rating platform, [Letterboxd](https://letterboxd.com/). This application is designed to add movies to a basic watchlist. Movies are added to from search and can also be removed.

The applications uses a node.js and SQLite backend with three tables: users (username, password), sessions (username, session_id), and movies (username, movie_id). We modify the users and sessions using GET and POST requests. The movies table is modified using GET, POST, and DELETE. State is maintained using the session and a cookie.

Searching for movies is done using The Movie Database (TMDB) API. In our database, we only store the movie_id which we get from TMDB, so the movie poster image, synopsis etc. are all taken from the API and then cached client-side.

Link to demonstration: [https://youtu.be/JJnVPKTce9s](https://youtu.be/JJnVPKTce9s)

