import { gql } from 'apollo-angular';
import { Dashboard } from '@safe/builder';

/**
 * Dashboard query.
 */
export const GET_DASHBOARD_BY_ID = gql`
  query GetDashboardById($id: ID!) {
    dashboard(id: $id) {
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
    }
  }
`;

/**
 * Interface of dashboard query response.
 */
export interface GetDashboardByIdQueryResponse {
  /** Loading state of the query */
  loading: boolean;
  /** Application dashboard */
  dashboard: Dashboard;
}
