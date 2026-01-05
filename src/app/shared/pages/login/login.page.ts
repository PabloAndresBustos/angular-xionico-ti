import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomInputComponent } from '../../components/forms/custom-input/custom-input.component';
import { Router } from '@angular/router';
import { ViewServices } from '../../services/view-services';
import { ValidatorFormComponent } from '../../components/forms/validator-form/validator-form.component';
import { Servers } from '../../services/servers';
import { User } from '../../models/user.model';
import { ComponentsModule } from '../../modules/components/components-module';
import { IonicElementsModule } from '../../modules/ionic-elements/ionic-elements-module';
import { Biometric } from '../../services/biometric';
import { addIcons } from 'ionicons';
import {
  key,
  lockClosedOutline,
  logInOutline,
  personAddOutline,
  fingerPrintOutline,
  alertCircleOutline,
  mailOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonicElementsModule,
    ComponentsModule,
    CustomInputComponent,
    ValidatorFormComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginPage implements OnInit {
  private router = inject(Router);
  private viewSrv = inject(ViewServices);
  private servers = inject(Servers);
  private biometric = inject(Biometric);

  biometricData = signal<boolean>(false);

  constructor() {
    addIcons({
      key,
      lockClosedOutline,
      logInOutline,
      personAddOutline,
      fingerPrintOutline,
      alertCircleOutline,
      mailOutline,
    });
  }

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  async submit() {
    if (this.loginForm.valid) {
      const userLogin = this.loginForm.value as User;

      try {
        const userData = await this.servers.singIn(userLogin);

        if (userData) {
          this.viewSrv.toastPresent(
            `Bienvenido ${userData.name.toUpperCase()}`,
            'success'
          );
          this.viewSrv.isLogin.set(true);
          this.router.navigateByUrl('/content');
        }
      } catch (err: any) {
        this.viewSrv.toastPresent(err.message || 'Error', 'danger');
      }
    }
  }

  async authenUser() {
    const loginData = localStorage.getItem('xionico_user_temp');
    if (!loginData) {
      this.viewSrv.toastPresent('No hay credenciales registradas', 'warning');
      return;
    }

    const valid = await this.biometric.verify();

    if (valid) {
      try {
        const user = JSON.parse(loginData);

        const userData = await this.servers.singIn(user);

        if (userData) {
          this.viewSrv.toastPresent(
            `Acceso Biométrico: Bienvenido ${userData.name.toUpperCase()}`,
            'success'
          );
          this.viewSrv.isLogin.set(true);
          this.router.navigateByUrl('/content');
        }
      } catch (err: any) {
        this.viewSrv.toastPresent(
          'Error en la autenticación biométrica',
          'danger'
        );
      }
    }
  }

  checkBiometricData(){
    const bioId = localStorage.getItem('xionico_auth_cred_id');
    const tempUser = localStorage.getItem('xionico_user_temp');

    this.biometricData.set(!!(bioId && tempUser))
  }

  register() {
    this.router.navigateByUrl('/register');
  }

  ionViewWillLeave() {
    const activeEl = document.activeElement as HTMLElement;
    if (activeEl) {
      activeEl.blur();
    }
  }

  ngOnInit() {
    this.checkBiometricData();
  }
}
