import { gql } from 'apollo-angular';
import { Dashboard, Form, Permission, Resource, Role, User, Record, Application, Page, Workflow, Step, PositionAttributes } from '@who-ems/builder';

// === GET USERS ===
export const GET_USERS = gql`
{
  users {
    id
    username
    name
    roles {
      id
      title
      application {
        id
      }
    }
    oid
  }
}`;

export interface GetUsersQueryResponse {
  loading: boolean;
  users: User[];
}

// === GET ROLES ===
export const GET_ROLES = gql`
query GetRoles($all: Boolean, $application: ID) {
  roles(all: $all, application: $application) {
    id
    title
    permissions {
      id
      type
    }
    usersCount
  }
}`;


export interface GetRolesQueryResponse {
  loading: boolean;
  roles: Role[];
}

// === GET PERMISSIONS ===
export const GET_PERMISSIONS = gql`
query GetPermissions($application: Boolean) {
  permissions(application: $application) {
    id
    type
    global
  }
}`;

export interface GetPermissionsQueryResponse {
  loading: boolean;
  permissions: Permission[];
}

// === GET DASHBOARDS ===
export const GET_DASHBOARDS = gql`
{
  dashboards {
    id
    name
    createdAt
    structure
    canDelete
  }
}`;

export interface GetDashboardsQueryResponse {
  loading: boolean;
  dashboards: Dashboard[];
}

// === GET FORMS ===
export const GET_FORMS = gql`
{
  forms {
    id
    name
    createdAt
    status
    versions {
      id
    }
    recordsCount
    core
    canCreate
    canUpdate
    canDelete
  }
}`;

export interface GetFormsQueryResponse {
  loading: boolean;
  forms: Form[];
}

// === GET RESOURCE BY ID ===
export const GET_RESOURCE_BY_ID = gql`
query GetResourceById($id: ID!, $filters: JSON, $display: Boolean) {
  resource(id: $id) {
    id
    name
    createdAt
    records(filters: $filters) {
      id
      data(display: $display)
    }
    fields
    forms {
      id
      name
      status
      createdAt
      recordsCount
      core
      canCreate
      canUpdate
      canDelete
    }
    permissions {
      canSee {
        id
        title
      }
      canCreate {
        id
        title
      }
      canUpdate {
        id
        title
      }
      canDelete {
        id
        title
      }
    }
    canCreate
    canUpdate
  }
}`;

export interface GetResourceByIdQueryResponse {
  loading: boolean;
  resource: Resource;
}

// === GET RESOURCES ===
export const GET_RESOURCES = gql`
{
  resources {
    id
    name
    forms {
      id
      name
    }
  }
}`;

export const GET_RESOURCES_EXTENDED = gql`
{
  resources {
    id
    name
    createdAt
    recordsCount
  }
}`;

export interface GetResourcesQueryResponse {
  loading: boolean;
  resources: Resource[];
}

// === GET FORM BY ID ===

export const GET_FORM_BY_ID = gql`
query GetFormById($id: ID!, $filters: JSON, $display: Boolean) {
  form(id: $id) {
    id
    name
    createdAt
    structure
    status
    fields
    versions {
      id
      createdAt
      data
    }
    records(filters: $filters) {
      id
      data(display: $display)
      versions {
        id
        createdAt
        data
      }
    }
    resource{
      id
    }
    permissions {
      canSee {
        id
        title
      }
      canCreate {
        id
        title
      }
      canUpdate {
        id
        title
      }
      canDelete {
        id
        title
      }
    }
    canCreate
    canUpdate
    canCreateRecords
    uniqueRecord {
      id
      modifiedAt
      data
    }
  }
}`;

export interface GetFormByIdQueryResponse {
  loading: boolean;
  form: Form;
  errors: any;
}

// === GET RECORD BY ID ===
export const GET_RECORD_BY_ID = gql`
query GetRecordById($id: ID!) {
  record(id: $id) {
    id
    data
    modifiedAt
    form {
      id
      structure
    }
  }
}`;

export interface GetRecordByIdQueryResponse {
  loading: boolean;
  record: Record;
}

// === GET DASHBOARD BY ID ===
export const GET_DASHBOARD_BY_ID = gql`
  query GetDashboardById($id: ID!){
    dashboard(id: $id){
      id
      name
      createdAt
      structure
      permissions {
        canSee {
          id
          title
        }
        canCreate {
          id
          title
        }
        canUpdate {
          id
          title
        }
        canDelete {
          id
          title
        }
      }
      canSee
      canUpdate
      page {
        id
        application {
          id
        }
        canUpdate
      }
      step {
        id
        workflow {
          id
          page {
            id
            application {
              id
            }
          }
        }
        canUpdate
      }
    }
  }
`;

export interface GetDashboardByIdQueryResponse {
  loading: boolean;
  dashboard: Dashboard;
}

// === GET APPLICATIONS ===
export const GET_APPLICATIONS = gql`
{
  applications {
    id
    name
    createdAt
    modifiedAt
    status
    pages {
      id
      name
      createdAt
      type
      content
    }
    settings
    permissions {
      canSee {
        id
        title
      }
      canUpdate {
        id
        title
      }
      canDelete {
        id
        title
      }
    }
    canSee
    canUpdate
    canDelete
    usersCount
  }
}`;

export interface GetApplicationsQueryResponse {
  loading: boolean;
  applications: Application[];
}

// === GET APPLICATION BY ID ===
export const GET_APPLICATION_BY_ID = gql`
  query GetApplicationById($id: ID!, $asRole: ID){
    application(id: $id, asRole: $asRole){
      id
      name
      description
      createdAt
      status
      pages {
        id
        name
        type
        content
        createdAt
        canSee
        canUpdate
        canDelete
      }
      roles {
        id
        title
        permissions {
          id
          type
        }
        usersCount
      }
      users {
        id
        username
        name
        roles {
          id
          title
        }
        oid
      }
      permissions {
        canSee {
          id
          title
        }
        canCreate {
          id
          title
        }
        canUpdate {
          id
          title
        }
        canDelete {
          id
          title
        }
      }
      canSee
      canUpdate
    }
  }
`;

export interface GetApplicationByIdQueryResponse {
  loading: boolean;
  application: Application;
}

// === GET PAGE BY ID ===
export const GET_PAGE_BY_ID = gql`
  query GetPageById($id: ID!){
    page(id: $id){
      id
      name
      createdAt
      modifiedAt
      type
      content
      permissions {
        canSee {
          id
          title
        }
        canCreate {
          id
          title
        }
        canUpdate {
          id
          title
        }
        canDelete {
          id
          title
        }
      }
      application {
        id
      }
      canSee
      canUpdate
      canDelete
    }
  }
`;

export interface GetPageByIdQueryResponse {
  loading: boolean;
  page: Page;
}

// === GET WORKFLOW BY ID ===
export const GET_WORKFLOW_BY_ID = gql`
  query GetWorkflowById($id: ID!, $asRole: ID){
    workflow(id: $id, asRole: $asRole){
      id
      name
      createdAt
      modifiedAt
      permissions {
        canSee {
          id
          title
        }
        canCreate {
          id
          title
        }
        canUpdate {
          id
          title
        }
        canDelete {
          id
          title
        }
      }
      steps {
        id
        name
        type
        content
        createdAt
      }
      page {
        id
        name
        canUpdate
        permissions {
          canSee {
            id
            title
          }
          canCreate {
            id
            title
          }
          canUpdate {
            id
            title
          }
          canDelete {
            id
            title
          }
        }
        application {
          id
        }
      }
    }
  }
`;

export interface GetWorkflowByIdQueryResponse {
  loading: boolean;
  workflow: Workflow;
}

// === GET STEP BY ID ===
export const GET_STEP_BY_ID = gql`
  query GetStepById($id: ID!){
    step(id: $id){
      id
      name
      createdAt
      modifiedAt
      content
      workflow {
        id
        name
        page {
          id
          application {
            id
          }
        }
      }
      permissions {
        canSee {
          id
          title
        }
        canCreate {
          id
          title
        }
        canUpdate {
          id
          title
        }
        canDelete {
          id
          title
        }
      }
      canSee
      canUpdate
      canDelete
    }
  }
`;

export interface GetStepByIdQueryResponse {
  loading: boolean;
  step: Step;
}

// === GET ROUTING KEYS ===
export const GET_ROUTING_KEYS = gql`
query GetRoutingKeys {
  applications {
    id
    name
    channels {
      id
      title
      routingKey
    }
  }
}`;

export interface GetRoutingKeysQueryResponse{
  loading: boolean;
  applications: Application[];
}

// === GET POSITION ATTRIBUTES FORM CATEGORY ===
export const GET_POSITION_ATTRIBUTES_FROM_CATEGORY = gql`
query GetPositionAttributesFromCategory($id: ID!) {
  positionAttributes(category: $id) {
    value
    category {
      title
    }
    usersCount
  }
}`;

export interface GetPositionAttributesFromCategoryQueryResponse {
  loading: boolean;
  positionAttributes: PositionAttributes[];
}
