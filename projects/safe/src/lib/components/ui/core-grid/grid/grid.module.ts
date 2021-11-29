import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeGridComponent } from './grid.component';
import { SafeGridRowActionsModule } from '../row-actions/row-actions.module';
import { SafeGridToolbarModule } from '../toolbar/toolbar.module';
import { SafeArrayFilterModule } from '../array-filter/array-filter.module';
import { SafeArrayFilterMenuModule } from '../array-filter-menu/array-filter-menu.module';
import { SafeDropdownFilterModule } from '../dropdown-filter/dropdown-filter.module';
import { SafeDropdownFilterMenuModule } from '../dropdown-filter-menu/dropdown-filter-menu.module';
import { SafeExpandedCommentModule } from '../expanded-comment/expanded-comment.module';

@NgModule({
  declarations: [
    SafeGridComponent
  ],
  imports: [
    CommonModule,
    // === UTILS ===
    SafeExpandedCommentModule,
    // === FILTER ===
    SafeArrayFilterModule,
    SafeArrayFilterMenuModule,
    SafeDropdownFilterModule,
    SafeDropdownFilterMenuModule,
    // === ROW ===
    SafeGridRowActionsModule,
    // === TOOLBAR ===
    SafeGridToolbarModule
  ],
  exports: [
    SafeGridComponent
  ]
})
export class SafeGridModule { }
