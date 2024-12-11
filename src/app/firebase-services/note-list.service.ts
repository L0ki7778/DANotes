import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface'
import { Firestore, query, collection, doc, collectionData, onSnapshot, addDoc, updateDoc, deleteDoc, orderBy, limit, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  markedNotes: Note[] = [];


  firestore: Firestore = inject(Firestore);

  unsubTrash;
  unsubNotes;
  unsubMarked;

  constructor() {
    this.unsubTrash = this.subTrashList();
    this.unsubNotes = this.subNotesList();
    this.unsubMarked = this.subMarkedNotesList();
  }


  async deleteNote(colId: string, docId: string) {
    await deleteDoc(this.getSingleNoteRef(colId, docId)).catch(
      error => console.error(error)
    )
  }


  async updateNote(note: Note) {
    if (note.id) {
      let docRef = this.getSingleNoteRef(this.getColIdFromNote(note), note.id)
      await updateDoc(docRef, this.getCleanJson(note)).catch(
        error => console.error(error)
      ).then()
    }
  }


  getCleanJson(note: Note) {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked
    }
  }


  getColIdFromNote(note: Note) {
    if (note.type == 'note') {
      return 'notes';
    } else {
      return 'trash';
    }
  }


  async addNote(item: Note, colId: "notes" | "trash") {
    if (colId == 'trash') {
      await addDoc(this.getTrashRef(), item).catch(
        error => console.error(error)
      ).then(
        (docRef) => console.log("Document written with ID: ", docRef?.id)
      )
    } else {
      await addDoc(this.getNotesRef(), item).catch(
        error => console.error(error)
      ).then(
        (docRef) => console.log("Document written with ID: ", docRef?.id)
      )
    }
  }


  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list => {
      this.trashNotes = [];
      list.forEach(element => {
        this.trashNotes.push(this.setNote(element.data(), element.id));
      });
    }))
  };


  subNotesList() {
    const q = query(this.getNotesRef(), where("marked", "==", false) ,limit(100));
    return onSnapshot(q, (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNote(element.data(), element.id));
      });
    })
  };


  subMarkedNotesList() {
    const q = query(this.getNotesRef(), where("marked", "==", true) ,limit(100));
    return onSnapshot(q, (list) => {
      this.markedNotes = [];
      list.forEach(element => {
        this.markedNotes.push(this.setNote(element.data(), element.id));
      });
    })
  };


  ngOnDestroy() {
    this.unsubTrash();
    this.unsubNotes();
    this.unsubMarked();
  }


  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  getNotesRef() {
    return collection(this.firestore, 'notes');
  }


  getSingleNoteRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId)
  }


  setNote(obj: any, id: string): Note {
    return {
      id: id || "",
      type: obj.type || "note",
      title: obj.title || "",
      content: obj.content || "",
      marked: obj.marked || false
    }
  }
}