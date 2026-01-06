import {
  Component,
  computed,
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

  async onConfirm() {
    const path = `users/${this.user().uid}`;

    try {
      const updateData = {
        ...this.cardForm.getRawValue(),
        approved: true,
      };

      await this.servers.updateDocument(path, updateData);
    } catch (error) {
      console.error(error);
    }
  }

  async onReject() {
    const path = `users/${this.user().uid}`;

    try {
      await this.servers.deleteDocument(path);
      await this.servers.deleteUser(this.user().uid);
      console.log('Solicitud eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  }

  ngOnInit() {
    this.cardForm = new FormGroup({
      distribuidoraAsignada: new FormControl(''),
      sucursales: new FormControl({ value: [], disabled: true }),
      role: new FormControl(2), // Valor inicial Usuario
      approved: new FormControl(false),
    });

    this.cardForm.get('role')?.valueChanges.subscribe((role) => {
      const distControl = this.cardForm.get('distribuidoraAsignada');
      const sucControl = this.cardForm.get('sucursales');

      if (role === 0 || role === 1) {
        distControl?.setValue('Todas');
        sucControl?.setValue('Todas');
        distControl?.disable();
        sucControl?.disable();
      } else {
        distControl?.enable();
        distControl?.setValue('');
        sucControl?.setValue([]);
      }
    });

    this.cardForm
      .get('distribuidoraAsignada')
      ?.valueChanges.subscribe((val) => {
        this.selectedDist.set(val);
        const sucursalesControl = this.cardForm.get('sucursales');
        const currentRole = this.cardForm.get('role')?.value;

        if (val && currentRole === 2) {
          sucursalesControl?.enable();
        } else if (currentRole === 2) {
          sucursalesControl?.disable();
          sucursalesControl?.setValue([]);
        }
      });
  }
}
