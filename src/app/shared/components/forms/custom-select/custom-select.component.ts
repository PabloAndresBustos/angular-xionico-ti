import { Component, computed, input, OnInit, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/shared/modules/components/components-module';
import { IonicElementsModule } from 'src/app/shared/modules/ionic-elements/ionic-elements-module';

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.scss'],
   imports: [
    IonicElementsModule,
    ComponentsModule,
    ReactiveFormsModule,
  ],
})

export class CustomSelectComponent  implements OnInit {

  label = input.required<string>();
  icon = input.required<string>();
  control = input.required<FormControl>();
  options = input<any[]>([]);
  multiple = input<boolean>(false);

  selectionChange = output<any>();

  constructor() { }

  optionsChange(event: any) {
    const value = event.detail.value;

    this.control().setValue(event.detail.value);
    this.control().markAsDirty();
    this.control().markAsTouched();

    this.selectionChange.emit(value);
  }

  ngOnInit() {}

}
