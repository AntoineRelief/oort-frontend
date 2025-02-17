import { Apollo } from 'apollo-angular';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Form, Page, Step, SafeFormComponent } from '@safe/builder';
import {
  GetFormByIdQueryResponse,
  GetPageByIdQueryResponse,
  GetStepByIdQueryResponse,
  GET_FORM_BY_ID,
  GET_PAGE_BY_ID,
  GET_STEP_BY_ID,
} from './graphql/queries';
import { Subscription } from 'rxjs';
import { SafeSnackBarService, NOTIFICATIONS } from '@safe/builder';
import { switchMap } from 'rxjs/operators';

/**
 * Form page.
 */
@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit, OnDestroy {
  /** View reference of Shared form component */
  @ViewChild(SafeFormComponent)
  private formComponent?: SafeFormComponent;
  /** Loading state of the page */
  public loading = true;
  /** Current form id */
  public id = '';
  /** Current form */
  public form: Form = {};
  /** Is the form answered */
  public completed = false;
  /** Ongoing query */
  public querySubscription?: Subscription;
  /** Prevents new records to be created */
  public hideNewRecord = false;
  /** Prevents new records to be created */
  public canCreateRecords = false;
  /** Current page */
  public page?: Page;
  /** Current step if nested in workflow */
  public step?: Step;
  /** Tells if the form is within a workflow */
  public isStep = false;
  /** Subscribes to current route to load form accordingly */
  private routeSubscription?: Subscription;

  /**
   * Form page.
   *
   * @param apollo Apollo client
   * @param route Angular current route
   * @param router Angular router
   * @param snackBar Shared snackbar service
   */
  constructor(
    private apollo: Apollo,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: SafeSnackBarService
  ) {}

  /**
   * Subscribes to the route to load the form.
   */
  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe((params) => {
      this.loading = true;
      this.id = params.id;
      this.isStep = this.router.url.includes('/workflow/');
      // If a query is already loading, cancel it
      if (this.querySubscription) {
        this.querySubscription.unsubscribe();
      }
      if (this.isStep) {
        this.querySubscription = this.apollo
          .query<GetStepByIdQueryResponse>({
            query: GET_STEP_BY_ID,
            variables: {
              id: this.id,
            },
          })
          .pipe(
            switchMap((res) => {
              this.step = res.data.step;
              return this.apollo.query<GetFormByIdQueryResponse>({
                query: GET_FORM_BY_ID,
                variables: {
                  id: this.step.content,
                },
              });
            })
          )
          .subscribe((res) => {
            if (res.data) {
              this.form = res.data.form;
            }
            if (
              !this.form ||
              this.form.status !== 'active' ||
              !this.form.canCreateRecords
            ) {
              this.snackBar.openSnackBar(
                NOTIFICATIONS.objectAccessDenied('form'),
                { error: true }
              );
            } else {
              this.canCreateRecords = true;
            }
            this.loading = res.data.loading;
          });
      } else {
        this.querySubscription = this.apollo
          .query<GetPageByIdQueryResponse>({
            query: GET_PAGE_BY_ID,
            variables: {
              id: this.id,
            },
          })
          .pipe(
            switchMap((res) => {
              this.page = res.data.page;
              return this.apollo.query<GetFormByIdQueryResponse>({
                query: GET_FORM_BY_ID,
                variables: {
                  id: this.page.content,
                },
              });
            })
          )
          .subscribe((res) => {
            if (res.data) {
              this.form = res.data.form;
            }
            if (
              !this.form ||
              this.form.status !== 'active' ||
              !this.form.canCreateRecords
            ) {
              this.snackBar.openSnackBar(
                NOTIFICATIONS.objectAccessDenied('form'),
                { error: true }
              );
            } else {
              this.canCreateRecords = true;
            }
            this.loading = res.data.loading;
          });
      }
    });
  }

  /**
   * Removes the subscriptions of the component.
   */
  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  /**
   * Updates status of the page.
   *
   * @param e completion event
   * @param e.completed is form completed
   * @param e.hideNewRecord is it needed to hide new record button
   */
  onComplete(e: { completed: boolean; hideNewRecord?: boolean }): void {
    this.completed = e.completed;
    this.hideNewRecord = e.hideNewRecord || false;
  }

  /**
   * Resets the form.
   */
  clearForm(): void {
    this.formComponent?.reset();
  }
}
