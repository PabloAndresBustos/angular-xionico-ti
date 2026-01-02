import { Component, inject, OnInit } from '@angular/core';
import { IonicElementsModule } from '../../modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from '../../modules/components/components-module';
import { addIcons } from 'ionicons';
import { timeOutline, arrowBackOutline, cafeOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-aprobation',
  templateUrl: './aprobation.page.html',
  styleUrls: ['./aprobation.page.scss'],
  standalone: true,
  imports: [IonicElementsModule, ComponentsModule],
})
export class AprobationPage implements OnInit {
  constructor() {
    addIcons({
      timeOutline,
      arrowBackOutline,
      cafeOutline
    });
  }

  router = inject(Router);

  goToLogin() {
    this.router.navigateByUrl('/login');
  }

  ionViewWillLeave() {
    const activeEl = document.activeElement as HTMLElement;
    if (activeEl) {
      activeEl.blur();
    }
  }

  ngOnInit() {}
}
