import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref, set } from 'firebase/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs';


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

  constructor(private stg: AngularFireStorage) {
    const app = initializeApp(firebaseConfig);
    this.storage = getStorage(app);
    this.database = getDatabase(app);
  }

  uploadFile(file: File, filePath: string) {
    const fileRef = this.stg.ref(filePath);
    const task = this.stg.upload(filePath, file);

    // Observe upload progress
    task.percentageChanges().subscribe(progress => {
      // You can use this progress value to update a progress bar in your component
      console.log('Upload progress:', progress);
    });

    // Get download URL when upload is complete
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(url => {
          // You can use this download URL to display the uploaded file in your component
          console.log('File available at', url);
        });
      })
    ).subscribe();

    return task.percentageChanges(); // Return the observable for progress tracking
  }
}
