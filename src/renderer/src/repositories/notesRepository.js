// D:\newerf\FocusPulse-main\src\renderer\src/repositories/notesRepository.js
export class NotesRepository {
  constructor() {
    this.storageKey = 'focusPulse-notes'
  }
  
  getAll() {
    const notes = localStorage.getItem(this.storageKey)
    return notes ? JSON.parse(notes) : []
  }
  
  saveAll(notes) {
    localStorage.setItem(this.storageKey, JSON.stringify(notes))
  }
  
  add(note) {
    const notes = this.getAll()
    notes.unshift(note)
    this.saveAll(notes)
    return notes
  }
  
  remove(index) {
    const notes = this.getAll()
    notes.splice(index, 1)
    this.saveAll(notes)
    return notes
  }
  
  update(index, updatedNote) {
    const notes = this.getAll()
    notes[index] = updatedNote
    this.saveAll(notes)
    return notes
  }
}