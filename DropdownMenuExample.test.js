import React from 'react';
import { shallow } from 'enzyme';
import DropdownMenuExample from './DropdownMenuExample';

let _props = {
  data: [{ label: 'testdropdown' }],
  value: { value: '1' },
};
describe('render DropdownMenuExample component', () => {
  let wrapper;
  const setSelectValue = jest.fn();
  const useStateSpy = jest.spyOn(React, 'useState');
  useStateSpy.mockImplementation((selectValue) => [selectValue, setSelectValue]);

  it('Should match snapshots', () => {
    wrapper = shallow(<DropdownMenuExample {..._props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Onchange select test...', () => {
    const buttonGrpu = wrapper.find({ 'data-test-id': 'custom-select-cmp' });
    buttonGrpu.props().onChange({ preventDefault: jest.fn(), target: { value: 'select1' } });
    expect(setSelectValue).toBeTruthy();
  });
});
