import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicElementsModule } from 'src/app/shared/modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from 'src/app/shared/modules/components/components-module';
import { SectionComponent } from 'src/app/shared/components/section/section.component';
import { Servers } from 'src/app/shared/services/servers';

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

  selectedIp = '';
  selectedDbName = '';
  queryText = '';

  public servers = inject(Servers);

  constructor() {
    effect(() => {
      const status = this.lastCommand()?.status;
      if (status === 'SUCCESS' || status === 'ERROR') {
        this.isExecuting.set(false);
      }
    });
  }

  ngOnInit() {
    setTimeout(() => this.isReady.set(true), 300);
  }

  serversInDist = computed(() => {
    const dist = this.selectedDist();
    const allServers = this.servers.allServersData();
    if (!dist) return [];
    return allServers.filter((s) => s.nombreDistribuidora === dist);
  });

  availableIps = computed(() => {
    const server = this.selectedServer();
    return server?.availableIps || [];
  });

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
    const common =
      this.selectedDist() &&
      this.selectedServer() &&
      this.selectedDbName &&
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
    if (!server || this.isExecuting()) return;

    this.isExecuting.set(true);

    let ipFinal =
      this.selectedDist() === 'AMERICA' ? this.selectedIp : 'localhost';

    try {
      await this.sendSqlCommand(this.selectedDist(), server.id, {
        ip: ipFinal,
        dbName: this.selectedDbName,
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
}
