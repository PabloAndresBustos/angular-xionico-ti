import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { IonicElementsModule } from '../../modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from '../../modules/components/components-module';
import { Servers } from '../../services/servers';
import { addIcons } from 'ionicons';
import {
  cloudOfflineOutline,
  refreshOutline,
  serverOutline,
  businessOutline,
  cloudOutline
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
  private serversSrvc = inject(Servers);

  selectedDistributor = signal<string>('');
  selectedServerId = signal<string>('');

  availableDistributors = computed(() => {
    const all = this.serversSrvc.processedServers();
    return [...new Set(all.map((s) => s.nombreDistribuidora))];
  });

  constructor() {
    addIcons({
      cloudOutline,
      cloudOfflineOutline,
      refreshOutline,
      serverOutline,
      businessOutline,
    });

    effect(() => {
      const dists = this.availableDistributors();
      const currentDist = this.selectedDistributor();

      if (dists.length > 0 && (!currentDist || !dists.includes(currentDist))) {
        untracked(() => this.selectedDistributor.set(dists[0]));
      }
    }); // <-- Ya no hace falta el objeto de configuración aquí

    effect(() => {
      const list = this.serversInSelectedDist();
      const currentId = this.selectedServerId();

      if (list.length > 0) {
        const exists = list.some((s) => s.id === currentId);
        if (!exists) {
          untracked(() => this.selectedServerId.set(list[0].id));
        }
      }
    });
  }

  serversInSelectedDist = computed(() => {
    const dist = this.selectedDistributor();
    return this.serversSrvc
      .processedServers()
      .filter((s) => s.nombreDistribuidora === dist);
  });

  activeServer = computed(() => {
    const list = this.serversInSelectedDist();
    const selectedId = this.selectedServerId();
    return list.find((s) => s.id === selectedId) || list[0] || null;
  });

  ngOnInit() {}
}
