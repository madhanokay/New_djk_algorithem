import React from 'react';
import { shallow } from 'enzyme';
import { RangeSlider } from '@looker/components';
import RangerSliderExample from './RangerSliderExample';

describe('render RangerSliderExample component', () => {
  let wrapper;
  const setValue = jest.fn();
  const useStateSpy = jest.spyOn(React, 'useState');
  useStateSpy.mockImplementation((value) => [value, setValue]);

  it('Should match snapshots', () => {
    wrapper = shallow(<RangerSliderExample />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Onchange range select test...', () => {
    const buttonGrpu = wrapper.find(RangeSlider);
    buttonGrpu.props().onChange('range1');
    expect(setValue).toBeTruthy();
  });
});
