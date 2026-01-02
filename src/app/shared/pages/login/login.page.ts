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
import { NativeBiometric } from 'capacitor-native-biometric';
import { addIcons } from 'ionicons';
import {
  key,
  lockClosedOutline,
  logInOutline,
  personAddOutline,
  fingerPrintOutline,
  alertCircleOutline,
  mailOutline
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
  router = inject(Router);
  viewSrvc = inject(ViewServices);
  servers = inject(Servers);

  constructor() {
    addIcons({
      key,
      lockClosedOutline,
      logInOutline,
      personAddOutline,
      fingerPrintOutline,
      alertCircleOutline,
      mailOutline
    });
  }

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  fingerPrint() {
    return this.viewSrvc.fingerPrint;
  }

  submit() {
    if (this.loginForm.valid) {
      this.servers.singIn(this.loginForm.value as User).then(res => {
        console.log(res);
      }).catch(err => {
        console.log(err)
      }).finally(() => {
        this.router.navigateByUrl('/content');
      })
    }
  }

  register() {
    this.router.navigateByUrl('/register');
  }

/*   async authWithFingerprint() {
  try {
    const result = await NativeBiometric.isAvailable();

    if(!result.isAvailable) return;

    const verified = await NativeBiometric.verifyIdentity({
      reason: "Para ingresar a tu cuenta de monitoreo",
      title: "Ingreso Biométrico",
      subtitle: "Usa tu huella o rostro",
      description: "Confirma tu identidad para continuar"
    });

    if(verified) {
      // 1. Aquí debes llamar a tu función de login
      // 2. Lo ideal es haber guardado las credenciales en el SecureStorage la primera vez
      console.log('Identidad verificada con éxito');
      this.submit(); // Llama a tu función de ingreso normal
    }
  } catch (error) {
    console.error("Error en biometría", error);
  }
} */

  ionViewWillLeave() {
    const activeEl = document.activeElement as HTMLElement;
    if (activeEl) {
      activeEl.blur();
    }
  }

  ngOnInit() {}
}
