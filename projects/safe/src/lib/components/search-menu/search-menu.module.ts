import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeSearchMenuComponent } from './search-menu.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SafeButtonModule } from '../ui/button/button.module';
import { MatIconModule } from '@angular/material/icon';

/**
 * Search menu component module.
 */
@NgModule({
  declarations: [SafeSearchMenuComponent],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    SafeButtonModule,
  ],
  exports: [SafeSearchMenuComponent],
})
export class SafeSearchMenuModule {}
