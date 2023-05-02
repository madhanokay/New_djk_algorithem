import React from 'react';
import { shallow } from 'enzyme';
import RadioButtonExample from './RadioButtonExample';

let _props = {
  data: [{ label: 'testradiodata' }],
  value: 1,
};
describe('render RadioButtonExample component', () => {
  let wrapper;

  it('Should match snapshots', () => {
    wrapper = shallow(<RadioButtonExample {..._props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
