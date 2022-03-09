import {
  APP_INITIALIZER,
  DoBootstrap,
  Injector,
  NgModule,
} from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
// Apollo
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, ApolloLink, split } from '@apollo/client/core';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';
import { setContext } from '@apollo/client/link/context';
import { AppComponent } from './app.component';
import { NewsComponent } from './news/news.component';
import { ApplicationWidgetComponent } from './widgets/application-widget/application-widget.component';
import { ApplicationWidgetModule } from './widgets/application-widget/application-widget.module';
import { DashboardWidgetComponent } from './widgets/dashboard-widget/dashboard-widget.component';
import { DashboardWidgetModule } from './widgets/dashboard-widget/dashboard-widget.module';
import { FormWidgetComponent } from './widgets/form-widget/form-widget.component';
import { FormWidgetModule } from './widgets/form-widget/form-widget.module';
import { WorkflowWidgetComponent } from './widgets/workflow-widget/workflow-widget.component';
import { WorkflowWidgetModule } from './widgets/workflow-widget/workflow-widget.module';
import { environment } from '../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { OAuthModule, OAuthService } from 'angular-oauth2-oidc';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

localStorage.setItem('loaded', 'false');

const REFRESH = new BehaviorSubject<boolean>(false);

/**
 * Configuration of the Apollo client.
 *
 * @param httpLink Apollo http link
 * @returns void
 */
export const provideApollo = (httpLink: HttpLink): any => {
  const basic = setContext((operation, context) => ({
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Accept: 'charset=utf-8',
    },
  }));

  const auth = setContext((operation, context) => {
    // Get the authentication token from local storage if it exists
    // const token = localStorage.getItem('idtoken');
    const token =
      'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJxcVFRZElCNzFxaFpWbDBiSXo5OFd2R1VqaHk3TlR5Q1g1U3ZPRVhya29jIn0.eyJleHAiOjE2NDY4MzcyMDgsImlhdCI6MTY0NjgzNjkwOCwiYXV0aF90aW1lIjoxNjQ2ODM2MDAwLCJqdGkiOiJhNTRhMGFhZS03ZDQ0LTQwOTEtOTM3MS02MWFlYzI0ZmU3MTUiLCJpc3MiOiJodHRwczovL2lkLWRldi5vb3J0Y2xvdWQudGVjaC9hdXRoL3JlYWxtcy9vb3J0IiwiYXVkIjoib29ydC1jbGllbnQiLCJzdWIiOiJjMmY3MDlkMy1iNzMwLTQ0N2EtYWExZi05M2I3MjU4MmQwNWMiLCJ0eXAiOiJJRCIsImF6cCI6Im9vcnQtY2xpZW50Iiwibm9uY2UiOiJkRFoxU21GemJXVjRTSFpoUVMxaFVIbDNTWEkwTjJSRmVrVmlSV3RmVWpOSmNHZGllVEYtYkRKNFozbDEiLCJzZXNzaW9uX3N0YXRlIjoiOWM4ODA5YmUtYTM2Ny00Y2U4LWI2NGYtMDg1YjRkYjY1OTc5IiwiYXRfaGFzaCI6InhVb1NEcTU3LXBXRTdiWFU5VnJoTFEiLCJhY3IiOiIxIiwic2lkIjoiOWM4ODA5YmUtYTM2Ny00Y2U4LWI2NGYtMDg1YjRkYjY1OTc5IiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiQW50b2luZSBIdXJhcmQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhbnRvaW5lQHJlbGllZmFwcGxpY2F0aW9ucy5vcmciLCJnaXZlbl9uYW1lIjoiQW50b2luZSIsImZhbWlseV9uYW1lIjoiSHVyYXJkIiwiZW1haWwiOiJhbnRvaW5lQHJlbGllZmFwcGxpY2F0aW9ucy5vcmcifQ.h5hzSksjfkvVHPy_XhVhisRsHOcvsndMej1BOC4SLxp7ECrQFU2yeO5SMQKf5QYmgbh0d3UugcBC4dULLwoIwv0uaMJwtsiQuN9ra40AIc9frPYNDrHpST5c1jLXPgSF2BB-LVdctAGFdwrmFwtNKo0a0BQ_YZ4hwBQf6nK9KUaq3uroXqUXHbk_Z0PqwCVZK5Y6mHe11P36E8U_2cuDVVPKWchMBE280vb1gRGv9vcNwDdB8sHGblbCFKyMDCn9cCQJ6QHgQJ1ZNosDrk0an9CkCUpvbZsYzahGZefIOAviipr4bV5Tz_mINkkSiT-48sYDm1EuxDG9So8PFzG6hA';
    return {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: `Bearer ${token}`,
      },
    };
  });

  const http = httpLink.create({ uri: `${environment.apiUrl}/graphql` });

  const ws = new WebSocketLink({
    uri: `${environment.subscriptionApiUrl}/graphql`,
    options: {
      reconnect: true,
      connectionParams: {
        authToken: localStorage.getItem('idtoken'),
      },
      connectionCallback: (error) => {
        if (localStorage.getItem('loaded') === 'true') {
          // location.reload();
          REFRESH.next(true);
          localStorage.setItem('loaded', 'false');
        }
        localStorage.setItem('loaded', 'true');
      },
    },
  });

  interface Definition {
    kind: string;
    operation?: string;
  }

  const link = ApolloLink.from([
    basic,
    auth,
    split(
      ({ query }) => {
        const { kind, operation }: Definition = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
      },
      ws,
      http
    ),
  ]);

  // Cache is not currently used, due to fetchPolicy values
  const cache = new InMemoryCache();

  return {
    link,
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only',
        // fetchPolicy: 'cache-and-network',
        errorPolicy: 'ignore',
      },
      query: {
        fetchPolicy: 'network-only',
        // fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  };
};

const initializeAuth =
  (oauth: OAuthService): any =>
  () => {
    oauth.configure(environment.authConfig);
  };

/**
 * Sets up translator.
 *
 * @param http http client
 * @returns Translator.
 */
export const httpTranslateLoader = (http: HttpClient) =>
  new TranslateHttpLoader(http);

@NgModule({
  declarations: [AppComponent, NewsComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    MatSnackBarModule,
    RouterModule.forRoot([]),
    OAuthModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient],
      },
    }),
    DashboardWidgetModule,
    FormWidgetModule,
    WorkflowWidgetModule,
    ApplicationWidgetModule,
  ],
  providers: [
    {
      provide: 'environment',
      useValue: environment,
    },
    {
      // TODO: added default options to solve cache issues, cache solution can be added at the query / mutation level.
      provide: APOLLO_OPTIONS,
      useFactory: provideApollo,
      deps: [HttpLink],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      multi: true,
      deps: [OAuthService],
    },
  ],
})
export class AppModule implements DoBootstrap {
  constructor(private injector: Injector, private translate: TranslateService) {
    this.translate.addLangs(environment.availableLanguages);
    this.translate.setDefaultLang('en');
  }

  ngDoBootstrap(): void {
    // Dashboard
    const dashboard = createCustomElement(DashboardWidgetComponent, {
      injector: this.injector,
    });
    customElements.define('dashboard-widget', dashboard);
    // Form
    const form = createCustomElement(FormWidgetComponent, {
      injector: this.injector,
    });
    customElements.define('form-widget', form);
    // Workflow
    const workflow = createCustomElement(WorkflowWidgetComponent, {
      injector: this.injector,
    });
    customElements.define('workflow-widget', workflow);
    // Application
    const application = createCustomElement(ApplicationWidgetComponent, {
      injector: this.injector,
    });
    customElements.define('application-widget', application);
  }
}
