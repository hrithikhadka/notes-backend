const notesRouter = require("express").Router();
const mongoose = require("mongoose");
const Note = require("../models/note");

//get all notes
notesRouter.get("/", async (request, response) => {
  const notes = await Note.find({});
  response.json(notes);
});

//get a single note
notesRouter.get("/:id", async (request, response) => {
  const { id } = request.params;

  //prevent mongoose autocasting invalid ids
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).json({ error: "Invalid note ID format" });
  }
  const note = await Note.findById(request.params.id);
  if (note) {
    response.json(note);
  } else {
    response.status(404).end();
  }
});

//Create a new note
notesRouter.post("/", async (request, response) => {
  const { content, important } = request.body;

  if (!content) {
    return response.status(400).end();
  }

  const note = new Note({
    content: content,
    important: important || false,
  });

  const savedNote = await note.save();
  response.status(201).json(savedNote);
});

//delete a note
notesRouter.delete("/:id", async (request, response) => {
  await Note.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

//update a note
notesRouter.put("/:id", async (request, response) => {
  const body = request.body;

  const note = {
    content: body.content,
    important: body.important,
  };

  const updatedNote = Note.findByIdAndUpdate(request.params.id, note, {
    new: true,
  });
  response.json(updatedNote);
});

module.exports = notesRouter;
