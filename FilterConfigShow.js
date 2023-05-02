/**
 * src/components/filters/FilterModal/cmp/FilterConfigShow.js
 * Display version of filter configuration
 */
import React, { useContext } from 'react';
import { Box, IconButton, makeStyles } from '@material-ui/core';
import { getExpressionTypeFromField, summary } from '@looker/filter-components';
import { Divider } from '@looker/components';
import { Edit2 } from 'react-feather';

import { FilterModalContext } from '../context/FilterModalContext';
import { filterMeta } from '../utils/utils';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    padding: '8px',
  },
  iconButton: {
    width: '18px',
    height: '18px',
    color: theme.palette.primary.light,
  },
}));

function FilterConfigShow() {
  const classes = useStyles();

  const [ctx, dispatch] = useContext(FilterModalContext);

  /**
   * Revert to configure step
   * @param {*} _evt
   */
  function revertToConfigureStep(_evt) {
    dispatch((st) => ({
      ...st,
      workflowStep: 'configure',
    }));
  }

  return (
    <div className={classes.root}>
      <Divider mb="u4" />
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ marginBottom: '5px', fontWeight: '600' }}>Configuration</Box>
          <Box sx={{ marginBottom: '15px' }}>{filterMeta(ctx)}</Box>

          <Box sx={{ marginBottom: '5px', fontWeight: '600' }}>Filter Summary</Box>
          <Box sx={{ marginBottom: '15px' }}>
            {summary({
              type: getExpressionTypeFromField(ctx?.filterPayload?.field),
              expression: ctx?.filterPayload?.default_value,
            })}
          </Box>
        </Box>
        <Box>
          <IconButton onClick={revertToConfigureStep}>
            <Edit2 className={classes.iconButton} />
          </IconButton>
        </Box>
      </Box>
    </div>
  );
}

export default FilterConfigShow;
