import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
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
        await this.servers.singIn(userLogin).then((res) => {
          this.viewSrv.toastPresent(
            `Bienvenido ${userLogin.name.toUpperCase()}`,
            'success'
          );
          this.viewSrv.isLogin.set(true);
          this.router.navigateByUrl('/content');
        });
      } catch (err: any) {
        this.viewSrv.toastPresent(err.message || 'Error', 'danger');
      }
    }
  }

  async authenUser() {
    const loginData = localStorage.getItem('xionico_user_temp');
    if (!loginData) return;

    const valid = await this.biometric.verify();

    if (valid) {
      const user = JSON.parse(loginData);
      await this.servers.singIn(user);
    }
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

  ngOnInit() {}
}
