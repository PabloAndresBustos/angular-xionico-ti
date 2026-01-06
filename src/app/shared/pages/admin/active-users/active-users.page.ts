import { Component, input, OnInit } from '@angular/core';
import { IonicElementsModule } from 'src/app/shared/modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from 'src/app/shared/modules/components/components-module';
import { User } from 'src/app/shared/models/user.model';
import { SingUpUserComponent } from 'src/app/shared/components/forms/sing-up-user/sing-up-user.component';
import { SectionComponent } from 'src/app/shared/components/section/section.component';

@Component({
  selector: 'app-active-users',
  templateUrl: './active-users.page.html',
  styleUrls: ['./active-users.page.scss'],
  standalone: true,
  imports: [IonicElementsModule, ComponentsModule, SingUpUserComponent, SectionComponent]
})
export class ActiveUsersPage implements OnInit {

  approvedUsers = input.required<User[]>();
  allServerData = input.required<User[]>();

  constructor() { }

  ngOnInit() {
  }

}
