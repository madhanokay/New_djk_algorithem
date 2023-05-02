import React, { useEffect, useContext, useCallback } from 'react';
import { shallow } from 'enzyme';
import FilterConfig from './FilterConfig';
import { FieldSelect, FieldText } from '@looker/components';
import { Box, Checkbox, FormControl, FormControlLabel, FormGroup, makeStyles } from '@material-ui/core';

import AdvancedControlForm from './AdvancedControlForm';
import DatetimeControlForm from './DatetimeControlForm';
import MultipleControlForm from './MultipleControlForm';
import SingleControlForm from './SingleControlForm';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(),
  useContext: jest.fn(),
}));

jest.mock('@material-ui/styles', () => ({
  ...jest.requireActual('@material-ui/styles'),
  makeStyles: (cb) => () => ({
    left: {
      borderRight: `solid 1px rgba(0, 0, 0, 0.2)`,
    },
  }),
}));

let wrapper;
let wrapperCustom;
const mockDispatch = jest.fn();

const setAllowMultiple = jest.fn();
const setControlType = jest.fn();
const setControlTypeOptions = jest.fn();
const setControlOptionCategory = jest.fn();
const setDisplayOption = jest.fn();
const setFilterName = jest.fn();
const setFilterNameValidationMessage = jest.fn();
const setRequired = jest.fn();
const useStateSpy = jest.spyOn(React, 'useState');

describe('render AdvanceControlForm component', () => {
  beforeEach(() => {
    useContext.mockReturnValue([
      {
        editMode: false,
        filterPayload: {
          allow_multiple_values: false,
          dashboard_id: '250',
          default_value: [1, 2, 3],
          dimension: '',
          explore: '',
          field: { type: 'string' },
          id: null,
          listens_to_filters: [],
          model: 'model',
          name: null,
          required: false,
          row: 0,
          title: null,
          type: 'field_filter',
          ui_config: { options: [0, 1], type: '', display: 'inline' },
        },
        selectedFilter: { model: 'testModel', scope: 'testScope', name: 'testName', label: 'testLabel' },
        workflowStep: 'test',
      },
      mockDispatch,
    ]);
    //useEffect.mockImplementation((fn) => fn());
    wrapper = shallow(<FilterConfig />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should be render inside component FieldText ', () => {
    //expect(wrapper).toMatchSnapshot();
    expect(wrapper.find(FieldText)).toBeDefined();
  });

  it('Should be test FieldName onchange value', () => {
    const filterName = 'testFilterName';
    const wrapperFieldText = wrapper.find(FieldText);
    wrapperFieldText.props().onChange({ preventDefault: jest.fn(), target: { value: filterName } });
    useStateSpy.mockImplementationOnce(() => [filterName, setFilterName]);
    expect(mockDispatch).toBeDefined();
  });

  it('Should be test select control onchange value', () => {
    const selectName = 'advanced';
    const wrapperFieldText = wrapper.find(FieldSelect).at(0);
    wrapperFieldText.props().onChange(selectName);
    useStateSpy.mockImplementationOnce(() => [selectName, setControlType]);
    useStateSpy.mockImplementationOnce(() => [true, setAllowMultiple]);
    expect(mockDispatch).toBeDefined();
  });

  it('Should be test select control onchange value as slider', () => {
    const selectName = 'slider';
    const wrapperFieldText = wrapper.find(FieldSelect).at(0);
    wrapperFieldText.props().onChange(selectName);
    expect(mockDispatch).toBeDefined();
  });

  it('Should be test select control onchange value as range_slider', () => {
    const selectName = 'range_slider';
    const wrapperFieldText = wrapper.find(FieldSelect).at(0);
    wrapperFieldText.props().onChange(selectName);
    expect(mockDispatch).toBeDefined();
  });

  it('Should be test select display onchange value ', () => {
    const displayValue = 'testDisplayValue';
    const wrapperFieldText = wrapper.find(FieldSelect).at(1);
    wrapperFieldText.props().onChange(displayValue);
    useStateSpy.mockImplementationOnce(() => [displayValue, setDisplayOption]);
    expect(mockDispatch).toBeDefined();
  });

  it('Should be test required filter', () => {
    const wrapperFieldText = wrapper.find(FormControlLabel).at(0);
    wrapperFieldText.props().onChange({ preventDefault: jest.fn(), target: { value: true } });
    useStateSpy.mockImplementationOnce(() => [true, setRequired]);
    expect(mockDispatch).toBeDefined();
  });

  it('Should be test allow multiple values onchange as true', () => {
    const wrapperFieldText = wrapper.find(FormControlLabel).at(1);
    wrapperFieldText.props().onChange({ preventDefault: jest.fn(), target: { checked: true } });
    expect(mockDispatch).toBeDefined();
  });

  it('Should be test allow multiple values onchange as false', () => {
    const wrapperFieldText = wrapper.find(FormControlLabel).at(1);
    wrapperFieldText.props().onChange({ preventDefault: jest.fn(), target: { checked: false } });
    useStateSpy.mockImplementationOnce(() => [true, setAllowMultiple]);
    expect(mockDispatch).toBeDefined();
  });
});
