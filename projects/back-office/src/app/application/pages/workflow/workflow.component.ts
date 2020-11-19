import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Workflow, Step, WhoSnackBarService } from '@who-ems/builder';
import { Subscription } from 'rxjs';
import { WorkflowService } from '../../../services/workflow.service';
import {
  EditPageMutationResponse, EDIT_PAGE,
  DeleteStepMutationResponse, DELETE_STEP,
  EditWorkflowMutationResponse, EDIT_WORKFLOW} from '../../../graphql/mutations';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {

  // === DATA ===
  public id: string;
  public loading = true;
  public steps: Step[];

  // === WORKFLOW ===
  public workflow: Workflow;
  private workflowSubscription: Subscription;

  // === WORKFLOW NAME EDITION ===
  public formActive: boolean;
  public workflowNameForm: FormGroup;

  // === SELECTED STEP ===
  public dragging: boolean;
  public displayStep = false;
  public selectedStep: Step;

  // === ROUTE ===
  private routeSubscription: Subscription;

  constructor(
    private apollo: Apollo,
    private workflowService: WorkflowService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private snackBar: WhoSnackBarService
  ) { }

  ngOnInit(): void {
    this.formActive = false;
    this.routeSubscription = this.route.params.subscribe((params) => {
      this.id = params.id;
      this.workflowService.loadWorkflow(this.id);
    });
    this.workflowSubscription = this.workflowService.workflow.subscribe((workflow: Workflow) => {
      if (workflow) {
        this.workflow = workflow;
        this.steps = workflow.steps;
        this.workflowNameForm = new FormGroup({
          workflowName: new FormControl(this.workflow.name, Validators.required)
        });
        this.loading = false;
      }
    });
  }

  toggleFormActive = () => this.formActive = !this.formActive;

  /*  Update the name of the workflow and his linked page.
  */
  saveName(): void {
    const { workflowName } = this.workflowNameForm.value;
    this.toggleFormActive();
    this.apollo.mutate<EditPageMutationResponse>({
      mutation: EDIT_PAGE,
      variables: {
        id: this.workflow.page.id,
        name: workflowName
      }
    }).subscribe(res => {
      this.workflow.name = res.data.editPage.name;
    });
  }

  /*  Delete a step if authorized.
  */
  deleteStep(id, e): void {
    e.stopPropagation();
    this.apollo.mutate<DeleteStepMutationResponse>({
      mutation: DELETE_STEP,
      variables: {
        id
      }
    }).subscribe(res => {
      this.snackBar.openSnackBar('Step deleted', { duration: 1000 });
      this.steps = this.steps.filter(x => {
        return x.id !== res.data.deleteStep.id;
      });
      this.router.navigate(['./'], { relativeTo: this.route });
      this.displayStep = false;
    });
  }

  /*  Navigate to the add-step component
  */
  addStep(): void {
    this.router.navigate(['./add-step'], { relativeTo: this.route });
  }

  navigateToSelectedStep(): void {
    this.router.navigate(['./' + this.selectedStep.type + '/' + this.selectedStep.content ], { relativeTo: this.route });
  }

  /* Drop a step dragged into the list
  */
  dropStep(event: CdkDragDrop<string[]>): void{
    this.dragging = false;
    moveItemInArray(this.steps, event.previousIndex, event.currentIndex);
    if (event.previousIndex !== event.currentIndex) {
      this.apollo.mutate<EditWorkflowMutationResponse>({
        mutation: EDIT_WORKFLOW,
        variables: {
          id: this.id,
          steps: this.steps.map(step => step.id)
        }
      }).subscribe( () => {
        this.snackBar.openSnackBar('New step order : ' + this.steps.map(step => step.name));
      });
    }
  }

  onDragStart(): void {
    this.dragging = true;
  }

  /* Display selected step on click*/
  onStepClick(step: Step): void {
    if (this.dragging) {
      this.dragging = false;
      return;
    }
    if (this.selectedStep !== step) {
      this.selectedStep = step;
      this.navigateToSelectedStep();
      this.displayStep = true;
    }
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
    this.workflowSubscription.unsubscribe();
  }
}
