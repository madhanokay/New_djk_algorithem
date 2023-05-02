/**
 * src/components/filters/FilterModal/FilterConfig.js
 * The display version of filter selection, which recaps current filters selected
 */
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Box, Checkbox, FormControl, FormControlLabel, FormGroup, makeStyles } from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { FieldSelect, FieldText } from '@looker/components';
import { getExpressionTypeFromField } from '@looker/filter-components';

import { FilterModalContext } from '../context/FilterModalContext';
import { CONTROL_ADVANCED, CONTROL_RANGE_SLIDER, CONTROL_SLIDER, compositeFilterName } from '../utils/utils';

import AdvancedControlForm from './AdvancedControlForm';
import DatetimeControlForm from './DatetimeControlForm';
import MultipleControlForm from './MultipleControlForm';
import SingleControlForm from './SingleControlForm';

import { matchAvailableControlTypes, FILTER_CONTROL_OPTIONS, FILTER_DISPLAY_OPTIONS } from '../utils/utils';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxHeight: '450px',
    padding: '8px',
  },
  form: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
  },
  left: {
    flex: 1,
    paddingRight: theme.spacing(1),
    borderRight: `solid 1px ${theme.palette.divider}`,
  },
  right: (props) => {
    return {
      flex: props.selectedControl === CONTROL_ADVANCED ? 3 : 2,
      paddingLeft: theme.spacing(1),
    };
  },
  formSection: {
    marginBottom: theme.spacing(2),
  },
  formControl: {
    width: '100%',
  },
  debug: {
    padding: '10px',
    width: '100%',
    wordBreak: 'break-all',
  },
}));

function FilterConfig() {
  const [ctx, dispatch] = useContext(FilterModalContext);
  const { dashboardData, filterPayload, selectedFilter } = ctx;

  // need to accumulate the filter names already in use.  Dashboard filters
  // cannot have duplicate names
  const filterNamesCurrentlyInUse = (dashboardData?.dashboard_filters || []).map((m) => m.name);

  const classes = useStyles({ selectedControl: filterPayload?.ui_config?.type });

  const [allowMultiple, setAllowMultiple] = useState(ctx?.filterPayload?.allow_multiple_values || false);
  const [controlType, setControlType] = useState(filterPayload?.ui_config?.type || '');
  const [controlTypeOptions, setControlTypeOptions] = useState([]);
  const [controlOptionCategory, setControlOptionCategory] = useState('');
  const [displayOption, setDisplayOption] = useState(filterPayload?.ui_config.display || 'inline');
  const [filterName, setFilterName] = useState(compositeFilterName(selectedFilter));
  const [filterNameValidationMessage, setFilterNameValidationMessage] = useState(null);
  const [required, setRequired] = useState(ctx?.filterPayload?.required || false);

  /**
   * If the control type is advanced, we do not need the display options
   */
  const showDisplayOptions = useCallback(() => {
    return filterPayload.ui_config.type === CONTROL_ADVANCED ? false : true;
  }, [filterPayload.ui_config.type]);

  /**
   * Allow multiple values checkbox
   * @param {*} evt
   */
  function allowMultipleValuesChangeHandler(evt) {
    const {
      target: { checked },
    } = evt;

    if (getExpressionTypeFromField(ctx?.filterPayload?.field) === 'string' && !checked) {
      evt.preventDefault();
      return;
    }

    setAllowMultiple(checked);
    dispatch((st) => ({
      ...st,
      filterPayload: {
        ...st.filterPayload,
        allow_multiple_values: checked,
        default_value: '',
      },
    }));
  }

  /**
   * Handle state change for selecting control value
   * @param {*} value
   */
  function controlSelectHandler(value) {
    const expressionType = getExpressionTypeFromField(ctx?.filterPayload.field);

    setControlType(value);

    // allow multiple values
    const amv = value === CONTROL_ADVANCED && expressionType === 'string' ? true : false;
    if (amv) {
      setAllowMultiple(true);
    }

    let default_value = '';

    // options
    let options = [];
    if (value === CONTROL_SLIDER || value === CONTROL_RANGE_SLIDER) {
      options = { min: 0, max: 100 };
      if (value === CONTROL_SLIDER) {
        default_value = 50;
      } else {
        default_value = JSON.stringify([25, 75]);
      }
    }

    dispatch((st) => ({
      ...st,
      filterPayload: {
        ...st.filterPayload,
        allow_multiple_values: amv,
        ui_config: {
          ...st.filterPayload.ui_config,
          options,
          type: value || '',
        },
        default_value,
      },
    }));
  }

  /**
   * Handle state change for selecting display type
   * @param {*} value
   */
  function displaySelectHandler(value) {
    setDisplayOption(value);

    dispatch((st) => ({
      ...st,
      filterPayload: {
        ...st.filterPayload,
        ui_config: {
          ...st.filterPayload.ui_config,
          display: value,
        },
      },
    }));
  }

  /**
   * Filter Name field change handler
   * @param {*} evt
   */
  function filterNameChangeHandler(evt) {
    const {
      target: { value },
    } = evt;
    setFilterName(value);

    dispatch((st) => ({
      ...st,
      filterPayload: {
        ...st.filterPayload,
        name: value || compositeFilterName(selectedFilter),
        title: value || compositeFilterName(selectedFilter),
      },
    }));
  }

  /**
   * Required checkbox
   * @param {*} evt
   */
  function requiredChangeHandler(evt) {
    const {
      target: { checked },
    } = evt;
    setRequired(checked);

    dispatch((st) => ({
      ...st,
      filterPayload: {
        ...st.filterPayload,
        required: checked,
      },
    }));
  }

  /**
   * This useEffect will fetch the field configuration for the selected value
   * and update the context accordingly
   */
  useEffect(() => {
    // set the control type options
    const categories = matchAvailableControlTypes(selectedFilter?.type || 'string', selectedFilter?.name);

    let availableOptions = FILTER_CONTROL_OPTIONS.filter((f) => categories.indexOf(f.category) >= 0);
    setControlTypeOptions(availableOptions);

    if (selectedFilter?.name) {
      const dimensionsAndMeasuresFlatMap = (ctx?.exploreApiData || []).flatMap((s) => {
        return [...(s?.fields?.dimensions || []), ...(s?.fields?.measures || [])];
      });
      const [firstFieldMatch] = dimensionsAndMeasuresFlatMap.filter((f) => {
        return f.name === selectedFilter.name;
      });

      if (firstFieldMatch) {
        dispatch((st) => ({
          ...st,
          dashboardElements: [],
          filterPayload: {
            ...st.filterPayload,
            // name: st.filterPayload?.id ? st.filterPayload.name : compositeFilterName(selectedFilter),
            // title: st.filterPayload?.id ? st.filterPayload.name : compositeFilterName(selectedFilter),
            name: compositeFilterName(selectedFilter),
            title: compositeFilterName(selectedFilter),
            field: firstFieldMatch,
          },
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * This useEffect will update the controlOptionCategory when controlType changes
   */
  useEffect(() => {
    const catIndex = FILTER_CONTROL_OPTIONS.findIndex((el) => el.options.some((s) => s.value === controlType));
    if (catIndex >= 0) {
      setControlOptionCategory(FILTER_CONTROL_OPTIONS[catIndex].category);
    } else {
      setControlOptionCategory('');
    }
  }, [controlType]);

  /**
   * This useEffect will check to see if the filter name is a duplicate
   */
  useEffect(() => {
    if (filterName && !ctx.editMode) {
      if (filterNamesCurrentlyInUse.indexOf(filterName) >= 0) {
        setFilterNameValidationMessage({ type: 'error', message: 'Duplicate filter name.' });
      } else {
        setFilterNameValidationMessage(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterName]);

  return (
    <form noValidate autoComplete="off">
      <div className={classes.root}>
        <div className={classes.form}>
          {/*
           * LEFT SIDE
           */}
          <div className={classes.left}>
            {/* filter name */}
            <Box sx={{ width: '100%' }} className={classes.formSection}>
              <FieldText
                id="filter-name"
                label="Filter Name"
                value={filterName}
                onChange={filterNameChangeHandler}
                disabled={ctx.editMode}
                validationMessage={filterNameValidationMessage}
              />
            </Box>

            {/* select control type */}
            <Box className={classes.formSection}>
              <FormControl className={classes.formControl}>
                <FieldSelect
                  aria-label="Select Control"
                  id="select-control"
                  isClearable={true}
                  label="Control"
                  options={controlTypeOptions}
                  onChange={controlSelectHandler}
                  placeholder="Select control"
                  value={controlType}
                />
              </FormControl>
            </Box>

            {/* display (if not advanced) */}
            <Box className={classes.formSection} style={{ display: showDisplayOptions() ? 'block' : 'none' }}>
              <FormControl className={classes.formControl}>
                <FieldSelect
                  aria-label="Display Values"
                  id="select-display"
                  label="Display"
                  options={FILTER_DISPLAY_OPTIONS}
                  onChange={displaySelectHandler}
                  placeholder="Display Values"
                  value={displayOption}
                />
              </FormControl>
            </Box>

            {/* required filter */}
            <Box sx={{ width: '100%' }} className={classes.formSection}>
              <FormGroup column="true">
                <FormControlLabel
                  control={
                    <Checkbox
                      id="is-required"
                      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                      checkedIcon={<CheckBoxIcon fontSize="small" />}
                      name="required"
                      checked={required}
                      inputProps={{ 'aria-label': 'Required' }}
                    />
                  }
                  label="Required"
                  onChange={requiredChangeHandler}
                />
                <FormControlLabel
                  style={{ display: filterPayload.ui_config.type === CONTROL_ADVANCED ? 'block' : 'none' }}
                  control={
                    <Checkbox
                      id="amv"
                      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                      checkedIcon={<CheckBoxIcon fontSize="small" />}
                      name="allow_multiple_values"
                      checked={allowMultiple}
                      inputProps={{ 'aria-label': 'Allow Multiple Values' }}
                    />
                  }
                  label="Allow Multiple Values"
                  onChange={allowMultipleValuesChangeHandler}
                />
              </FormGroup>
            </Box>
          </div>

          {/*
           * RIGHT SIDE
           */}
          <div className={classes.right}>
            {/* control option = singular category */}
            {controlOptionCategory === 'single' && <SingleControlForm />}

            {/* control option = multiple category */}
            {controlOptionCategory === 'multiple' && <MultipleControlForm />}

            {/* control option = datetime category */}
            {controlOptionCategory === 'datetime' && <DatetimeControlForm />}

            {/* control option = advanced/other category */}
            {controlOptionCategory === 'other' && <AdvancedControlForm />}
          </div>
        </div>
      </div>
    </form>
  );
}

export default FilterConfig;
