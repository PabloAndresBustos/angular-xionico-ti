import { Component, inject, OnInit } from '@angular/core';
import { IonicElementsModule } from '../../modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from '../../modules/components/components-module';
import { ViewServices } from '../../services/view-services';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { Servers } from '../../services/servers';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicElementsModule, ComponentsModule]
})
export class HeaderComponent  implements OnInit {

  private viewSrv = inject(ViewServices);
  private serversSrvc = inject(Servers);

  constructor() {
    addIcons({
      logOutOutline
    })
  }

  platform(){
    return this.viewSrv.isMobile;
  }

  signOut(){
    this.serversSrvc.signOut();
  }

  isLogin(){
    return this.viewSrv.isLogin();
  }

  ngOnInit() {}

}
