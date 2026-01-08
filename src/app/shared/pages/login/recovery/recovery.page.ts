import { Component, inject, OnInit } from '@angular/core';
import { IonicElementsModule } from 'src/app/shared/modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from 'src/app/shared/modules/components/components-module';
import { CustomInputComponent } from 'src/app/shared/components/forms/custom-input/custom-input.component';
import { ValidatorFormComponent } from 'src/app/shared/components/forms/validator-form/validator-form.component';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  reloadOutline,
  lockClosedOutline,
  logInOutline,
  personAddOutline,
  fingerPrintOutline,
  alertCircleOutline,
  mailOutline,
  sendOutline,
} from 'ionicons/icons';
import { ViewServices } from 'src/app/shared/services/view-services';
import { Servers } from 'src/app/shared/services/servers';

@Component({
  selector: 'app-recovery',
  templateUrl: './recovery.page.html',
  styleUrls: ['./recovery.page.scss'],
  standalone: true,
  imports: [
    IonicElementsModule,
    ComponentsModule,
    CustomInputComponent,
    ValidatorFormComponent,
  ],
})
export class RecoveryPage implements OnInit {
  private router = inject(Router);
  private viewSrv = inject(ViewServices);
  private servers = inject(Servers);

  email: string = '';
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  constructor() {
    addIcons({
      reloadOutline,
      alertCircleOutline,
      mailOutline,
      sendOutline,
    });
  }

  recoveryForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  async enviarEnlace() {
    if (this.recoveryForm.invalid) {
      this.mensajeError = 'Por favor, ingresa un correo electrónico válido.';
      return;
    }

    const email = this.recoveryForm.value.email!;
    this.mensajeError = null;
    this.mensajeExito = null;
    this.viewSrv.loadingSpinnerShow();

    try {
      await this.servers.resetPassword(email);
      this.mensajeExito =
        'Se ha enviado un correo a tu cuenta para restablecer la contraseña.';
      this.recoveryForm.reset();
    } catch (error: any) {
      this.mensajeError =
        'Error: No se encontró una cuenta asociada a este correo o el servicio no está disponible.';
      console.error(error);
    } finally {
      this.viewSrv.loadingSpinnerHide();
    }
  }

  ionViewWillLeave() {
    const activeEl = document.activeElement as HTMLElement;
    if (activeEl) {
      activeEl.blur();
    }
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
  }

  ngOnInit() {}
}
