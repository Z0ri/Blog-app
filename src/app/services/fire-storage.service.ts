import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class FireStorageService {
  private storage: Storage;

  constructor(private fireStorage: Storage) {
    this.storage = fireStorage;
  }

  async uploadFile(filePath: string, file: File): Promise<string> {
    //create a reference in the Firebase Storage at the specified path
    const storageRef = ref(this.storage, filePath);

    try {
      //upload the file in the just created storage reference and get a reference of the just uploaded file to get it's informations
      const snapshot = await uploadBytes(storageRef, file);
      //return the URL of the snapshot (that refers the file's)
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error('Error during the loading of the image:', error);
      throw error;
    }
  }

  async getFileDownloadUrl(filePath: string): Promise<string> {
    //create a reference in the Firebase Storage at the specified path
    const storageRef = ref(this.storage, filePath);

    try {
      // Return the download URL of the file in that specific storageReference
      return await getDownloadURL(storageRef);
    } catch (error) {
      // Gestione degli errori durante il recupero dell'URL
      console.error('Errore durante il recupero dell\'URL di download:', error);
      throw error;
    }
  }

  // /**
  //  * Elenca tutti i file in una cartella specifica su Firebase Storage.
  //  * @param folderPath Il percorso della cartella in Firebase Storage (esempio: 'images/').
  //  * @returns Una Promise che si risolve con un array di nomi di file.
  //  */
  // async listFilesInFolder(folderPath: string): Promise<string[]> {
  //   // Crea un riferimento alla cartella specificata nel bucket di Firebase Storage
  //   const listRef = ref(this.storage, folderPath);

  //   try {
  //     // Recupera e restituisce un array contenente i nomi di tutti i file nella cartella
  //     const res = await listAll(listRef);
  //     return res.items.map(itemRef => itemRef.name);
  //   } catch (error) {
  //     // Gestione degli errori durante l'elenco dei file
  //     console.error('Errore durante l\'elenco dei file:', error);
  //     throw error;
  //   }
  // }

  async deleteFile(filePath: string): Promise<void> {
    //create a reference to the file in a specified path
    const fileRef = ref(this.storage, filePath);

    try {
      //delete file
      await deleteObject(fileRef);
      console.log('File eliminato con successo');
    } catch (error) {
      console.error('Errore durante l\'eliminazione del file:', error);
      throw error;
    }
  }
}
