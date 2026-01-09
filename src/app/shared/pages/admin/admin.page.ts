import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { IonicElementsModule } from '../../modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from '../../modules/components/components-module';
import { Servers } from '../../services/servers';
import { ViewServices } from '../../services/view-services';
import { User } from '../../models/user.model';
import { UsersSingUpPage } from './users-sing-up/users-sing-up.page';
import { ActiveUsersPage } from './active-users/active-users.page';
import { SqlQueryPage } from './sql-query/sql-query.page';
import { DistribuidorasPage } from './distribuidoras/distribuidoras.page';
import { MenuController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  peopleCircleOutline,
  fileTrayStackedOutline,
  lockClosedOutline,
  serverOutline,
  hourglassOutline,
  playOutline,
  downloadOutline,
  closeCircle,
  copyOutline,
  shieldCheckmarkOutline,
  logoGoogle,
  documentTextOutline,
  sparklesOutline,
  sparkles,
  cloudDownloadOutline,
  documentText,
  clipboardOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [
    IonicElementsModule,
    ComponentsModule,
    UsersSingUpPage,
    ActiveUsersPage,
    SqlQueryPage,
    DistribuidorasPage,
  ],
})
export class AdminPage implements OnInit, OnDestroy {
  servers = inject(Servers);
  private viewSrv = inject(ViewServices);
  private menu = inject(MenuController);
  public rawUsers = signal<User[]>([]);
  activeSection = signal<'pending' | 'active' | 'sql' | 'distribuidoras'>(
    'pending'
  );
  filterText = signal<string>('');
  private unsubscribeUsers?: () => void;

  constructor() {
    addIcons({
      fileTrayStackedOutline,
      peopleCircleOutline,
      lockClosedOutline,
      serverOutline,
      hourglassOutline,
      playOutline,
      downloadOutline,
      closeCircle,
      copyOutline,
      shieldCheckmarkOutline,
      logoGoogle,
      documentTextOutline,
      sparklesOutline,
      sparkles,
      cloudDownloadOutline,
      documentText,
      clipboardOutline,
    });
  }

  opcionesAprobar = [
    { label: 'Sí', value: true },
    { label: 'No', value: false },
  ];

  async selectionMenu(
    section: 'pending' | 'active' | 'sql' | 'distribuidoras'
  ) {
    this.activeSection.set(section);
    await this.menu.close('main-content');
  }

  distribuidoras() {
    return this.servers.distribuidorasDeServidores();
  }

  pendingUsers() {
    return this.servers.pendingUsers();
  }

  allServerData() {
    return this.servers.allServersData();
  }

  supportUser() {
    return this.servers.supportUser();
  }

  adminUser() {
    return this.servers.adminUser();
  }

  approvedUsers() {
    return this.servers.approvedUsers();
  }

  ngOnInit() {
    this.viewSrv.isAdminPanel.set(true);

    this.cargarDatosPrueba();
  }

  async cargarDatosPrueba() {
    const data = [
      { nombre: 'Bastari Pergamino', ip: '192.168.5.30' },
      { nombre: 'Topalen', ip: '192.168.5.35' },
      { nombre: 'Caramerlo', ip: '192.168.5.39' },
      { nombre: 'Dulnec', ip: '192.168.5.37' },
      { nombre: 'Vulcano', ip: '192.168.5.38' },
      { nombre: 'Forzater', ip: '192.168.5.36' },
      { nombre: 'Bogner MAD', ip: '192.168.5.34' },
      { nombre: 'Bogner Sao', ip: '192.168.5.48' },
      { nombre: 'Flap MDA', ip: '192.168.5.49' },
      { nombre: 'Valles', ip: '192.168.5.33' },
      { nombre: 'Lurini', ip: '192.168.5.47' },
      { nombre: 'Pys', ip: '192.168.5.42' },
      { nombre: 'Anastasia', ip: '192.168.5.43' },
      { nombre: 'Rosarc', ip: '192.168.5.31' },
      { nombre: 'Sfilio', ip: '192.168.5.40' },
      { nombre: 'Bogner Tre', ip: '192.168.5.45' },
      { nombre: 'Logicom', ip: '192.168.5.32' },
      { nombre: 'Bastari Junin', ip: '192.168.5.46' },
      { nombre: 'Bastari Salto', ip: '192.168.5.41' },
      { nombre: 'Bastari Pilar', ip: '192.168.5.44' },
    ];;


    const path = `distribuidoras/AMERICA/servidores/TENANT02`;

    try {
      await this.servers.updateDocument(path, {
        availableIps: data,
      });
      console.log('¡Datos cargados con éxito!');
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  }

  ngOnDestroy(): void {
    this.viewSrv.isAdminPanel.set(false);
    if (this.unsubscribeUsers) this.unsubscribeUsers();
  }
}
