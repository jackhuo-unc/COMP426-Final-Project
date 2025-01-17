import {db} from './db.mjs';

// Use the db object to run table creation commands and otherwise initialize your database setup here.
// parents id of parent, id of child
// nodes id of node, headline
await db.run('CREATE TABLE IF NOT EXISTS users (username VARCHAR(16) PRIMARY KEY, password VARCHAR(16))');
// let username = 'scandium';
// let password = 'password123';
// console.log('fetch', await db.get('SELECT * FROM users WHERE username = ? AND password = ?', username, password));
console.log('fetch', await db.get('SELECT * FROM users WHERE username = ?', 'scandium'));
await db.run('CREATE TABLE IF NOT EXISTS movies (username VARCHAR(16), movie_id INTEGER, PRIMARY KEY (username, movie_id))');
await db.run('CREATE TABLE IF NOT EXISTS sessions (session_id VARCHAR(16) PRIMARY KEY, username VARCHAR(16))');

//await db.run('INSERT INTO users VALUES (?, ?)', 'scandium', 'password123');
//await db.run('INSERT INTO movies VALUES (?,?)', 'scandium', 121);

//let my_movies = (await db.all('select movie_id from movies where username = ?', username)).map(s => s.movie_id);
//let db_insert = await db.run('delete from movies where username = ? AND movie_id = ?', username, movie_id);
//let db_result = await db.run('delete from movies where username = ? AND movie_id = ?', username, movie_id);


db.close();