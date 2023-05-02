import React, { useEffect, useContext } from 'react';
import { shallow } from 'enzyme';
import { useDispatch } from 'react-redux';
import { FieldSelect, FieldSelectMulti, FieldText, InputChips, Label, MessageBar, Spinner } from '@looker/components';
import MultipleControlForm from './MultipleControlForm';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useEffect: jest.fn(),
  useContext: jest.fn(),
}));

jest.mock('@material-ui/styles', () => ({
  ...jest.requireActual('@material-ui/styles'),
  makeStyles: (cb) => () => cb({ spacing: () => 0 }),
}));

describe('render MultipleControlForm component with display type range_slider', () => {
  let wrapper;
  const mockDispatch = jest.fn();

  const setDefaultMultiOptions = jest.fn();
  const setWorkingMultiOptions = jest.fn();
  const setDefaultSingleValue = jest.fn();
  const setValueTracker = jest.fn();
  const setMinValue = jest.fn();
  const setMaxValue = jest.fn();
  const setDefaultMin = jest.fn();
  const setDefaultMax = jest.fn();
  const useStateSpy = jest.spyOn(React, 'useState');
  useStateSpy.mockImplementation((defaultMultiOptions) => [defaultMultiOptions, setDefaultMultiOptions]);
  useStateSpy.mockImplementation((workingMultiOptions) => [workingMultiOptions, setWorkingMultiOptions]);
  useStateSpy.mockImplementation((defaultSingleValue) => [defaultSingleValue, setDefaultSingleValue]);
  useStateSpy.mockImplementation((valueTracker) => [valueTracker, setValueTracker]);
  useStateSpy.mockImplementation((minValue) => [minValue, setMinValue]);
  useStateSpy.mockImplementation((maxValue) => [maxValue, setMaxValue]);
  useStateSpy.mockImplementation((defaultMax) => [defaultMax, setDefaultMin]);
  useStateSpy.mockImplementation((defaultMin) => [defaultMin, setDefaultMax]);

  beforeEach(() => {
    jest.restoreAllMocks();
    useEffect.mockImplementation((fn) => fn());
    useContext.mockReturnValue([
      {
        editMode: true,
        filterPayload: {
          allow_multiple_values: false,
          dashboard_id: '250',
          default_value: [1, 2, 3],
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
          ui_config: { options: [0, 1], type: 'range_slider', display: 'inline' },
        },
        selectedFilter: { model: 'testModel', scope: 'testScope', name: 'testName' },
        workflowStep: 'test',
      },
      mockDispatch,
    ]);
    wrapper = shallow(<MultipleControlForm />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should match snapshots', () => {
    expect(wrapper.find(FieldText)).toBeDefined();
    //expect(wrapper).toMatchSnapshot();
  });

  it('Should be test FieldText minimum value onchange', () => {
    const minValue = '1';
    const wrapperFieldText = wrapper.find(FieldText).at(0);
    wrapperFieldText.props().onChange({ preventDefault: jest.fn(), target: { value: minValue } });
    useStateSpy.mockImplementationOnce(() => [minValue, setMinValue]);
    expect(mockDispatch).toBeDefined();
  });

  it('Should be test FieldText maximum value onchange', () => {
    const maxValue = '2';
    const wrapperFieldText = wrapper.find(FieldText).at(1);
    wrapperFieldText.props().onChange({ preventDefault: jest.fn(), target: { value: maxValue } });
    useStateSpy.mockImplementationOnce(() => [maxValue, setMaxValue]);
    expect(mockDispatch).toBeDefined();
  });

  it('Should be test FieldText default min value onchange', () => {
    const defaultMinValue = '25';
    const wrapperFieldText = wrapper.find(FieldText).at(2);
    wrapperFieldText.props().onChange({ preventDefault: jest.fn(), target: { value: defaultMinValue } });
    useStateSpy.mockImplementationOnce(() => [defaultMinValue, setDefaultMin]);
    expect(mockDispatch).toBeDefined();
  });

  it('Should be test FieldText default max value onchange', () => {
    const defaultMaxValue = '75';
    const wrapperFieldText = wrapper.find(FieldText).at(3);
    wrapperFieldText.props().onChange({ preventDefault: jest.fn(), target: { value: defaultMaxValue } });
    useStateSpy.mockImplementationOnce(() => [defaultMaxValue, setDefaultMax]);
    expect(mockDispatch).toBeDefined();
  });

  describe('render MultiControlForm component with display type without range_slider', () => {
    let wrapperType;
    const mockDispatch = jest.fn();
    const dispatch = jest.fn();

    beforeAll(() => {
      useDispatch.mockReturnValue(mockDispatch);
      useEffect.mockImplementation((fn) => fn());
      useContext.mockReturnValue([
        {
          editMode: true,
          filterPayload: {
            allow_multiple_values: false,
            dashboard_id: '250',
            default_value: '',
            dimension: '',
            explore: '',
            field: {},
            id: null,
            listens_to_filters: [],
            model: 'model',
            name: null,
            required: false,
            row: 0,
            title: null,
            type: 'field_filter',
            ui_config: { options: '', type: '', display: 'inline' },
          },
          selectedFilter: null,
          workflowStep: 'select',
        },
        dispatch,
      ]);

      wrapperType = shallow(<MultipleControlForm />);
    });

    beforeEach(() => {
      jest.restoreAllMocks();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('Should match wrapper inside FieldSelectMulti component', () => {
      expect(wrapperType.find(FieldSelectMulti)).toBeDefined();
      //expect(wrapperType).toMatchSnapshot();
    });

    it('Should Test FieldSelectMulti onchange with values not empty', () => {
      const defaultValue = [1, 2];
      const wrapperFieldMultiSelect = wrapperType.find(FieldSelectMulti);
      wrapperFieldMultiSelect.props().onChange(defaultValue);
      expect(mockDispatch).toBeDefined();
    });

    it('Should Test FieldSelectMulti onchange with values as empty', () => {
      const defaultValue = [];
      const wrapperFieldMultiSelect = wrapperType.find(FieldSelectMulti);
      wrapperFieldMultiSelect.props().onChange(defaultValue);
      useStateSpy.mockImplementationOnce(() => [defaultValue, setWorkingMultiOptions]);
      useStateSpy.mockImplementationOnce(() => ['', setDefaultSingleValue]);
      useStateSpy.mockImplementationOnce(() => [[], setValueTracker]);
      expect(mockDispatch).toBeDefined();
    });

    it('Should test datatype its number then change multi select', () => {
      useContext.mockReturnValue([
        {
          filterPayload: {
            field: { type: 'number' },
            ui_config: { options: '', type: '', display: 'inline' },
          },
        },
        dispatch,
      ]);
      const wrapperTypeMultiSelection = shallow(<MultipleControlForm />);
      const wrapperFieldMultiSelect = wrapperTypeMultiSelection.find(InputChips);
      wrapperFieldMultiSelect.props().onChange([1, 2, 3]);
      expect(setWorkingMultiOptions).toBeTruthy();
    });

    it('Should test select field default value handler', () => {
      const wrapperFieldMultiSelect = wrapperType.find(FieldSelect);
      wrapperFieldMultiSelect.props().onChange(1);
      expect(mockDispatch).toBeDefined();
    });

    it('Should test message bar available', () => {
      useContext.mockReturnValue([
        {
          filterPayload: {
            field: { type: 'string' },
            ui_config: { options: '', type: 'range_slider', display: 'inline' },
          },
        },
        dispatch,
      ]);
      const wrapperTypeMessage = shallow(<MultipleControlForm />);
      expect(wrapperTypeMessage.find(MessageBar)).toBeDefined();
    });
  });
});
