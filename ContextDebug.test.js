import React, { useEffect, useContext } from 'react';
import { shallow } from 'enzyme';
import ContextDebug from './ContextDebug';
// import { FilterModalContext } from '../context/FilterModalContext';

let wrapper;
describe('render ContextDebug component', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    wrapper = shallow(<ContextDebug />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should match snapshots', () => {
    expect(wrapper).toMatchSnapshot();
  });
});

let mockData = {
  dashboardData: null,
  dashboardElements: [{ label: 'label' }],
  editMode: false,
  exploreApiData: null,
  exploreApiDataLoading: true,
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
    ui_config: { options: [0, 1], type: 'CONTROL_SLIDER', display: 'inline' },
  },
  selectedFilter: { model: 'testModel', scope: 'testScope', name: 'testName' },
  workflowStep: 'test',
};
