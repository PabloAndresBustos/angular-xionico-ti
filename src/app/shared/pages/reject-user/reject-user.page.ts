import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicElementsModule } from '../../modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from '../../modules/components/components-module';
import { addIcons } from 'ionicons';
import { closeCircleOutline, arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-reject-user',
  templateUrl: './reject-user.page.html',
  styleUrls: ['./reject-user.page.scss'],
  standalone: true,
  imports: [IonicElementsModule, ComponentsModule],
})
export class RejectUserPage implements OnInit {
  constructor() {
    addIcons({
      closeCircleOutline,
      arrowBackOutline
    });
  }

  router = inject(Router);

  goToLogin() {
    this.router.navigateByUrl('/login');
  }

  ngOnInit() {}
}
