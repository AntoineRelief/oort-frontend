import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AccessGuard } from '../guards/access.guard';
import { DashboardComponent } from './dashboard.component';

/**
 * List of routes of the dashboard.
 * Uses lazy loading for performance.
 */
export const routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: ':id',
        children: [
          {
            path: 'dashboard/:id',
            loadChildren: () =>
              import('./pages/dashboard/dashboard.module').then(
                (m) => m.DashboardModule
              ),
          },
          {
            path: 'form/:id',
            loadChildren: () =>
              import('./pages/form/form.module').then((m) => m.FormModule),
          },
          {
            path: 'workflow/:id',
            loadChildren: () =>
              import('./pages/workflow/workflow.module').then(
                (m) => m.WorkflowModule
              ),
          },
          {
            path: 'profile',
            loadChildren: () =>
              import('./pages/profile/profile.module').then(
                (m) => m.ProfileModule
              ),
          },
          {
            path: 'settings',
            children: [
              {
                path: 'roles',
                loadChildren: () =>
                  import('./pages/roles/roles.module').then(
                    (m) => m.RolesModule
                  ),
                // canActivate: [WhoPermissionGuard]
              },
              {
                path: 'users',
                loadChildren: () =>
                  import('./pages/users/users.module').then(
                    (m) => m.UsersModule
                  ),
                // canActivate: [WhoPermissionGuard]
              },
            ],
          },
        ],
      },
    ],
    canActivate: [AccessGuard],
  },
];

/**
 * Routing module of the Front-Office main navigation.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
