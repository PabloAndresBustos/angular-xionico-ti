import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { IonicElementsModule } from '../../modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from '../../modules/components/components-module';
import { Servers } from '../../services/servers';
import { SingUpUserComponent } from "../../components/forms/sing-up-user/sing-up-user.component";
import { ViewServices } from '../../services/view-services';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicElementsModule, ComponentsModule, SingUpUserComponent],
})
export class AdminPage implements OnInit, OnDestroy {
  servers = inject(Servers);
  private viewSrv = inject(ViewServices);

  constructor() {}

  opcionesAprobar = [
    { label: 'Sí', value: true },
    { label: 'No', value: false },
  ];

  distribuidoras() {
    return this.servers.distribuidorasDeServidores();
  }

  pendingUsers() {
    return this.servers.pendingUsers();
  }

  allServerData() {
    return this.servers.allServersData();
  }

  supportUser(){
    return this.servers.supportUser()
  }

  adminUser(){
    return this.servers.adminUser();
  }

  ngOnInit() {
    this.viewSrv.isAdminPanel.set(true)
  }

  ngOnDestroy(): void {
    this.viewSrv.isAdminPanel.set(false)
  }
}
