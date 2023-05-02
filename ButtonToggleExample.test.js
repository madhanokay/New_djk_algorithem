import React from 'react';
import { shallow } from 'enzyme';
import ButtonToggleExample from './ButtonToggleExample';

let _props = {
  data: [{ label: 'testlabel' }],
  value: { value: '1' },
};
describe('render ButtonToggleExample component', () => {
  let wrapper;
  const setGroupValue = jest.fn();
  const useStateSpy = jest.spyOn(React, 'useState');
  useStateSpy.mockImplementation((groupValue) => [groupValue, setGroupValue]);

  it('Should match snapshots', () => {
    wrapper = shallow(<ButtonToggleExample {..._props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Onclick button test...', () => {
    const buttonGrpu = wrapper.find({ 'data-test-id': 'custom-button-groupEx' });
    buttonGrpu.props().onClick({ preventDefault: jest.fn(), target: { value: 'bg1' } });
    expect(setGroupValue).toBeTruthy();
  });
});
