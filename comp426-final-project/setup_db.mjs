import {db} from './db.mjs';

// Use the db object to run table creation commands and otherwise initialize your database setup here.
// parents id of parent, id of child
// nodes id of node, headline
await db.run('CREATE TABLE IF NOT EXISTS users (username VARCHAR(16) PRIMARY KEY, password VARCHAR(16))');
await db.run('CREATE TABLE IF NOT EXISTS movies (username VARCHAR(16), movie_id INTEGER), PRIMARY KEY (username, movie_id)');

await db.run('INSERT INTO users VALUES (?, ?)', 'scandium', 'password123');
await db.run('INSERT INTO movies VALUES (?,?)', 'username', 'movie_id');

let nodes_raw = (await db.all('select movie_id from movies where username = ?', username)).map(s => s.movie_id);
let db_result = await db.run('delete from movies where movie_id = ?', movie_id);






await db.run('CREATE TABLE IF NOT EXISTS nodes (id INTEGER PRIMARY KEY, headline TEXT(100) NOT NULL, note TEXT(100) NOT NULL)');
await db.run('CREATE TABLE IF NOT EXISTS edges (parent_id INTEGER, child_id INTEGER)');
//await db.run('CREATE TABLE IF NOT EXISTS edges (parent_id INTEGER, child_id INTEGER), PRIMARY KEY (parent_id, child_id), CONSTRAINT parent FOREIGN KEY (parent_id) REFERENCES nodes(id), CONSTRAINT child FOREIGN KEY (child_id) REFERENCES nodes(id)');
let node_id = 0;
let node_headline = 'root';
let node_note = '';
await db.run('DELETE FROM nodes');
await db.run('INSERT INTO nodes VALUES (?, ?, ?)', node_id, node_headline, node_note);

db.close();