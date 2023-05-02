import React, { useEffect, useContext } from 'react';
import { shallow } from 'enzyme';
import { FieldSelect, FieldSelectMulti, FieldText, InputChips, Label, MessageBar, Spinner } from '@looker/components';
import { Box } from '@material-ui/core';
import FilterTiles from './FilterTiles';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useEffect: jest.fn(),
  useContext: jest.fn(),
}));

jest.mock('@material-ui/styles', () => ({
  ...jest.requireActual('@material-ui/styles'),
  makeStyles: (cb) => () => ({
    root: {
      color: '#0c0c12',
      width: '100%',
      padding: '8px',
      '& > * + *': {
        marginTop: '8px',
      },
    },
    dashboardElementIcon: {
      width: '18px',
      height: '18px',
      color: '#0371e0',
    },
    elementName: {
      fontSize: '14px',
      marginLeft: '8px',
    },
    scrollContainer: {
      maxHeight: '325px',
      overflowY: 'auto',
    },
  }),
}));

let wrapper;
const dispatch = jest.fn();
let mockData = {
  dashboardData: null,
  dashboardElements: [],
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

describe('render FilterTiles component', () => {
  const setAllDimensionDataLoading = jest.fn();
  const setAllDimensionData = jest.fn();
  const setDashboardElementDataLoading = jest.fn();
  const setPrefilled = jest.fn();
  const setSortedDashboardElements = jest.fn();
  const setTileAssignment = jest.fn();
  const useStateSpy = jest.spyOn(React, 'useState');
  useStateSpy.mockImplementation((allDimensionDataLoading) => [allDimensionDataLoading, setAllDimensionDataLoading]);
  useStateSpy.mockImplementation((allDimensionData) => [allDimensionData, setAllDimensionData]);
  useStateSpy.mockImplementation((dashboardElementDataLoading) => [
    dashboardElementDataLoading,
    setDashboardElementDataLoading,
  ]);
  useStateSpy.mockImplementation((prefilled) => [prefilled, setPrefilled]);
  useStateSpy.mockImplementation((sortedDashboardElements) => [sortedDashboardElements, setSortedDashboardElements]);
  useStateSpy.mockImplementation((tileAssignment) => [tileAssignment, setTileAssignment]);

  beforeEach(() => {
    jest.restoreAllMocks();
    useContext.mockReturnValue([
      {
        editMode: true,
        dashboardElements: [
          {
            body_text: 'Test body',
            body_text_as_html: '<p>Test body</p>\n',
            dashboard_id: '898',
            edit_uri: null,
            id: '2374',
            look: null,
            look_id: null,
            lookml_link_id: '',
            merge_result_id: null,
            note_display: null,
            note_state: null,
            note_text: null,
            note_text_as_html: null,
            query: null,
            query_id: null,
            refresh_interval: null,
            refresh_interval_to_i: null,
            result_maker_id: null,
            subtitle_text: 'Test subtile',
            title: null,
            title_hidden: false,
            title_text: 'Test title',
            type: 'text',
            alert_count: 0,
            rich_content_json: null,
            title_text_as_html: 'Test title',
            subtitle_text_as_html: 'Test subtile',
            extension_id: null,
            result_maker: null,
            can: {
              create: true,
              update: true,
              destroy: true,
              index: true,
              show: true,
              explore: false,
              run: false,
            },
          },
        ],
        filterPayload: {
          allow_multiple_values: false,
          dashboard_id: '898',
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
          ui_config: { options: [0, 1], type: 'slider', display: 'inline' },
        },
        selectedFilter: { model: 'testModel', scope: 'testScope', name: 'testName' },
        workflowStep: 'test',
      },
      dispatch,
    ]);
    useEffect.mockImplementation((fn) => fn());
    wrapper = shallow(<FilterTiles />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should match snapshots', () => {
    expect(
      wrapper
        .find(Box)
        .at(1)
        .text(),
    ).toEqual('TILES TO UPDATE');
    //expect(wrapper).toMatchSnapshot();
  });
});
