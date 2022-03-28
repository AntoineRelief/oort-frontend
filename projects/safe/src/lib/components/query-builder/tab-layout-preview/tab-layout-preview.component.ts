import { Component, Input, OnInit } from '@angular/core';
import { GridSettings } from '../../ui/core-grid/models/grid-settings.model';

export interface LayoutPreviewData {
  form: any;
  defaultLayout: any;
}

const DEFAULT_GRID_SETTINGS = {
  actions: {
    delete: false,
    history: true,
    convert: false,
    update: false,
    inlineEdition: false,
  },
};

@Component({
  selector: 'safe-tab-layout-preview',
  templateUrl: './tab-layout-preview.component.html',
  styleUrls: ['./tab-layout-preview.component.scss'],
})
export class SafeTabLayoutPreviewComponent implements OnInit {
  @Input() data: LayoutPreviewData | null = null;
  public gridSettings: GridSettings = DEFAULT_GRID_SETTINGS;

  constructor() {}

  ngOnInit(): void {
    if (this.data) {
      this.data.form.get('query')?.valueChanges.subscribe(() => {
        this.gridSettings = {
          ...this.data?.form?.getRawValue(),
          ...DEFAULT_GRID_SETTINGS,
        };
      });
    }
  }

  /**
   * Updates layout parameters.
   *
   * @param value new value
   */
  onGridLayoutChange(value: any): void {
    if (this.data) {
      this.data.form?.get('display')?.setValue(value);
    }
  }
}
