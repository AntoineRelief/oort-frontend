import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QueryBuilderService } from '../../services/query-builder.service';
import { FormGroup } from '@angular/forms';
import { PopupService } from '@progress/kendo-angular-popup';
import { MAT_SELECT_SCROLL_STRATEGY } from '@angular/material/select';
import { BlockScrollStrategy, Overlay } from '@angular/cdk/overlay';
import { MAT_TOOLTIP_SCROLL_STRATEGY } from '@angular/material/tooltip';
import { createQueryForm } from '../query-builder/query-builder-forms';

/**
 * Scroll Factory for material select, provided by the component.
 *
 * @param overlay material overlay
 * @returns Strategy to prevent scrolling if user sees overlay.
 */
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function scrollFactory(overlay: Overlay): () => BlockScrollStrategy {
  const block = () => overlay.scrollStrategies.block();
  return block;
}

/**
 * Interface that describes the structure of the data shown in the dialog
 */
interface DialogData {
  form: any;
  resourceName: string;
}

/**
 * This component is used in the grids to display a modal to configurate the fields in the grid
 */
@Component({
  selector: 'safe-config-display-grid-fields-modal',
  templateUrl: './config-display-grid-fields-modal.component.html',
  styleUrls: ['./config-display-grid-fields-modal.component.css'],
  providers: [
    PopupService,
    {
      provide: MAT_SELECT_SCROLL_STRATEGY,
      useFactory: scrollFactory,
      deps: [Overlay],
    },
    {
      provide: MAT_TOOLTIP_SCROLL_STRATEGY,
      useFactory: scrollFactory,
      deps: [Overlay],
    },
  ],
})
export class ConfigDisplayGridFieldsModalComponent implements OnInit {
  public form: FormGroup = new FormGroup({});
  public loading = true;

  @ViewChild('settingsContainer', { read: ViewContainerRef })
  settingsContainer: any;

  /**
   * The constructor function is a special function that is called when a new instance of the class is
   * created.
   *
   * @param data The data to be shown in the modal
   * @param queryBuilder The service used to build queries
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private queryBuilder: QueryBuilderService
  ) {}

  ngOnInit(): void {
    this.queryBuilder.availableQueries$.subscribe((res) => {
      if (res.length > 0) {
        const hasDataForm = this.data.form !== null;
        const queryName = hasDataForm
          ? this.data.form.value.name
          : this.queryBuilder.getQueryNameFromResourceName(
              this.data.resourceName
            );
        this.form = createQueryForm({
          name: queryName,
          fields: hasDataForm ? this.data.form.value.fields : [],
          sort: hasDataForm ? this.data.form.value.sort : {},
          filter: hasDataForm ? this.data.form.value.filter : {},
        });
        this.loading = false;
      }
    });
  }
}
