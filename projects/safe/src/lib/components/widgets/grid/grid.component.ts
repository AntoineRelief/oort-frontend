import { Apollo } from 'apollo-angular';
import { CompositeFilterDescriptor, filterBy, orderBy, SortDescriptor } from '@progress/kendo-data-query';
import {
  GridComponent as KendoGridComponent,
  GridDataResult,
  PageChangeEvent,
  SelectableSettings,
  SelectionEvent,
  PagerSettings,
  ColumnReorderEvent,
  RowArgs
} from '@progress/kendo-angular-grid';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  CONVERT_RECORD,
  ConvertRecordMutationResponse, EDIT_RECORD, EditRecordMutationResponse,
  PUBLISH, PUBLISH_NOTIFICATION, PublishMutationResponse, PublishNotificationMutationResponse, DELETE_RECORDS
} from '../../../graphql/mutations';
import { SafeFormModalComponent } from '../../form-modal/form-modal.component';
import { Subscription } from 'rxjs';
import { QueryBuilderService } from '../../../services/query-builder.service';
import { SafeConfirmModalComponent } from '../../confirm-modal/confirm-modal.component';
import { SafeConvertModalComponent } from '../../convert-modal/convert-modal.component';
import { Form } from '../../../models/form.model';
import {
  GetRecordDetailsQueryResponse, GET_RECORD_DETAILS,
  GetRecordByIdQueryResponse, GET_RECORD_BY_ID
} from '../../../graphql/queries';
import { SafeRecordHistoryComponent } from '../../record-history/record-history.component';
import { SafeLayoutService } from '../../../services/layout.service';
import {
  Component, OnInit, OnChanges, OnDestroy, ViewChild, Input, Output, ComponentFactory, Renderer2,
  ComponentFactoryResolver, EventEmitter, Inject
} from '@angular/core';
import { SafeSnackBarService } from '../../../services/snackbar.service';
import { SafeRecordModalComponent } from '../../record-modal/record-modal.component';
import { GradientSettings } from '@progress/kendo-angular-inputs';
import { SafeWorkflowService } from '../../../services/workflow.service';
import { SafeChooseRecordModalComponent } from '../../choose-record-modal/choose-record-modal.component';
import { SafeDownloadService } from '../../../services/download.service';
import { NOTIFICATIONS } from '../../../const/notifications';
import { prettifyLabel } from '../../../utils/prettify';
import { SafeAuthService } from '../../../services/auth.service';
import { SafeApiProxyService } from '../../../services/api-proxy.service';
import { SafeEmailService } from '../../../services/email.service';
import get from 'lodash/get';
import { ExcelExportData } from '@progress/kendo-angular-excel-export';
import { SafeResourceGridModalComponent } from '../../search-resource-grid-modal/search-resource-grid-modal.component';
import { GridLayout } from '../../ui/core-grid/models/grid-layout.model';
import { SafeCoreGridComponent } from '../../ui/core-grid/core-grid.component';


// const matches = (el: any, selector: any) => (el.matches || el.msMatchesSelector).call(el, selector);

// const DEFAULT_FILE_NAME = 'grid.xlsx';

// const cloneData = (data: any[]) => data.map(item => Object.assign({}, item));

// const DISABLED_FIELDS = ['id', 'incrementalId', 'createdAt', 'modifiedAt'];

// const SELECTABLE_SETTINGS: SelectableSettings = {
//   checkboxOnly: true,
//   mode: 'multiple',
//   drag: false
// };

// const PAGER_SETTINGS: PagerSettings = {
//   buttonCount: 5,
//   type: 'numeric',
//   info: true,
//   pageSizes: [10, 25, 50, 100],
//   previousNext: true
// };

// const GRADIENT_SETTINGS: GradientSettings = {
//   opacity: false
// };

// const MULTISELECT_TYPES: string[] = ['checkbox', 'tagbox', 'owner', 'users'];

const REGEX_PLUS = new RegExp('today\\(\\)\\+\\d+');

const REGEX_MINUS = new RegExp('today\\(\\)\\-\\d+');

@Component({
  selector: 'safe-grid-widget',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
/*  Grid widget using KendoUI.
*/
export class SafeGridWidgetComponent implements OnInit {

  // === TEMPLATE REFERENCE ===
  @ViewChild(SafeCoreGridComponent)
  private grid!: SafeCoreGridComponent;

  // === DATA ===
  private isNew = false;
  public loading = true;
  public queryError = false;
  public fields: any[] = [];

  // === CACHED CONFIGURATION ===
  @Input() layout: GridLayout = {};

  // === VERIFICATION IF USER IS ADMIN ===
  public isAdmin: boolean;

  // === SORTING ===
  public sort: SortDescriptor[] = [];

  // === PAGINATION ===
  public pageSize = 10;
  public skip = 0;

  // === FILTER ===
  public filter: CompositeFilterDescriptor = { logic: 'and', filters: [] };
  public showFilter = false;

  // === SETTINGS ===
  @Input() header = true;
  @Input() settings: any = null;
  @Input() id = '';

  // === ACTIONS ON SELECTION ===
  public selectedRowsIndex: number[] = [];
  public hasEnabledActions = false;
  public canUpdateSelectedRows = false;
  public canDeleteSelectedRows = false;
  public editionActive = false;

  // === EMIT STEP CHANGE FOR WORKFLOW ===
  @Output() goToNextStep: EventEmitter<any> = new EventEmitter();

  // === NOTIFY CHANGE OF GRID CHILD ===
  @Output() childChanged: EventEmitter<any> = new EventEmitter();

  @Output() layoutChanged: EventEmitter<any> = new EventEmitter();

  @Output() defaultLayoutChanged: EventEmitter<any> = new EventEmitter();

  @Output() defaultLayoutReset: EventEmitter<any> = new EventEmitter();

  // === HISTORY COMPONENT TO BE INJECTED IN LAYOUT SERVICE ===
  public factory?: ComponentFactory<any>;

  // === DOWNLOAD ===
  public excelFileName = '';

  constructor(
    @Inject('environment') environment: any,
    private apollo: Apollo,
    public dialog: MatDialog,
    private resolver: ComponentFactoryResolver,
    private snackBar: SafeSnackBarService,
    private workflowService: SafeWorkflowService,
    private safeAuthService: SafeAuthService,
    private emailService: SafeEmailService
  ) {
    this.isAdmin = this.safeAuthService.userIsAdmin && environment.module === 'backoffice';
  }

  ngOnInit(): void {
    this.factory = this.resolver.resolveComponentFactory(SafeRecordHistoryComponent);
  }

  private promisedChanges(items: any[]): Promise<any>[] {
    const promises: Promise<any>[] = [];
    for (const item of items) {
      const data = Object.assign({}, item);
      delete data.id;
      promises.push(this.apollo.mutate<EditRecordMutationResponse>({
        mutation: EDIT_RECORD,
        variables: {
          id: item.id,
          data,
          template: this.settings.query.template
        }
      }).toPromise());
    }
    return promises;
  }

  /**
   * Executes sequentially actions enabled by settings for the floating button
   * @param options action options.
   */
  public async onQuickAction(options: any): Promise<void> {
    this.loading = true;
    // Select all the records in the core grid
    if (options.selectAll) {
      this.grid.selectedRows = this.grid.gridData.data.map(x => x.id);
    }
    // let rowsIndexToModify = [...this.selectedRowsIndex];
    // if (options.autoSave && options.modifySelectedRows) {
    //   const unionRows = this.selectedRowsIndex.filter(index => this.updatedItems.some(item => item.id === this.gridData.data[index].id));
    //   if (unionRows.length > 0) {
    //     await Promise.all(this.promisedRowsModifications(options.modifications, unionRows));
    //     this.updatedItems = this.updatedItems.filter(x => !unionRows.some(y => x.id === this.gridData.data[y].id));
    //     rowsIndexToModify = rowsIndexToModify.filter(x => !unionRows.includes(x));
    //   }
    // }

    // Auto save all records
    if (options.autoSave) {
      await Promise.all(this.promisedChanges(this.grid.updatedItems));
    }
    // Auto modify the selected rows
    if (options.modifySelectedRows) {
      await Promise.all(this.promisedRowsModifications(options.modifications, this.grid.selectedItems));
    }

    if (this.grid.selectedRows.length > 0) {
      // Attaches the records to another one.
      if (options.attachToRecord) {
        await this.promisedAttachToRecord(this.grid.selectedItems, options.targetForm, options.targetFormField, options.targetFormQuery);
      }
      const promises: Promise<any>[] = [];
      // Notifies on a channel.
      if (options.notify) {
        promises.push(this.apollo.mutate<PublishNotificationMutationResponse>({
          mutation: PUBLISH_NOTIFICATION,
          variables: {
            action: options.notificationMessage ? options.notificationMessage : 'Records update',
            content: this.grid.selectedItems,
            channel: options.notificationChannel
          }
        }).toPromise());
      }
      // Publishes on a channel.
      if (options.publish) {
        promises.push(this.apollo.mutate<PublishMutationResponse>({
          mutation: PUBLISH,
          variables: {
            ids: this.grid.selectedRows,
            channel: options.publicationChannel
          }
        }).toPromise());
      }
      if (promises.length > 0) {
        await Promise.all(promises);
      }
      // Opens email client of user.
      if (options.sendMail) {
        const emailSettings = {
          query: {
            name: this.settings.query.name,
            fields: options.bodyFields
          }
        };
        const sortField = this.grid.sortField || '';
        const sortOrder = this.grid.sortOrder || '';
        this.emailService.sendMail(options.distributionList, options.subject, options.bodyText, emailSettings,
          this.grid.selectedRows, sortField, sortOrder);
        if (options.export) {
          // TODO
          // this.grid?.saveAsExcel();
        }
      }

      // Opens a form with selected records.
      if (options.prefillForm) {
        const promisedRecords: Promise<any>[] = [];
        // Fetches the record object for each selected record.
        for (const record of this.grid.selectedItems) {
          promisedRecords.push(this.apollo.query<GetRecordDetailsQueryResponse>({
            query: GET_RECORD_DETAILS,
            variables: {
              id: record.id
            }
          }).toPromise());
        }
        const records = (await Promise.all(promisedRecords)).map(x => x.data.record);

        // Opens a modal containing the prefilled form.
        this.dialog.open(SafeFormModalComponent, {
          data: {
            template: options.prefillTargetForm,
            locale: 'en',
            prefillRecords: records,
            askForConfirm: false
          },
          autoFocus: false
        });
      }
    }

    // Workflow only: goes to next step, or closes the workflow.
    if (options.goToNextStep || options.closeWorkflow) {
      if (options.goToNextStep) {
        this.goToNextStep.emit(true);
      } else {
        const dialogRef = this.dialog.open(SafeConfirmModalComponent, {
          data: {
            title: `Close workflow`,
            content: options.confirmationText,
            confirmText: 'Yes',
            confirmColor: 'primary'
          }
        });
        dialogRef.afterClosed().subscribe((confirm: boolean) => {
          if (confirm) {
            this.workflowService.closeWorkflow();
          }
        });
      }
    } else {
      this.grid.reloadData();
    }
  }

  /**
   * Returns a list of promises containing all the mutations in order to modify selected records accordingly to settings.
   * Applies inline edition before applying modifications.
   * @param modifications list of modifications to apply.
   * @param rows rows to edit.
   * @returns Array of Promises to execute.
   */
  private promisedRowsModifications(modifications: any[], items: any[]): Promise<any>[] {
    const promises: Promise<any>[] = [];
    for (const item of items) {
      const data = Object.assign({}, item);
      for (const modification of modifications) {
        if (['Date', 'DateTime'].includes(modification.field.type.name)) {
          data[modification.field.name] = this.getDateForFilter(modification.value);
        } else {
          data[modification.field.name] = modification.value;
        }
      }
      delete data.id;
      delete data.__typename;
      promises.push(this.apollo.mutate<EditRecordMutationResponse>({
        mutation: EDIT_RECORD,
        variables: {
          id: item.id,
          data,
          template: this.settings.query.template
        }
      }).toPromise());
    }
    return promises;
  }

  /**
   * Gets from input date value the three dates used for filtering.
   * @param value input date value
   * @returns calculated day, beginning of day, and ending of day
   */
  private getDateForFilter(value: any): Date {
    // today's date
    let date: Date;
    if (value === 'today()') {
      date = new Date();
      // today + number of days
    } else if (REGEX_PLUS.test(value)) {
      const difference = parseInt(value.split('+')[1], 10);
      date = new Date();
      date.setDate(date.getDate() + difference);
      // today - number of days
    } else if (REGEX_MINUS.test(value)) {
      const difference = - parseInt(value.split('-')[1], 10);
      date = new Date();
      date.setDate(date.getDate() + difference);
      // classic date
    } else {
      date = new Date(value);
    }
    return date;
  }

  /* Open a modal to select which record we want to attach the rows to and perform the attach.
  */
  private async promisedAttachToRecord(
    // come from 'attach to record' button from grid component
    selectedRecords: any[], targetForm: Form, targetFormField: string, targetFormQuery: any): Promise<void> {
    const dialogRef = this.dialog.open(SafeChooseRecordModalComponent, {
      data: {
        targetForm,
        targetFormField,
        targetFormQuery
      },
    });
    const value = await Promise.resolve(dialogRef.afterClosed().toPromise());
    if (value && value.record) {
      this.apollo.query<GetRecordByIdQueryResponse>({
        query: GET_RECORD_BY_ID,
        variables: {
          id: value.record
        }
      }).subscribe(res => {
        const resourceField = targetForm.fields?.find(field => field.resource && field.resource === this.settings.resource);
        let data = res.data.record.data;
        const key = resourceField.name;
        if (resourceField.type === 'resource') {
          data = { ...data, [key]: selectedRecords[0].id };
        } else {
          if (data[key]) {
            const ids = selectedRecords.map(x => x.id);
            data = { ...data, [key]: data[key].concat(ids) };
          } else {
            data = { ...data, [key]: selectedRecords.map(x => x.id) };
          }
        }
        this.apollo.mutate<EditRecordMutationResponse>({
          mutation: EDIT_RECORD,
          variables: {
            id: value.record,
            data
          }
        }).subscribe(res2 => {
          if (res2.data) {
            const record = res2.data.editRecord;
            if (record) {
              this.snackBar.openSnackBar(NOTIFICATIONS.addRowsToRecord(selectedRecords.length, key, record.data[targetFormField]));
              this.dialog.open(SafeFormModalComponent, {
                data: {
                  recordId: record.id,
                  locale: 'en'
                },
                autoFocus: false
              });
            }
          }
        });
      });
    }
  }

  /**
   * Set and emit new grid configuration after column reorder event.
   * @param e ColumnReorderEvent
   */
  // columnReorder(e: ColumnReorderEvent): void {
  //   if ((e.oldIndex !== e.newIndex)) {
  //     this.columnsOrder = this.grid?.columns.toArray().sort((a: any, b: any) => a.orderIndex - b.orderIndex).map((x: any) => x.field) || [];

  //     const tempFields: any[] = [];
  //     let j = 0;
  //     const oldIndex = e.oldIndex;
  //     const newIndex = e.newIndex;

  //     for (let i = 0; i < this.columnsOrder.length; i++) {
  //       if (i === newIndex) {
  //         if (oldIndex < newIndex) {
  //           tempFields[j] = this.columnsOrder[i];
  //           j++;
  //           tempFields[j] = this.columnsOrder[oldIndex];
  //         }
  //         if (oldIndex > newIndex) {
  //           tempFields[j] = this.columnsOrder[oldIndex];
  //           j++;
  //           tempFields[j] = this.columnsOrder[i];
  //         }
  //         j++;
  //       }
  //       else if (i !== oldIndex) {
  //         tempFields[j] = this.columnsOrder[i];
  //         j++;
  //       }
  //     }
  //     this.columnsOrder = tempFields.filter(x => x !== undefined);
  //     this.setColumnsConfig();
  //   }
  // }

  /**
   * Set and emit new grid configuration after column resize event.
   */
  // columnResize(): void {
  //   this.setColumnsConfig();
  // }

  /**
   * Set and emit new grid configuration after column visibility event.
   */
  // columnVisibilityChange(): void {
  //   this.setColumnsConfig();
  // }

  /**
   * Generate the cached fields config from the grid columns.
   */
  // private setColumnsConfig(): void {
  //   this.layout.fields = this.grid?.columns.toArray().filter((x: any) => x.field).reduce((obj, c: any) => {
  //     return {
  //       ...obj,
  //       [c.field]: {
  //         field: c.field,
  //         title: c.title,
  //         width: c.width,
  //         hidden: c.hidden,
  //         order: this.columnsOrder.findIndex((x) => x === c.field)
  //       }
  //     };
  //   }, {});
  //   this.layoutChanged.emit(this.layout);
  // }

  /**
   * Save the current layout of the grid as default layout
   */
  onDefaultLayout(): void {
    this.defaultLayoutChanged.emit(this.layout);
  }

  /**
   * Reset the currently cached layout to the default one
   */
  onResetDefaultLayout(): void {
    this.defaultLayoutReset.emit();
  }
}
