// firebase.service.ts
import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref, set } from 'firebase/database';

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyDrH51HlOA_t9KHwYFRmRuCTpyj6zoWi1M",
  authDomain: "blog-app-85fe3.firebaseapp.com",
  databaseURL: "https://blog-app-85fe3-default-rtdb.firebaseio.com",
  projectId: "blog-app-85fe3",
  storageBucket: "blog-app-85fe3.appspot.com",
  messagingSenderId: "1058435592489",
  appId: "1:1058435592489:web:41700991d4882047fc0738"
};

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private storage;
  private database;

  constructor() {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    this.storage = getStorage(app);
    this.database = getDatabase(app);
  }

  // Method to upload an image and return its download URL
  uploadImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const storageReference = storageRef(this.storage, `images/${file.name}`);
      uploadBytes(storageReference, file)
        .then(snapshot => getDownloadURL(snapshot.ref))
        .then(url => resolve(url))
        .catch(error => reject(error));
    });
  }

  // Method to save image metadata to Realtime Database
  saveImageMetadata(url: string, name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const databaseReference = ref(this.database, `images/${name}`);
      set(databaseReference, { url })
        .then(() => resolve())
        .catch(error => reject(error));
    });
  }
}
