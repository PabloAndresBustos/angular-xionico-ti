import { Component, input, OnInit } from '@angular/core';
import { ComponentsModule } from 'src/app/shared/modules/components/components-module';
import { IonicElementsModule } from 'src/app/shared/modules/ionic-elements/ionic-elements-module';

@Component({
  selector: 'app-validator-form',
  templateUrl: './validator-form.component.html',
  styleUrls: ['./validator-form.component.scss'],
  standalone: true,
  imports: [IonicElementsModule, ComponentsModule]
})
export class ValidatorFormComponent implements OnInit {
  constructor() {}

  slot = input.required<string>();
  message = input.required<string>();
  showMessage = input.required<boolean>();
  color = input<string>();

  ngOnInit() {}
}
