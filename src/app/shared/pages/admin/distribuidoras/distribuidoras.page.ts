import { Component, OnInit } from '@angular/core';
import { IonicElementsModule } from 'src/app/shared/modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from 'src/app/shared/modules/components/components-module';
import { SectionComponent } from 'src/app/shared/components/section/section.component';

@Component({
  selector: 'app-distribuidoras',
  templateUrl: './distribuidoras.page.html',
  styleUrls: ['./distribuidoras.page.scss'],
  standalone: true,
  imports: [IonicElementsModule, ComponentsModule, SectionComponent]
})
export class DistribuidorasPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
