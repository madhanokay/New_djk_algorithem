import React, { useEffect, useContext, useMemo } from 'react';
import { shallow } from 'enzyme';
import AdvanceControlForm from './AdvancedControlForm';
import AdvancedDashFilter from '../../AdvancedDashFilter';
import CustomDateTimeFilter from 'components/filters/CustomDateTime/CustomDateTimeFilter';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(),
  useContext: jest.fn(),
  useMemo: jest.fn(),
}));

let wrapper;
let wrapperCustom;
const mockDispatch = jest.fn();

describe('render AdvanceControlForm component', () => {
  beforeEach(() => {
    useContext.mockReturnValue([
      {
        filterPayload: {},
      },
      mockDispatch,
    ]);
    useEffect.mockImplementation((fn) => fn());
    wrapper = shallow(<AdvanceControlForm />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should be render AdvancedDashfilter ', () => {
    expect(wrapper.find(AdvancedDashFilter)).toBeDefined();
  });

  it('Test AdvancedDashFilter onhandler', () => {
    const wrapperAdvanceDash = wrapper.find(AdvancedDashFilter);
    wrapperAdvanceDash.props().changeHandler(jest.fn());
    expect(mockDispatch).toBeDefined();
  });

  it('Should Test CustomDateTimeFilter render', () => {
    useContext.mockReturnValue([
      {
        filterPayload: {
          field: { type: 'number', name: 'testFieldName' },
        },
      },
      mockDispatch,
    ]);
    useMemo.mockReturnValue(true);
    wrapperCustom = shallow(<AdvanceControlForm />);
    expect(wrapperCustom.find(CustomDateTimeFilter)).toBeDefined();
    const wrapperCustomFilter = wrapperCustom.find(CustomDateTimeFilter);
    wrapperCustomFilter.props().onChange(jest.fn());
    expect(mockDispatch).toBeDefined();
  });
});
