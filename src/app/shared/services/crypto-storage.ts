import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CryptoStorage {
  private secretKey = environment.secretKey;

  saveData(key: string, data: any) {
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      this.secretKey
    ).toString();
    localStorage.setItem(key, encryptedData);
  }

  getData(key: string) {
    const data = localStorage.getItem(key);

    if (!data) return null;

    try {
      const bytes = CryptoJS.AES.decrypt(data, this.secretKey);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      return decryptedData;
    } catch (error) {
      console.error('Desencriptación con error:', error);
      return null;
    }
  }

  decryptData(data: any) {
    try {
      const bytes = CryptoJS.AES.decrypt(data, this.secretKey);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      return decryptedData;
    } catch (error) {
      console.error('Desencriptación con error:', error);
      return null;
    }
  }

  clear() {
    localStorage.clear();
  }
}
