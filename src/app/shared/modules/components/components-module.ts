import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentsComponent } from '../../components/comments/comments.component';
import { VideoComponent } from '../../components/video/video.component';
import { HeaderComponent } from '../../components/header/header.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CommentsComponent,
    HeaderComponent,
    VideoComponent,
    ReactiveFormsModule
  ],
  exports: [
    CommonModule,
    CommentsComponent,
    HeaderComponent,
    VideoComponent,
    ReactiveFormsModule
  ]
})
export class ComponentsModule {}
