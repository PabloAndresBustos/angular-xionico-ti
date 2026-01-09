import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomInputComponent } from '../custom-input/custom-input.component';
import { IonicElementsModule } from 'src/app/shared/modules/ionic-elements/ionic-elements-module';
import { User } from 'src/app/shared/models/user.model';
import { ComponentsModule } from 'src/app/shared/modules/components/components-module';
import { addIcons } from 'ionicons';
import {
  mailOutline,
  personOutline,
  personAddOutline,
  layersOutline,
  checkmarkDoneCircleOutline,
  businessOutline,
  mapOutline,
  trashOutline,
} from 'ionicons/icons';
import { Servers } from 'src/app/shared/services/servers';
import { CustomSelectComponent } from '../custom-select/custom-select.component';
import { ViewServices } from 'src/app/shared/services/view-services';

@Component({
  selector: 'app-sing-up-user',
  templateUrl: './sing-up-user.component.html',
  styleUrls: ['./sing-up-user.component.scss'],
  imports: [
    CustomInputComponent,
    IonicElementsModule,
    ComponentsModule,
    ReactiveFormsModule,
    CustomSelectComponent,
  ],
})
export class SingUpUserComponent implements OnInit {
  user = input.required<User>();
  allServers = input<any[]>([]);
  title = input.required<string>();
  okButton = input.required<string>();
  redButton = input.required<string>();
  selectedDist = signal<string>('');

  private servers = inject(Servers);
  private viewSrv = inject(ViewServices);

  cardForm!: FormGroup;

  constructor() {
    addIcons({
      mailOutline,
      personOutline,
      personAddOutline,
      layersOutline,
      checkmarkDoneCircleOutline,
      businessOutline,
      mapOutline,
      trashOutline,
    });

  }

  getControl(name: string): FormControl {
    return this.cardForm.get(name) as FormControl;
  }

  sucursalesFiltradas = computed(() => {
    const dist = this.selectedDist();
    if (!dist || dist === 'Todas') return [];
    return this.allServers()
      .filter((s) => s.nombreDistribuidora === dist)
      .map((s) => s.nombreServidor || s.id);
  });

  uniqueDistributors = computed(() => {
    const servidores = this.allServers();
    return [...new Set(servidores.map((s) => s.nombreDistribuidora))];
  });

  distSelect(dist: string) {
    this.selectedDist.set(dist);
    this.getControl('sucursales').setValue([]);
  }

  async onConfirm() {
    const path = `users/${this.user().uid}`;
    this.viewSrv.loadingSpinnerShow();

    try {
      const rawData = this.cardForm.getRawValue();

      const updateData = {
        ...rawData,
        active: true,
      };

      await this.servers.updateDocument(path, updateData);

      console.log('✅ Usuario actualizado con éxito:', updateData);
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);
    } finally {
      this.viewSrv.loadingSpinnerHide();
    }
  }

  async onReject() {
    const path = `users/${this.user().uid}`;

    this.viewSrv.loadingSpinnerShow();
    try {
      const updateData = {
        approved: false,
        active: false,
      };
      await this.servers.updateDocument(path, updateData);
      console.log('Solicitud eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
    } finally {
      this.viewSrv.loadingSpinnerHide();
    }
  }

  checkRolePermissions(rolValue: number) {
    const distControl = this.cardForm.get('distribuidoraAsignada');
    const sucControl = this.cardForm.get('sucursales');

    if (!distControl || !sucControl) return;

    if (rolValue !== 2) {
      if (distControl.enabled || distControl.value !== 'TODAS') {
        distControl.setValue('TODAS', { emitEvent: false });
        distControl.disable({ emitEvent: false });
      }

      if (sucControl.enabled || sucControl.value?.[0] !== 'TODAS') {
        sucControl.setValue(['TODAS'], { emitEvent: false });
        sucControl.disable({ emitEvent: false });
      }

      return;
    }

    if (distControl.disabled) {
      distControl.enable({ emitEvent: false });
    }

    if (distControl.value === 'TODAS') {
      distControl.setValue('', { emitEvent: false });
    }

    if (distControl.value && distControl.value !== '') {
      if (sucControl.disabled) {
        sucControl.enable({ emitEvent: false });
      }
    } else {
      if (sucControl.enabled) {
        sucControl.setValue([], { emitEvent: false });
        sucControl.disable({ emitEvent: false });
      }
    }
  }

  adminUser() {
    return this.servers.adminUser();
  }

  ngOnInit() {
    this.cardForm = new FormGroup({
      distribuidoraAsignada: new FormControl(''),
      sucursales: new FormControl({ value: [], disabled: true }),
      role: new FormControl(2),
      approved: new FormControl(true),
      deleted: new FormControl(this.user().active || false),
    });

    this.cardForm
      .get('distribuidoraAsignada')
      ?.valueChanges.subscribe((value) => {
        this.selectedDist.set(value);
      });

    // 2. Carga de datos iniciales (Si es edición)
    const userData = this.user();
    if (userData) {
      this.cardForm.patchValue({
        distribuidoraAsignada: userData.distribuidoraAsignada || '',
        role: userData.role ?? 2,
        approved: userData.approved ?? true,
      });

      if (userData.distribuidoraAsignada) {
        this.selectedDist.set(userData.distribuidoraAsignada);
      }
    }

    // 3. SUSCRIPCIONES (Listeners proactivos)

    // Escuchar cambios en el Rol
    this.cardForm.get('role')?.valueChanges.subscribe((rolValue) => {
      this.checkRolePermissions(rolValue);
    });

    // Escuchar cambios en la Distribuidora (CRÍTICO para habilitar sucursales al primer clic)
    this.cardForm
      .get('distribuidoraAsignada')
      ?.valueChanges.subscribe((distValue) => {
        const currentRole = this.cardForm.get('role')?.value;
        // Si es un usuario normal (2), evaluamos si habilitar sucursales
        if (currentRole === 2) {
          this.checkRolePermissions(currentRole);
        }
      });

    // 4. Ejecución de permisos inicial (para el estado de carga)
    this.checkRolePermissions(this.cardForm.get('role')?.value);
  }
}
