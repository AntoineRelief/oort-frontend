import { Apollo } from 'apollo-angular';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  Application,
  SafeApplicationService,
  SafeConfirmModalComponent,
  SafeSnackBarService,
  NOTIFICATIONS,
  SafeAuthService,
} from '@safe/builder';
import { MatDialog } from '@angular/material/dialog';
import {
  DeleteApplicationMutationResponse,
  DELETE_APPLICATION,
} from '../../../graphql/mutations';
import { DuplicateApplicationComponent } from '../../../components/duplicate-application/duplicate-application.component';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

/**
 * Application settings page component.
 */
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  public applications = new MatTableDataSource<Application>([]);
  public settingsForm?: FormGroup;
  private applicationSubscription?: Subscription;
  public application?: Application;
  public user: any;
  public locked: boolean | undefined = undefined;
  public lockedByUser: boolean | undefined = undefined;

  /**
   * Application settings page component.
   *
   * @param formBuilder Angular form builder
   * @param apollo Apollo service
   * @param router Angular router
   * @param snackBar Shared snackbar service
   * @param applicationService Shared application service
   * @param authService Shared authentication service
   * @param dialog Material dialog service
   * @param translate Angular translate service
   */
  constructor(
    private formBuilder: FormBuilder,
    private apollo: Apollo,
    private router: Router,
    private snackBar: SafeSnackBarService,
    private applicationService: SafeApplicationService,
    private authService: SafeAuthService,
    public dialog: MatDialog,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.applicationSubscription =
      this.applicationService.application$.subscribe(
        (application: Application | null) => {
          if (application) {
            this.application = application;
            this.settingsForm = this.formBuilder.group({
              id: [{ value: application.id, disabled: true }],
              name: [application.name, Validators.required],
              description: [application.description],
              status: [application.status],
            });
            this.locked = this.application?.locked;
            this.lockedByUser = this.application?.lockedByUser;
          }
        }
      );
  }

  /**
   * Submit settings form.
   */
  onSubmit(): void {
    this.applicationService.editApplication(this.settingsForm?.value);
    this.settingsForm?.markAsPristine();
  }

  /**
   * Duplicate application.
   */
  onDuplicate(): void {
    if (this.locked && !this.lockedByUser) {
      this.snackBar.openSnackBar(
        NOTIFICATIONS.objectIsLocked(this.application?.name)
      );
    } else {
      this.dialog.open(DuplicateApplicationComponent, {
        data: {
          id: this.application?.id,
          name: this.application?.name,
        },
      });
    }
  }

  /**
   * Delete application.
   * Prompt modal to confirm.
   */
  onDelete(): void {
    if (this.locked && !this.lockedByUser) {
      this.snackBar.openSnackBar(
        NOTIFICATIONS.objectIsLocked(this.application?.name)
      );
    } else {
      const dialogRef = this.dialog.open(SafeConfirmModalComponent, {
        data: {
          title: this.translate.instant('common.deleteObject', {
            name: this.translate.instant('common.application.one'),
          }),
          content: this.translate.instant(
            'components.application.delete.confirmationMessage',
            { name: this.application?.name }
          ),
          confirmText: this.translate.instant('components.confirmModal.delete'),
          cancelText: this.translate.instant('components.confirmModal.cancel'),
          confirmColor: 'warn',
        },
      });
      dialogRef.afterClosed().subscribe((value) => {
        if (value) {
          const id = this.application?.id;
          this.apollo
            .mutate<DeleteApplicationMutationResponse>({
              mutation: DELETE_APPLICATION,
              variables: {
                id,
              },
            })
            .subscribe((res) => {
              this.snackBar.openSnackBar(
                NOTIFICATIONS.objectDeleted('Application')
              );
              this.applications.data = this.applications.data.filter(
                (x) => x.id !== res.data?.deleteApplication.id
              );
            });
          this.router.navigate(['/applications']);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.applicationSubscription) {
      this.applicationSubscription.unsubscribe();
    }
  }
}
