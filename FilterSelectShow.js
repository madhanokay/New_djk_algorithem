/**
 * src/components/filters/FilterModal/FilterSelectShow.js
 * The display version of filter selection, which recaps current filters selected
 */
import React, { useContext } from 'react';
import { Box, IconButton, makeStyles } from '@material-ui/core';
import { Edit2 } from 'react-feather';

import { FilterModalContext } from '../context/FilterModalContext';
import { defaultFilterPayload } from '../context/initialState';
import { compositeFilterName } from '../utils/utils';

const useStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.text.primary,
    width: '100%',
    padding: '8px',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  iconButton: {
    width: '18px',
    height: '18px',
    color: theme.palette.primary.light,
  },
}));

function FilterSelectShow() {
  const classes = useStyles();

  const [ctx, dispatch] = useContext(FilterModalContext);
  const { selectedFilter } = ctx;

  /**
   * Reverting back to the select filter step
   */
  function revertToSelectStep() {
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
        workflowStep: 'select',
      }));
    }
  }

  return (
    <div className={classes.root}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ marginBottom: '5px' }}>FILTER BY</Box>
          <Box>{`${compositeFilterName(selectedFilter)}`}</Box>
        </Box>
        <Box>
          <IconButton onClick={revertToSelectStep}>
            <Edit2 className={classes.iconButton} />
          </IconButton>
        </Box>
      </Box>
    </div>
  );
}

export default FilterSelectShow;
