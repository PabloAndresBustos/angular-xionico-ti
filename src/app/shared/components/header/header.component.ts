import { Component, inject, OnInit } from '@angular/core';
import { IonHeader } from "@ionic/angular/standalone";
import { IonicElementsModule } from '../../modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from '../../modules/components/components-module';
import { ViewServices } from '../../services/view-services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicElementsModule, ComponentsModule]
})
export class HeaderComponent  implements OnInit {

  private viewSrv = inject(ViewServices);

  constructor() { }

  platform(){
    return this.viewSrv.isMobile;
  }

  ngOnInit() {}

}
