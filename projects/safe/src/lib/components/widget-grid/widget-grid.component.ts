import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WIDGET_TYPES } from '../../models/dashboard.model';
import { SafeExpandedWidgetComponent } from './expanded-widget/expanded-widget.component';
import {
  TileLayoutReorderEvent,
  TileLayoutResizeEvent,
} from '@progress/kendo-angular-layout';

/** Maximum height of the widget in row units */
const MAX_ROW_SPAN = 4;

/** Maximum width of the widget in column units */
const MAX_COL_SPAN = 8;

/**
 * Component definition for grid widgets
 */
@Component({
  selector: 'safe-widget-grid',
  templateUrl: './widget-grid.component.html',
  styleUrls: ['./widget-grid.component.scss'],
})
export class SafeWidgetGridComponent implements OnInit {
  public widgetTypes: any[] = WIDGET_TYPES;

  @Input() widgets: any[] = [];
  @Input() canUpdate = false;

  // === GRID ===
  colsNumber = MAX_COL_SPAN;

  // === EVENT EMITTER ===
  @Output() move: EventEmitter<any> = new EventEmitter();
  @Output() delete: EventEmitter<any> = new EventEmitter();
  @Output() edit: EventEmitter<any> = new EventEmitter();
  @Output() add: EventEmitter<any> = new EventEmitter();

  // === STEP CHANGE FOR WORKFLOW ===
  @Output() goToNextStep: EventEmitter<any> = new EventEmitter();

  /**
   * Changes display when windows size changes.
   *
   * @param event window resize event
   */
  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any): void {
    this.colsNumber = this.setColsNumber(event.target.innerWidth);
  }

  /**
   * Constructor of the grid widget component
   *
   * @param dialog The material dialog service
   */
  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    this.colsNumber = this.setColsNumber(window.innerWidth);
  }

  /**
   * Changes the number of displayed columns.
   *
   * @param width width of the screen.
   * @returns new number of cols.
   */
  private setColsNumber(width: number): number {
    if (width <= 480) {
      return 1;
    }
    if (width <= 600) {
      return 2;
    }
    if (width <= 800) {
      return 4;
    }
    if (width <= 1024) {
      return 6;
    }
    return MAX_COL_SPAN;
  }

  /**
   * Emits edition event.
   *
   * @param e widget to edit.
   */
  onEditWidget(e: any): void {
    this.edit.emit(e);
  }

  /**
   * Emits delete event.
   *
   * @param e widget to delete.
   */
  onDeleteWidget(e: any): void {
    this.delete.emit(e);
  }

  /**
   * Expands widget in a full size screen popup.
   *
   * @param e widget to open.
   */
  onExpandWidget(e: any): void {
    const widget = this.widgets.find((x) => x.id === e.id);
    const dialogRef = this.dialog.open(SafeExpandedWidgetComponent, {
      data: {
        widget,
      },
      autoFocus: false,
      position: {
        bottom: '0',
        right: '0',
      },
      panelClass: 'expanded-widget-dialog',
    });
    dialogRef.componentInstance.goToNextStep.subscribe((event: any) => {
      this.goToNextStep.emit(event);
      dialogRef.close();
    });
  }

  /**
   * Emits addition event.
   *
   * @param e new widget.
   */
  onAdd(e: any): void {
    this.add.emit(e);
  }

  /**
   * Emits reorder event.
   *
   * @param e reorder event.
   */
  public onReorder(e: TileLayoutReorderEvent): void {
    this.move.emit(e);
  }

  /**
   * Handles resize widget event.
   *
   * @param e resize event.
   */
  public onResize(e: TileLayoutResizeEvent) {
    const widgetDefinition = this.widgetTypes.find(
      (x) => x.component === this.widgets[e.item.order].component
    );
    if (e.newRowSpan < widgetDefinition.minRow) {
      e.newRowSpan = widgetDefinition.minRow;
    }
    if (e.newRowSpan > MAX_ROW_SPAN) {
      e.newRowSpan = MAX_ROW_SPAN;
    }
    if (e.newColSpan > MAX_COL_SPAN) {
      e.newColSpan = MAX_COL_SPAN;
    }
    this.edit.emit({
      type: 'display',
      id: this.widgets[e.item.order].id,
      options: {
        id: this.widgets[e.item.order].id,
        cols: e.newColSpan,
        rows: e.newRowSpan,
      },
    });
  }
}
