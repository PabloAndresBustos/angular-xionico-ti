import { Component, inject, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { isPlatform } from '@ionic/angular';
import { ViewServices } from './shared/services/view-services';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {

  private viewSrvc = inject(ViewServices);

  constructor() {

    if (isPlatform('android')) {
      this.viewSrvc.fingerPrint = true;
    }

    if(isPlatform('android') || isPlatform('ios')){
      this.viewSrvc.isMobile.set(true);
    }

  }


  ngOnInit(): void {
    /* if(this.viewSrvc.biometricData()){
      this.viewSrvc.authenUser();
    } */
  }

}
