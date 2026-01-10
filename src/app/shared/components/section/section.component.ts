import { Component, computed, inject, input, model, OnInit } from '@angular/core';
import { IonicElementsModule } from '../../modules/ionic-elements/ionic-elements-module';
import { ComponentsModule } from '../../modules/components/components-module';
import { ViewServices } from '../../services/view-services';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss'],
  imports: [IonicElementsModule, ComponentsModule]
})
export class SectionComponent  implements OnInit {

  private viewSrv = inject(ViewServices)

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

  updateTime():number{
    if(this.data().ispProvider === "LIMITED"){
      return 30 * 60 * 2000;
    }else{
      return 30 * 60 * 1000;
    }
  }

  serverAlarm = computed(() =>{
    const firebaseTime = this.data().lastUpdate;
    const firebaseDate = new Date(firebaseTime);
    const now = new Date();
    const MINUTOS = this.updateTime()
    const alarm = (now.getTime() - firebaseDate.getTime()) >= MINUTOS;
    return alarm
  });

  servicesStatus(){
    return this.viewSrv.servicesStatus();
  }



  ngOnInit() {
  }

}
