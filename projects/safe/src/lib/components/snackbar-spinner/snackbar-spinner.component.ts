import { Component, Inject, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

/**
 * Interface that describes the structure of the data displayed in the snackbar
 */
interface SnackBarData {
  loading: boolean;
  error?: boolean;
  message: string;
}

/**
 * Snackbar to indicate progress of an async task.
 * Used for download / upload.
 */
@Component({
  selector: 'safe-snackbar-spinner',
  templateUrl: './snackbar-spinner.component.html',
  styleUrls: ['./snackbar-spinner.component.scss'],
})
export class SafeSnackbarSpinnerComponent implements OnInit {
  /**
   * The constructor function is a special function that is called when a new instance of the class is
   * created.
   *
   * @param data The data that will be displayed in the snackbar
   */
  constructor(
    @Inject(MAT_SNACK_BAR_DATA)
    public data: SnackBarData
  ) {}

  ngOnInit(): void {}
}
