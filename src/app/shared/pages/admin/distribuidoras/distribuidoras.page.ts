import { Component, inject, OnInit } from '@angular/core';
import { IonicElementsModule } from 'src/app/shared/modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from 'src/app/shared/modules/components/components-module';
import { SectionComponent } from 'src/app/shared/components/section/section.component';
import { GoogleServices } from 'src/app/shared/services/google-services';
import { ViewServices } from 'src/app/shared/services/view-services';

@Component({
  selector: 'app-distribuidoras',
  templateUrl: './distribuidoras.page.html',
  styleUrls: ['./distribuidoras.page.scss'],
  standalone: true,
  imports: [IonicElementsModule, ComponentsModule, SectionComponent],
})
export class DistribuidorasPage implements OnInit {
  constructor() {}

  private googleDrive = inject(GoogleServices);
  private viewSrv = inject(ViewServices);

  distribuidoras: any[] = [];
  sucursales: any[] = [];
  logs: any[] = [];
  conectado = false;
  reporteGenerado: string | null = null;

  async cargarRaiz() {
    this.distribuidoras = await this.googleDrive.listarDistribuidoras();
    console.log(this.distribuidoras);
  }

  async cargarSucursales(distId: string) {
    const id = distId;
    if (!id) return;

    console.log('Buscando sucursales para:', id);
    this.sucursales = await this.googleDrive.listarSucursales(id);
    this.logs = [];
    console.log('Sucursales encontradas:', this.sucursales);
  }

  async cargarArchivos(sucuId: string) {
    const id = sucuId;
    if (!id) return;

    console.log('Buscando logs para:', id);
    this.logs = await this.googleDrive.listarLogs(id);
    console.log('Logs encontrados:', this.logs);
  }

  async conectarYListar() {
    try {
      console.log('Solicitando acceso a Google...');
      await this.googleDrive.obtenerAcceso();

      this.conectado = true;
      console.log('Acceso concedido, listando distribuidoras...');

      this.distribuidoras = await this.googleDrive.listarDistribuidoras();
    } catch (error) {
      console.error('Error en el proceso:', error);
    }
  }

  async prepararAnalisis(logId: string) {
    this.viewSrv.loadingSpinnerShow();
    try {
      const textoLog = await this.googleDrive.descargarTextoLog(logId);

      this.reporteGenerado = await this.googleDrive.analizarLog(textoLog);

      console.log('Reporte listo:', this.reporteGenerado);
    } catch (error) {
      console.error('Error analizando:', error);
    }finally {
      this.viewSrv.loadingSpinnerHide();
    }
  }

  ngOnInit() {}
}
