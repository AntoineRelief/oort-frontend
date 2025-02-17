import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { SafeFormComponent, Form } from '@safe/builder';
import {
  GetFormByIdQueryResponse,
  GET_SHORT_FORM_BY_ID,
} from './graphql/queries';

/** Form component */
@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit, OnChanges {
  @Input() id = '6184e4573d5386dc4a68c83e';

  @ViewChild(SafeFormComponent)
  private formComponent?: SafeFormComponent;

  // === DATA ===
  public loading = true;
  public form?: Form;
  public completed = false;
  public hideNewRecord = false;

  /**
   * Form component
   *
   * @param apollo Apollo service
   */
  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.apollo
      .query<GetFormByIdQueryResponse>({
        query: GET_SHORT_FORM_BY_ID,
        variables: {
          id: this.id,
        },
      })
      .subscribe((res) => {
        if (res.data) {
          this.form = res.data.form;
          this.loading = res.loading;
        }
      });
  }

  ngOnChanges(): void {
    this.apollo
      .query<GetFormByIdQueryResponse>({
        query: GET_SHORT_FORM_BY_ID,
        variables: {
          id: this.id,
        },
      })
      .subscribe((res) => {
        if (res.data) {
          this.form = res.data.form;
          this.loading = res.loading;
        }
      });
  }

  /**
   * Complete form
   *
   * @param e completion event
   * @param e.completed is form completed
   * @param e.hideNewRecord is it needed to show 'new record' button
   */
  onComplete(e: { completed: boolean; hideNewRecord?: boolean }): void {
    this.completed = e.completed;
    this.hideNewRecord = e.hideNewRecord || false;
  }

  /**
   * Reset form.
   */
  clearForm(): void {
    this.formComponent?.reset();
  }
}
