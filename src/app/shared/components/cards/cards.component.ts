import {
  Component,
  computed,
  inject,
  Input,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { IonicElementsModule } from '../../modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from '../../modules/components/components-module';
import { BackupResponse } from '../../models/backup.model';
import { HardwareInfo } from '../../models/hardware.model';
import { Transferencias } from '../../models/trasnsferencias.models';
import { Servers } from '../../services/servers';
import { doc, updateDoc } from 'firebase/firestore';
import { addIcons } from 'ionicons';
import {
  thumbsUp,
  checkmarkCircle,
  removeCircle,
  stop,
  play,
  pauseCircle,
  stopCircleOutline,
  playCircleOutline,
  star,
  starOutline,
  speedometerOutline,
  hardwareChipOutline,
  warningOutline,
  cloudOfflineOutline,
  informationCircleOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
  standalone: true,
  imports: [IonicElementsModule, ComponentsModule],
})
export class CardsComponent implements OnInit {
  title = input<string>();
  colNames = input<string[]>();
  type = input.required<string>();
  services = input<any[]>();
  disks = input<any[]>();
  backups = input<BackupResponse | null>();
  hardware = input<HardwareInfo | null>(null);
  transferencias = input<Transferencias | null>(null);
  serverData = input<any>();
  selectedTab = signal<string>('Recomendados');
  filterText = signal<string>('');

  DISTRIBUIDORA_ID = input<string>('');
  SERVER_ID = input<string>('');

  popoverOpen = false;
  popoverEvent: Event | null = null;

  servers = inject(Servers);

  constructor() {
    addIcons({
      thumbsUp,
      checkmarkCircle,
      removeCircle,
      stop,
      play,
      pauseCircle,
      stopCircleOutline,
      playCircleOutline,
      star,
      starOutline,
      speedometerOutline,
      hardwareChipOutline,
      warningOutline,
      cloudOfflineOutline,
      informationCircleOutline,
    });
  }

  statusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      RUNNING: 'play-circle-outline',
      STOPPED: 'stop-circle-outline',
      PAUSED: 'pause-circle',
    };
    return icons[status] || 'remove-circle';
  }

  statusIconColor(status: string): string {
    const color: { [key: string]: string } = {
      RUNNING: 'xionico',
      STOPPED: 'danger',
    };
    return color[status] || 'danger';
  }

  backupIcon(status: string): string {
    return status === 'OK' ? 'thumbs-up' : 'remove-circle';
  }

  backupColor(status: string): string {
    return status === 'OK' ? 'xionico' : 'danger';
  }

  openPopover(event: Event) {
    this.popoverEvent = event;
    this.popoverOpen = true;
  }

  async toggleService(service: any) {
    const action = service.status === 'RUNNING' ? 'STOP' : 'START';

    const path = `distribuidoras/${this.DISTRIBUIDORA_ID()}/servidores/${this.SERVER_ID()}`;

    try {
      const serverRef = doc(this.servers.db, path);

      await updateDoc(serverRef, {
        lastCommand: {
          serviceId: service.id,
          action: action,
          timestamp: new Date().toISOString(),
          status: 'PENDING',
        },
      });

      console.log(`✅ Comando ${action} enviado para ${service.service}`);
    } catch (error: any) {
      console.error('❌ Error al enviar comando:', error.message);
    }
  }

  async toggleFav(service: any) {
    await this.servers.selectRecommended(
      this.DISTRIBUIDORA_ID(),
      this.SERVER_ID(),
      service.id,
      service.isRecommended
    );
  }

  serviceStatus(service: any) {
    if (service === 'RUNNING') {
      return 'EN EJECUCION';
    } else {
      return 'DETENIDO';
    }
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr || dateStr.length !== 8) return 'Fecha no disponible';

    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);

    return `${day}-${month}-${year}`;
  }

  displayServices = computed(() => {
    const data = this.serverData();
    const tab = this.selectedTab();
    const search = this.filterText().toLowerCase().trim();

    let list =
      tab === 'Recomendados'
        ? data.serviciosRecomendados || []
        : data.serviciosGeneral || [];

    if (search) {
      list = list.filter((s: any) => s.name.toLowerCase().includes(search));
    }

    return list;
  });

  totalRecomendados = computed(
    () => this.serverData()?.serviciosRecomendados?.length || 0
  );
  totalGeneral = computed(
    () => this.serverData()?.serviciosGeneral?.length || 0
  );

  ngOnInit() {}
}
