/**
 * src/components/filters/FilterModal/cmp/MultipleControlForm.js
 * Form elements relating to a multiple control option like button groups,
 * checkboxes, or tags list
 */
import React, { useContext, useEffect, useState } from 'react';
import { Box, makeStyles } from '@material-ui/core';
import { FieldSelect, FieldSelectMulti, FieldText, InputChips, Label, MessageBar, Spinner } from '@looker/components';

import asyncWrapper from '../../../../utils/asyncWrapper';

import { FilterModalContext } from '../context/FilterModalContext';
import { fetchSuggestions } from '../async';
import {
  CONTROL_RANGE_SLIDER,
  REGEXES,
  extractDataTypeFromContext,
  extractDisplayTypeFromContext,
} from '../utils/utils';

import ExampleWrapper from './examples/ExampleWrapper';

const useStyles = makeStyles((theme) => ({
  formSection: {
    marginBottom: theme.spacing(2),
  },
}));

function MultipleControlForm() {
  const classes = useStyles();

  const [ctx, dispatch] = useContext(FilterModalContext);

  const [defaultMultiOptions, setDefaultMultiOptions] = useState([]);
  const [workingMultiOptions, setWorkingMultiOptions] = useState([]);
  const [defaultValue, setDefaultValue] = useState(arrayOrString(ctx?.filterPayload?.default_value));
  const [valueTracker, setValueTracker] = useState(ctx?.filterPayload?.ui_config?.options || []);

  const [minValue, setMinValue] = useState(ctx?.filterPayload?.ui_config?.options?.[0] || 0);
  const [maxValue, setMaxValue] = useState(ctx?.filterPayload?.ui_config?.options?.[1] || 100);
  const [defaultMin, setDefaultMin] = useState(25);
  const [defaultMax, setDefaultMax] = useState(75);

  const [suggestionDataLoading, setSuggestionDataLoading] = useState(true);

  const displayType = extractDisplayTypeFromContext(ctx);
  const dataType = extractDataTypeFromContext(ctx);

  /**
   * For default value calculation...whether string or array, like for range slider
   * @param {*} v
   * @returns
   */
  function arrayOrString(v) {
    if (Array.isArray(v)) {
      const [first] = v;
      return first;
    }
    return v || '';
  }

  /**
   * Handling the "Value(s)" multi select change
   * @param {*} values
   */
  function valuesSelectionHandler(values) {
    if (Array.isArray(values)) {
      if (values.length === 0) {
        // revert
        setWorkingMultiOptions(defaultMultiOptions);
        setDefaultValue('');
        setValueTracker([]);

        dispatch((st) => ({
          ...st,
          filterPayload: {
            ...st.filterPayload,
            default_value: '',
            ui_config: {
              ...st.filterPayload.ui_config,
              options: [],
            },
          },
        }));
      } else {
        let temp = [...values];

        // numeric checks
        if (dataType === 'number') {
          temp = values.filter((f) => REGEXES.numOnly.test(f));
        }

        // intersection
        setWorkingMultiOptions(
          (temp || []).map((m) => {
            return { value: m };
          }),
        );

        if (temp.length > 0 && !temp.includes(defaultValue)) {
          setDefaultValue('');
        }
        setValueTracker(temp);

        dispatch((st) => ({
          ...st,
          filterPayload: {
            ...st.filterPayload,
            default_value: '',
            ui_config: {
              ...st.filterPayload.ui_config,
              options: temp,
            },
          },
        }));
      }
    }
  }

  /**
   * Handling the default value selection
   * @param {*} values String[]
   */
  function defaultValueSelectionHandler(value) {
    setDefaultValue(value);

    dispatch((st) => ({
      ...st,
      filterPayload: {
        ...st.filterPayload,
        default_value: value,
      },
    }));
  }

  /**
   * Min value handler for slider
   * @param {*} evt
   */
  function handleMinValueChange(evt) {
    const {
      target: { value },
    } = evt;
    setMinValue(value ?? 0);

    const options = {
      min: Number(value ?? 0),
      max: maxValue,
    };

    dispatch((st) => ({
      ...st,
      filterPayload: {
        ...st.filterPayload,
        ui_config: {
          ...st.filterPayload.ui_config,
          options,
        },
      },
    }));
  }

  /**
   * Max value handler for slider
   * @param {*} evt
   */
  function handleMaxValueChange(evt) {
    const {
      target: { value },
    } = evt;
    setMaxValue(value ?? 0);

    const options = {
      min: minValue,
      max: Number(value ?? 0),
    };

    dispatch((st) => ({
      ...st,
      filterPayload: {
        ...st.filterPayload,
        ui_config: {
          ...st.filterPayload.ui_config,
          options,
        },
      },
    }));
  }

  /**
   * Default value handler for slider
   * @param {*} evt
   */
  function handleDefaultMin(evt) {
    const {
      target: { value },
    } = evt;

    setDefaultMin(value);

    dispatch((st) => ({
      ...st,
      filterPayload: {
        ...st.filterPayload,
        default_value: `[${Number(value)}, ${Number(defaultMax)}]`,
      },
    }));
  }

  function handleDefaultMax(evt) {
    const {
      target: { value },
    } = evt;

    setDefaultMax(value);

    dispatch((st) => ({
      ...st,
      filterPayload: {
        ...st.filterPayload,
        default_value: `[${Number(defaultMin)}, ${Number(value)}]`,
      },
    }));
  }

  /**
   * This function will fetch suggestions data
   */
  async function fetchSuggestionData(model, view, field) {
    const [, data] = await asyncWrapper(fetchSuggestions(model, view, field));
    const opt = (data?.suggestions || []).map((m) => {
      return {
        label: m,
        value: m,
      };
    });

    setDefaultMultiOptions(opt);
    setWorkingMultiOptions(opt);

    setSuggestionDataLoading(false);
  }

  /**
   * This useEffect will retrieve the suggestions data
   */
  useEffect(() => {
    const model = ctx?.selectedFilter?.model;
    const view = ctx?.selectedFilter?.scope;
    const field = ctx?.selectedFilter?.name;

    if (model && view && field) {
      fetchSuggestionData(model, view, field);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * range slider only available for "number"
   */
  if (displayType === CONTROL_RANGE_SLIDER && dataType !== 'number') {
    return <MessageBar intent="critical">Slider available only for "number" data type.</MessageBar>;
  }

  return (
    <React.Fragment>
      {displayType !== CONTROL_RANGE_SLIDER && (
        <React.Fragment>
          <Box className={classes.formSection}>
            {dataType !== 'number' && (
              <Box sx={{ display: 'flex', alignItems: 'end' }}>
                <FieldSelectMulti
                  aria-label="select-values"
                  clearIconLabel="remove all chips"
                  disabled={suggestionDataLoading}
                  freeInput={true}
                  id="multiple-values"
                  onChange={valuesSelectionHandler}
                  options={defaultMultiOptions}
                  label="Value(s)"
                  placeholder={valueTracker.length > 0 ? '' : 'any value'}
                  values={valueTracker}
                />
                <Spinner
                  size={25}
                  markers={15}
                  markerRadius={10}
                  speed={1000}
                  style={{ marginBottom: '5px', visibility: suggestionDataLoading ? 'visible' : 'hidden' }}
                />
              </Box>
            )}
            {dataType === 'number' && (
              <Label htmlFor="single-values">
                <Box sx={{ marginBottom: '5px' }}>Value(s)</Box>
                <InputChips
                  aria-label="Select Values"
                  id="single-values"
                  label="Value(s)"
                  onChange={valuesSelectionHandler}
                  placeholder={valueTracker.length > 0 ? '' : 'Enter at least one number'}
                  values={ctx.filterPayload.ui_config.options || []}
                />
              </Label>
            )}
          </Box>
          <Box className={classes.formSection}>
            <Box sx={{ display: 'flex', alignItems: 'end' }}>
              <FieldSelect
                aria-label="multiselect-default-values"
                disabled={suggestionDataLoading}
                freeInput={true}
                id="default-values"
                label="Default Value"
                onChange={defaultValueSelectionHandler}
                options={workingMultiOptions}
                placeholder={defaultValue.length > 0 ? '' : 'none'}
                value={defaultValue}
              />
              <Spinner
                size={25}
                markers={15}
                markerRadius={10}
                speed={1000}
                style={{ marginBottom: '5px', visibility: suggestionDataLoading ? 'visible' : 'hidden' }}
              />
            </Box>
          </Box>
        </React.Fragment>
      )}
      {displayType === CONTROL_RANGE_SLIDER && (
        <React.Fragment>
          <Box className={classes.formSection} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ marginRight: '10px' }}>
              <FieldText id="min-value" label="Min" type="number" value={minValue} onChange={handleMinValueChange} />
            </Box>
            <Box sx={{ marginRight: '10px' }}>
              <FieldText id="max-value" label="Max" type="number" value={maxValue} onChange={handleMaxValueChange} />
            </Box>
            <Box sx={{ marginRight: '10px' }}>
              <FieldText
                id="default-value-min"
                label="Default Min"
                type="number"
                value={defaultMin}
                onChange={handleDefaultMin}
              />
            </Box>
            <Box sx={{ marginRight: '10px' }}>
              <FieldText
                id="default-value-max"
                label="Default Max"
                type="number"
                value={defaultMax}
                onChange={handleDefaultMax}
              />
            </Box>
          </Box>
        </React.Fragment>
      )}
      <Box sx={{ marginTop: '15px' }}>
        <ExampleWrapper
          config="multiple"
          dataType={ctx?.filterPayload?.field?.type || 'string'}
          display={ctx?.filterPayload?.ui_config?.display}
          suggestions={defaultMultiOptions}
          type={ctx?.filterPayload?.ui_config?.type}
          value={defaultValue}
        />
      </Box>
    </React.Fragment>
  );
}

export default MultipleControlForm;
