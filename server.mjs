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
  if (req.url === '/signup') {
    // Navigate to the signup page.
    fs.readFile('signup.html', (err, data) => {
      if (err) {
        // res.statusCode = 500;
        // res.setHeader('Content-Type', 'text/plain');
        res.end('Error loading signup page');
      } else {
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
      }
    });
  }
  else if (req.url === '/signstyle.css') {
    fs.readFile('./signstyle.css', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Error loading CSS file');
      } else {
        res.setHeader('Content-Type', 'text/css');
        res.end(data);
      }
    });
  }
  else if (req.url === '/ARLRDBD_0.TTF') {
    fs.readFile('./ARLRDBD_0.TTF', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Error loading font file');
      } else {
        res.setHeader('Content-Type', 'font/ttf');
        res.end(data);
      }
    });
  }
  else if (req.url === '/logo.png') {
    fs.readFile('./logo.png', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Error loading font file');
      } else {
        res.setHeader('Content-Type', 'font/ttf');
        res.end(data);
      }
    });
  }
  else if (req.url === '/indexstyle.css') {
    fs.readFile('indexstyle.css', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Error loading CSS file');
      } else {
        res.setHeader('Content-Type', 'text/css');
        res.end(data);
      }
    });
  }
  else if (req.url === '/logout' && req.method == 'DELETE') { // deletes cookie on client-side and removes session on server-side
      const cookies = req.headers.cookie ?
      req.headers.cookie.split('; ').reduce((cookies, cookie) => {
        const [name, value] = cookie.split('=');
        cookies[name] = value;
        return cookies;
      }, {}) : {};
    const sessionId = cookies.sessionId;
    console.log(sessionId);

    await db.run('DELETE FROM sessions WHERE session_id = ?', sessionId);

    res.setHeader('Set-Cookie', [`username=; expires=Thu, 01 Jan 1970 00:00:00 GMT`, `sessionId=; expires=Thu, 01 Jan 1970 00:00:00 GMT`]);
    res.statusCode = 302;
    res.setHeader('Location', '/');
    res.end();
  }
  else if (req.url.startsWith('/signup')) {
    // Create a new user in the database.
    const parseUrl = url.parse(req.url, true);
    const { username, password } = parseUrl.query;
    if (!username || !password) {
      // res.statusCode = 400;
      // res.setHeader('Content-Type', 'text/plain');
      res.statusCode = 303;
      res.setHeader('Location', '/signup');
      res.end('Invalid username or password');
    }
    else {
      try {
        let new_user = await db.run('INSERT INTO users(username, password) VALUES (?, ?)', username, password);
        console.log('new user:', new_user);
        if (await new_user) {
          console.log('new user2:', new_user);
          const sessionId = new Date().getTime().toString();
          console.log('user session id', new_user, sessionId);
          try {
            let session = await db.run('INSERT INTO sessions(session_id, username) VALUES (?, ?)', sessionId, username);
            if (session) {
              // Set a cookie with the user's ID after they log in.
              res.setHeader('Set-Cookie', [`username=${username}`, `sessionId=${sessionId}`]);
              res.statusCode = 303;
              res.setHeader('Location', '/dashboard');
              res.end('Signed up!');
            } else {
              res.statusCode = 303;
              res.setHeader('Location', '/signup');
              // res.statusCode = 500;
              // res.setHeader('Content-Type', 'text/plain');
              res.end('Error signing up, no session created');
            }
          } catch (e) {
            res.statusCode = 303;
              res.setHeader('Location', '/signup');
            // res.statusCode = 500;
            // res.setHeader('Content-Type', 'text/plain');
            res.end('Error signing up, 2');
          }
        } else {
          res.statusCode = 303;
              res.setHeader('Location', '/signup');
          // res.statusCode = 500;
          // res.setHeader('Content-Type', 'text/plain');
          res.end('Error signing up, 3');
        }
      }
      catch (e) {
        res.statusCode = 303;
              res.setHeader('Location', '/signup');
        // console.error(e);
        // res.statusCode = 500;
        // res.setHeader('Content-Type', 'text/plain');
        res.end('Error signing up, 4');
      }
    }
  } else if (req.url === '/main.js') {
    fs.readFile('main.js', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Error loading JavaScript file');
      } else {
        res.setHeader('Content-Type', 'application/javascript');
        res.end(data);
      }
    });
  }
  else if (req.url === '/loginstyle.css') {
    fs.readFile('./loginstyle.css', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Error loading CSS file');
      } else {
        res.setHeader('Content-Type', 'text/css');
        res.end(data);
      }
    });
  }
  else if (req.url === '/login') {
    // Navigate to the login page.
    fs.readFile('login.html', (err, data) => {
      if (err) {
        res.statusCode = 303;
        res.setHeader('Location', '/login');
        // res.statusCode = 500;
        // res.setHeader('Content-Type', 'text/plain');
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
      // res.statusCode = 400;
      // res.setHeader('Content-Type', 'text/plain');
      res.statusCode = 303;
      res.setHeader('Location', '/login');
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
              res.statusCode = 303;
              res.setHeader('Location', '/dashboard');
              res.end('Logged in!');
            } else {
              // res.statusCode = 500;
              // res.setHeader('Content-Type', 'text/plain');
              res.statusCode = 303;
              res.setHeader('Location', '/login');
              res.end('Error logging in, no session created');
            }
          } catch (e) {
            // res.statusCode = 500;
            // res.setHeader('Content-Type', 'text/plain');
            res.statusCode = 303;
            res.setHeader('Location', '/login');
            res.end('Error logging in');
          }
        }
        else {
          console.log('user dne', user);
          // res.statusCode = 401;
          // res.setHeader('Content-Type', 'text/plain');
          res.statusCode = 303;
          res.setHeader('Location', '/login');
          res.end('Invalid username or password');
        }
      }
      catch (e) {
        console.error(e);
        res.statusCode = 303;
        res.setHeader('Location', '/login');
        // res.statusCode = 500;
        // res.setHeader('Content-Type', 'text/plain');
        res.end('Error logging in');
      }
    }
  } else if (req.url.startsWith('/dashboard')) {
    // Check if the user is logged in by checking if the cookie is set.
    const cookies = req.headers.cookie ?
      req.headers.cookie.split('; ').reduce((cookies, cookie) => {
        const [name, value] = cookie.split('=');
        cookies[name] = value;
        return cookies;
      }, {}) : {};
    const sessionId = cookies.sessionId;
    let matchingSession = await db.get('SELECT * FROM sessions WHERE session_id = ?', sessionId);
    if (!matchingSession) {
      // res.statusCode = 500;
      // res.setHeader('Content-Type', 'text/plain');
      res.statusCode = 303;
      res.setHeader('Location', '/');
      res.end('Could not find a matching session');
      console.log('could not find matching session.')
      return;
    }
    let moviesData;
    if (req.method == 'GET') {
      try {
        moviesData = await getAllMoviesForUser(cookies['username']);
      }
      catch (e) {
        console.error(e);
        // res.statusCode = 500;
        // res.setHeader('Content-Type', 'text/plain');
        res.statusCode = 303;
        res.setHeader('Location', '/dashboard');
        res.end('Error getting movies');
      }
    }

    const parseUrl = url.parse(req.url, true);
    const movie_id = parseUrl.query['movie_id'];
    console.log('The movie_id query param is: ' + movie_id);

    if (req.method == 'POST') {
      addNewMovie(cookies['username'], movie_id, res);
      return;
    }
    if (req.method == 'DELETE') {
      deleteMovie(cookies['username'], movie_id, res);
      return;
    }
    fs.readFile('index.html', 'utf8', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Error loading index page');
      } else {
        const modifiedData = data.replace('var moviesData;', `var moviesData = ${JSON.stringify(moviesData)};`);
        res.setHeader('Content-Type', 'text/html');
        res.end(modifiedData);
      }
    });
  }
  else {
    fs.readFile('index.html', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Error loading index page');
      } else {
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
      }
    });
  }
});


async function getAllMoviesForUser(username) {
  // try {
  let allMovies = await db.all('SELECT movie_id FROM movies WHERE username = ?', username);
  return allMovies;
  //   res.statusCode = 200;
  //   res.setHeader('Content-Type', 'application/json');
  //   res.write(JSON.stringify(allMovies));
  //   res.end();
  // } catch (error) {
  //   console.log('error was encountered: ' + error)
  //   res.statusCode = 500;
  //   res.setHeader('Content-Type', 'text/plain');
  //   res.end('Error getting movies');
  //   console.log('error was encountered: ' + error)
  // }
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