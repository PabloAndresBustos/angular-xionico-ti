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
  manualDbName: string = '';

  selectedIp = '';
  selectedDbName = '';
  queryText = '';

  public servers = inject(Servers);

  constructor() {
    effect(() => {
      const server = this.selectedServer();
      const current = this.allServerData().find((s) => s.id === server?.id);
      const command = current?.lastCommand;

      if (!command) return;

      if (command.status === 'PENDING') {
        this.isExecuting.set(true);
        return;
      }

      if (command.status === 'SUCCESS' || command.status === 'FINISHED') {
        if (command.requestedAt === this.lastProcessedRequest()) {
          this.isExecuting.set(false);
          return;
        }

        const newData = command.results || [];

        if (newData.length > 0) {
          this.fijarColumnas.set(Object.keys(newData[0]));
        }
        this.queryData.set(newData);

        this.lastProcessedRequest.set(command.requestedAt);
        this.isExecuting.set(false);
      }

      if (command.status === 'ERROR') {
        this.isExecuting.set(false);
      }
    });
  }

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

  onDistChange(ev: any) {
    this.selectedDist.set(ev.detail.value);
    this.selectedServer.set(null);
    this.selectedIp = '';
    this.selectedDbName = '';
  }

  onServerChange(ev: any) {
    this.selectedServer.set(ev.detail.value);

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
      this.queryText.trim().length > 10;

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
    const path = `distribuidoras/${distribuidoraId}/servidores/${serverId}`;

    const command = {
      action: 'EXECUTE_SQL',
      status: 'PENDING',
      params: {
        ip: sqlData.ip,
        dbName: sqlData.dbName,
        query: sqlData.query,
        user: 'autotrader',
        password: 'autotrader',
      },
      requestedAt: new Date().toISOString(),
    };

    try {
      return await this.servers.updateDocument(path, {
        lastCommand: command,
      });
    } catch (error) {
      console.error('Error al enviar consulta SQL:', error);
      throw error;
    }
  }

  async ejecutarConsulta() {
    const server = this.selectedServer();
    if (!server?.id || this.isExecuting()) return;

    const dbFinal =
      this.selectedDbName === 'OTRA'
        ? this.manualDbName.trim()
        : this.selectedDbName;

    if (!dbFinal) {
      console.error('Debes especificar un nombre de base de datos');
      return;
    }

    this.isExecuting.set(true);

    let ipFinal =
      this.selectedDist() === 'AMERICA' ? this.selectedIp : 'localhost';

    try {
      await this.sendSqlCommand(this.selectedDist(), server.id, {
        ip: ipFinal,
        dbName: dbFinal,
        query: this.queryText,
      });
    } catch (error) {
      this.isExecuting.set(false);
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
