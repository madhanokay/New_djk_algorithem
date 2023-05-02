/**
 * src/components/filters/FilterModal/cmp/DatetimeControlForm.js
 * Offers options for configuring dates
 */
import React, { useContext, useEffect, useState } from 'react';
import { Heading } from '@looker/components';
import { Filter, useExpressionState } from '@looker/filter-components';
import moment from 'moment';

import { FilterModalContext } from '../context/FilterModalContext';

import { CONTROL_DAY_PICKER, CONTROL_DAY_RANGE_PICKER, CONTROL_RELATIVE_TIMEFRAMES } from '../utils/utils';

function DatetimeControlForm() {
  const [ctx, dispatch] = useContext(FilterModalContext);
  const {
    editMode,
    filterPayload: { default_value },
  } = ctx;

  let defaultSingleDate = moment().format('YYYY/MM/DD');
  let defaultDateRange = `${moment().format('YYYY/MM/DD')} to ${moment()
    .add(7, 'days')
    .format('YYYY/MM/DD')}`;
  let defaultTimeframe = '7 day';
  if (editMode) {
    defaultSingleDate = default_value;
    defaultDateRange = default_value;
    defaultTimeframe = default_value;
  }

  const [dayPickerExpression, setDayPickerExpression] = useState(defaultSingleDate);
  const [, setDayRangePickerExpression] = useState(defaultDateRange);
  const [timeframeExpression, setTimeframeExpression] = useState(defaultTimeframe);

  /**
   * special implementation for date range because the calendar picker has strange behavior
   */
  const dateRangeExpressionState = useExpressionState({
    expression: defaultDateRange,
    filter: { default_value: defaultDateRange },
    onChange: onDayRangePickerChange,
  });

  /**
   * Update the "default_value" with the expression
   * @param {*} expression
   */
  function callExpressionDispatch(expression) {
    dispatch((st) => ({
      ...st,
      filterPayload: {
        ...st.filterPayload,
        default_value: expression,
      },
    }));
  }

  /**
   * Single day picker change
   * @param {*} obj
   */
  function onDayPickerChange(obj) {
    const { expression } = obj;
    setDayPickerExpression(expression);
    callExpressionDispatch(expression);
  }

  /**
   * Date range picker change
   * @param {*} obj
   * "YYYY/MM/DD to YYYY/MM/DD"...the first part must be before the second part
   * chronologically
   */
  function onDayRangePickerChange(value) {
    setDayRangePickerExpression(value);
    callExpressionDispatch(value);
  }

  /**
   * Relative timeframe picker change
   * @param {*} obj
   */
  function onTimeframeExpressionChange(obj) {
    const { expression } = obj;
    setTimeframeExpression(expression);
    callExpressionDispatch(expression);
  }

  /**
   * Set the default context value on load
   */
  useEffect(() => {
    let df = '';
    if (ctx?.filterPayload?.ui_config?.type === CONTROL_DAY_PICKER) {
      df = dayPickerExpression;
    }
    if (ctx?.filterPayload?.ui_config?.type === CONTROL_DAY_RANGE_PICKER) {
      df = defaultDateRange;
    }
    if (ctx?.filterPayload?.ui_config?.type === CONTROL_RELATIVE_TIMEFRAMES) {
      df = timeframeExpression;
    }

    dispatch((st) => ({
      ...st,
      filterPayload: {
        ...st.filterPayload,
        default_value: df,
      },
    }));
  }, [ctx.filterPayload.ui_config.type, dayPickerExpression, defaultDateRange, dispatch, timeframeExpression]);

  return (
    <React.Fragment>
      {ctx?.filterPayload?.ui_config?.type === CONTROL_DAY_PICKER && (
        <>
          <Heading as="h6" style={{ marginBottom: '5px' }}>
            Single Date
          </Heading>
          <Filter
            id="single-date"
            name="Date"
            expressionType="date"
            expression={dayPickerExpression}
            config={{ type: CONTROL_DAY_PICKER }}
            onChange={onDayPickerChange}
          />
        </>
      )}
      {ctx?.filterPayload?.ui_config?.type === CONTROL_DAY_RANGE_PICKER && (
        <>
          <Heading as="h6" style={{ marginBottom: '5px' }}>
            Date Range
          </Heading>
          <Filter
            name="Date Range"
            expressionType={ctx?.filterPayload?.field?.type === 'date_time' ? 'date_time' : 'date'}
            {...dateRangeExpressionState}
          />
        </>
      )}
      {ctx?.filterPayload?.ui_config?.type === CONTROL_RELATIVE_TIMEFRAMES && (
        <>
          <Heading as="h6" style={{ marginBottom: '5px' }}>
            Timeframe
          </Heading>
          <Filter
            id="timeframe-picker"
            name="Date"
            expressionType="date"
            expression={timeframeExpression}
            config={{ type: CONTROL_RELATIVE_TIMEFRAMES }}
            onChange={onTimeframeExpressionChange}
          />
        </>
      )}
    </React.Fragment>
  );
}

export default DatetimeControlForm;
