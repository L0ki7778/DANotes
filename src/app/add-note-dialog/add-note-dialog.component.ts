import { Component, Output, EventEmitter } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { NoteListService } from '../firebase-services/note-list.service'

@Component({
  selector: 'app-add-note-dialog',
  templateUrl: './add-note-dialog.component.html',
  styleUrls: ['./add-note-dialog.component.scss']
})
export class AddNoteDialogComponent {
  @Output() addDialogClosed: EventEmitter<boolean> = new EventEmitter();
  title = "";
  content = "";


  constructor(private noteService: NoteListService) { }

  closeDialog() {
    this.title = "";
    this.content = "";
    this.addDialogClosed.emit(false);
  }

  addNote() {
    let note: Note ={
      type:"note",
      title: this.title,
      content: this.content,
      marked: false
    }
    this.noteService.addNote(note, "notes");
    this.closeDialog();
  }
}
