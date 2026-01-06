import { Component, OnInit } from '@angular/core';
import { IonicElementsModule } from 'src/app/shared/modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from 'src/app/shared/modules/components/components-module';
import { SectionComponent } from 'src/app/shared/components/section/section.component';

@Component({
  selector: 'app-sql-query',
  templateUrl: './sql-query.page.html',
  styleUrls: ['./sql-query.page.scss'],
  standalone: true,
  imports: [IonicElementsModule, ComponentsModule, SectionComponent]
})
export class SqlQueryPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
