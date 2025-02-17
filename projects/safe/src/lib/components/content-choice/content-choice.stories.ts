import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { SafeContentChoiceComponent } from './content-choice.component';
import { SafeContentChoiceModule } from './content-choice.module';
import { CONTENT_TYPES } from '../../models/page.model';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

export default {
  component: SafeContentChoiceComponent,
  decorators: [
    moduleMetadata({
      imports: [SafeContentChoiceModule, FormsModule, ReactiveFormsModule],
      providers: [],
    }),
  ],
  title: 'UI/Content Type Choice',
} as Meta;
/**
 * Defines a template for the component SafeContentChoiceComponent to use as a playground
 *
 * @param args the properties of the instance of SafeContentChoiceComponent
 * @returns the template
 */
const TEMPLATE: Story<SafeContentChoiceComponent> = (args) => ({
  template:
    '<safe-content-choice [formControl]="type" [contentTypes]="contentTypes"></safe-content-choice>',
  props: {
    ...args,
    type: new FormControl(''),
  },
});

/** Default template to export */
export const DEFAULT = TEMPLATE.bind({});
DEFAULT.storyName = 'Default';
DEFAULT.args = {
  contentTypes: CONTENT_TYPES,
};
