import { inject, Injectable, signal } from '@angular/core';
import { ModalOptions } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class ViewServices {
  public fingerPrint: boolean = false;
  public isMobile: boolean = false;
  private modalController = inject(ModalController);
  private toastController = inject(ToastController);

  public isLogin = signal<boolean>(false);
  public isAdminPanel = signal<boolean>(false);

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

}
