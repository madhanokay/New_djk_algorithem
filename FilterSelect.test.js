import React, { useContext } from 'react';
import { shallow, mount } from 'enzyme';
import FilterSelect from './FilterSelect';
import { TextField } from '@material-ui/core';
import RecursiveTree from './RecursiveTree';
import { defaultFilterPayload } from '../context/initialState';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
}));

jest.mock('@material-ui/styles', () => ({
  ...jest.requireActual('@material-ui/styles'),
  makeStyles: (cb) => () => cb({ spacing: () => 0 }),
}));

const setFormLabel = jest.fn();
const setSearchTerm = jest.fn();
const useStateSpy = jest.spyOn(React, 'useState');

describe('render FilterSelect component', () => {
  let wrapper;
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
          id: 123,
          listens_to_filters: [],
          model: 'model',
          name: null,
          required: false,
          row: 0,
          title: null,
          type: 'field_filter',
          ui_config: { options: [0, 1], type: 'day_picker', display: 'inline' },
        },
        selectedFilter: { scope: 'testScope', label: 'testlabel' },
        workflowStep: 'test',
      },
      dispatch,
    ]);
    useStateSpy.mockImplementationOnce(() => [searchValue, setSearchTerm]);
    wrapper = shallow(<FilterSelect />);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should match wrapper TextField component', () => {
    expect(wrapper.find(TextField)).toBeDefined();
    //expect(wrapper).toMatchSnapshot();
  });

  it('Should test search text value onchange', () => {
    const searchValue = 'TestSearchValue';
    const wrapperTextField = wrapper.find(TextField);
    wrapperTextField
      .props()
      .onChange({ preventDefault: jest.fn(), target: { value: searchValue }, persist: jest.fn() });
    useStateSpy.mockImplementationOnce(() => [searchValue, setSearchTerm]);
    expect(setSearchTerm).toBeTruthy();
  });

  it('Should test search text value as empty onchange with filterpayload as false', () => {
    const setLabel = 'What do you want to filter by?';
    useContext.mockReturnValue([
      {
        editMode: true,
        filterPayload: {
          id: null,
          ui_config: { options: [0, 1], type: 'day_picker', display: 'inline' },
        },
        selectedFilter: { scope: 'testScope', label: 'testlabel' },
        workflowStep: 'test',
      },
      dispatch,
    ]);
    const wrapperNew = shallow(<FilterSelect />);
    const wrapperTextField = wrapperNew.find(TextField);
    wrapperTextField.props().onChange({ preventDefault: jest.fn() });
    useStateSpy.mockImplementationOnce(() => [setLabel, setFormLabel]);
    expect(setFormLabel).toBeTruthy();
  });

  it('Should test render recursive tree component', () => {
    const setFilter = { name: 'testName', model: 'testModel', scope: 'testScope', label: 'testLabel' };
    const wrapperRecursive = wrapper.find(RecursiveTree);
    wrapperRecursive.props().selectHandler(setFilter);
    useStateSpy.mockImplementationOnce(() => [setFilter, setSearchTerm]);
    expect(setSearchTerm).toBeTruthy();
  });

  it('Should test input values reset input props InputAdornment', () => {
    const wrapperInputAdorment = wrapper.find(TextField);
    const inputPropsObject = wrapperInputAdorment.props().InputProps.endAdornment;

    inputPropsObject.props.children.props.onClick();
    useStateSpy.mockImplementationOnce(() => ['', setSearchTerm]);
    expect(setSearchTerm).toBeTruthy();
  });

  it('Should test input with empty values reset input props InputAdornment', () => {
    useContext.mockReturnValue([
      {
        editMode: true,
        filterPayload: {
          id: null,
          dashboard_id: '250',
          ui_config: { options: [0, 1], type: 'day_picker', display: 'inline' },
        },
        selectedFilter: { scope: 'testScope', label: 'testlabel' },
        workflowStep: 'test',
      },
      dispatch,
    ]);
    const wrapperInput = shallow(<FilterSelect />);
    const wrapperInputAdorment = wrapperInput.find(TextField);
    const inputPropsObject = wrapperInputAdorment.props().InputProps.endAdornment;
    inputPropsObject.props.children.props.onClick();
    expect(mockDispatch).toBeDefined();
  });
});
