import React, { useEffect, useContext, useState } from 'react';
import { shallow } from 'enzyme';
import { useDispatch } from 'react-redux';
import { Box, CircularProgress } from '@material-ui/core';
import FilterSubmit from './FilterSubmit';
import { Alert } from '@material-ui/lab';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(),
  useContext: jest.fn(),
  useState: jest.fn(),
}));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

let wrapper;
const mockDispatch = jest.fn();

const headerProps = {
  closeHandler: jest.fn(),
};
const setLoading = jest.fn();
const setSuccess = jest.fn();
describe('render FilterSubmit component', () => {
  beforeEach(() => {
    const useStateSpy = jest.spyOn(React, 'useState');
    useContext.mockReturnValue([
      {
        editMode: false,
        dashboardElements: [{ id: '2374', label: 'label', dashboard_id: '898' }],
        filterPayload: {
          allow_multiple_values: false,
          dashboard_id: '898',
          default_value: [1, 2, 3],
          dimension: '',
          explore: '',
          field: { type: 'string' },
          id: '56',
          listens_to_filters: [],
          model: 'model',
          name: null,
          required: false,
          row: 0,
          title: null,
          type: 'field_filter',
          ui_config: { options: [0, 1], type: '', display: 'inline' },
        },
      },
      mockDispatch,
    ]);
    useEffect.mockImplementation((fn) => fn());
    useStateSpy.mockImplementation(() => [true, setLoading]);
    wrapper = shallow(<FilterSubmit {...headerProps} />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should be render inside component loading as true ', () => {
    // expect(wrapper).toMatchSnapshot();
    expect(wrapper.find(CircularProgress)).toBeDefined();
  });

  it('Should be render inside component loading as false and success as true ', () => {
    const useStateSpy = jest.spyOn(React, 'useState');
    useContext.mockReturnValue([
      {
        editMode: false,
        dashboardElements: [{ id: '123', label: 'label', dashboard_id: '898' }],
        filterPayload: {
          dashboard_id: '250',
        },
      },
      mockDispatch,
    ]);
    useStateSpy.mockImplementationOnce(() => [false, setLoading]);
    useEffect.mockImplementation((fn) => fn());
    const wrapperSuccess = shallow(<FilterSubmit {...headerProps} />);
    expect(wrapperSuccess.find(Alert)).toBeDefined();
  });

  it('Should be render inside component loading as false and success as false ', () => {
    const useStateSpy = jest.spyOn(React, 'useState');
    useContext.mockReturnValue([
      {
        editMode: false,
        dashboardElements: [{ id: '123', label: 'label', dashboard_id: '898' }],
        filterPayload: {
          dashboard_id: '250',
        },
      },
      mockDispatch,
    ]);
    useStateSpy.mockImplementationOnce(() => [false, setLoading]);
    useStateSpy.mockImplementationOnce(() => [false, setSuccess]);
    useEffect.mockImplementation((fn) => fn());
    const wrapperFail = shallow(<FilterSubmit {...headerProps} />);
    expect(wrapperFail.find(Alert)).toBeDefined();
  });
});
