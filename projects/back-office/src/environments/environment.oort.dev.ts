import { AuthConfig } from 'angular-oauth2-oidc';
import { theme } from '../themes/oort/oort.dev';

/**
 * Authentification configuration
 */
const authConfig: AuthConfig = {
  issuer: 'https://id-dev.oortcloud.tech/auth/realms/oort',
  redirectUri: 'https://oort-dev.oortcloud.tech/admin/',
  postLogoutRedirectUri: 'https://oort-dev.oortcloud.tech/admin/auth/',
  clientId: 'oort-client',
  scope: 'openid profile email offline_access',
  responseType: 'code',
  showDebugInformation: true,
};

/**
 * Environment file for local development.
 */
export const environment = {
  production: true,
  apiUrl: 'https://oort-dev.oortcloud.tech/api',
  subscriptionApiUrl: 'wss://oort-dev.oortcloud.tech/api',
  frontOfficeUri: 'https://oort-dev.oortcloud.tech',
  backOfficeUri: 'https://oort-dev.oortcloud.tech/admin/',
  module: 'backoffice',
  availableLanguages: ['en', 'test'],
  authConfig,
  theme,
};
