import { Component, input, model, OnInit } from '@angular/core';
import { IonicElementsModule } from '../../modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from '../../modules/components/components-module';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss'],
  imports: [IonicElementsModule, ComponentsModule]
})
export class SectionComponent  implements OnInit {

  title = input.required<string>();
  subTitle = input.required<string>();
  data = input.required<any>();
  serversInSelectedDist = input<any[]>([]);
  selectedServerId = model<string>('');
  status = input.required<boolean>();
  iconName = input.required<string>();

  onSegmentChange(event: any) {
    const newId = event.detail.value;
    this.selectedServerId.set(newId);
  }

  constructor() { }

  ngOnInit() {}

}
