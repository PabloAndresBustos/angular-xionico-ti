import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { IonicElementsModule } from '../../modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from '../../modules/components/components-module';
import { Servers } from '../../services/servers';
import { SingUpUserComponent } from "../../components/forms/sing-up-user/sing-up-user.component";
import { ViewServices } from '../../services/view-services';
import { User } from '../../models/user.model';

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
  public rawUsers = signal<User[]>([]);
  private unsubscribeUsers?: () => void;

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

  approvedUsers(){
    return this.servers.approvedUsers();
  }

  ngOnInit() {
    this.viewSrv.isAdminPanel.set(true)
    console.log(this.servers.approvedUsers())
  }

  ngOnDestroy(): void {
    this.viewSrv.isAdminPanel.set(false)
    if (this.unsubscribeUsers) this.unsubscribeUsers();
  }
}
