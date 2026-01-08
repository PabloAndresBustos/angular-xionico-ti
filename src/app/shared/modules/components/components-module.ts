import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentsComponent } from '../../components/comments/comments.component';
import { VideoComponent } from '../../components/video/video.component';
import { HeaderComponent } from '../../components/header/header.component';
import { NgxSpinnerModule } from "ngx-spinner";
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CommentsComponent,
    HeaderComponent,
    VideoComponent,
    ReactiveFormsModule,
    NgxSpinnerModule
  ],
  schemas : [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  exports: [
    CommonModule,
    CommentsComponent,
    HeaderComponent,
    VideoComponent,
    ReactiveFormsModule,
    NgxSpinnerModule
  ]
})
export class ComponentsModule {}
