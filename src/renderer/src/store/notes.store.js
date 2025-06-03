// D:\newerf\FocusPulse-main\src\renderer\src\store/notes.store.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref([])
  
  const loadNotes = () => {
    const savedNotes = localStorage.getItem('focusPulse-notes')
    if (savedNotes) {
      notes.value = JSON.parse(savedNotes)
    }
  }
  
  const saveNotes = () => {
    localStorage.setItem('focusPulse-notes', JSON.stringify(notes.value))
  }
  
  const addNote = (note) => {
    notes.value.unshift(note)
    saveNotes()
  }
  
  const removeNote = (index) => {
    notes.value.splice(index, 1)
    saveNotes()
  }
  
  return { notes, loadNotes, saveNotes, addNote, removeNote }
})