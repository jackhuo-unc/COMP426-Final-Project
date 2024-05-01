import {Database} from 'sqlite-async';

// Your code to set up a database goes here.

export let db = await Database.open('db.sqlite');
