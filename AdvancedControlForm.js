/**
 * src/components/filters/FilterModal/cmp/AdvancedControlForm.js
 * Advanced filter implementation
 *
 */
import React, { useContext, useEffect, useMemo } from 'react';

import { FilterModalContext } from '../context/FilterModalContext';
import AdvancedDashFilter from '../../AdvancedDashFilter';
import { isCustomDatetime } from '../utils/utils';
import CustomDateTimeFilter from 'components/filters/CustomDateTime/CustomDateTimeFilter';
import { getLookbackPeriod } from '../../../../api/utils';
import { LOOKBACK_PERIOD_DAYS_TO_MONTH_MULTIPLIER } from '../../../../constants';

function AdvancedControlForm() {
  const [ctx, dispatch] = useContext(FilterModalContext);
  const { filterPayload } = ctx;

  const configuredLookbackDays = (getLookbackPeriod() || 1) * LOOKBACK_PERIOD_DAYS_TO_MONTH_MULTIPLIER;

  const customDateTime = useMemo(() => {
    return isCustomDatetime(filterPayload?.field?.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPayload?.field?.name]);

  /**
   * Change handler for advanced dashboard filter control
   * @param {*} value
   */
  function onChangeHandler(value) {
    const v = value ?? '';

    dispatch((st) => ({
      ...st,
      filterPayload: {
        ...st.filterPayload,
        default_value: v,
      },
    }));
  }

  /**
   * Slightly different change handler for the custom datetime filter
   * @param {*} expressionObject
   */
  function onCustomDateTimeChangeHandler(expressionObject) {
    const { expression } = expressionObject;
    dispatch((st) => ({
      ...st,
      filterPayload: {
        ...st.filterPayload,
        default_value: expression,
      },
    }));
  }

  /**
   * This useEffect will handle the initial value for a custom datetime filter
   * or the current default value if in edit mode
   */
  useEffect(() => {
    if (customDateTime) {
      dispatch((st) => ({
        ...st,
        filterPayload: {
          ...st.filterPayload,
          default_value: st.filterPayload?.default_value || '1 day',
        },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateTime]);

  return customDateTime ? (
    <CustomDateTimeFilter
      expression={filterPayload?.default_value || '1 day'}
      expressionType="date_time"
      lookbackDays={configuredLookbackDays}
      onChange={onCustomDateTimeChangeHandler}
    />
  ) : (
    <AdvancedDashFilter
      changeHandler={onChangeHandler}
      expression={filterPayload?.default_value ?? ''}
      filter={filterPayload}
    />
  );
}

export default AdvancedControlForm;
