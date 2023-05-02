import React from 'react';
import { shallow } from 'enzyme';
import CheckboxExample from './CheckboxExample';

let _props = {
  data: [{ label: 'testlabeldata' }],
  value: 1,
};
describe('render CheckboxExample component', () => {
  let wrapper;

  it('Should match snapshots', () => {
    wrapper = shallow(<CheckboxExample {..._props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
