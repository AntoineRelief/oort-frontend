    import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { withKnobs } from '@storybook/addon-knobs';
import { SafeAddStepComponent } from './add-step.component';
import { SafeWorkflowStepperModule } from '../../workflow-stepper.module';

export default {
    component: SafeAddStepComponent,
    decorators: [
        moduleMetadata({
            imports: [
                SafeWorkflowStepperModule
            ],
            providers: []
        }),
        withKnobs
    ],
    title: 'UI/Workflow/Add Step',
    argTypes: {}
} as Meta;

const TEMPLATE: Story<SafeAddStepComponent> = args => ({
    props: {
        ...args
    }
});

export const DEFAULT = TEMPLATE.bind({});
DEFAULT.args = {};
