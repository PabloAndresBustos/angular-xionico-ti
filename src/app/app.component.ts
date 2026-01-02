import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { isPlatform } from '@ionic/angular';
import { ViewServices } from './shared/services/view-services';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {

  viewSrvc = inject(ViewServices);

  constructor() {

    if (isPlatform('android')) {
      this.viewSrvc.fingerPrint = true;
    }

    if(isPlatform('android') || isPlatform('ios')){
      this.viewSrvc.isMobile = true;
    }

  }

}
