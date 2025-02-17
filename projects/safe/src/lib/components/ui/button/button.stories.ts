import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { SafeButtonModule } from './button.module';
import { SafeButtonComponent } from './button.component';
import { ButtonCategory } from './button-category.enum';
import { ButtonSize } from './button-size.enum';
import { ButtonVariant } from './button-variant.enum';

export default {
  component: SafeButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [SafeButtonModule],
      providers: [],
    }),
  ],
  title: 'UI/Button',
  argTypes: {
    size: {
      options: [ButtonSize.SMALL, ButtonSize.MEDIUM],
      control: { type: 'select' },
    },
    category: {
      options: [
        ButtonCategory.PRIMARY,
        ButtonCategory.SECONDARY,
        ButtonCategory.TERTIARY,
      ],
      control: { type: 'select' },
    },
    variant: {
      options: [
        ButtonVariant.DEFAULT,
        ButtonVariant.PRIMARY,
        ButtonVariant.SUCCESS,
        ButtonVariant.DANGER,
      ],
      control: { type: 'select' },
    },
    block: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
    disabled: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
    loading: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
    icon: {
      defaultValue: '',
      control: { type: 'text' },
    },
    isIcon: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
    content: {
      defaultValue: 'This is a button',
      control: { type: 'text' },
    },
  },
} as Meta;

/**
 * Template used by storybook to display the component in stories.
 *
 * @param args story arguments
 * @returns story template
 */
const TEMPLATE_WITH_TEXT: Story<SafeButtonComponent> = (args) => ({
  template: '<safe-button [icon]="icon">{{content}}</safe-button>',
  props: {
    ...args,
  },
});

/**
 * Template used by stories that don't need to display text.
 *
 * @param args story arguments
 * @returns story template
 */
const TEMPLATE_WITHOUT_TEXT: Story<SafeButtonComponent> = (args) => ({
  props: {
    ...args,
  },
});

/**
 * Default story
 */
export const DEFAULT = TEMPLATE_WITH_TEXT.bind({});
DEFAULT.storyName = 'Default';
DEFAULT.args = {
  category: ButtonCategory.PRIMARY,
  size: ButtonSize.MEDIUM,
  variant: ButtonVariant.DEFAULT,
};

/**
 * Story with Icon and Text
 */
export const ICON_AND_TEXT = TEMPLATE_WITH_TEXT.bind({});
DEFAULT.storyName = 'Icon and text';
ICON_AND_TEXT.args = {
  ...DEFAULT.args,
  icon: 'home',
};

/**
 * Story with icon only
 */
export const ICON = TEMPLATE_WITHOUT_TEXT.bind({});
DEFAULT.storyName = 'Icon only';
ICON.args = {
  ...DEFAULT.args,
  isIcon: true,
  icon: 'home',
};
