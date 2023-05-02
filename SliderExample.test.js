import React from 'react';
import { shallow } from 'enzyme';
import SliderExample from './SliderExample';

describe('render SliderExample component', () => {
  let wrapper;
  const setValue = jest.fn();
  const useStateSpy = jest.spyOn(React, 'useState');
  useStateSpy.mockImplementation((value) => [value, setValue]);

  it('Should match snapshots', () => {
    wrapper = shallow(<SliderExample />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Onchange slider test...', () => {
    const buttonGrpu = wrapper.find({ 'data-test-id': 'custom-slide' });
    buttonGrpu.props().onChange({ preventDefault: jest.fn(), target: { value: 'slide1' } });
    expect(setValue).toBeTruthy();
  });
});
