import React from 'react';
import { shallow } from 'enzyme';
import ExampleWrapper from './ExampleWrapper';
let _props = {
  config: 'single',
  dataType: 'number',
  display: 'inline',
  type: 'radio_buttons',
};
describe('render ButtonGroupExample component', () => {
  let wrapper;

  it('Should match snapshots', () => {
    wrapper = shallow(<ExampleWrapper {..._props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Test suggesion else values', () => {
    _props = {
      config: 'single',
      dataType: 'string',
      display: 'inline',
      type: 'radio_buttons',
    };
    wrapper = shallow(<ExampleWrapper {..._props} />);
  });

  it('Test get values on popover', () => {
    _props = {
      config: 'testsingle',
      dataType: 'number',
      display: 'popover',
      type: 'dropdown_menu',
    };
    wrapper = shallow(<ExampleWrapper {..._props} />);
  });

  it('Test get values on popover with config change', () => {
    _props = {
      config: 'testsingle',
      dataType: 'string',
      display: 'popover',
      type: 'tag_list',
    };
    wrapper = shallow(<ExampleWrapper {..._props} />);
  });
});
