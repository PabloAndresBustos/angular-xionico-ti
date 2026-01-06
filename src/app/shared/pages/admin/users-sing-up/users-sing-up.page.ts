import { Component, input, OnInit } from '@angular/core';
import { IonicElementsModule } from 'src/app/shared/modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from 'src/app/shared/modules/components/components-module';
import { SingUpUserComponent } from 'src/app/shared/components/forms/sing-up-user/sing-up-user.component';
import { User } from 'src/app/shared/models/user.model';
import { SectionComponent } from 'src/app/shared/components/section/section.component';

@Component({
  selector: 'app-users-sing-up',
  templateUrl: './users-sing-up.page.html',
  styleUrls: ['./users-sing-up.page.scss'],
  standalone: true,
  imports: [IonicElementsModule, ComponentsModule, SingUpUserComponent, SectionComponent]
})
export class UsersSingUpPage implements OnInit {

  pendingUsers = input.required<User[]>();
  allServerData = input.required<any[]>();

  constructor() { }

  ngOnInit() {
  }

}
