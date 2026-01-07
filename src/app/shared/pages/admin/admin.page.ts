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
import { SqlQueryPage } from "./sql-query/sql-query.page";
import { DistribuidorasPage } from "./distribuidoras/distribuidoras.page";
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
  shieldCheckmarkOutline
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
    DistribuidorasPage
],
})
export class AdminPage implements OnInit, OnDestroy {
  servers = inject(Servers);
  private viewSrv = inject(ViewServices);
  private menu = inject(MenuController);
  public rawUsers = signal<User[]>([]);
  activeSection = signal<'pending' | 'active' | 'sql' | 'distribuidoras'>('pending');
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
      shieldCheckmarkOutline
    });
  }

  opcionesAprobar = [
    { label: 'Sí', value: true },
    { label: 'No', value: false },
  ];

  async selectionMenu(section: 'pending' | 'active' | 'sql' | 'distribuidoras') {
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
  }

  ngOnDestroy(): void {
    this.viewSrv.isAdminPanel.set(false);
    if (this.unsubscribeUsers) this.unsubscribeUsers();
  }
}
