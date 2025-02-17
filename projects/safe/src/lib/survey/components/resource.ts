import { Apollo } from 'apollo-angular';
import {
  GET_RESOURCE_BY_ID,
  GetResourceByIdQueryResponse,
} from '../../graphql/queries';
import * as SurveyCreator from 'survey-creator';
import { resourceConditions } from './resources';
import { ConfigDisplayGridFieldsModalComponent } from '../../components/config-display-grid-fields-modal/config-display-grid-fields-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SafeResourceDropdownComponent } from '../../components/resource-dropdown/resource-dropdown.component';
import { DomService } from '../../services/dom.service';
import { buildSearchButton, buildAddButton } from './utils';

/**
 * Inits the resource question component of for survey.
 *
 * @param Survey Survey library
 * @param domService Shared DOM service
 * @param apollo Apollo client
 * @param dialog Material dom service
 * @param formBuilder Angular form service
 */
export const init = (
  Survey: any,
  domService: DomService,
  apollo: Apollo,
  dialog: MatDialog,
  formBuilder: FormBuilder
): void => {
  const getResourceById = (data: {
    id: string;
    filters?: { field: string; operator: string; value: string }[];
  }) =>
    apollo.query<GetResourceByIdQueryResponse>({
      query: GET_RESOURCE_BY_ID,
      variables: {
        id: data.id,
        filter: data.filters,
      },
    });

  let filters: { field: string; operator: string; value: string }[] = [
    {
      field: '',
      operator: '',
      value: '',
    },
  ];

  // const hasUniqueRecord = ((id: string) => false);
  // resourcesForms.filter(r => (r.id === id && r.coreForm && r.coreForm.uniqueRecord)).length > 0);

  const component = {
    name: 'resource',
    title: 'Resource',
    category: 'Custom Questions',
    questionJSON: {
      name: 'resource',
      type: 'dropdown',
      optionsCaption: 'Select a record...',
      choicesOrder: 'asc',
      choices: [] as any[],
    },
    filters: [] as any[],
    resourceFieldsName: [] as any[],
    /** Initiate the resource question component */
    onInit(): void {
      Survey.Serializer.addProperty('resource', {
        name: 'resource',
        category: 'Custom Questions',
        type: 'resourceDropdown',
        visibleIndex: 3,
        required: true,
      });

      const resourceEditor = {
        render: (editor: any, htmlElement: any) => {
          const question = editor.object;
          const dropdown = domService.appendComponentToBody(
            SafeResourceDropdownComponent,
            htmlElement
          );
          const instance: SafeResourceDropdownComponent = dropdown.instance;
          instance.resource = question.resource;
          instance.choice.subscribe((res) => editor.onChanged(res));
        },
      };

      SurveyCreator.SurveyPropertyEditorFactory.registerCustomEditor(
        'resourceDropdown',
        resourceEditor
      );

      Survey.Serializer.addProperty('resource', {
        name: 'displayField',
        category: 'Custom Questions',
        dependsOn: 'resource',
        required: true,
        visibleIf: (obj: any) => {
          if (!obj || !obj.resource) {
            return false;
          } else {
            return true;
          }
        },
        visibleIndex: 3,
        choices: (obj: any, choicesCallback: any) => {
          if (obj.resource) {
            getResourceById({ id: obj.resource }).subscribe((response) => {
              const serverRes = response.data.resource.fields;
              const res = [];
              res.push({ value: null });
              for (const item of serverRes) {
                if (item.type !== 'matrix') {
                  res.push({ value: item.name });
                }
              }
              choicesCallback(res);
            });
          }
        },
      });

      Survey.Serializer.addProperty('resource', {
        name: 'relatedName',
        category: 'Custom Questions',
        dependsOn: 'resource',
        required: true,
        description: 'unique name for this resource question',
        visibleIf: (obj: any) => {
          if (!obj || !obj.resource) {
            return false;
          } else {
            return true;
          }
        },
        visibleIndex: 4,
      });

      // Build set available grid fields button
      Survey.JsonObject.metaData.addProperty('resource', {
        name: 'Search resource table',
        type: 'resourceFields',
        isRequired: true,
        category: 'Custom Questions',
        dependsOn: ['resource'],
        visibleIf: (obj: any) => !!obj && !!obj.resource,
        visibleIndex: 5,
      });

      const availableFieldsEditor = {
        render: (editor: any, htmlElement: any) => {
          const btn = document.createElement('button');
          btn.innerText = 'Available grid fields';
          btn.style.width = '100%';
          btn.style.border = 'none';
          btn.style.padding = '10px';
          htmlElement.appendChild(btn);
          btn.onclick = (ev: any) => {
            const currentQuestion = editor.object;
            getResourceById({ id: currentQuestion.resource }).subscribe(
              (response) => {
                if (response.data.resource && response.data.resource.name) {
                  const nameTrimmed = response.data.resource.name
                    .replace(/\s/g, '')
                    .toLowerCase();
                  const dialogRef = dialog.open(
                    ConfigDisplayGridFieldsModalComponent,
                    {
                      data: {
                        form: !currentQuestion.gridFieldsSettings
                          ? null
                          : this.convertFromRawToFormGroup(
                              currentQuestion.gridFieldsSettings
                            ),
                        resourceName: nameTrimmed,
                      },
                    }
                  );
                  dialogRef.afterClosed().subscribe((res: any) => {
                    if (res && res.value.fields) {
                      currentQuestion.gridFieldsSettings = res.getRawValue();
                    }
                  });
                }
              }
            );
          };
        },
      };

      SurveyCreator.SurveyPropertyEditorFactory.registerCustomEditor(
        'resourceFields',
        availableFieldsEditor
      );

      Survey.Serializer.addProperty('resource', {
        name: 'test service',
        category: 'Custom Questions',
        dependsOn: ['resource', 'displayField'],
        required: true,
        visibleIf: (obj: any) => {
          if (!obj || !obj.resource || !obj.displayField) {
            return false;
          } else {
            return true;
          }
        },
        visibleIndex: 3,
        choices: (obj: any, choicesCallback: any) => {
          if (obj.resource) {
            getResourceById({ id: obj.resource }).subscribe((response) => {
              const serverRes =
                response.data.resource.records?.edges?.map((x) => x.node) || [];
              const res = [];
              res.push({ value: null });
              for (const item of serverRes) {
                res.push({
                  value: item?.id,
                  text: item?.data[obj.displayField],
                });
              }
              choicesCallback(res);
            });
          }
        },
      });
      Survey.Serializer.addProperty('resource', {
        name: 'addRecord:boolean',
        category: 'Custom Questions',
        dependsOn: ['resource'],
        visibleIf: (obj: any) => {
          if (!obj || !obj.resource) {
            return false;
          } else {
            return true;
            // return !hasUniqueRecord(obj.resource);
          }
        },
        visibleIndex: 3,
      });
      Survey.Serializer.addProperty('resource', {
        name: 'canSearch:boolean',
        category: 'Custom Questions',
        dependsOn: ['resource'],
        default: true,
        visibleIf: (obj: any) => {
          if (!obj || !obj.resource) {
            return false;
          } else {
            return true;
            // return !hasUniqueRecord(obj.resource);
          }
        },
        visibleIndex: 3,
      });
      Survey.Serializer.addProperty('resource', {
        name: 'addTemplate',
        category: 'Custom Questions',
        dependsOn: ['addRecord', 'resource'],
        visibleIf: (obj: any) => {
          if (!obj || !obj.addRecord) {
            return false;
          } else {
            return true;
            // return !hasUniqueRecord(obj.resource);
          }
        },
        visibleIndex: 3,
        choices: (obj: any, choicesCallback: any) => {
          if (obj.resource && obj.addRecord) {
            getResourceById({ id: obj.resource }).subscribe((response) => {
              const serverRes = response.data.resource.forms || [];
              const res: any[] = [];
              res.push({ value: null });
              for (const item of serverRes) {
                res.push({ value: item.id, text: item.name });
              }
              choicesCallback(res);
            });
          }
        },
      });
      Survey.Serializer.addProperty('resource', {
        name: 'placeholder',
        category: 'Custom Questions',
      });
      Survey.Serializer.addProperty('resource', {
        name: 'prefillWithCurrentRecord:boolean',
        category: 'Custom Questions',
        dependsOn: ['addRecord', 'resource'],
        visibleIf: (obj: any) => {
          if (!obj.resource || !obj.addRecord) {
            return false;
          } else {
            return true;
          }
        },
        visibleIndex: 8,
      });
      Survey.Serializer.addProperty('resource', {
        name: 'selectQuestion:dropdown',
        category: 'Filter by Questions',
        dependsOn: ['resource', 'displayField'],
        required: true,
        visibleIf: (obj: any) => {
          if (!obj || !obj.resource || !obj.displayField) {
            return false;
          } else {
            return true;
          }
        },
        visibleIndex: 3,
        choices: (obj: any, choicesCallback: any) => {
          if (obj && obj.resource) {
            const questions: any[] = [
              '',
              { value: '#staticValue', text: 'Set from static value' },
            ];
            obj.survey.getAllQuestions().forEach((question: any) => {
              if (question.id !== obj.id) {
                questions.push(question.name);
              }
            });
            choicesCallback(questions);
          }
        },
      });
      Survey.Serializer.addProperty('resource', {
        type: 'string',
        name: 'staticValue',
        category: 'Filter by Questions',
        dependsOn: ['resource', 'selectQuestion', 'displayField'],
        visibleIf: (obj: any) =>
          obj.selectQuestion === '#staticValue' && obj.displayField,
        visibleIndex: 3,
      });
      Survey.Serializer.addProperty('resource', {
        type: 'dropdown',
        name: 'filterBy',
        category: 'Filter by Questions',
        dependsOn: ['resource', 'displayField', 'selectQuestion'],
        visibleIf: (obj: any) => obj.selectQuestion && obj.displayField,
        choices: (obj: any, choicesCallback: any) => {
          if (obj.resource) {
            getResourceById({ id: obj.resource }).subscribe((response) => {
              const serverRes = response.data.resource.fields;
              const res = [];
              for (const item of serverRes) {
                res.push({ value: item.name });
              }
              choicesCallback(res);
            });
          }
        },
        visibleIndex: 3,
      });
      Survey.Serializer.addProperty('resource', {
        type: 'dropdown',
        name: 'filterCondition',
        category: 'Filter by Questions',
        dependsOn: ['resource', 'displayField', 'selectQuestion'],
        visibleIf: (obj: any) =>
          obj.resource && obj.displayField && obj.selectQuestion,
        choices: (obj: any, choicesCallback: any) => {
          const questionByName = !!obj.survey.getQuestionByName(
            obj.selectQuestion
          )
            ? obj.survey.getQuestionByName(obj.selectQuestion)
            : obj.customQuestion;
          if (questionByName && questionByName.inputType === 'date') {
            choicesCallback(
              resourceConditions.filter((r) => r.value !== 'contains')
            );
          } else {
            choicesCallback(resourceConditions);
          }
        },
        visibleIndex: 3,
      });
      Survey.Serializer.addProperty(
        'resource',
        {
          category: 'Filter by Questions',
          type: 'selectResourceText',
          name: 'selectResourceText',
          displayName: 'Select a resource',
          dependsOn: ['resource', 'displayField'],
          visibleIf: (obj: any) => !obj.resource || !obj.displayField,
          visibleIndex: 3,
        },
        Survey.Serializer.addProperty('resource', {
          name: 'gridFieldsSettings',
          dependsOn: ['resource'],
          visibleIf: (obj: any) => {
            obj.gridFieldsSettings = obj.resource
              ? obj.gridFieldsSettings
              : new FormGroup({}).getRawValue();
            return false;
          },
        })
      );

      const selectResourceText = {
        render: (editor: any, htmlElement: any): void => {
          const text = document.createElement('div');
          text.innerHTML =
            'First you have to select a resource before set filters';
          htmlElement.appendChild(text);
        },
      };
      SurveyCreator.SurveyPropertyEditorFactory.registerCustomEditor(
        'selectResourceText',
        selectResourceText
      );

      Survey.Serializer.addProperty('resource', {
        category: 'Filter by Questions',
        type: 'customFilter',
        name: 'customFilterEl',
        displayName: 'Custom Filter',
        dependsOn: ['resource', 'selectQuestion'],
        visibleIf: (obj: any) => obj.resource && !obj.selectQuestion,
        visibleIndex: 3,
      });

      const customFilterElements = {
        render: (editor: any, htmlElement: any): void => {
          const text = document.createElement('div');
          text.innerHTML =
            'You can use curly brackets to get access to the question values.' +
            '<br><b>field</b>: select the field to be filter by.' +
            '<br><b>operator</b>: contains, =, !=, >, <, >=, <=' +
            '<br><b>value:</b> {question1} or static value' +
            '<br><b>Example:</b>' +
            '<br>[{' +
            '<br>"field": "name",' +
            '<br>"operator":"contains",' +
            '<br>"value": "Laura"' +
            '<br>},' +
            '<br>{' +
            '<br>"field":"age",' +
            '<br>"operator": ">",' +
            '<br>"value": "{question1}"' +
            '<br>}]';
          htmlElement.appendChild(text);
        },
      };

      SurveyCreator.SurveyPropertyEditorFactory.registerCustomEditor(
        'customFilter',
        customFilterElements
      );

      Survey.Serializer.addProperty('resource', {
        category: 'Filter by Questions',
        type: 'text',
        name: 'customFilter',
        displayName: ' ',
        dependsOn: ['resource', 'selectQuestion'],
        visibleIf: (obj: any) => obj.resource && !obj.selectQuestion,
        visibleIndex: 4,
      });
    },
    /**
     * Get the resource after the question is loaded
     *
     * @param question The current resource question
     */
    onLoaded(question: any): void {
      if (question.placeholder) {
        question.contentQuestion.optionsCaption = question.placeholder;
      }
      if (question.resource) {
        if (question.selectQuestion) {
          filters[0].operator = question.filterCondition;
          filters[0].field = question.filterBy;
          if (question.selectQuestion) {
            question.registerFunctionOnPropertyValueChanged(
              'filterCondition',
              () => {
                filters.map((i: any) => {
                  i.operator = question.filterCondition;
                });
              }
            );
          }
        }
        getResourceById({ id: question.resource }).subscribe((response) => {
          const serverRes =
            response.data.resource.records?.edges?.map((x) => x.node) || [];
          const res = [];
          for (const item of serverRes) {
            res.push({
              value: item?.id,
              text: item?.data[question.displayField],
            });
          }
          question.contentQuestion.choices = res;
          if (!question.placeholder) {
            question.contentQuestion.optionsCaption =
              'Select a record from ' + response.data.resource.name + '...';
          }
          if (!question.filterBy || question.filterBy.length < 1) {
            this.populateChoices(question);
          }
        });

        if (question.selectQuestion) {
          if (question.selectQuestion === '#staticValue') {
            setAdvanceFilter(question.staticValue, question);
            this.populateChoices(question);
          } else {
            question.survey.onValueChanged.add((_: any, options: any) => {
              if (options.name === question.selectQuestion) {
                if (
                  !!options.value ||
                  (options.question.customQuestion &&
                    options.question.customQuestion.name)
                ) {
                  setAdvanceFilter(options.value, question);
                  this.populateChoices(question);
                }
              }
            });
          }
        } else if (
          !question.selectQuestion &&
          question.customFilter &&
          question.customFilter.trim().length > 0
        ) {
          const obj = JSON.parse(question.customFilter);
          if (obj) {
            for (const objElement of obj) {
              const value = objElement.value;
              if (typeof value === 'string' && value.match(/^{*.*}$/)) {
                const quest = objElement.value.substr(
                  1,
                  objElement.value.length - 2
                );
                objElement.value = '';
                question.survey.onValueChanged.add((_: any, options: any) => {
                  if (options.question.name === quest) {
                    if (!!options.value) {
                      setAdvanceFilter(options.value, objElement.field);
                      this.populateChoices(question);
                    }
                  }
                });
              }
            }
            filters = obj;
            this.populateChoices(question);
          }
        }
      }
    },
    /**
     * Update the question properties when the resource property is changed
     *
     * @param question The current question
     * @param propertyName The name of the property
     * @param newValue The new value assigned to the property by the user
     */
    onPropertyChanged(
      question: any,
      propertyName: string,
      newValue: any
    ): void {
      if (propertyName === 'resource') {
        question.displayField = null;
        this.filters = [];
        this.resourceFieldsName = [];
        question.addRecord = false;
        question.addTemplate = null;
        question.prefillWithCurrentRecord = false;
      }
    },
    populateChoices: (question: any): void => {
      if (question.resource) {
        getResourceById({ id: question.resource, filters }).subscribe(
          (response) => {
            const serverRes =
              response.data.resource.records?.edges?.map((x) => x.node) || [];
            const res: any[] = [];
            for (const item of serverRes) {
              res.push({
                value: item?.id,
                text: item?.data[question.displayField],
              });
            }
            question.contentQuestion.choices = res;
          }
        );
      } else {
        question.contentQuestion.choices = [];
      }
    },
    // Display of add button for resource question
    onAfterRender: (question: any, el: any): void => {
      if (question.survey.mode !== 'display' && question.resource) {
        const actionsButtons = document.createElement('div');
        actionsButtons.id = 'actionsButtons';
        actionsButtons.style.display = 'flex';
        actionsButtons.style.marginBottom = '0.5em';

        const searchBtn = buildSearchButton(
          question,
          question.gridFieldsSettings,
          false,
          dialog
        );
        actionsButtons.appendChild(searchBtn);

        const addBtn = buildAddButton(question, false, dialog);
        actionsButtons.appendChild(addBtn);

        const parentElement = el.querySelector('.safe-qst-content');
        if (parentElement) {
          parentElement.insertBefore(actionsButtons, parentElement.firstChild);
        }

        // actionsButtons.style.display = ((!question.addRecord || !question.addTemplate) && !question.gridFieldsSettings) ? 'none' : '';

        question.registerFunctionOnPropertyValueChanged(
          'gridFieldsSettings',
          () => {
            searchBtn.style.display = question.gridFieldsSettings ? '' : 'none';
          }
        );
        question.registerFunctionOnPropertyValueChanged('canSearch', () => {
          searchBtn.style.display = question.canSearch ? '' : 'none';
        });
        question.registerFunctionOnPropertyValueChanged('addTemplate', () => {
          addBtn.style.display =
            question.addRecord && question.addTemplate ? '' : 'none';
        });
        question.registerFunctionOnPropertyValueChanged('addRecord', () => {
          addBtn.style.display =
            question.addRecord && question.addTemplate ? '' : 'none';
        });
      }
    },
    convertFromRawToFormGroup: (gridSettingsRaw: any): FormGroup | null => {
      if (!gridSettingsRaw.fields) {
        return null;
      }
      const auxForm = formBuilder.group(gridSettingsRaw);
      auxForm.controls.fields.setValue(gridSettingsRaw.fields);
      return auxForm;
    },
  };
  Survey.ComponentCollection.Instance.add(component);

  const setAdvanceFilter = (value: string, question: string | any) => {
    const field = typeof question !== 'string' ? question.filterBy : question;
    if (!filters.some((x: any) => x.field === field)) {
      filters.push({
        field: question.filterBy,
        operator: question.filterCondition,
        value,
      });
    } else {
      filters.map((x: any) => {
        if (x.field === field) {
          x.value = value;
        }
      });
    }
  };
};
