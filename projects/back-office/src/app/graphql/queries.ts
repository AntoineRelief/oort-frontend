import { gql } from 'apollo-angular';
import {
  Dashboard, Form, Permission, Resource, Role, User, Record,
  Application, Page, Workflow, Step, PositionAttribute, ApiConfiguration
} from '@safe/builder';

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
    application {
      name
    }
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
export const GET_FORM_NAMES = gql`
query GetFormNames($first: Int, $afterCursor: ID) {
  forms(first: $first, afterCursor: $afterCursor) {
    edges {
      node {
        id
        name
      }
      cursor
    }
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}`;

export const GET_SHORT_FORMS = gql`
query GetShortForms($first: Int, $afterCursor: ID) {
  forms(first: $first, afterCursor: $afterCursor) {
    edges {
      node {
        id
        name
        createdAt
        status
        versionsCount
        recordsCount
        core
        canSee
        canCreateRecords
        canUpdate
        canDelete
        resource {
          id
          coreForm {
            id
            name
          }
        }
      }
      cursor
    }
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}`;

export interface GetFormsQueryResponse {
  loading: boolean;
  forms: {
    edges: {
      node: Form;
      cursor: string;
    }[];
    pageInfo: {
      endCursor: string;
      hasNextPage: boolean;
    },
    totalCount: number;
  };
}

// === GET FORM BY ID ===
export const GET_SHORT_FORM_BY_ID = gql`
query GetShortFormById($id: ID!) {
  form(id: $id) {
    id
    name
    core
    structure
    fields
    status
    canCreateRecords
    uniqueRecord {
      id
      modifiedAt
      data
    }
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
    canUpdate
  }
}`;

export const GET_FORM_BY_ID = gql`
query GetFormById($id: ID!, $filters: JSON, $display: Boolean, $showDeletedRecords: Boolean) {
  form(id: $id) {
    id
    name
    createdAt
    structure
    fields
    status
    versions {
      id
      createdAt
      data
    }
    records(filters: $filters, archived: $showDeletedRecords) {
      id
      data(display: $display)
      versions {
        id
        createdAt
        data
      }
    }
    canUpdate
  }
}`;

export const GET_FORM_STRUCTURE = gql`
query GetFormStructure($id: ID!) {
  form(id: $id) {
    id
    structure
  }
}`;

export interface GetFormByIdQueryResponse {
  loading: boolean;
  form: Form;
}

// === GET RESOURCE BY ID ===
export const GET_RESOURCE_BY_ID = gql`
query GetResourceById($id: ID!, $filters: JSON, $display: Boolean, $showDeletedRecords: Boolean) {
  resource(id: $id) {
    id
    name
    createdAt
    records(filters: $filters, archived: $showDeletedRecords) {
      id
      data(display: $display)
      form {
        id
        name
      }
    }
    fields
    forms {
      id
      name
      status
      createdAt
      recordsCount
      core
      canUpdate
      canDelete
      canCreateRecords
    }
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
    canUpdate
  }
}`;

export interface GetResourceByIdQueryResponse {
  loading: boolean;
  resource: Resource;
}

// === GET RESOURCES ===
export const GET_RESOURCES = gql`
query GetResources($first: Int, $afterCursor: ID){
  resources(first: $first, afterCursor: $afterCursor) {
    edges {
      node {
        id
        name
        forms {
          id
          name
        }
      }
      cursor
    }
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}`;

export const GET_RESOURCES_EXTENDED = gql`
query GetResourcesExtended($first: Int, $afterCursor: ID){
  resources(first: $first, afterCursor: $afterCursor) {
    edges {
      node {
        id
        name
        createdAt
        recordsCount
        canDelete
      }
      cursor
    }
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}`;

export interface GetResourcesQueryResponse {
  loading: boolean;
  resources: {
    edges: {
      node: Resource;
      cursor: string;
    }[];
    pageInfo: {
      endCursor: string;
      hasNextPage: boolean;
    },
    totalCount: number;
  };
}

// === GET RECORD BY ID ===
export const GET_RECORD_BY_ID = gql`
query GetRecordById($id: ID!) {
  record(id: $id) {
    id
    createdAt
    modifiedAt
    createdBy {
      name
    }
    data
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
query GetApplications($first: Int, $afterCursor: ID) {
  applications(first: $first, afterCursor: $afterCursor) {
    edges {
      node {
        id
        name
        createdAt
        modifiedAt
        status
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
      cursor
    }
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}`;

export interface GetApplicationsQueryResponse {
  loading: boolean;
  applications: {
    edges: {
      node: Application;
      cursor: string;
    }[];
    pageInfo: {
      endCursor: string;
      hasNextPage: boolean;
    },
    totalCount: number;
  };
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
      isLocked
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
query GetRoutingKeys($first: Int, $afterCursor: ID) {
  applications(first: $first, afterCursor: $afterCursor) {
    edges {
      node {
        id
        name
        channels {
          id
          title
          routingKey
        }
      }
      cursor
    }
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}`;

export interface GetRoutingKeysQueryResponse {
  loading: boolean;
  applications: {
    edges: {
      node: Application;
      cursor: string;
    }[];
    pageInfo: {
      endCursor: string;
      hasNextPage: boolean;
    },
    totalCount: number;
  };
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
  positionAttributes: PositionAttribute[];
}

// === GET RECORD DETAILS ===
export const GET_RECORD_DETAILS = gql`
query GetRecordDetails($id: ID!) {
  record(id: $id) {
    id
    data
    createdAt
    modifiedAt
    form {
      id
      name
      createdAt
      structure
      fields
      core
    }
    versions {
      id
      createdAt
      data
      createdBy {
        name
      }
    }
  }
}`;

export interface GetRecordDetailsQueryResponse {
  loading: boolean;
  record: Record;
}

// === GET API CONFIGURATIONS ===
export const GET_API_CONFIGURATIONS = gql`
query GetApiConfigurations($first: Int, $afterCursor: ID) {
  apiConfigurations(first: $first, afterCursor: $afterCursor) {
    edges {
      node {
        id
        name
        status
        authType
        endpoint
        pingUrl
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
      }
      cursor
    }
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}`;

export interface GetApiConfigurationsQueryResponse {
  loading: boolean;
  apiConfigurations: {
    edges: {
      node: ApiConfiguration;
      cursor: string;
    }[];
    pageInfo: {
      endCursor: string;
      hasNextPage: boolean;
    },
    totalCount: number;
  };
}

// === GET API CONFIGURATION ===
export const GET_API_CONFIGURATION = gql`
query GetApiConfiguration($id: ID!) {
  apiConfiguration(id: $id) {
    id
    name
    status
    authType
    endpoint
    pingUrl
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
  }
}`;

export interface GetApiConfigurationQueryResponse {
  loading: boolean;
  apiConfiguration: ApiConfiguration;
}
