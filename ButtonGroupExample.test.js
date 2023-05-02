import React from 'react';
import { shallow } from 'enzyme';
import ButtonGroupExample from './ButtonGroupExample';

let _props = {
  data: [{ label: 'testlabel' }],
  value: { value: '1' },
};
describe('render ButtonGroupExample component', () => {
  let wrapper;
  const setGroupValue = jest.fn();
  const useStateSpy = jest.spyOn(React, 'useState');
  useStateSpy.mockImplementation((groupValue) => [groupValue, setGroupValue]);

  it('Should match snapshots', () => {
    wrapper = shallow(<ButtonGroupExample {..._props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Onclick button test...', () => {
    const buttonGrpu = wrapper.find({ 'data-test-id': 'custom-button-group' });
    buttonGrpu.props().onClick({ preventDefault: jest.fn(), target: { value: 'bg1' } });
    expect(setGroupValue).toBeTruthy();
  });
});
