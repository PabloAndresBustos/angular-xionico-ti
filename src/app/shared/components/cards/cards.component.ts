import { Component, computed, inject, Input, input, OnInit, signal } from '@angular/core';
import { IonicElementsModule } from '../../modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from '../../modules/components/components-module';
import { Servers } from '../../services/servers';
import { doc, updateDoc,  } from 'firebase/firestore';
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
  cloudOfflineOutline
} from 'ionicons/icons';


interface HardwareInfo {
  cpu: { usagePercentage: number; usageRatio: number };
  ram: { totalGB: string; usedGB: string; usagePercentage: string; usageRatio: number };
}

interface BackupResponse {
  lastBackups: any[];
  backupFoundToday: boolean;
  error?: string;
}

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
  serverData = input<any>();
  selectedTab = signal<string>('Recomendados');
  filterText = signal<string>('');

  DISTRIBUIDORA_ID = input<string>('');
  SERVER_ID = input<string>('');

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
      cloudOfflineOutline
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

  async toggleFav(service:any){
    await this.servers.selectRecommended(
      service.id, this.SERVER_ID(), this.DISTRIBUIDORA_ID(), service.isRecommended
    )
  }

  serviceStatus(service: any){
    if (service === 'RUNNING') {
      return 'EN EJECUCION'
    }else{
      return 'DETENIDO'
    }
  }

  displayServices = computed(() => {
    const data = this.serverData();
    const tab = this.selectedTab();
    const search = this.filterText().toLowerCase().trim();

    let list = tab === 'Recomendados' ?
               (data.serviciosRecomendados || []) :
               (data.serviciosGeneral || []);

    if (search) {
      list = list.filter((s: any) =>
        s.name.toLowerCase().includes(search)
      );
    }

    return list;
  });

  totalRecomendados = computed(() => this.serverData()?.serviciosRecomendados?.length || 0);
  totalGeneral = computed(() => this.serverData()?.serviciosGeneral?.length || 0);


  ngOnInit() {}
}
