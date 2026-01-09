import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from 'src/environments/environment';

declare var google: any;

@Injectable({
  providedIn: 'root',
})
export class GoogleServices {
  private accessToken: string | null = null;
  private clientID = environment.googleConfig.clientId;
  private scopes = environment.googleConfig.scope;
  private rootFolderId = environment.googleConfig.folderId;
  private genAI = new GoogleGenerativeAI(environment.googleConfig.geminiId);
  private model = this.genAI.getGenerativeModel(
    { model: 'gemini-3-flash-preview' }
  );

  constructor() {}

  obtenerAcceso(): Promise<string> {
    return new Promise((resolve, reject) => {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: this.clientID,
        scope: this.scopes,
        callback: (response: any) => {
          if (response.error) {
            reject(response.error);
          }
          this.accessToken = response.access_token;
          resolve(response.access_token);
        },
      });
      client.requestAccessToken();
    });
  }

  async listarDistribuidoras() {
    return this.listarContenidoCarpeta(this.rootFolderId);
  }

  async listarSucursales(distribuidoraId: string) {
    return this.listarContenidoCarpeta(distribuidoraId);
  }

  async listarLogs(sucursalId: string) {
    return this.listarContenidoCarpeta(sucursalId);
  }

  private async listarContenidoCarpeta(parentId: string) {
    if (!this.accessToken) throw new Error('No hay token de acceso');

    const query = `'${parentId}' in parents and trashed = false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size)`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    const data = await response.json();
    return data.files || [];
  }

  async descargarTextoLog(fileId: string): Promise<string> {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    );
    return await response.text();
  }

  async analizarLog(contenidoLog: string) {
    const prompt = `
      Actúa como un Ingeniero de DevOps experto.
      Analiza los siguientes registros de log que están en formato JSON.

      TAREAS:
      1. Resume los errores más críticos encontrados.
      2. Si hay fallos en SQL o BACKUPS, resáltalos.
      3. Genera una conclusión sobre el estado del servidor.

      LOGS A ANALIZAR:
      ${contenidoLog}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error en Gemini:", error);
      throw error;
    }
  }

}
