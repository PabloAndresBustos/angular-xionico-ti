import { inject, Injectable } from '@angular/core';
import { NativeBiometric } from 'capacitor-native-biometric';
import { ViewServices } from './view-services';
import { Servers } from './servers';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class Biometric {
  private viewSrvc = inject(ViewServices);
  private server = inject(Servers);
  private router = inject(Router);

  async registerBiometric(user: User){
    try {
      const verify = await NativeBiometric.isAvailable();
      if(!verify.isAvailable) return;

      await NativeBiometric.setCredentials({
        username: user.email,
        password: user.password,
        server: "xionico-backoffice-ti"
      });

      this.viewSrvc.toastPresent('Registro biometrico existoso', 'success');

    } catch (error) {
      console.log(error)
      this.viewSrvc.toastPresent('Error inesperado en el registro', 'warning')
    }

  }

  async authenUser() {
    try {
      const result = await NativeBiometric.isAvailable();

      if (!result.isAvailable) {
        this.viewSrvc.toastPresent(
          'Este equipo no cuenta con doble seguridad, no es posible usar esa pagina',
          'danger'
        );
        this.server.signOut();
        return;
      }

      await NativeBiometric.verifyIdentity({
        reason: 'Acceso seguro al BackOffice Ti Xioncio',
        title: 'Identidad Requerida',
        subtitle: 'Usar biometria o tu PIN de sistema',
        description: 'Verifica tu identidad para continar',
        maxAttempts: 3,
      });

      this.router.navigateByUrl('/content');
    } catch (error: any) {
      const msg = error.message || 'Autenticacion cancelada'
      this.viewSrvc.toastPresent(msg, 'danger')
      this.router.navigateByUrl('/login');
    }
  }
}
