/**
 * src/components/fitlers/FilterModal/cmp/FilterSubmit.js
 * The final step of the filter modal workflow...POSTing API request
 */
import React, { useContext, useEffect, useState } from 'react';
import { Box, CircularProgress } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import Alert from '@material-ui/lab/Alert';

import DashboardAPI from 'api/Dashboards';
import asyncWrapper from '../../../../utils/asyncWrapper';

import { createDashboardFilter, updateDashboardFilter } from '../async';
import { FilterModalContext } from '../context/FilterModalContext';
import { setDashboardFilterToEdit, updateDashboardLastFetched } from 'store/actions';

function FilterSubmit({ closeHandler }) {
  const dispatch = useDispatch();
  const [ctx] = useContext(FilterModalContext);
  const { dashboardElements } = ctx;

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  /**
   * A wrapper function for create or update of a dashboard filter
   * @param {*} filterPayload
   */
  async function submitFilter(filterPayload) {
    // updating the dashboard elements regardless of Add or Edit
    const dashboardElementPromises = dashboardElements.map((m) => {
      return DashboardAPI.updateEntireDashboardElement(m.id, m);
    });
    await Promise.allSettled(
      dashboardElementPromises.map(async (p) => {
        await asyncWrapper(p);
      }),
    );

    if (ctx.filterPayload.id) {
      const [, data] = await asyncWrapper(updateDashboardFilter(filterPayload));
      if (data) {
        setLoading(false);
        setSuccess(true);
        dispatch(setDashboardFilterToEdit(null));
        dispatch(updateDashboardLastFetched());
      } else {
        setLoading(false);
      }
    } else {
      const [, data] = await asyncWrapper(createDashboardFilter(filterPayload));
      if (data) {
        setLoading(false);
        setSuccess(true);
        dispatch(updateDashboardLastFetched());
      } else {
        setLoading(false);
      }
    }
  }

  /**
   * This useEffect will submit the filter payload to the Looker API
   */
  useEffect(() => {
    submitFilter(ctx?.filterPayload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <React.Fragment>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
          <CircularProgress />
        </Box>
      )}
      {!loading && success && (
        <Box sx={{ width: '100%' }}>
          <Alert severity="success">{`Dashboard filter successfully ${ctx.editMode ? 'updated' : 'added'}.`}</Alert>
        </Box>
      )}
      {!loading && !success && (
        <Box sx={{ width: '100%' }}>
          <Alert severity="error">Unable to process filter for dashboard.</Alert>
        </Box>
      )}
    </React.Fragment>
  );
}

export default FilterSubmit;
