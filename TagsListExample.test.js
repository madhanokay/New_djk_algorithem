import React from 'react';
import { shallow } from 'enzyme';
import TagsListExample from './TagsListExample';

let _props = {
  data: [{ label: 'testTagsList' }],
  value: { value: '1' },
};
describe('render TagsListExample component', () => {
  let wrapper;
  const setSelectValue = jest.fn();
  const useStateSpy = jest.spyOn(React, 'useState');
  useStateSpy.mockImplementation((selectValue) => [selectValue, setSelectValue]);

  it('Should match snapshots', () => {
    wrapper = shallow(<TagsListExample {..._props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Onchange tags test...', () => {
    const buttonGrpu = wrapper.find({ 'data-test-id': 'custom-tags-list' });
    buttonGrpu.props().onChange({ preventDefault: jest.fn(), target: { value: 'slide1' } });
    expect(setSelectValue).toBeTruthy();
  });
});
