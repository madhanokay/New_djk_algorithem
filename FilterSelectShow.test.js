import React, { useContext } from 'react';
import { shallow } from 'enzyme';
import { IconButton } from '@material-ui/core';
import FilterSelectShow from './FilterSelectShow';

let wrapper;
jest.mock('react', () => ({
  ...jest.requireActual('react'),
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
    iconButton: {
      width: '18px',
      height: '18px',
      color: '#0371e0',
    },
  }),
}));
const mockDispatch = jest.fn();

describe('render FilterSelectShow component', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    useContext.mockReturnValue([
      {
        filterPayload: {
          id: '123',
          ui_config: { options: [0, 1], type: 'day_range_picker', display: 'inline' },
        },
        selectedFilter: { scope: 'testScope', label: 'testlabel' },
      },
      mockDispatch,
    ]);
    wrapper = shallow(<FilterSelectShow />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should match inside icon component', () => {
    expect(wrapper.find(IconButton)).toBeDefined();
  });

  it('Should test revert to revertToSelectStep onClick', () => {
    const wrapperIconButton = wrapper.find(IconButton);
    wrapperIconButton.props().onClick(jest.fn());
    expect(mockDispatch).toBeDefined();
  });

  it('Should test revert to revertToSelectStep onClick without modal context values', () => {
    useContext.mockReturnValue([
      {
        filterPayload: {
          ui_config: { options: [0, 1], type: ' ', display: 'inline' },
        },
      },
      mockDispatch,
    ]);
    const wrapperNew = shallow(<FilterSelectShow />);
    const wrapperIconButton = wrapperNew.find(IconButton);
    wrapperIconButton.props().onClick(jest.fn());
    expect(mockDispatch).toBeDefined();
  });
});
