import React, { useEffect } from 'react';
import { shallow } from 'enzyme';
import RecursiveTree from './RecursiveTree';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useEffect: jest.fn(),
}));

jest.mock('@material-ui/styles', () => ({
  ...jest.requireActual('@material-ui/styles'),
  makeStyles: (cb) => () => ({
    root: {
      '& ul li div span': {
        cursor: 'pointer',
      },
    },
  }),
}));

let wrapper;
let headerProps = {
  exploreDataArray: [
    {
      id: '123',
      model_name: 'testModelName',
      fields: {
        dimensions: [
          {
            scope: 'testScope',
            name: 'testName',
            label_short: 'label_short',
            category: 'testCategory',
            type: 'testType',
            field_group_label: 'testName',
          },
          {
            scope: 'testScope1',
            name: 'testName1',
            label_short: 'label_short1',
            category: 'testCategory1',
            type: 'testType1',
          },
        ],
        measures: [
          {
            scope: 'testScope',
            name: 'testName',
            label_short: 'label_short',
            category: 'testCategory',
            type: 'testType',
            group: 'testGroup',
            field_group_label: 'testName',
          },
          {
            scope: 'testScope1',
            name: 'testName1',
            label_short: 'label_short1',
            category: 'testCategory1',
            type: 'testType1',
            group: 'testGroup1',
          },
        ],
      },
    },
  ],
  searchTerm: 'test',
  selectHandler: jest.fn(),
};
const dispatch = jest.fn();

describe('render RecursiveTree component', () => {
  const setBaseTreeData = jest.fn();
  const setWorkingTreeData = jest.fn();

  const useStateSpy = jest.spyOn(React, 'useState');
  useStateSpy.mockImplementation((baseTreeData) => [baseTreeData, setBaseTreeData]);
  useStateSpy.mockImplementation((workingTreeData) => [workingTreeData, setWorkingTreeData]);

  beforeEach(() => {
    jest.restoreAllMocks();
    useEffect.mockImplementation((fn) => fn());
    const baseTreeData = [1, 2, 3];
    const workTree = [
      {
        id: '321',
        items: [
          {
            id: 'testName-0',
            items: null,
            label: 'Label Short',
            category: 'testCategory',
            model: 'testModelName',
            name: 'testName',
            scope: 'testScope',
            type: 'testType',
          },
        ],
        label: '321',
        model: 'testModelName',
        name: 'testNaem',
        scope: 1,
        type: 'model-explore',
        uniqueScopes: ['testScope', 'testScope1'],
      },
    ];
    useStateSpy.mockImplementationOnce(() => [baseTreeData, setBaseTreeData]);
    useStateSpy.mockImplementationOnce(() => [workTree, setWorkingTreeData]);
    wrapper = shallow(<RecursiveTree {...headerProps} />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should match snapshots', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
