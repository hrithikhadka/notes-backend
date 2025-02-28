// process.env.NODE_ENV = "test";
// require("dotenv").config();

// console.log("NODE_ENV at test start:", process.env.NODE_ENV);
// console.log(
//   "MONGODB_URI at test start (before config.js):",
//   process.env.MONGODB_URI
// );

// if (!process.env.TEST_MONGODB_URI) {
//   throw new Error("TEST_MONGODB_URI is not set!");
// }

// process.env.MONGODB_URI = process.env.TEST_MONGODB_URI; // Force the correct DB
// console.log("Forced MONGODB_URI to:", process.env.MONGODB_URI);

const { test, after, beforeEach } = require("node:test");
const Note = require("../models/note");

const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app"); // Import the main Express app
const helper = require("./helper");

const api = supertest(app);

//debugging
// console.log("Current NODE_ENV:", process.env.NODE_ENV);
// console.log("Using database:", process.env.MONGODB_URI);

// const initialNotes = [
//   {
//     content: "HTML is easy",
//     important: false,
//   },
//   {
//     content: "Browser can execute only JavaScript",
//     important: true,
//   },
// ];

//initialize database before each test
beforeEach(async () => {
  await Note.deleteMany({});

  const noteObjects = helper.initialNotes.map((note) => new Note(note));
  const promiseArray = noteObjects.map((note) => note.save());
  await Promise.all(promiseArray);
});

test("notes are returned as json", async () => {
  await api
    .get("/api/notes")
    .expect(200)
    .expect("Content-Type", /application\/json/); //
});

test("there are two notes", async () => {
  const response = await api.get("/api/notes");

  assert.strictEqual(response.body.length, helper.initialNotes.length);
});

test("the first note is about testing note", async () => {
  const response = await api.get("/api/notes");

  const contents = response.body.map((e) => e.content);
  // is the argument truthy
  assert(contents.includes("HTML is easy"));
});

test("a valid note can be added ", async () => {
  const newNote = {
    content: "async/await simplifies making async calls",
    important: true,
  };

  await api
    .post("/api/notes")
    .send(newNote)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  // const response = await api.get("/api/notes");

  const notesAtEnd = await helper.notesInDb();
  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1);

  const contents = notesAtEnd.map((n) => n.content);
  assert(contents.includes("async/await simplifies making async calls"));
});

test("note without content is not added", async () => {
  const newNote = {
    important: true,
  };

  await api.post("/api/notes").send(newNote).expect(400);

  // const response = await api.get("/api/notes");
  const notesAtEnd = await helper.notesInDb();
  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length);
});

// test for fetching an individual note
test("a specific note can be viewed", async () => {
  const notesAtStart = await helper.notesInDb();

  const noteToView = notesAtStart[0];

  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  assert.deepStrictEqual(resultNote.body, noteToView);
});

//removing
test("a note can be deleted", async () => {
  const notesAtStart = await helper.notesInDb();
  const noteToDelete = notesAtStart[0];

  await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);

  const notesAtEnd = await helper.notesInDb();

  const contents = notesAtEnd.map((r) => r.content);
  assert(!contents.includes(noteToDelete.content));

  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1);
});

after(async () => {
  await mongoose.connection.close(); //
});
