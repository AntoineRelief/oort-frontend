import {
  APP_INITIALIZER,
  DoBootstrap,
  ElementRef,
  Injector,
  NgModule,
} from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
// Http
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { ApplicationWidgetComponent } from './widgets/application-widget/application-widget.component';
import { ApplicationWidgetModule } from './widgets/application-widget/application-widget.module';
import { DashboardWidgetComponent } from './widgets/dashboard-widget/dashboard-widget.component';
import { DashboardWidgetModule } from './widgets/dashboard-widget/dashboard-widget.module';
import { FormWidgetComponent } from './widgets/form-widget/form-widget.component';
import { FormWidgetModule } from './widgets/form-widget/form-widget.module';
import { WorkflowWidgetComponent } from './widgets/workflow-widget/workflow-widget.component';
import { WorkflowWidgetModule } from './widgets/workflow-widget/workflow-widget.module';
import { environment } from '../environments/environment';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { OAuthModule, OAuthService, OAuthStorage } from 'angular-oauth2-oidc';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MessageService } from '@progress/kendo-angular-l10n';
import { KendoTranslationService } from '@safe/builder';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { POPUP_CONTAINER } from '@progress/kendo-angular-popup';
// Apollo / GraphQL
import { GraphQLModule } from './graphql.module';

/**
 * Initialize authentication in the platform.
 * Configuration in environment file.
 * Use oAuth
 *
 * @param oauth OAuth Service
 * @returns oAuth configuration
 */
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

/**
 * Web Widget project root module.
 */
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
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
    GraphQLModule,
  ],
  providers: [
    {
      provide: 'environment',
      useValue: environment,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      multi: true,
      deps: [OAuthService],
    },
    {
      provide: POPUP_CONTAINER,
      useFactory: () =>
        // return the container ElementRef, where the popup will be injected
        ({ nativeElement: document.body } as ElementRef),
    },
    {
      provide: MessageService,
      useClass: KendoTranslationService,
    },
    {
      provide: OAuthStorage,
      useValue: localStorage,
    },
  ],
})
export class AppModule implements DoBootstrap {
  /**
   * Main project root module
   *
   * @param injector Angular injector
   * @param translate Angular translate service
   */
  constructor(private injector: Injector, private translate: TranslateService) {
    this.translate.addLangs(environment.availableLanguages);
    this.translate.setDefaultLang('en');
  }

  /**
   * Bootstrap the project.
   * Create the web elements.
   */
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
