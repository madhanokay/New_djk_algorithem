import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import _ from 'lodash';
import moment from 'moment';

import { AppBar, Box, Toolbar, Divider, makeStyles, Container, Tabs, Tab, Button, Paper } from '@material-ui/core';
import clsx from 'clsx';
import { Info } from 'react-feather';
import HomeHeader from '../../components/home-page/HomeHeader';
import HomeContent from '../../components/home-page/HomeContent';
import { auth } from 'platformCore/auth';
import DashboardAPI from '../../api/Dashboards/index';
import ContentAPI from '../../api/Content/index';
import BoardAPI from '../../api/Boards/index';
import ExploreAPI from '../../api/Explore';
import LoadingPage from '../../components/loading-screen/LoadingPage';
import MiddlewareAPI from 'api/Middleware';
import JSZip from 'jszip';
import { getLookerUserId } from 'api/utils';
import { useHistory } from 'react-router-dom';
import { getBaseUrl, getHomePageQueryObj, updateHomePageUrl, downloadDashboardConfigFile, encodeJSON } from 'utils';
import { getLookerTenantBoardId, getLookerTenantFolderId } from '../../api/utils';
import {
  updateDashboardId,
  toggleDashboardEditMode,
  updateDashboardOwners,
  updateDashboardFilterTags,
  updateDashboardFilterCreatedBy,
  updateDashboardFilterDateCreated,
  updateDashboardFilterDateEdited,
  updateUserPersonalFolderId,
  updateDashboardsList,
  updateCustomDashboardsLimitReached,
} from 'store/actions';
import { DASHBOARD_STORE, DASHBOARD_REDUCER } from 'store/reducers/constants';
import { getDefaultVisualizationLayout } from 'utils/VisualizationHelpers';
import LoaderButton from 'components/loader-button/LoaderButton';

import { INDICATOR_TYPES } from 'exa-core-ui/build/core';
import { processIndicatorActions } from 'exa-core-ui/build/core/';

import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import FolderAPI from 'api/Folder';
import { ALERT_SEVERITIES, FEATURE_FLAGS, MESSAGES, TENANT_CUSTOM_DASHBOARDS_LIMIT } from '../../constants';
import { addAlert } from 'store/actions/commonActions';
import { hasFeatureFlag } from 'platformCore/FeatureFlag';

const useStyles = makeStyles((theme) => ({
  homeContainer: {
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gridGap: theme.spacing(3),
    height: 'calc(100vh - 3.6rem)',
    maxWidth: 'calc(100vw - 9.3rem)',
    // width: '100%',
  },
  contentContainer: {
    marginTop: '10px',
    marginBottom: '10px',
    height: '80%',
  },
  contentContainerSub: {
    height: '100%',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '100%',
    marginLeft: '10px',
    marginRight: '10px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 330px))',
    gridTemplateRows: '1fr',
    gridGap: theme.spacing(3),
    justifyContent: 'center',
  },
  customTabs: {
    width: '100%',
    '& button': {
      marginRight: 2,
      borderBottom: '2px solid ' + theme.palette.divider,
      minWidth: 50,
      opacity: 1,
    },
    '& button>*': {
      opacity: 0.7,
    },
    '& button[class*="Mui-selected"]>*': {
      opacity: 1,
    },
    '& div[class*="MuiTabs-flexContainer"]:after': {
      content: '""',
      borderBottom: '2px solid ' + theme.palette.divider,
      width: '100%',
    },
  },

  iconColor: {
    color: theme.palette.primary.light,
  },
  iconMargin: {
    marginRight: '10px',
  },
  iconSize: {
    height: '18px',
    width: '18px',
  },
  downloadBtn: {
    backgroundColor: theme.palette.primary.main,
    height: '36px',
    lineHeight: '16px',
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    '&:disabled': {
      color: theme.palette.grey[100],
    },
  },

  appBar: {
    top: 'auto',
    bottom: 0,
  },
  rightToolbar: {
    marginLeft: 'auto',
    marginRight: -12,
    display: 'flex',
    paddingRight: '10px',
    flexDirection: 'row-reverse',
    gap: '0px 1rem',
  },
  menuButton: {
    marginRight: -10,
    marginLeft: 30,
  },
}));

const HomePage = (props) => {
  const { setProcessIndicator } = processIndicatorActions;

  const { search } = useLocation();
  const searchObj = getHomePageQueryObj(search);
  const [layout, setLayout] = useState('grid');
  const [value, setValue] = useState(0);

  const [searchValue, setSearchValue] = useState('');
  const classes = useStyles();
  const dispatch = useDispatch();
  const baseUrl = getBaseUrl();
  const history = useHistory();
  const personalFolderId = useSelector((state) => state[DASHBOARD_STORE][DASHBOARD_REDUCER].personalFolderId);
  const dashboardsFromStore = useSelector((state) => state[DASHBOARD_STORE][DASHBOARD_REDUCER].dashboards);
  const customDashboardsLimitReached = useSelector(
    (state) => state[DASHBOARD_STORE][DASHBOARD_REDUCER].customDashboardsLimitReached,
  );
  const [dashboards, setDashboards] = useState(dashboardsFromStore);
  const [tagList, setTagList] = useState([]);
  const [dashboardsBackup, setDashboardsBackup] = useState(dashboardsFromStore);
  const [dashboardsPayload, setDashboardsPayload] = useState(dashboardsFromStore);
  const [isLoading, setIsLoading] = useState(!dashboardsFromStore.length);

  const [dashboardsSelectedForExports, setDashboardsSelectedForExports] = useState({});
  const [processing, setProcessing] = useState(false);

  const getPersonalFolderId = async () => {
    if (personalFolderId) {
      return personalFolderId;
    } else {
      const userInfo = await DashboardAPI.getCurrentUser('personal_folder_id');
      const folderId = userInfo.personal_folder_id;
      dispatch(updateUserPersonalFolderId(folderId));
      return folderId;
    }
  };

  const fetchTenantDashboardsCount = useCallback(async () => {
    if (hasFeatureFlag(FEATURE_FLAGS.ENABLE_CUSTOM_DASHBOARD_ENFORCEMENTS)) {
      const folderId = getLookerTenantFolderId();
      const dashboards = await FolderAPI.getAllDashboardsFromFolder({
        folderId,
      });
      console.log("dashboards",dashboards);
      const customDashboardsCount = dashboards?.length || 0;
      dispatch(updateCustomDashboardsLimitReached(customDashboardsCount >= TENANT_CUSTOM_DASHBOARDS_LIMIT));
      return customDashboardsCount;
    } else {
      dispatch(updateCustomDashboardsLimitReached(false));
      // Lowest possible value to enable all features when flag is off
      return 0;
    }
  }, []);

  const fetchTags = async () => {
    const tenantBoardId = getLookerTenantBoardId();
    const tenantBoardSections = await Promise.resolve(BoardAPI.getBoardWithId(tenantBoardId));
    return tenantBoardSections.board_sections;
  };

  const updateDashboards = async (data) => {
    // setValue(0);
    const id = getLookerUserId();

    const userIds = data
      .reduce((acc, int) => {
        if (acc.indexOf(int.user_id) === -1) {
          acc.push(int.user_id);
        }

        return acc;
      }, [])
      .join(',');

    const tenantBoardId = getLookerTenantBoardId();

    let contents;
    let response;
    let tenantBoardSections;

    const promises = [];
    promises.push(ContentAPI.getSearchFavoriteContents(id));
    promises.push(MiddlewareAPI.getUsersInfoByIds(userIds));

    if (!tenantBoardId) {
      throw new Error('Tenant board ID is not defined');
    } else {
      promises.push(BoardAPI.getBoardWithId(tenantBoardId));
    }

    await Promise.allSettled(promises)
      .then((promisesData) => {
        contents = promisesData[0].value;
        response = promisesData[1].value;
        tenantBoardSections = promisesData[2].value;
      })
      .catch((err) => {
        console.log(err);
      });

    // get all sections for tag assignment
    let dashboardIdToBoardTitleMap = new Map();
    for (let i = 0; i < tenantBoardSections.board_sections.length; i++) {
      const boardSection = tenantBoardSections.board_sections[i];
      for (let j = 0; j < boardSection.board_items.length; j++) {
        const dashboardId = boardSection.board_items[j].dashboard_id;
        if (dashboardIdToBoardTitleMap.has(dashboardId)) {
          dashboardIdToBoardTitleMap.get(dashboardId).push(boardSection.title);
        } else {
          dashboardIdToBoardTitleMap.set(dashboardId, [boardSection.title]);
        }
      }
    }

    let usersInfo = {};
    response.forEach((user) => {
      usersInfo[user.id] = user;
    });

    dispatch(
      updateDashboardOwners([
        { name: 'Exabeam', id: 'exabeam' },
        { name: 'All Custom', id: 'all-custom' },
        ...response
          .filter(({ email }) => !email.includes('@exabeam.com'))
          .map((r) => ({ name: r.displayName, id: r.id })),
      ]),
    );

    const updateData = data.map((dashboard) => ({
      ...dashboard,
      email: usersInfo[dashboard.user_id] ? usersInfo[dashboard.user_id].email : '',
    }));

    let newData = [];
    const personalFolderId = await getPersonalFolderId();
    for (let a = 0; a < updateData.length; a++) {
      const content = contents.find((int) => int.content_metadata_id === updateData[a].content_metadata_id);
      let obj = {
        content_favorite_id: content ? content.id : null,
        content_metadata_id: updateData[a].content_metadata_id,
        index: parseInt(updateData[a].id),
        name: updateData[a].title,
        owner:
          updateData[a].email && _.endsWith(updateData[a].email, '@exabeam.com') ? 'Exabeam' : updateData[a].user_name,
        caption: updateData[a].description,
        views: updateData[a].view_count,
        lastUpdated: updateData[a].updated_at,
        created: updateData[a].created_at,
        tags:
          dashboardIdToBoardTitleMap.get(updateData[a].id) !== undefined
            ? dashboardIdToBoardTitleMap.get(updateData[a].id)
            : [],
        can: updateData[a].can,
        modelUsed: updateData[a]?.dashboard_elements.map((element) => element?.query?.model),
        tileCount: updateData[a]?.dashboard_elements ? updateData[a].dashboard_elements.length : 0,
        isFavorite: content ? true : false,
        createdBySelf: updateData[a].user_id === id,
        dashboardSnapshot: updateData[a].dashboardSnapshot,
        folderId: updateData[a].folder_id,
        isDraft: updateData[a].folder_id === personalFolderId,
      };
      newData.push(obj);
    }
    setDashboards(newData);
    dispatch(updateDashboardsList(newData));
    setDashboardsBackup(newData);
    // filter dashboard based on seaarch query param
    if (searchObj) {
      if (searchObj.tags) {
        dispatch(updateDashboardFilterTags(searchObj.tags));
      }
      if (searchObj.createdBy) {
        dispatch(updateDashboardFilterCreatedBy(searchObj.createdBy));
      }
      if (searchObj.dateCreated) {
        dispatch(updateDashboardFilterDateCreated(searchObj.dateCreated));
      }
      if (searchObj.dateEdited) {
        dispatch(updateDashboardFilterDateEdited(searchObj.dateEdited));
      }
    }
  };

  const getDashboardsFromLooker = async () => {
    let fullDashboardsPayload = [];

    try {
      const initialDashboardsPromise = [];
      initialDashboardsPromise.push(DashboardAPI.getAllDashboards());
      initialDashboardsPromise.push(DashboardAPI.getSearchDashboards(10, 0));

      await Promise.all(initialDashboardsPromise).then(async (data) => {
        const fullDashboards = data[0];
        const first10Dashboards = data[1];
        fullDashboardsPayload = first10Dashboards;

        if (fullDashboards.length > first10Dashboards.length) {
          const fullDashboardsPromise = [];
          for (let i = 2; i < fullDashboards.length / 10 + 1; i++) {
            fullDashboardsPromise.push(DashboardAPI.getSearchDashboards(10, (i - 1) * 10));
          }

          await Promise.all(fullDashboardsPromise).then((data) => {
            data.forEach((dashboardsSet) => {
              dashboardsSet.forEach((dashboard) => fullDashboardsPayload.push(dashboard));
            });
          });
        }
      });
    } catch (err) {
      console.error(err);
    }
    return fullDashboardsPayload;
  };

  const getUsername = () => {
    const profile = auth.getUserProfile();
    return profile.user_name;
  };

  const handleChange = (event, newValue) => {
    if (!isLoading && dashboards && dashboardsBackup && dashboardsPayload) {
      setValue(newValue);
    }
  };

  const onSearchChange = (d) => {
    const searchTerm = d.target.value.toLowerCase();
    setSearchValue(searchTerm);
  };

  const handleHeart = async (data) => {
    try {
      if (!data.isFavorite) {
        await Promise.resolve(
          ContentAPI.postCreateFavoriteContent({
            content_metadata_id: data.content_metadata_id,
          }),
        );
      } else {
        await Promise.resolve(
          ContentAPI.deleteFavoriteContent({
            content_favorite_id: data.content_favorite_id,
          }),
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      updateDashboards(dashboardsPayload);
    }
  };

  const filterBy = (users, tags, created, edited) => {
    // update homepage url everytime user add filter
    updateHomePageUrl(users, tags, created, edited);
    const tenantFolderId = getLookerTenantFolderId();
    let newDashboards = [];
    if (users?.length > 0) {
      const allCustomSelected = users.includes('All Custom');
      for (let a = 0; a < dashboardsBackup.length; a++) {
        if (
          users.includes(dashboardsBackup[a].owner) ||
          (allCustomSelected && dashboardsBackup[a].folderId === tenantFolderId)
        ) {
          newDashboards.push(dashboardsBackup[a]);
        }
      }
    }

    let newDashboards2;
    if (tags?.length > 0) {
      newDashboards2 = [];
      if (newDashboards.length > 0) {
        for (let a = 0; a < newDashboards.length; a++) {
          for (let b = 0; b < newDashboards[a].tags.length; b++) {
            if (tags.includes(newDashboards[a].tags[b])) {
              newDashboards2.push(newDashboards[a]);
              break;
            }
          }
        }
      } else {
        for (let a = 0; a < dashboardsBackup.length; a++) {
          for (let b = 0; b < dashboardsBackup[a].tags.length; b++) {
            if (tags.includes(dashboardsBackup[a].tags[b])) {
              newDashboards2.push(dashboardsBackup[a]);
              break;
            }
          }
        }
      }
    }

    let newDashboards3;
    if (created) {
      newDashboards3 = [];
      let currentFilteredDashboards;
      if (newDashboards2?.length > 0) {
        currentFilteredDashboards = newDashboards2;
      } else if (newDashboards?.length > 0) {
        currentFilteredDashboards = newDashboards;
      } else {
        currentFilteredDashboards = dashboardsBackup;
      }

      for (let a = 0; a < currentFilteredDashboards.length; a++) {
        if (moment(currentFilteredDashboards[a].created).format('YYYY-MM-DD') === created) {
          newDashboards3.push(currentFilteredDashboards[a]);
        }
      }
    }

    let newDashboards4;
    if (edited) {
      newDashboards4 = [];
      let currentFilteredDashboards;
      if (newDashboards3?.length > 0) {
        currentFilteredDashboards = newDashboards3;
      } else if (newDashboards2?.length > 0) {
        currentFilteredDashboards = newDashboards2;
      } else if (newDashboards?.length > 0) {
        currentFilteredDashboards = newDashboards;
      } else {
        currentFilteredDashboards = dashboardsBackup;
      }

      for (let a = 0; a < currentFilteredDashboards.length; a++) {
        if (moment(currentFilteredDashboards[a].lastUpdated).format('YYYY-MM-DD') === edited) {
          newDashboards4.push(currentFilteredDashboards[a]);
        }
      }
    }

    if (newDashboards4?.length > 0 || edited) {
      setDashboards(newDashboards4);
    } else if (newDashboards3?.length > 0 || created) {
      setDashboards(newDashboards3);
    } else if (newDashboards2?.length > 0 || tags?.length > 0) {
      setDashboards(newDashboards2);
    } else if (newDashboards?.length > 0 || users?.length > 0) {
      setDashboards(newDashboards);
    } else {
      setDashboards(dashboardsBackup);
    }
  };

  const createNewDashboard = async (title, description, tags, handleClose) => {
    // setValue(0);

    //Check for existing custom dashboards
    const customDashboardsCount = await fetchTenantDashboardsCount();

    if (customDashboardsCount >= TENANT_CUSTOM_DASHBOARDS_LIMIT) {
      return;
    }

    let userFolderId;
    try {
      userFolderId = await getPersonalFolderId();
    } catch (err) {
      console.error(err);
      return;
    }

    const dupeNameFilter = dashboardsBackup.filter((int) => int.name?.toLowerCase() === title?.toLowerCase());

    if (dupeNameFilter.length > 0) {
      return true;
    } else {
      let payload = {
        title: title,
        description: description,
        folder_id: userFolderId,
        user_name: getUsername(),
      };
      let newDashboard;

      try {
        newDashboard = await Promise.resolve(
          DashboardAPI.createDashboard({
            payload,
          }),
        );
      } catch (err) {
        console.error(err);
      }

      if (tags) {
        let sectionToCreate = []; // section to create before attaching the dashboard
        let sectionToUpdate = []; // store dashboard reference to existing section
        const tenantBoardId = getLookerTenantBoardId();
        // check if there exist a section named the same as each tag
        if (tags.length !== 0) {
          try {
            const boards = await Promise.resolve(BoardAPI.getBoardWithId(tenantBoardId));
            if (boards) {
              // construct map to check which tag is missing
              let map = new Map();
              for (let i = 0; i < boards.board_sections.length; i++) {
                const sectionInfo = boards.board_sections[i];
                map.set(sectionInfo.title, sectionInfo.id);
              }
              // loop through the tag we have and add tag that is missing by matching the title and tagname
              for (let j = 0; j < tags.length; j++) {
                // new section that needs to be created
                if (!map.has(tags[j])) {
                  sectionToCreate.push(
                    BoardAPI.createBoardSection({
                      title: tags[j],
                      board_id: tenantBoardId,
                    }),
                  );
                } else {
                  // section to be updated
                  sectionToUpdate.push(
                    BoardAPI.createBoardItem({
                      dashboard_id: newDashboard.id, // TODO: update this do created dashboard
                      board_section_id: map.get(tags[j]),
                    }),
                  );
                }
              }
            }
          } catch (err) {
            throw new Error(err);
          }
        }
        // create those section
        try {
          Promise.all(sectionToCreate).then((results) => {
            results.forEach((res) => {
              sectionToUpdate.push(
                BoardAPI.createBoardItem({
                  dashboard_id: newDashboard.id, // TODO: update this do created dashboard
                  board_section_id: res.id,
                }),
              );
            });
          });
        } catch (err) {
          throw Error(err);
        }
        // update those section
        if (sectionToUpdate.length) {
          await Promise.all(sectionToUpdate);
        }
      }

      const newDashboardsList = [...dashboardsPayload, newDashboard].sort((a, b) =>
        a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1,
      );
      setDashboardsPayload(newDashboardsList);
      updateDashboards(newDashboardsList);

      handleClose();
      editDashboard(newDashboard.id);
    }
  };

  const deleteDashboard = async (data) => {
    const dashboardId = data.index;
    try {
      await Promise.resolve(
        DashboardAPI.deleteDashboard({
          urlParams: {
            dashboardId: dashboardId,
          },
        }),
      );
      fetchTenantDashboardsCount();
    } catch (err) {
      console.error(err);
    } finally {
      const newDashboardsPayload = _.cloneDeep(dashboardsPayload);
      const newDashboardsPayloadIndex = newDashboardsPayload.indexOf(
        newDashboardsPayload.find((int) => Number(int.id) === dashboardId),
      );

      // delete unused tag
      const dashboardToDelete = dashboards.find((dashboard) => Number(dashboard.index) === dashboardId);
      if (dashboardToDelete.tags) {
        let tagToDelete = []; // chain all tag to be deleted
        let newTagList = [...tagList]; // to update tagList state
        for (let i = 0; i < dashboardToDelete.tags.length; i++) {
          const tagInfo = newTagList.find((tag) => tag.title === dashboardToDelete.tags[i]);

          // remove the dashboard id that is associate with the tag/section
          tagInfo.board_items = tagInfo.board_items.filter((board) => Number(board.dashboard_id) !== dashboardId);
          if (tagInfo && tagInfo.board_items.length === 0) {
            newTagList = newTagList.filter((tag) => tag.id !== tagInfo.id);
            tagToDelete.push(BoardAPI.deleteBoardSectionById({ boardSectionId: tagInfo.id }));
          }
        }
        // delete all section that has no dashboard attach to it.
        if (tagToDelete.length) {
          await Promise.all(tagToDelete);
        }

        // reset taglist to make sure we remove tag that is not being used
        setTagList(newTagList);
      }
      const newDashboardsPayloadFiltered = newDashboardsPayload.filter(
        (int, index) => index !== newDashboardsPayloadIndex,
      );
      setDashboardsPayload(newDashboardsPayloadFiltered);
      updateDashboards(newDashboardsPayloadFiltered);
    }
  };

  const duplicateDashboard = async (dashboardId) => {
    let copyDashboard, folderId;

    //Check for existing custom dashboards
    const customDashboardsCount = await fetchTenantDashboardsCount();

    if (customDashboardsCount >= TENANT_CUSTOM_DASHBOARDS_LIMIT) {
      dispatch(
        addAlert({
          severity: ALERT_SEVERITIES.ERROR,
          message: MESSAGES.CUSTOM_DASHBOARDS_LIMIT_CREATION,
        }),
      );
      return;
    }

    try {
      folderId = await getPersonalFolderId();

      copyDashboard = await Promise.resolve(
        DashboardAPI.copyDashboard({
          urlParams: {
            dashboardId,
            folderId,
          },
        }),
      );

      const dashboardLayouts = copyDashboard.dashboard_layouts;

      if (dashboardLayouts.length) {
        const dashboardLayout = dashboardLayouts[0].dashboard_layout_components;
        const snapshot = constructDashboardSnapshot(dashboardLayout);
        copyDashboard = { ...copyDashboard, dashboardSnapshot: snapshot };
      }

      let newDashboardsList = [...dashboardsPayload, copyDashboard].sort((a, b) =>
        a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1,
      );
      setDashboardsPayload(newDashboardsList);
      updateDashboards(newDashboardsList);
      editDashboard(copyDashboard.id);
    } catch (err) {
      console.error(err);
    }
  };

  const exportDashboard = async (dashboardId) => {
    onExportProcess(true, [dashboardId]);
  };

  const editDashboard = (dashboardId) => {
    dispatch(updateDashboardId(dashboardId));
    dispatch(toggleDashboardEditMode(true));
    history.push(`${baseUrl}/dashboards/${dashboardId}`);
  };

  const viewDashboard = (dashboardId) => {
    dispatch(updateDashboardId(dashboardId));
    history.push(`${baseUrl}/dashboards/${dashboardId}`);
  };

  const constructDashboardSnapshot = (layout) => {
    return layout
      .sort((a, b) => {
        if (a.row === b.row) {
          return a.column - b.column;
        }
        return a.row - b.row;
      })
      .map((component) => {
        const { row, column, width, height, vis_type: chartType } = component;
        const defaultLayout = getDefaultVisualizationLayout(chartType);
        return {
          type: chartType,
          row: row || 0,
          column: column || 0,
          width: width || defaultLayout.width,
          height: height || defaultLayout.height,
        };
      });
  };

  const updateDashboardWithSnapshot = (dashboards) => {
    return dashboards.map((dashboard) => {
      const dashboardLayouts = dashboard.dashboard_layouts;

      if (dashboardLayouts.length) {
        const dashboardLayout = dashboardLayouts[0].dashboard_layout_components;

        return {
          ...dashboard,
          dashboardSnapshot: constructDashboardSnapshot(dashboardLayout),
        };
      }

      return dashboard;
    });
  };

  const createNewDashboardFromConfig = async (config) => {
    const { title, description, dashboardElements, dashboardFilters } = config;
    let userFolderId;
    try {
      userFolderId = await getPersonalFolderId();
    } catch (err) {
      console.error(err);
      return { success: false };
    }

    let payload = {
      title: title,
      description: description,
      folder_id: userFolderId,
      user_name: getUsername(),
    };
    let newDashboard;

    // Create a new Dashboard
    try {
      newDashboard = await Promise.resolve(
        DashboardAPI.createDashboard({
          payload,
        }),
      );
    } catch (err) {
      console.error(err);
      return { success: false };
    }

    const dashboardId = newDashboard.id;

    try {
      // Create Dashboard Filters
      const dashboardFiltersPromise = dashboardFilters?.map(async (filter) => {
        return new Promise(async (res, rej) => {
          await DashboardAPI.createDashboardFilter({ ...filter, dashboard_id: dashboardId });
          res();
        });
      });
      // Create Dashboard elements
      const dashboardElementsPromise = dashboardElements?.map(
        async ({
          view,
          model,
          dynamic_fields,
          limit,
          fields,
          filters,
          pivots,
          vis_config,
          type,
          title,
          title_text,
          title_hidden,
          row,
          height,
          width,
          column,
          result_maker,
          body_text,
          subtitle_text,
        }) => {
          const dashboardElementPromise = new Promise(async (res, rej) => {
            // Create query
            const createQueryData =
              type === 'text'
                ? {}
                : await ExploreAPI.createQuery({
                    payload: {
                      model,
                      view,
                      can: {
                        use_custom_fields: true,
                      },
                      dynamic_fields,
                      limit,
                      fields,
                      filters,
                      pivots,
                      vis_config,
                    },
                  });

            // Create Dashboard Element
            const addDashboardElement =
              type === 'text' ? DashboardAPI.addDashboardTextElement : DashboardAPI.addDashboardElement;
            const tileData =
              type === 'text'
                ? {
                    title: title_text,
                    titleHidden: title_hidden,
                    subtitle: subtitle_text,
                    body: body_text,
                    dashboardId,
                    type,
                  }
                : {
                    title,
                    titleHidden: title_hidden,
                    dashboardElementId: Date.now(),
                    queryId: createQueryData.id,
                    model: createQueryData.model,
                    explore: createQueryData.view,
                    chartType: vis_config.type,
                    queryLimit: limit,
                    fields,
                    result_maker,
                    dashboardId,
                    refreshSettings: {
                      exists: false,
                    },
                  };
            const dashboardElementData = await addDashboardElement(tileData);

            // Update Dashboard ElementLayout
            await DashboardAPI.updateDashboardElementLayout(dashboardElementData.id, {
              row,
              column,
              height,
              width,
            });

            res();
          });

          return dashboardElementPromise;
        },
      );

      await Promise.allSettled(dashboardElementsPromise);
      await Promise.allSettled(dashboardFiltersPromise);

      return { dashboardId, success: true };
    } catch (err) {
      await DashboardAPI.deleteDashboard({
        urlParams: {
          dashboardId,
        },
      });
      return { success: false };
    }
  };

  const onImportComplete = async (newDashboardsIds) => {
    const newDashboards = await DashboardAPI.getSearchExportDashboard({
      queryParams: {
        ids: newDashboardsIds.join(','),
      },
    });
    const newDashboardsList = [...dashboardsPayload, ...newDashboards].sort((a, b) =>
      a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1,
    );
    setDashboardsPayload(newDashboardsList);
    updateDashboards(newDashboardsList);
  };

  useEffect(() => {
    const getDashboards = async () => {
      try {
        let sections = await fetchTags();
        let fullDashboards = await getDashboardsFromLooker();
        fullDashboards.sort((a, b) => (a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1));
        fullDashboards = updateDashboardWithSnapshot(fullDashboards);
        setDashboardsPayload(fullDashboards);
        setTagList(sections);
        updateDashboards(fullDashboards);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    getDashboards();
  }, []);

  /*Start Export multi select */
  const handleCheck = (dashboardId, checked) => {
    const updatedCheckedState = {
      ...dashboardsSelectedForExports,
      [dashboardId]: checked,
    };
    console.log("updatedCheckedState",updatedCheckedState)
    setDashboardsSelectedForExports(updatedCheckedState);
  };

  const closeHandler = () => {
    setDashboardsSelectedForExports({});
  };

  function invokeProcessIndicator(message = 'Success', indicatorType = INDICATOR_TYPES.success, dismissAfter = 3000) {
    dispatch(
      setProcessIndicator({
        indicatorType,
        dismissAfter,
        message,
        closingButton: false,
      }),
    );
  }

  const onExportProcess = async (useIdsFromParams = false, ids = []) => {
    setProcessing(true);
    const dashboardIds = Object.keys(dashboardsSelectedForExports).filter((id) => dashboardsSelectedForExports[id]);
    const data = await DashboardAPI.getSearchExportDashboard({
      queryParams: {
        ids: useIdsFromParams ? ids.join(',') : dashboardIds.join(','),
      },
    });
    let allFiles = []; //Concat all jsonFiles

    data.map((item) => {
      const dashboard_layouts = item.dashboard_layouts || [];
      const dashboard_layout_components = dashboard_layouts[0]?.dashboard_layout_components || [];
      const dashboardElementsLayoutMap = dashboard_layout_components.reduce((acc, ele) => {
        acc[ele.dashboard_element_id] = {
          height: ele.height,
          width: ele.width,
          row: ele.row,
          column: ele.column,
        };

        return acc;
      }, {});

      const dashboardConfig = {
        title: item.title,
        description: item.description,
        dashboardElements: item.dashboard_elements?.map((ele) => {
          if (ele.type === 'text') {
            return {
              title_text: ele.title_text,
              subtitle_text: ele.subtitle_text,
              body_text: ele.body_text,
              title_hidden: ele.title_hidden,
              type: 'text',
              ...(dashboardElementsLayoutMap[ele.id] || {}),
            };
          }
          if (ele.type === 'vis') {
            const { title, title_hidden, query, result_maker, id, subtitle, body } = ele;
            const {
              view,
              fields,
              pivots,
              filters,
              filter_expression,
              sorts,
              limit,
              vis_config,
              dynamic_fields,
              model,
            } = query || {};

            return {
              title: title,
              title_hidden: title_hidden,
              subtitle,
              body,
              type: 'vis',
              view,
              fields,
              pivots,
              filters,
              filter_expression,
              sorts,
              limit,
              vis_config: {
                type: vis_config?.type,
              },
              dynamic_fields,
              model,
              result_maker: {
                filterables: result_maker?.filterables,
              },
              ...(dashboardElementsLayoutMap[id] || {}),
            };
          }
        }),
        dashboardFilters: item.dashboard_filters?.map((filter) => ({
          ...filter,
          id: null,
          dashboard_id: null,
        })),
      };
      allFiles.push(dashboardConfig);
    });

    try {
      if (allFiles?.length === 1) {
        const data = allFiles[0];
        downloadDashboardConfigFile(encodeJSON(data), `${data.title}`);
        setProcessing(false);
        closeHandler();
      } else {
        const zip = new JSZip();
        allFiles.map(async (file) => {
          var dataStr = encodeJSON(file);
          const data = zip.file(`${file.title}.config`, dataStr);
          return data;
        });
        setProcessing(false);
        zip.generateAsync({ type: 'blob' }).then(function(content) {
          const a = document.createElement('a');
          a.style.display = 'none';
          document.body.appendChild(a);

          const blobFile = new Blob([content], { type: 'application/zip' });
          const url = window.URL.createObjectURL(blobFile);
          a.href = url;
          a.target = '_blank';
          a.download = 'dashboards.zip';
          a.click();
          window.URL.revokeObjectURL(url);
          invokeProcessIndicator('Export Dashboard zip file downloaded successfully.');
          closeHandler();
        });
      }
    } catch (error) {
      console.log('error', error);
    }
  };
  /*End Export multi select */
  useEffect(() => {
    fetchTenantDashboardsCount();
  }, []);

  const countOfSelectedDashboardToExport = Object.values(dashboardsSelectedForExports).filter(Boolean).length;
 console.log("customDashboardsLimitReached",customDashboardsLimitReached)
  return (
    <Container className={classes.homeContainer}>
      <HomeHeader
        dataLength={dashboards?.length}
        layout={layout}
        tagList={tagList.length ? tagList : []}
        setLayout={setLayout}
        onSearchChange={onSearchChange}
        createNewDashboard={createNewDashboard}
        importDashboardFromConfig={createNewDashboardFromConfig}
        disableCreateDashboards={customDashboardsLimitReached}
        onImportComplete={onImportComplete}
        filterBy={filterBy}
        tabValue={value}
        isLoading={isLoading}
        data-test-id="custom-home-header"
      />
      <Divider />
      <Box>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          className={classes.customTabs}
          data-test-id="custom-dashboard-tabs"
        >
          <Tab label="All" />
          <Tab label="My Dashboards" />
          <Tab label="Favorites" />
        </Tabs>
      </Box>
      <Box className={classes.contentContainer}>
        {isLoading ? (
          <LoadingPage />
        ) : (
          <Box className={classes.contentContainerSub}>
            <Box className={layout === 'list' ? classes.list : classes.grid}>
              {layout &&
                dashboards &&
                dashboards.map((int, idx) => (
                  <HomeContent
                    index={int.index}
                    data={int}
                    layout={layout}
                    handleHeart={handleHeart}
                    deleteDashboard={deleteDashboard}
                    duplicateDashboard={duplicateDashboard}
                    exportDashboard={exportDashboard}
                    viewDashboard={viewDashboard}
                    editDashboard={editDashboard}
                    searchValue={searchValue}
                    disableCreateDashboards={customDashboardsLimitReached}
                    key={int.index}
                    show={value === 0 ? true : value === 1 ? int.createdBySelf : value === 2 ? int.isFavorite : true}
                    dashboardsSelectedForExports={dashboardsSelectedForExports}
                    handleDashboardSelectionForExports={handleCheck}
                  />
                ))}
            </Box>
          </Box>
        )}
      </Box>

      {countOfSelectedDashboardToExport > 0 && (
        <AppBar position="fixed" className={classes.appBar}>
          <Paper elevation={12}>
            <Toolbar>
              <IconButton className={classes.menuButton} aria-label="Menu" color="inherit">
                <Info className={clsx(classes.iconColor, classes.iconMargin, classes.iconSize)} />
              </IconButton>
              <Typography color="inherit">{countOfSelectedDashboardToExport} Dashboard(s) Selected</Typography>
              <section className={classes.rightToolbar}>
                <LoaderButton
                  buttonProps={{
                    onClick: () => onExportProcess(),
                    className: classes.downloadBtn,
                    disabled: processing === true,
                  }}
                  showLoader={processing}
                >
                  Export Dashboards
                </LoaderButton>
                <Button variant="outlined" color="primary" onClick={closeHandler}>
                  Cancel
                </Button>
              </section>
            </Toolbar>
          </Paper>
        </AppBar>
      )}
    </Container>
  );
};

export default HomePage;
