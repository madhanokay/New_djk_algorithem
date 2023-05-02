/**
 * src/components/filters/FilterModal/FilterSelect.js
 * Adding an initial filter or editing
 */
import React, { useContext, useState, useCallback } from 'react';
import { Box, InputAdornment, makeStyles, TextField } from '@material-ui/core';
import { Search, X } from 'react-feather';
import { Alert } from '@material-ui/lab';
import _ from 'lodash';

import { FilterModalContext } from '../context/FilterModalContext';
import { defaultFilterPayload } from '../context/initialState';
import RecursiveTree from './RecursiveTree';
import { compositeFilterName } from '../utils/utils';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '350px',
  },
  mb1: {
    marginBottom: theme.spacing(1),
  },
  recursion_tree: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    overflowY: 'auto',
  },
}));

function FilterSelect() {
  const classes = useStyles();

  const [ctx, dispatch] = useContext(FilterModalContext);
  const { exploreApiData, selectedFilter } = ctx;
  const invalidModelData = !exploreApiData || exploreApiData?.length === 0;

  const [formLabel, setFormLabel] = useState('What do you want to filter by?');
  const [searchTerm, setSearchTerm] = useState(compositeFilterName(selectedFilter));
  const [filterBy, setFilterBy] = useState('');

  /**
   * Input field change handler
   * @param {*} evt
   * @param {*} value
   * @param {*} reason
   */
  function onChangeHandler(evt) {
    const {
      target: { value },
    } = evt;
    setFilterBy(value);
    if (value) {
      setFormLabel('Filter by');
    } else {
      setFormLabel('What do you want to filter by?');
    }
  }

  const debouncedInputChange = useCallback(
    _.debounce((evt) => onChangeHandler(evt), 500),
    [],
  );

  const onSearchInputChange = (evt) => {
    // disable input if already selected (add mode)
    if (selectedFilter && !ctx?.filterPayload?.id) {
      evt.preventDefault();
      return;
    }
    evt.persist();
    setSearchTerm(evt.target.value);
    debouncedInputChange(evt);
  };

  /**
   * Selecting an item from the tree
   * @param {*} selectedFilter
   */
  const onSelectHandler = useCallback((selectedFilter) => {
    const { name, model } = selectedFilter;
    const dimensionsAndMeasuresFlatMap = (exploreApiData || []).flatMap((s) => [
      ...(s?.fields?.dimensions || []),
      ...(s?.fields?.measures || []),
    ]);
    const [firstMatch] = dimensionsAndMeasuresFlatMap.filter((f) => f.name === name);

    setSearchTerm(compositeFilterName(selectedFilter));

    dispatch((st) => ({
      ...st,
      selectedFilter,
      filterPayload: {
        ...st.filterPayload,
        model,
        dimension: name,
        explore: firstMatch.scope,
        field: firstMatch,
        ui_config: { options: '', type: '', display: 'inline' },
      },
    }));
  }, []);

  /**
   * clear the search field
   */
  function resetSearch() {
    setSearchTerm('');
    setFilterBy('');

    // edit mode
    if (ctx?.filterPayload?.id) {
      dispatch((st) => ({
        ...st,
        workflowStep: 'select',
      }));
    }
    // new filter add mode
    else {
      dispatch((st) => ({
        ...st,
        filterPayload: {
          ...defaultFilterPayload,
          // preserve dashboard ID
          dashboard_id: ctx.filterPayload.dashboard_id,
        },
        selectedFilter: null,
      }));
    }
  }

  return (
    <div className={classes.root}>
      <div className={classes.mb1}>{formLabel}</div>
      <TextField
        id="dimension-finder"
        className={classes.margin}
        onChange={onSearchInputChange}
        placeholder="Search"
        value={searchTerm}
        disabled={invalidModelData}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search style={{ height: '18px' }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end" data-test-id="clear-selected-filter">
              <X
                style={{ height: '18px', cursor: 'pointer', visibility: searchTerm ? 'visible' : 'hidden' }}
                onClick={resetSearch}
              />
            </InputAdornment>
          ),
        }}
      />
      {invalidModelData && (
        <Box sx={{ width: '100%', marginTop: '15px' }}>
          <Alert severity="warning">
            Unable to retrieve model information for this dashboard. Please make sure you have at least one properly
            configured query-based tile.
          </Alert>
        </Box>
      )}

      <div className={classes.recursion_tree}>
        <RecursiveTree exploreDataArray={exploreApiData} searchTerm={filterBy} selectHandler={onSelectHandler} />
      </div>
    </div>
  );
}

export default FilterSelect;
