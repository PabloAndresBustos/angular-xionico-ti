import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { IonicElementsModule } from '../../modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from '../../modules/components/components-module';
import { ViewServices } from '../../services/view-services';
import { Servers } from '../../services/servers';
import { addIcons } from 'ionicons';
import {
  cloudOfflineOutline,
  refreshOutline,
  serverOutline,
  businessOutline
} from 'ionicons/icons';
import { CardsComponent } from '../../components/cards/cards.component';

@Component({
  selector: 'app-content',
  templateUrl: './content.page.html',
  styleUrls: ['./content.page.scss'],
  standalone: true,
  imports: [IonicElementsModule, ComponentsModule, CardsComponent],
})
export class ContentPage implements OnInit {
  private viewSrvc = inject(ViewServices);
  selectedServerId = signal<string>('');

  servers = inject(Servers);
  allServersData = signal<any[]>([]);
  serversList = computed(() => this.servers.processedServers());

  constructor() {
    addIcons({
      cloudOfflineOutline,
      refreshOutline,
      serverOutline,
      businessOutline
    });
  }



  activeServer = computed(() => {
  const list = this.serversList();
  const selectedId = this.selectedServerId();

  if (!selectedId && list.length > 0) {
    setTimeout(() => this.selectedServerId.set(list[0].id), 0);
    return list[0];
  }

  return list.find(s => s.id === selectedId);
});

  platform() {
    return this.viewSrvc.isMobile;
  }

  processedServers() {
    return this.servers.processedServers();
  }

  ngOnInit() {}
}
