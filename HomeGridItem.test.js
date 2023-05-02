const customData = {
  content_favorite_id: null,
  content_metadata_id: '609',
  index: 268,
  name: 'TestDashb',
  owner: 'Madhankumar Thangamani',
  caption: 'Testdesc',
  views: 0,
  lastUpdated: '2022-07-27T06:48:03.000+00:00',
  created: '2022-07-27T06:45:57.000+00:00',
  tags: ['test'],
  can: {
    download: true,
    see_aggregate_table_lookml: false,
    index: true,
    show: true,
    copy: true,
    run: true,
    create: true,
    move: true,
    update: true,
    destroy: true,
    recover: true,
    schedule: true,
    render: true,
  },
  tileCount: 4,
  isFavorite: false,
  createdBySelf: true,
  dashboardSnapshot: [
    {
      type: 'text',
      row: 0,
      column: 0,
      width: 10,
      height: 2,
    },
    {
      type: 'text',
      row: 2,
      column: 0,
      width: 10,
      height: 2,
    },
    {
      type: 'looker_bar',
      row: 4,
      column: 0,
      width: 10,
      height: 5,
    },
    {
      type: 'sankey',
      row: 9,
      column: 0,
      width: 10,
      height: 5,
    },
  ],
};

import React from 'react';
import { shallow } from 'enzyme';
import HomeGridItem from './HomeGridItem';
import { Card } from '@material-ui/core';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import MoreVertOutlinedIcon from '@material-ui/icons/MoreVertOutlined';
import DropDownMenu from './DropDownMenu';
import { useInViewport } from 'react-in-viewport';

jest.mock('react-in-viewport', () => ({
  ...jest.requireActual('react-in-viewport'),
  useInViewport: jest.fn(),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));

describe('render homegriditem component', () => {
  let wrapper;
  let _props = {
    data: customData,
    layout: 'grid',
    handleHeart: jest.fn(),
    handleDelete: jest.fn(),
    viewDashboard: jest.fn(),
    editDashboard: jest.fn(),
    duplicateDashboard: jest.fn(),
    index: 268,
    dashboardsSelectedForExports: {},
    handleDashboardSelectionForExports: jest.fn(),
  };
  const setAnchorEl = jest.fn();

  const useStateSpy = jest.spyOn(React, 'useState');
  useStateSpy.mockImplementation((anchorEl) => [anchorEl, setAnchorEl]);

  it('Should match snapshots grid layoput', () => {
    useInViewport.mockReturnValue({ inViewport: true });
    wrapper = shallow(<HomeGridItem {..._props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Should card item click', () => {
    const cardItem = wrapper.find(Card);
    cardItem.simulate('click');
    expect(_props.viewDashboard).toHaveBeenCalled();
  });

  it('Should StarBorderIcon icon click', () => {
    const starIcon = wrapper.find(StarBorderIcon);
    const clickInputEvent = { stopPropagation: () => {}, preventDefault: jest.fn };
    starIcon.simulate('click', clickInputEvent);
    expect(_props.handleHeart).toHaveBeenCalled();
  });
  it('Should onclick dropdown menu open', () => {
    const moreIcon = wrapper.find(MoreVertOutlinedIcon);
    const clickInputEvent = { stopPropagation: () => {}, preventDefault: jest.fn };
    moreIcon.simulate('click', clickInputEvent);
    useStateSpy.mockImplementationOnce(() => ['<svg></svg>', setAnchorEl]);
    expect(setAnchorEl).toBeTruthy();
  });
  it('Should onclick close', () => {
    const dropDown = wrapper.find(DropDownMenu);
    const clickInputEvent = { stopPropagation: () => {}, preventDefault: jest.fn };
    dropDown.props().handleClose(clickInputEvent);
    useStateSpy.mockImplementationOnce(() => ['null', setAnchorEl]);
    expect(setAnchorEl).toBeTruthy();
  });
});
