import { Component, inject, input, OnInit } from '@angular/core';
import { IonicElementsModule } from '../../modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from '../../modules/components/components-module';
import { ViewServices } from '../../services/view-services';
import { addIcons } from 'ionicons';
import { logOutOutline, peopleOutline } from 'ionicons/icons';
import { Servers } from '../../services/servers';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicElementsModule, ComponentsModule],
})
export class HeaderComponent implements OnInit {
  private viewSrv = inject(ViewServices);
  private serversSrvc = inject(Servers);
  private router = inject(Router);

  constructor() {
    addIcons({
      logOutOutline,
      peopleOutline,
    });
  }

  platform() {
    return this.viewSrv.isMobile;
  }

  adminOrSupport() {
    if(this.serversSrvc.adminUser() || this.serversSrvc.supportUser() ){
      return true;
    }else{
      return false
    }
  }

  admin() {
    this.router.navigateByUrl('/admin');
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  signOut() {
    this.serversSrvc.signOut();
  }

  isLogin() {
    return this.viewSrv.isLogin();
  }

  ionViewWillLeave() {
    const activeEl = document.activeElement as HTMLElement;
    if (activeEl) {
      activeEl.blur();
    }
  }

  ngOnInit() {}
}
