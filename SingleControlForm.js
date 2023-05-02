/**
 * src/components/filters/FilterModal/cmp/SingleControlForm.js
 * Form elements relating to a single control option like radio buttons,
 * button toggles, or dropdown menu
 */
import React, { useContext, useEffect, useState } from 'react';
import { Box, makeStyles } from '@material-ui/core';
import { FieldSelect, FieldSelectMulti, FieldText, InputChips, Label, MessageBar, Spinner } from '@looker/components';

import asyncWrapper from '../../../../utils/asyncWrapper';

import { fetchSuggestions } from '../async';
import { FilterModalContext } from '../context/FilterModalContext';
import ExampleWrapper from './examples/ExampleWrapper';
import { CONTROL_SLIDER, REGEXES, extractDataTypeFromContext, extractDisplayTypeFromContext } from '../utils/utils';

const useStyles = makeStyles((theme) => ({
  formSection: {
    marginBottom: theme.spacing(2),
  },
}));

function SingleControlForm() {
  const classes = useStyles();

  const [ctx, dispatch] = useContext(FilterModalContext);
  const [defaultMultiOptions, setDefaultMultiOptions] = useState([]);
  const [workingMultiOptions, setWorkingMultiOptions] = useState([]);
  const [defaultSingleValue, setDefaultSingleValue] = useState(ctx?.filterPayload?.default_value || '');
  const [valueTracker, setValueTracker] = useState([]);

  const [minValue, setMinValue] = useState(ctx?.filterPayload?.ui_config?.options?.[0] || 0);
  const [maxValue, setMaxValue] = useState(ctx?.filterPayload?.ui_config?.options?.[1] || 100);
  const [defaultNumericValue, setDefaultNumericValue] = useState(ctx?.filterPayload?.default_value || '50');

  const [suggestionDataLoading, setSuggestionDataLoading] = useState(true);

  const displayType = extractDisplayTypeFromContext(ctx);
  const dataType = extractDataTypeFromContext(ctx);

  /**
   * Handling the Values(s) input
   * @param {*} value String[]
   */
  function multipleValueSelectionHandler(value) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        // reset
        setWorkingMultiOptions(defaultMultiOptions);
        setDefaultSingleValue('');
        setValueTracker([]);

        // update payload
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
        let temp = [...value];

        // numeric checks
        if (dataType === 'number') {
          temp = value.filter((f) => REGEXES.numOnly.test(f));
        }

        setWorkingMultiOptions(
          temp.map((m) => {
            return { value: m };
          }),
        );
        if (!temp.includes(defaultSingleValue)) {
          setDefaultSingleValue('');
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
    return;
  }

  /**
   * Handle the single value selection
   * @param {*} value
   */
  function defaultValueSelectionHandler(value) {
    setDefaultSingleValue(value);

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
  function handleDefaultNumericValueChange(evt) {
    const {
      target: { value },
    } = evt;
    setDefaultNumericValue(value ?? 0);

    dispatch((st) => ({
      ...st,
      filterPayload: {
        ...st.filterPayload,
        default_value: value,
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
   * Slider only available for "number"
   */
  if (displayType === CONTROL_SLIDER && dataType !== 'number') {
    return <MessageBar intent="critical">Slider available only for "number" data type.</MessageBar>;
  }

  return (
    <React.Fragment>
      {displayType !== CONTROL_SLIDER && (
        <React.Fragment>
          <Box className={classes.formSection}>
            {dataType !== 'number' && (
              <Box sx={{ display: 'flex', alignItems: 'end' }}>
                <FieldSelectMulti
                  aria-label="Select Values"
                  values={ctx.filterPayload.ui_config.options || []}
                  clearIconLabel="remove all chips"
                  disabled={suggestionDataLoading}
                  freeInput={true}
                  id="single-values"
                  label="Value(s)"
                  onChange={multipleValueSelectionHandler}
                  type="number"
                  options={defaultMultiOptions}
                  placeholder={valueTracker.length > 0 ? '' : 'any value'}
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
                  onChange={multipleValueSelectionHandler}
                  placeholder={valueTracker.length > 0 ? '' : 'Enter at least one number'}
                  values={ctx.filterPayload.ui_config.options || []}
                />
              </Label>
            )}
          </Box>
          <Box className={classes.formSection}>
            <Box sx={{ display: 'flex', alignItems: 'end' }}>
              <FieldSelect
                aria-label="Select Value"
                defaultValue={ctx.filterPayload.default_value}
                freeInput={true}
                disabled={suggestionDataLoading}
                id="single-default-values"
                isClearable={true}
                label="Default Value"
                onChange={defaultValueSelectionHandler}
                options={workingMultiOptions}
                placeholder="Select default value"
                value={defaultSingleValue}
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
      {displayType === CONTROL_SLIDER && (
        <Box className={classes.formSection} sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ marginRight: '10px' }}>
            <FieldText id="min-value" label="Min" type="number" value={minValue} onChange={handleMinValueChange} />
          </Box>
          <Box sx={{ marginRight: '10px' }}>
            <FieldText id="max-value" label="Max" type="number" value={maxValue} onChange={handleMaxValueChange} />
          </Box>
          <Box sx={{ marginRight: '10px' }}>
            <FieldText
              id="default-value"
              label="Default"
              type="number"
              value={defaultNumericValue}
              onChange={handleDefaultNumericValueChange}
            />
          </Box>
        </Box>
      )}
      <Box sx={{ marginTop: '15px' }}>
        <ExampleWrapper
          config="single"
          dataType={ctx?.filterPayload?.field?.type || 'string'}
          display={ctx?.filterPayload?.ui_config?.display}
          type={ctx?.filterPayload?.ui_config?.type}
        />
      </Box>
    </React.Fragment>
  );
}

export default SingleControlForm;
