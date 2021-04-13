import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppPreviewRoutingModule } from './app-preview-routing.module';
import { AppPreviewComponent } from './app-preview.component';
import { PreviewToolbarModule } from './components/preview-toolbar/preview-toolbar.module';
import { SafeLayoutModule } from '@safe/builder';

@NgModule({
  declarations: [AppPreviewComponent],
  imports: [
    CommonModule,
    AppPreviewRoutingModule,
    SafeLayoutModule,
    PreviewToolbarModule
  ]
})
export class AppPreviewModule { }
