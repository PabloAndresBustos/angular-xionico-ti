import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { IonicElementsModule } from '../../modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from '../../modules/components/components-module';
import { CustomInputComponent } from '../../components/forms/custom-input/custom-input.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Servers } from '../../services/servers';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonBadge } from "@ionic/angular/standalone";
import { SingUpUserComponent } from "../../components/forms/sing-up-user/sing-up-user.component";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicElementsModule, ComponentsModule, SingUpUserComponent],
})
export class AdminPage implements OnInit {
  servers = inject(Servers);

  constructor() {}

  opcionesAprobar = [
    { label: 'Sí', value: true },
    { label: 'No', value: false },
  ];

  submit() {
    console.log('Hi');
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

  supportUser(){
    return this.servers.supportUser()
  }

  adminUser(){
    return this.servers.adminUser();
  }

  ngOnInit() {}
}
