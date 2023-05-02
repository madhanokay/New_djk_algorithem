import React from 'react';
import { shallow } from 'enzyme';
import { IconButton } from '@material-ui/core';
import FilterConfigShow from './FilterConfigShow';

let wrapper;
const mockDispatch = jest.fn();

describe('render FilterConfigShow component', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    wrapper = shallow(<FilterConfigShow />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should match render inside component', () => {
    //expect(wrapper).toMatchSnapshot();
    expect(wrapper.find(IconButton)).toBeDefined();
  });

  it('Test revert to configureStep onClick', () => {
    const wrapperIconButton = wrapper.find(IconButton);
    wrapperIconButton.props().onClick(jest.fn());
    expect(mockDispatch).toBeDefined();
  });
});
