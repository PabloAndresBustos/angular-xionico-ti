import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicElementsModule } from 'src/app/shared/modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from 'src/app/shared/modules/components/components-module';
import { SectionComponent } from 'src/app/shared/components/section/section.component';
import { Servers } from 'src/app/shared/services/servers';
import * as XLSX from 'xlsx';
import { ViewServices } from 'src/app/shared/services/view-services';
import { onSnapshot } from 'firebase/firestore';
import { CommandResponse } from 'src/app/shared/models/commands.model';

@Component({
  selector: 'app-sql-query',
  templateUrl: './sql-query.page.html',
  styleUrls: ['./sql-query.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicElementsModule,
    ComponentsModule,
    SectionComponent,
    FormsModule,
  ],
})
export class SqlQueryPage implements OnInit {
  Object = Object;
  selectedDist = signal<string>('');
  selectedServer = signal<any>(null);
  isReady = signal(false);
  isExecuting = signal(false);
  queryData = signal<any[]>([]);
  allServerData = input.required<any[]>();
  fijarColumnas = signal<string[]>([]);
  lastProcessedRequest = signal<string>('');
  errorMessage = signal<string | null>(null);
  manualDbName: string = '';

  selectedIp = '';
  selectedDbName = '';
  queryText = '';

  public servers = inject(Servers);
  private viewSrv = inject(ViewServices);

  constructor() {}

  serversInDist = computed(() => {
    const dist = this.selectedDist();
    const allServers = this.allServerData();
    if (!dist) return [];
    return allServers.filter((s) => s.nombreDistribuidora === dist);
  });

  availableIps = computed(() => {
    const server = this.selectedServer();
    return server?.availableIps || [];
  });

  columnas = computed(() => {
    const data = this.queryData();
    return data.length > 0 ? Object.keys(data[0]) : [];
  });

  compareWith = (o1: any, o2: any) => {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  };

  userLogin() {
    return this.servers.userLogin();
  }

  onIpChange(ev: any){
    this.errorMessage.set(null);
    this.queryData.set([]);
  }

  onDistChange(ev: any) {
    this.selectedDist.set(ev.detail.value);
    this.queryData.set([]);
    this.errorMessage.set(null);
    this.selectedServer.set(null);
    this.selectedIp = '';
    this.selectedDbName = '';
  }

  onServerChange(ev: any) {
    this.selectedServer.set(ev.detail.value);

    this.queryData.set([]);
    this.errorMessage.set(null);

    if (this.selectedDist() === 'AMERICA') {
      this.selectedIp = '';
    } else {
      this.selectedIp = 'localhost';
    }
  }

  canExecute() {
    const dbFinal =
      this.selectedDbName === 'OTRA' ? this.manualDbName : this.selectedDbName;

    const common =
      this.selectedDist() &&
      this.selectedServer() &&
      dbFinal &&
      this.queryText.toUpperCase().trim().length > 10;

    if (this.selectedDist() === 'AMERICA') {
      return common && this.selectedIp;
    }
    return common;
  }

  async sendSqlCommand(
    distribuidoraId: string,
    serverId: string,
    sqlData: { ip: string; dbName: string; query: string }
  ) {
    const path = `distribuidoras/${distribuidoraId}/servidores/${serverId}/commandsQueue`;

    const command = {
      action: 'EXECUTE_SQL',
      status: 'PENDING',
      params: {
        ip: sqlData.ip,
        dbName: sqlData.dbName,
        query: sqlData.query,
        user: 'autotrader',
        password: 'autotrader',
        executeUser: {
          uid: this.userLogin().uid,
          name: this.userLogin().name,
          email: this.userLogin().email,
        },
      },
      requestedAt: new Date().toISOString(),
      createdAt: new Date(),
    };

    try {
      this.viewSrv.loadingSpinnerShow();
      return await this.servers.addDocument(path, command);
    } catch (error) {
      console.error('Error al enviar consulta SQL:', error);
      throw error;
    } finally {
      this.viewSrv.loadingSpinnerHide();
    }
  }

  private finalizarEjecucion(unsubFn: () => void) {
    unsubFn();
    this.isExecuting.set(false);
    this.viewSrv.loadingSpinnerHide();
  }

  async ejecutarConsulta() {
    const server = this.selectedServer();
    if (!server?.id || this.isExecuting()) return;

    const dbFinal =
      this.selectedDbName === 'OTRA'
        ? this.manualDbName.trim()
        : this.selectedDbName;

    if (!dbFinal) {
      console.warn('Debe especificar una base de datos');
      return;
    }

    this.errorMessage.set(null);
    this.isExecuting.set(true);
    this.viewSrv.loadingSpinnerShow();

    let ipFinal = this.selectedDist() === 'AMERICA' ? this.selectedIp : 'localhost';
    const queryFinal = `USE [${dbFinal}]; ${this.queryText.toUpperCase().trim()}`;

    try {
      const docRef = await this.sendSqlCommand(this.selectedDist(), server.id, {
        ip: ipFinal,
        dbName: dbFinal,
        query: queryFinal,
      });

      const unsub = onSnapshot(docRef, (snap) => {
        const data = snap.data() as CommandResponse;

        if (!data) return;

        if (data.status === 'SUCCESS') {
          const rawResults = data.results ?? [];

          try {
            const finalData = typeof rawResults === 'string' ? JSON.parse(rawResults) : rawResults;

            this.queryData.set(finalData);

            if (Array.isArray(finalData) && finalData.length > 0) {
              const columnasExtraidas = Object.keys(finalData[0]);
              this.fijarColumnas.set(columnasExtraidas);
              console.log(`✅ Consulta exitosa: ${finalData.length} filas recibidas.`);
            } else {
              this.fijarColumnas.set([]);
              console.warn('La consulta no devolvió filas.');
            }
          } catch (parseError) {
            console.error('Error al parsear los resultados del servidor:', parseError);
          }

          this.errorMessage.set(null);
          this.viewSrv.loadingSpinnerHide();
          this.isExecuting.set(false);
          unsub();
        }

        else if (data.status === 'ERROR') {
          console.error('Error reportado por el servidor:', data.error);
          this.errorMessage.set(data.error || 'Error desconocido en el servidor.');
          this.viewSrv.loadingSpinnerHide();
          this.isExecuting.set(false);
          unsub();
        }
      });

      setTimeout(() => {
        if (this.isExecuting()) {
          console.warn('⏱️ Timeout: El servidor no respondió a tiempo.');
          this.finalizarEjecucion(unsub);
        }
      }, 30000);

    } catch (error) {
      console.error('Error al iniciar la ejecución:', error);
      this.isExecuting.set(false);
      this.viewSrv.loadingSpinnerHide();
    }
  }

  queryResults = computed(() => {
    const command = this.lastCommand();
    if (command?.status === 'SUCCESS' && command?.results) {
      return command.results;
    }
    return [];
  });

  lastCommand = computed(() => {
    const server = this.selectedServer();
    const currentServer = this.servers
      .allServersData()
      .find((s) => s.id === server?.id);
    return currentServer?.lastCommand;
  });

  isTimestamp(value: any): boolean {
    return value && typeof value === 'object' && 'seconds' in value;
  }

  convertToDate(value: any): Date {
    return new Date(value.seconds * 1000);
  }

  exportarAExcel() {
    const data = this.queryData();
    const columnas = this.fijarColumnas();

    if (data.length === 0) return;

    const dataParaExcel = data.map((row) => {
      const objetoOrdenado: any = {};
      columnas.forEach((col) => {
        let valor = row[col];
        if (this.isTimestamp(valor)) {
          const d = this.convertToDate(valor);
          valor = d.toLocaleString();
        }
        objetoOrdenado[col] = valor ?? '-';
      });
      return objetoOrdenado;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataParaExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados_SQL');

    const fecha = new Date().toISOString().slice(0, 10);
    const nombreArchivo = `Consulta_${
      this.selectedServer()?.nombreServidor
    }_${fecha}.xlsx`;

    XLSX.writeFile(workbook, nombreArchivo);
  }

  ngOnInit() {
    setTimeout(() => this.isReady.set(true), 300);
  }
}
