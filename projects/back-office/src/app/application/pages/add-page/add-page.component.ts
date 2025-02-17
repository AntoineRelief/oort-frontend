import { Apollo, QueryRef } from 'apollo-angular';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
  ContentType,
  CONTENT_TYPES,
  Form,
  Permissions,
  SafeApplicationService,
  SafeAuthService,
  SafeSnackBarService,
  NOTIFICATIONS,
} from '@safe/builder';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { AddFormComponent } from '../../../components/add-form/add-form.component';
import { AddFormMutationResponse, ADD_FORM } from '../../../graphql/mutations';
import {
  GET_FORM_NAMES,
  GetFormsQueryResponse,
} from '../../../graphql/queries';
import { MatSelect } from '@angular/material/select';

/**
 * Number of items per page.
 */
const ITEMS_PER_PAGE = 10;

/**
 * Add page component.
 */
@Component({
  selector: 'app-add-page',
  templateUrl: './add-page.component.html',
  styleUrls: ['./add-page.component.scss'],
})
export class AddPageComponent implements OnInit, OnDestroy {
  // === DATA ===
  public contentTypes = CONTENT_TYPES;
  private forms = new BehaviorSubject<Form[]>([]);
  public forms$!: Observable<Form[]>;
  private formsQuery!: QueryRef<GetFormsQueryResponse>;
  private pageInfo = {
    endCursor: '',
    hasNextPage: true,
  };
  private loading = true;

  @ViewChild('formSelect') formSelect?: MatSelect;

  // === REACTIVE FORM ===
  public pageForm: FormGroup = new FormGroup({});
  public step = 1;

  // === PERMISSIONS ===
  canCreateForm = false;
  private authSubscription?: Subscription;

  /**
   * Add page component
   *
   * @param formBuilder Angular form builder
   * @param apollo Apollo service
   * @param applicationService Shared application service
   * @param dialog Material dialog service
   * @param snackBar Shared snackbar service
   * @param authService Shared authentication service
   */
  constructor(
    private formBuilder: FormBuilder,
    private apollo: Apollo,
    private applicationService: SafeApplicationService,
    public dialog: MatDialog,
    private snackBar: SafeSnackBarService,
    private authService: SafeAuthService
  ) {}

  ngOnInit(): void {
    this.pageForm = this.formBuilder.group({
      type: ['', Validators.required],
      content: [''],
      newForm: [false],
    });
    this.pageForm.get('type')?.valueChanges.subscribe((type) => {
      const contentControl = this.pageForm.controls.content;
      if (type === ContentType.form) {
        this.formsQuery = this.apollo.watchQuery<GetFormsQueryResponse>({
          query: GET_FORM_NAMES,
          variables: {
            first: ITEMS_PER_PAGE,
          },
        });

        this.forms$ = this.forms.asObservable();
        this.formsQuery.valueChanges.subscribe((res) => {
          this.forms.next(res.data.forms.edges.map((x) => x.node));
          this.pageInfo = res.data.forms.pageInfo;
          this.loading = res.loading;
        });
        contentControl.setValidators([Validators.required]);
        contentControl.updateValueAndValidity();
      } else {
        contentControl.setValidators(null);
        contentControl.setValue(null);
        contentControl.updateValueAndValidity();
      }
      this.onNext();
    });
    this.authSubscription = this.authService.user.subscribe(() => {
      this.canCreateForm = this.authService.userHasClaim(
        Permissions.canCreateForms
      );
    });
  }

  /**
   * Check if step is valid or not
   *
   * @param step step index
   * @returns is step valid
   */
  isStepValid(step: number): boolean {
    switch (step) {
      case 1: {
        return this.pageForm.controls.type.valid;
      }
      case 2: {
        return this.pageForm.controls.content.valid;
      }
      default: {
        return true;
      }
    }
  }

  /**
   * Submit form to application service for creation
   */
  onSubmit(): void {
    this.applicationService.addPage(this.pageForm.value);
  }

  /**
   * Go to previous step.
   */
  onBack(): void {
    this.step -= 1;
  }

  /**
   * Go to next step.
   */
  onNext(): void {
    switch (this.step) {
      case 1: {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.pageForm.controls.type.value === ContentType.form
          ? (this.step += 1)
          : this.onSubmit();
        break;
      }
      case 2: {
        this.onSubmit();
        break;
      }
      default: {
        this.step += 1;
        break;
      }
    }
  }

  /**
   * Add a new form.
   */
  onAdd(): void {
    const dialogRef = this.dialog.open(AddFormComponent, {
      panelClass: 'add-dialog',
    });
    dialogRef.afterClosed().subscribe((value) => {
      if (value) {
        const data = { name: value.name };
        Object.assign(
          data,
          value.resource && { resource: value.resource },
          value.template && { template: value.template }
        );
        this.apollo
          .mutate<AddFormMutationResponse>({
            mutation: ADD_FORM,
            variables: data,
          })
          .subscribe(
            (res) => {
              if (res.errors) {
                this.snackBar.openSnackBar(
                  NOTIFICATIONS.objectNotCreated('form', res.errors[0].message),
                  { error: true }
                );
              } else {
                const id = res.data?.addForm.id || '';
                this.pageForm.controls.content.setValue(id);
                this.snackBar.openSnackBar(
                  NOTIFICATIONS.objectCreated('page', value.name)
                );

                this.onSubmit();
              }
            },
            (err) => {
              this.snackBar.openSnackBar(err.message, { error: true });
            }
          );
      }
    });
  }

  /**
   * Adds scroll listener to select.
   *
   * @param e open select event.
   */
  onOpenSelect(e: any): void {
    if (e && this.formSelect) {
      const panel = this.formSelect.panel.nativeElement;
      panel.addEventListener('scroll', (event: any) =>
        this.loadOnScroll(event)
      );
    }
  }

  /**
   * Fetches more forms on scroll.
   *
   * @param e scroll event.
   */
  private loadOnScroll(e: any): void {
    if (
      e.target.scrollHeight - (e.target.clientHeight + e.target.scrollTop) <
      50
    ) {
      if (!this.loading && this.pageInfo.hasNextPage) {
        this.loading = true;
        this.formsQuery.fetchMore({
          variables: {
            first: ITEMS_PER_PAGE,
            afterCursor: this.pageInfo.endCursor,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) {
              return prev;
            }
            return Object.assign({}, prev, {
              forms: {
                edges: [...prev.forms.edges, ...fetchMoreResult.forms.edges],
                pageInfo: fetchMoreResult.forms.pageInfo,
                totalCount: fetchMoreResult.forms.totalCount,
              },
            });
          },
        });
      }
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
