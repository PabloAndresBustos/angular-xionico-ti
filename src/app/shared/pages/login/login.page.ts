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
  private viewSrvc = inject(ViewServices);
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

  authenUser() {
    return this.biometric.authenUser();
  }

  submit() {
    if (this.loginForm.valid) {
      this.servers
        .singIn(this.loginForm.value as User)
        .then((res) => {
          const userData = res.user;
          if (userData.approved) {
            this.viewSrvc.toastPresent(`Bienvenido ${userData.name.toUpperCase()}`, 'success');
            this.router.navigateByUrl('/content');
          } else {
            this.router.navigateByUrl('/aprobation');
          }
        }).finally(() => {
          this.biometric.registerBiometric(this.loginForm.value as User)
        })
        .catch((err) => {
          this.viewSrvc.toastPresent('Verifique usuario o contraseña', 'danger');
        });
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
