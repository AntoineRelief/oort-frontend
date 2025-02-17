import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from 'projects/back-office/src/environments/environment';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { SafeFormComponent } from './form.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import {
  DateTimeProvider,
  OAuthLogger,
  OAuthService,
  UrlHelperService,
} from 'angular-oauth2-oidc';
import { RouterTestingModule } from '@angular/router/testing';
import {
  TranslateModule,
  TranslateService,
  TranslateFakeLoader,
  TranslateLoader,
} from '@ngx-translate/core';

describe('SafeFormComponent', () => {
  let component: SafeFormComponent;
  let fixture: ComponentFixture<SafeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: 'environment', useValue: environment },
        { provide: MatDialogRef, useValue: {} },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            access: { canSee: null, canUpdate: null, canDelete: null },
          },
        },
        OAuthService,
        UrlHelperService,
        OAuthLogger,
        DateTimeProvider,
        TranslateService,
      ],
      declarations: [SafeFormComponent],
      imports: [
        MatDialogModule,
        MatSnackBarModule,
        HttpClientModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader,
          },
        }),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SafeFormComponent);
    component = fixture.componentInstance;
    component.form = {
      structure: '{}',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
