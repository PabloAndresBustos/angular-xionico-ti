import { Component, OnInit, Input, input} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/shared/modules/components/components-module';
import { IonicElementsModule } from 'src/app/shared/modules/ionic-elements/ionic-elements-module';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
  standalone: true,
  imports: [ IonicElementsModule, ComponentsModule, ReactiveFormsModule]
})
export class CustomInputComponent  implements OnInit {

  constructor() {
    addIcons({
      eyeOffOutline,
      eyeOutline
    });
  }

  @Input() inputType!:string;
  iconName = input.required<string>();
  inputLabel = input.required<string>();
  formControlValue = input.required<FormControl>();

  /* Mostrar o Ocultar Password */
  isPassword = input.required<boolean>();
  hide: boolean = true;

  showHidePassword() {
    this.hide = !this.hide
    this.hide ? this.inputType = 'password' : this.inputType = 'text'
  }

  ngOnInit() {}

}
