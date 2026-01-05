import { Component, OnInit } from '@angular/core';
import { IonicElementsModule } from '../../modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from '../../modules/components/components-module';
import { ValidatorFormComponent } from '../../components/forms/validator-form/validator-form.component';
import { CustomInputComponent } from '../../components/forms/custom-input/custom-input.component';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [
    IonicElementsModule,
    ComponentsModule,
    CustomInputComponent,
    ValidatorFormComponent,
  ],
})
export class AdminPage implements OnInit {
  constructor() {}

  approvedForm = new FormGroup({
    email: new FormControl(),
    password: new FormControl(),
    name: new FormControl(),
    role: new FormControl(),
    approved: new FormControl(),
    distribuidoraAsignada: new FormControl(),
    sucursales: new FormControl(),
    distribuidoraObjetivo: new FormControl(),
  });

  submit() {
    console.log('Hi');
  }

  ngOnInit() {}
}
