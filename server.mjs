import http from 'http';
import fs from 'fs';
import url from 'url';
import { db, isDbOpen, closeDb } from './db.mjs';
import path from 'path';
import e from 'express';

const server = http.createServer(async (req, res) => {
  try {
    if (!isDbOpen()) {
      db.open();
    }
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Error opening database');
    return;
  }

  //parse the body of the request
  let body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    try {
      req.body = JSON.parse(body);
    } catch (e) {
      req.body = {}
    }
  });
  // Inside your request handler...
  // if (req.url.startsWith('/static/')) {
  //   // Get the path to the file.
  //   const filePath = path.join(__dirname, req.url);

  //   // Read the file from the file system.
  //   fs.readFile(filePath, (err, data) => {
  //     if (err) {
  //       res.statusCode = 404;
  //       res.setHeader('Content-Type', 'text/plain');
  //       res.end('Not found');
  //     } else {
  //       // Set the Content-Type header based on the file extension.
  //       const ext = path.extname(filePath);
  //       const contentType = ext === '.css' ? 'text/css' : 'text/plain';
  //       res.setHeader('Content-Type', contentType);
  //       res.end(data);
  //     }
  //   });
  // } else 
  if (req.url === '/signup') {
    // Navigate to the signup page.
    fs.readFile('signup.html', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Error loading signup page');
      } else {
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
      }
    });
  }
  else if (req.url === '/signup/confirm') {
    // Create a new user in the database.
    if (!req.body || !req.body.username || !req.body.password) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Invalid username or password');
    }
    else {
      db.run('INSERT INTO users(username, password) (?, ?)', req.body.username, req.body.password, (err) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Error signing up');
        } else {
          res.setHeader('Content-Type', 'text/plain');
          res.end('Signed up!');
        }
      });
    }
  } else if (req.url === '/login') {
    // Navigate to the login page.
    fs.readFile('login.html', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Error loading login page');
      } else {
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
      }
    });
  }
  else if (req.url.startsWith('/login')) {
    console.log('made it to login with params')
    const parseUrl = url.parse(req.url, true);
    const { username, password } = parseUrl.query;
    console.log('username:', username, 'password:', password);

    if (!username || !password) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Invalid username or password');
    }
    else {
      console.log('running db.get')
      try {
        let user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', username, password);
        console.log('user:', user);
        if (user) {
          const sessionId = new Date().getTime().toString();
          console.log('user session id', user, sessionId);
          try {
            let session = await db.run('INSERT INTO sessions(session_id, username) VALUES (?, ?)', sessionId, user.username);
            if (session) {
              // Set a cookie with the user's ID after they log in.
              res.setHeader('Set-Cookie', [`username=${user.username}`, `sessionId=${sessionId}`]);
              res.end('Logged in!');
            } else {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'text/plain');
              res.end('Error logging in');
            }
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Error logging in');
          }
        }
        else {
          console.log('user dne', user);
          res.statusCode = 401;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Invalid username or password');
        }
      }
      catch (e) {
        console.error(e);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Error logging in');
      }
    }
  } else if (req.url === '/dashboard') {
    // Check if the user is logged in by checking if the cookie is set.
    const cookies = req.headers.cookie ? req.headers.cookie.split('; ').reduce((cookies, cookie) => {
      const [name, value] = cookie.split('=');
      cookies[name] = value;
      return cookies;
    }, {}) : {};
    const sessionId = cookies.sessionId;
    db.get('SELECT * FROM sessions WHERE session_id = ?', sessionId, (err, session) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Error loading dashboard');
      } else if (session) {
        // we did /dashboard/username or just /dashboard
        res.setHeader('Content-Type', 'text/plain');
        // here would I do the sql stuff to get all the info for this user?
        // also, why are sql calls not async?
        let my_movies = (db.all('select movie_id from movies where username = ?', username)).map(s => s.movie_id);
        res.body.movies = my_movies; // how about this

        res.end('Welcome to the dashboard!');
      } else {
        res.setHeader('Content-Type', 'text/plain');
        res.end('Please log in first.');
      }
    });
  } else {
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello, world!');
  }
});

async function getAllMoviesForUser(username, res) {
  try {
    let allMovies = await db.all('SELECT movie_id FROM movies WHERE username = ?');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(allMovies));
  } catch (error) {
    console.log('error was encountered: ' + error)
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Error getting movies');
    console.log('error was encountered: ' + error)
  }
}

async function addNewMovie(username, movie_id, res) {
  try {
    await db.run('INSERT INTO movies VALUES (?,?)', username, movie_id);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');    
    res.end('Added new movie.');  
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Error adding movie');
    console.log('error was encountered: ' + error)
  }
}

async function deleteMovie(username, movie_id, res) {
  try {
    await db.run('DELETE FROM movies WHERE username = ? AND movie_id = ?', username, movie_id);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');    
    res.end('Deleted movie.');  
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Error deleting movie');
    console.log('error was encountered: ' + error)
  }
}

server.listen(3001, () => console.log('Server listening on port 3001'));
/*
const http = require('http');
const db = require('./db.js');

const server = http.createServer((req, res) => {
  if (req.url === '/signup') {
    // Create a new user in the database.
    // You need to replace 'username' and 'password' with the actual values
    db.run('INSERT INTO users(username, password) VALUES(?, ?)', 'username', 'password', (err) => {
      if (err) {
        res.statusCode = 500;
        res.end('Error signing up');
      } else {
        res.end('Signed up!');
      }
    });
  } else if (req.url === '/login') {
    // You need to replace 'username' and 'password' with the actual values
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', 'username', 'password', (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.end('Error logging in');
      } else if (user) {
        const sessionId = new Date().getTime().toString();
        db.run('INSERT INTO sessions(id, userId) VALUES(?, ?)', sessionId, user.username, (err) => {
          if (err) {
            res.statusCode = 500;
            res.end('Error logging in');
          } else {
            res.setHeader('Set-Cookie', `sessionId=${sessionId}`);
            res.end('Logged in!');
          }
        });
      } else {
        res.end('Invalid username or password');
      }
    });
  } else if (req.url === '/dashboard') {
    const sessionId = req.headers.cookie?.split('=')[1];
    db.get('SELECT * FROM sessions WHERE id = ?', sessionId, (err, session) => {
      if (err) {
        res.statusCode = 500;
        res.end('Error loading dashboard');
      } else if (session) {
        res.end('Welcome to the dashboard!');
      } else {
        res.end('Please log in first.');
      }
    });
  } else {
    res.end('Hello, world!');
  }
});

server.listen(3001, () => console.log('Server listening on port 3001'));
*/