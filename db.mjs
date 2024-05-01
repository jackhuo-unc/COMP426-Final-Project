import {Database} from 'sqlite-async';

// Your code to set up a database goes here.
let isOpen = false;

export let db = await Database.open('db.sqlite');
isOpen = true;

export function isDbOpen() {
    return isOpen;
}

export async function closeDb() {
    await db.close();
    isOpen = false;
}
