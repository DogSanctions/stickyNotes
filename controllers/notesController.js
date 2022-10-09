const Note = require('../models/Note')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')
const { response } = require('express')

// @desc Get all notes
// @route Get /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
    // Get all notes from MongoDB
    const notes = await Note.find().lean()
    if(!notes?.length) { // If no notes
        return res.status(400).json({ message: 'No notes found'})
    }

    // Add username to each note before sending the response 
    // You could also do this with a for...of loop
    const notesWithUser = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec()
        return { ...note, username: user.username }
    }))

    res.json(notesWithUser)
})

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body

    //Confirm Data
    if (!user || !title || !text) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    //Check for duplicate title
    const duplicate = await Note.findOne({ title }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    // Create and store the new user
    const note = await Note.create({ user, title, text })

    if (note) { // created
        res.status(201).json({ message: 'New note created' })
    } else {
        res.status(400).json({ message: 'Invalid note data received'})
    }
})

// @desc Update a note
// @route Patch /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body

    //Confirm data
    if (!id || !username || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Not not found' })
    }

    // Check for duplicate
    const duplicate = await Note.findOne({ title }).lean().exec()
    // Allow renaming of the original note
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()

    res.json(`'${updatedNote.title}' updated`)
})

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Note ID required' })
    }

    // Confirm note exists to delte
    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    const result = await note.deleteOne()

    const reply = `Note '${result.title} with ID ${result._id} delted`
    
    res.json(reply)
})

module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}