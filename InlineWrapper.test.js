import React from 'react';
import { shallow } from 'enzyme';
import InlineWrapper from './InlineWrapper';

let _props = {
  suggestions: [{ label: 'inlinetest', value: '1' }],
  value: 2,
  type: 'radio_buttons',
};
describe('render InlineWrapper component', () => {
  let wrapper;

  it('Should match snapshots', () => {
    wrapper = shallow(<InlineWrapper {..._props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
