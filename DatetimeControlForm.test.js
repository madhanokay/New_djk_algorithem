import React, { useEffect, useContext } from 'react';
import { shallow } from 'enzyme';
import { Heading } from '@looker/components';
import DatetimeControlForm from './DatetimeControlForm';
import { Filter, useExpressionState } from '@looker/filter-components';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(),
  useContext: jest.fn(),
}));

jest.mock('@looker/filter-components', () => ({
  ...jest.requireActual('@looker/filter-components'),
  useExpressionState: jest.fn(),
}));

const setDayPickerExpression = jest.fn();
const setDayRangePickerExpression = jest.fn();
const setTimeframeExpression = jest.fn();
const useStateSpy = jest.spyOn(React, 'useState');

describe('render DatetimeControlForm component', () => {
  let wrapper;
  let wrapperTimeFrame;
  const mockDispatch = jest.fn();
  const dispatch = jest.fn();

  beforeEach(() => {
    jest.restoreAllMocks();
    useContext.mockReturnValue([
      {
        editMode: true,
        filterPayload: {
          allow_multiple_values: false,
          dashboard_id: '250',
          default_value: '',
          dimension: '',
          explore: '',
          field: { type: 'number' },
          id: null,
          listens_to_filters: [],
          model: 'model',
          name: null,
          required: false,
          row: 0,
          title: null,
          type: 'field_filter',
          ui_config: { options: [0, 1], type: 'day_picker', display: 'inline' },
        },
        selectedFilter: { model: 'testModel', scope: 'testScope', name: 'testName' },
        workflowStep: 'test',
      },
      dispatch,
    ]);
    useEffect.mockImplementation((fn) => fn());
    wrapper = shallow(<DatetimeControlForm />);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should match wrapper CONTROL_DAY_PICKER component', () => {
    expect(wrapper.find(Heading).text()).toEqual('Single Date');
  });

  it('Should test onDayPickerChange', () => {
    const currentDate = Date.now();
    const wrapperFilter = wrapper.find(Filter);
    wrapperFilter.props().onChange(currentDate);
    useStateSpy.mockImplementationOnce(() => [currentDate, setDayPickerExpression]);
    expect(setDayPickerExpression).toBeTruthy();
  });

  it('Should match wrapper CONTROL_DAY_RANGE_PICKER component', () => {
    useContext.mockReturnValue([
      {
        filterPayload: {
          field: { type: 'date_time' },
          ui_config: { options: [0, 1], type: 'day_range_picker', display: 'inline' },
        },
      },
      dispatch,
    ]);
    const wrapperDayRangePicker = shallow(<DatetimeControlForm />);
    expect(wrapperDayRangePicker.find(Heading).text()).toEqual('Date Range');
  });

  it('Should match wrapper CONTROL_RELATIVE_TIMEFRAMES component', () => {
    useContext.mockReturnValue([
      {
        filterPayload: {
          ui_config: { options: [0, 1], type: 'relative_timeframes', display: 'inline' },
        },
      },
      dispatch,
    ]);
    wrapperTimeFrame = shallow(<DatetimeControlForm />);
    expect(wrapperTimeFrame.find(Heading).text()).toEqual('Timeframe');
  });

  it('Should test onchange relative timeframe', () => {
    const currentDate = Date.now();
    const wrapperFilterTime = wrapperTimeFrame.find(Filter);
    wrapperFilterTime.props().onChange(currentDate);
    useStateSpy.mockImplementationOnce(() => [currentDate, setTimeframeExpression]);
    expect(setTimeframeExpression).toBeTruthy();
  });
});
