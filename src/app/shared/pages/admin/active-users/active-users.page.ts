import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { IonicElementsModule } from 'src/app/shared/modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from 'src/app/shared/modules/components/components-module';
import { User } from 'src/app/shared/models/user.model';
import { SingUpUserComponent } from 'src/app/shared/components/forms/sing-up-user/sing-up-user.component';
import { SectionComponent } from 'src/app/shared/components/section/section.component';
import { Servers } from 'src/app/shared/services/servers';

@Component({
  selector: 'app-active-users',
  templateUrl: './active-users.page.html',
  styleUrls: ['./active-users.page.scss'],
  standalone: true,
  imports: [
    IonicElementsModule,
    ComponentsModule,
    SingUpUserComponent,
    SectionComponent,
  ],
})
export class ActiveUsersPage implements OnInit {
  approvedUsers = input.required<User[]>();
  allServerData = input.required<User[]>();
  searchTerm = signal<string>('');
  private servers = inject(Servers);

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const users = this.approvedUsers();

    if (!term) return users;

    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
    );
  });

  handleSearch(event: any) {
    this.searchTerm.set(event.detail.value);
  }

  adminUser() {
    return this.servers.adminUser();
  }

  constructor() {}

  ngOnInit() {}
}
