import { Apollo } from 'apollo-angular';
import * as SurveyCreator from 'survey-creator';
import { DomService } from '../../services/dom.service';
import { SafeApplicationDropdownComponent } from '../../components/application-dropdown/application-dropdown.component';
import {
  GetRolesFromApplicationsQueryResponse,
  GET_ROLES_FROM_APPLICATIONS,
} from '../../graphql/queries';

/**
 * Inits the owner component.
 *
 * @param Survey Survey library.
 * @param domService Dom service.
 * @param apollo Apollo client.
 */
export const init = (
  Survey: any,
  domService: DomService,
  apollo: Apollo
): void => {
  const component = {
    name: 'owner',
    title: 'Owner',
    category: 'Custom Questions',
    questionJSON: {
      name: 'owner',
      type: 'tagbox',
      optionsCaption: 'Select roles...',
      choicesOrder: 'asc',
      choices: [] as any[],
    },
    onInit: (): void => {
      Survey.Serializer.addProperty('owner', {
        name: 'applications',
        category: 'Owner properties',
        type: 'applicationsDropdown',
        isDynamicChoices: true,
        visibleIndex: 3,
        required: true,
      });

      const applicationEditor = {
        render: (editor: any, htmlElement: any) => {
          const question = editor.object;
          const dropdown = domService.appendComponentToBody(
            SafeApplicationDropdownComponent,
            htmlElement
          );
          const instance: SafeApplicationDropdownComponent = dropdown.instance;
          instance.value = question.applications;
          instance.choice.subscribe((res) => editor.onChanged(res));
        },
      };

      SurveyCreator.SurveyPropertyEditorFactory.registerCustomEditor(
        'applicationsDropdown',
        applicationEditor
      );
    },
    onLoaded: (question: any): void => {
      apollo
        .query<GetRolesFromApplicationsQueryResponse>({
          query: GET_ROLES_FROM_APPLICATIONS,
          variables: {
            applications: question.applications,
          },
        })
        .subscribe((res) => {
          if (res.data.rolesFromApplications) {
            const roles = [];
            for (const role of res.data.rolesFromApplications) {
              roles.push({ value: role.id, text: role.title });
            }
            question.contentQuestion.choices = roles;
          }
        });
    },
    onAfterRender: (question: any, el: any): void => {},
  };
  Survey.ComponentCollection.Instance.add(component);
};
