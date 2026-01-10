import { computed, inject, Injectable, signal } from '@angular/core';
import { ModalOptions } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular/standalone';
import { NgxSpinnerService } from 'ngx-spinner';
import { Services } from '../models/services.models';

@Injectable({
  providedIn: 'root',
})
export class ViewServices {
  public fingerPrint: boolean = false;
  private modalController = inject(ModalController);
  private toastController = inject(ToastController);
  spinnerService = inject(NgxSpinnerService);

  public isLogin = signal<boolean>(false);
  public isAdminPanel = signal<boolean>(false);
  public biometricData = signal<boolean>(false);
  public isMobile = signal<boolean>(false);

  public generalStatus = signal<string>('');
  public rawServices = signal<Services[]>([]);
  public rawTransfer = signal<string>('');

  async presentModal(opts: ModalOptions) {
    const modal = await this.modalController.create(opts);
    await modal.present();
  }

  closeModal(data?: any) {
    if (data) {
      this.modalController.dismiss();
      return data;
    } else {
      return this.modalController.dismiss();
    }
  }

  async toastPresent(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      position: 'bottom',
      color: color,
      cssClass: 'custom-ion-toast',
    });
    await toast.present();
  }

  loadingSpinnerShow() {
    this.spinnerService.show(undefined, {
      bdColor: 'rgba(0, 0, 0, 0.8)',
      color: '#0ea5e9',
      size: 'medium',
    });
  }

  loadingSpinnerHide() {
    this.spinnerService.hide();
  }

  public servicesStatus = computed(() => {
    const list = this.rawServices();
    if (list.length === 0) return 0;

    const up = list.filter((s) => s.status === 'RUNNING').length;
    return Math.round((up / list.length) * 100);
  });

}
