import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class FireStorageService {
  private storage: Storage;

  constructor(private fireStorage: Storage) {
    // Inizializza il servizio Firebase Storage utilizzando il parametro passato nel costruttore
    this.storage = fireStorage;
  }

  /**
   * Carica un file su Firebase Storage.
   * @param filePath Il percorso dove il file sarà caricato (esempio: 'images/my-image.jpg').
   * @param file L'oggetto file da caricare.
   * @returns Una Promise che si risolve con l'URL di download del file caricato.
   */
  async uploadFile(filePath: string, file: File): Promise<string> {
    // Crea un riferimento al percorso specificato nel bucket di Firebase Storage
    const storageRef = ref(this.storage, filePath);

    try {
      // Carica il file nel percorso specificato e ottiene uno snapshot dell'upload
      const snapshot = await uploadBytes(storageRef, file);

      // Ottiene e restituisce l'URL di download del file caricato
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      // Gestione degli errori durante il caricamento
      console.error('Errore durante il caricamento del file:', error);
      throw error;
    }
  }

  /**
   * Ottiene l'URL di download per un file su Firebase Storage.
   * @param filePath Il percorso del file in Firebase Storage.
   * @returns Una Promise che si risolve con l'URL di download.
   */
  async getFileDownloadUrl(filePath: string): Promise<string> {
    // Crea un riferimento al file specificato nel bucket di Firebase Storage
    const storageRef = ref(this.storage, filePath);

    try {
      // Restituisce l'URL di download per il file
      return await getDownloadURL(storageRef);
    } catch (error) {
      // Gestione degli errori durante il recupero dell'URL
      console.error('Errore durante il recupero dell\'URL di download:', error);
      throw error;
    }
  }

  /**
   * Elenca tutti i file in una cartella specifica su Firebase Storage.
   * @param folderPath Il percorso della cartella in Firebase Storage (esempio: 'images/').
   * @returns Una Promise che si risolve con un array di nomi di file.
   */
  async listFilesInFolder(folderPath: string): Promise<string[]> {
    // Crea un riferimento alla cartella specificata nel bucket di Firebase Storage
    const listRef = ref(this.storage, folderPath);

    try {
      // Recupera e restituisce un array contenente i nomi di tutti i file nella cartella
      const res = await listAll(listRef);
      return res.items.map(itemRef => itemRef.name);
    } catch (error) {
      // Gestione degli errori durante l'elenco dei file
      console.error('Errore durante l\'elenco dei file:', error);
      throw error;
    }
  }

  /**
   * Elimina un file da Firebase Storage.
   * @param filePath Il percorso del file da eliminare in Firebase Storage.
   * @returns Una Promise che si risolve quando il file è stato eliminato.
   */
  async deleteFile(filePath: string): Promise<void> {
    // Crea un riferimento al file specificato nel bucket di Firebase Storage
    const fileRef = ref(this.storage, filePath);

    try {
      // Elimina il file dal percorso specificato
      await deleteObject(fileRef);
      console.log('File eliminato con successo');
    } catch (error) {
      // Gestione degli errori durante l'eliminazione del file
      console.error('Errore durante l\'eliminazione del file:', error);
      throw error;
    }
  }
}
