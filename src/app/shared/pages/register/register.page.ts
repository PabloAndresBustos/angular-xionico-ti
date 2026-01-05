import { Component, inject, OnInit } from '@angular/core';
import { IonicElementsModule } from '../../modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from '../../modules/components/components-module';
import { addIcons } from 'ionicons';
import {
  logInOutline,
  personAdd,
  lockClosedOutline,
  personOutline,
  alertCircleOutline,
  mailOutline,
  businessOutline,
  paperPlaneOutline,
} from 'ionicons/icons';
import { CustomInputComponent } from '../../components/forms/custom-input/custom-input.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ValidatorFormComponent } from '../../components/forms/validator-form/validator-form.component';
import { User } from '../../models/user.model';
import { Servers } from '../../services/servers';
import { ViewServices } from '../../services/view-services';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonicElementsModule,
    ComponentsModule,
    CustomInputComponent,
    ValidatorFormComponent,
  ],
})
export class RegisterPage implements OnInit {
  private router = inject(Router);
  private servers = inject(Servers);
  private viewSrvc = inject(ViewServices);

  constructor() {
    addIcons({
      personAdd,
      logInOutline,
      lockClosedOutline,
      personOutline,
      alertCircleOutline,
      mailOutline,
      businessOutline,
      paperPlaneOutline,
    });
  }

  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    distribuidoraObjetivo: new FormControl('', [Validators.required]),
  });

  async submit() {
    if (this.registerForm.valid) {
      try {
        const user = this.registerForm.value as User;
        const newUser = await this.servers.register(user);

        await this.servers.createUser(user, newUser.user.uid).then((res) => {
          this.router.navigateByUrl('/aprobation');
        });
      } catch (error: any) {
        const msgError = error.message || 'Ocurrió un error inesperado';
        this.viewSrvc.toastPresent(msgError, 'warning');
      }
    }
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
  }

  ionViewWillLeave() {
    const activeEl = document.activeElement as HTMLElement;
    if (activeEl) {
      activeEl.blur();
    }
  }

  ngOnInit() {}
}
