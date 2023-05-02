/**
 * src/components/filters/FilterModal/FilterTiles.js
 * The display version of filter selection, which recaps current filters selected
 */
import React, { useContext, useEffect, useState } from 'react';
import { Box, CircularProgress, makeStyles } from '@material-ui/core';
import { Divider, FieldSelect } from '@looker/components';
import { BarChart2 } from 'react-feather';

import asyncWrapper from '../../../../utils/asyncWrapper';

import { fetchDashboardElements, fetchModelExplore } from '../async';
import { FilterModalContext } from '../context/FilterModalContext';

import { compositeLabelFromField } from '../utils/utils.js';

const useStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.text.primary,
    width: '100%',
    padding: '8px',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  dashboardElementIcon: {
    width: '18px',
    height: '18px',
    color: theme.palette.primary.light,
  },
  elementName: {
    fontSize: '14px',
    marginLeft: theme.spacing(2),
  },
  scrollContainer: {
    maxHeight: '325px',
    overflowY: 'auto',
  },
}));

function FilterTiles() {
  const classes = useStyles();

  const [ctx, dispatch] = useContext(FilterModalContext);
  const { dashboardElements } = ctx;

  const [allDimensionDataLoading, setAllDimensionDataLoading] = useState(false);
  const [allDimensionData, setAllDimensionData] = useState([]);
  const [dashboardElementDataLoading, setDashboardElementDataLoading] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [sortedDashboardElements, setSortedDashboardElements] = useState([]);
  const [tileAssignment, setTileAssignment] = useState([]);

  function filterRelatedToView(dimension, view) {
    const [filterView] = dimension.split('.');
    return filterView === view;
  }

  /**
   * prefill tile -> dimension selection for add mode
   */
  function presetTileAssignmentAddMode() {
    const prefill = [];
    dashboardElements.forEach((d, i) => {
      const model = d?.query?.model;
      const view = d?.query?.view;

      if (model && view && filterRelatedToView(ctx?.filterPayload?.dimension, view)) {
        prefill.push({
          dashboardElementId: d.id,
          dashboard_filter_name: ctx?.filterPayload.name,
          model,
          view,
          index: i,
          indexField: ctx?.filterPayload?.dimension,
        });

        // update result maker for each element
        d.result_maker.filterables.forEach((item) => {
          if (item.model === model && item.view === view) {
            item.listen = [
              ...item.listen,
              {
                dashboard_filter_name: ctx?.filterPayload.name,
                field: ctx?.filterPayload?.dimension,
              },
            ];
          }
        });
      }
    });

    setTileAssignment(prefill);
    setPrefilled(true);

    dispatch((st) => ({
      ...st,
      dashboardElements: [...dashboardElements],
    }));
  }

  /**
   * preset tile -> dimension selection for edit mode
   */
  function presetTileAssignmentEditMode() {
    const prefill = [];

    dashboardElements.forEach((d, i) => {
      const model = d?.query?.model;
      const view = d?.query?.view;
      const listeners = (d?.result_maker?.filterables || [])
        .filter((f) => {
          return f.model === model && f.view === view;
        })
        .map((m) => m.listen)
        .flat();

      // finding the index field is a bit tricky
      const [iField] = listeners.filter((f) => {
        return f.dashboard_filter_name === ctx?.filterPayload?.name && f.field === ctx?.filterPayload?.dimension;
      });

      if (iField) {
        prefill.push({
          dashboardElementId: d.id,
          dashboard_filter_name: ctx?.filterPayload.name,
          model,
          view,
          index: i,
          indexField: iField.field,
        });
      }
    });

    setTileAssignment(prefill);
    setPrefilled(true);
  }

  /**
   * Tile -> field assignment for a dashboard element
   * @param {*} dashEl
   * @param {*} index
   * @param {*} value
   */
  function handleTileAssignment(dashEl, index, value) {
    const dashElId = dashEl.id;
    const model = dashEl?.query?.model;
    const view = dashEl?.query?.view;

    // tile assignment local state for tracking dropdown values
    const newTileAssignment = tileAssignment.filter((f) => f.dashboardElementId !== dashElId);

    const obj = {
      dashboardElementId: dashEl.id,
      dashboard_filter_name: ctx?.filterPayload?.name,
      model,
      view,
      field: ctx?.selectedFilter?.name,
      index,
      indexField: value ? value : ctx?.selectedFilter?.name,
    };

    if (value) {
      newTileAssignment.push(obj);
    }

    setTileAssignment(newTileAssignment);

    /**
     * Moving on to the "result_maker" property for the matching dashboard element
     */
    const [matchingElement] = dashboardElements.filter((f) => f.id === dashEl.id);
    const remainingElements = dashboardElements.filter((f) => f.id !== dashEl.id);
    const newResultMaker = matchingElement.result_maker;

    newResultMaker.filterables.forEach((item) => {
      if (item.model === model && item.view === view) {
        if (!value) {
          item.listen = item.listen.filter((f) => {
            return f.field !== obj.indexField;
          });
        } else {
          item.listen = [
            ...item.listen,
            {
              dashboard_filter_name: obj?.dashboard_filter_name,
              field: obj?.indexField,
            },
          ];
        }
      }
    });

    matchingElement.result_maker = newResultMaker;
    const newDashboardElements = [...remainingElements, matchingElement];

    dispatch((st) => ({
      ...st,
      dashboardElements: newDashboardElements,
    }));
  }

  /**
   * Match up a tile (dashboard element) with it's pairing in allDimensionData
   * @param {*} model
   * @param {*} view
   */
  function matchTileWithDimensionData(model, view) {
    const [first] = (allDimensionData || []).filter((f) => f?.model === model && f?.view === view);
    return first?.dimensionsAndMeasures || [];
  }

  /**
   *
   * @param {*} dashboardElementId
   * @returns
   */
  function getTileFieldValue(dashboardElementId) {
    const [match] = tileAssignment.filter((f) => f.dashboardElementId === dashboardElementId);
    if (match) {
      return match.indexField;
    }
    return '';
  }

  /**
   * This function will fetch dashboard elements by ID
   */
  async function fetchDashboardElementData(dashboardId) {
    setDashboardElementDataLoading(true);

    const [, elementData] = await asyncWrapper(fetchDashboardElements(dashboardId));

    setDashboardElementDataLoading(false);

    // restrict to visualization tiles, exclude chartType === 'text'
    const elements = (elementData?.dashboard_elements || []).filter(
      (f) => Object.hasOwn(f, 'query') && f.query !== null,
    );

    // sorting of dashboard elements by title is required
    // for keeping track of <Select> onChange() states
    setSortedDashboardElements([...elements.sort((a, b) => (a.title > b.title ? 1 : -1))]);

    dispatch((st) => ({
      ...st,
      dashboardElements: elements,
    }));
  }

  /**
   * This function fetches all dimension data for models and curates a list for the dropdowns
   */
  async function fetchAllDimensionData() {
    setAllDimensionDataLoading(true);
    const dimData = [];

    ////////////////////////////////////////
    // Step 1.
    // Get a unique list of model-view pairs based on
    // the query-capable tiles (dashboard_elements)
    // comprising the dashboard
    ////////////////////////////////////////
    const foundCompositeIds = [];

    const uniqueModelsAndViews = dashboardElements
      .filter((f) => f.query)
      .map((m) => {
        if (m?.query?.model && m?.query?.view) {
          const foundCompositeId = `${m.query.model}.${m.query.view}`;
          if (foundCompositeIds.indexOf(foundCompositeId) < 0) {
            foundCompositeIds.push(foundCompositeId);
            return {
              id: foundCompositeId,
              model: m?.query?.model || null,
              view: m?.query?.view || null,
            };
          }
          return {
            id: null,
          };
        } else {
          return {
            id: null,
          };
        }
      })
      .filter((f) => f.id);

    ////////////////////////////////////////
    // Step 2.  For each model and view pair
    // query the dimensions and measures
    ////////////////////////////////////////
    if (uniqueModelsAndViews.length > 0) {
      for (const obj of uniqueModelsAndViews) {
        const { id, model, view } = obj;
        const [, data] = await asyncWrapper(fetchModelExplore(obj.model, obj.view));

        if (data) {
          dimData.push({
            id,
            model,
            view,
            dimensionsAndMeasures: [...(data?.fields?.dimensions || []), ...(data?.fields?.measures || [])]
              .filter((f) => {
                return f.name === ctx.selectedFilter.name;
              })
              .map((m) => {
                return {
                  label: compositeLabelFromField(m.name),
                  type: m?.type || 'string',
                  value: m?.name || ctx.selectedFilter.name,
                };
              }),
          });
        }
      }
    }

    setAllDimensionData(dimData);
    setAllDimensionDataLoading(false);
  }

  /**
   * This useEffect will fetch dashboard elements for the given dashboard ID
   */
  useEffect(() => {
    if (ctx?.filterPayload?.dashboard_id) {
      fetchDashboardElementData(ctx.filterPayload.dashboard_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * This use effect will fetch all dimension data for whatever models
   * are part of the dashboard
   */
  useEffect(() => {
    if (dashboardElements.length > 0 && allDimensionData.length === 0 && !prefilled) {
      fetchAllDimensionData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardElements, allDimensionData, prefilled]);

  /**
   * This useEffect will preset or prefill tile to update selections under a certain set of conditions
   */
  useEffect(() => {
    if (!prefilled && dashboardElements.length > 0) {
      if (ctx.editMode) {
        presetTileAssignmentEditMode();
      } else {
        presetTileAssignmentAddMode();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardElements, prefilled]);

  return (
    <div className={classes.root}>
      <Divider mb="u4" />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ marginBottom: '5px' }}>TILES TO UPDATE</Box>
      </Box>
      <Box>
        {allDimensionDataLoading || dashboardElementDataLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <div className={classes.scrollContainer}>
            {sortedDashboardElements.length > 0 &&
              sortedDashboardElements.map((m, i) => {
                const optionsForTile = matchTileWithDimensionData(m?.query?.model, m?.query?.view);

                return (
                  <Box
                    key={m.id}
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px',
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flex: '1' }}>
                      <BarChart2 className={classes.dashboardElementIcon} />
                      <div className={classes.elementName}>{m?.title || `Element ${i}`}</div>
                    </Box>
                    <div style={{ flex: '1' }}>
                      <Box>
                        <FieldSelect
                          aria-label="Select Control"
                          id={`select-${m.id}`}
                          isClearable
                          disabled={optionsForTile.length === 0}
                          options={optionsForTile}
                          onChange={(val) => handleTileAssignment(m, i, val)}
                          placeholder={optionsForTile.length > 0 ? 'Select field' : 'N/A'}
                          value={getTileFieldValue(m.id, optionsForTile, i)}
                          style={{ width: '100%' }}
                        />
                      </Box>
                    </div>
                  </Box>
                );
              })}
          </div>
        )}
      </Box>
    </div>
  );
}

export default FilterTiles;
