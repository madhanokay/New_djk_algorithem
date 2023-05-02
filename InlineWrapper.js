/**
 * src/components/filters/FilterModal/cmp/examples/InlineWrapper.js
 * Wrapper component for inline configuration
 */
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core';

import ButtonToggleExample from './ButtonToggleExample';
import RadioButtonExample from './RadioButtonExample';
import DropdownMenuExample from './DropdownMenuExample';
import ButtonGroupExample from './ButtonGroupExample';
import CheckboxExample from './CheckboxExample';
import TagsListExample from './TagsListExample';
import SliderExample from './SliderExample';
import RangeSliderExample from './RangerSliderExample';

import {
  CONTROL_BUTTON_GROUP,
  CONTROL_BUTTON_TOGGLES,
  CONTROL_CHECKBOXES,
  CONTROL_DROPDOWN_MENU,
  CONTROL_RADIO_BUTTONS,
  CONTROL_RANGE_SLIDER,
  CONTROL_SLIDER,
  CONTROL_TAG_LIST,
} from '../../utils/utils';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
}));

function InlineWrapper({ suggestions, value, type }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {type === CONTROL_RADIO_BUTTONS && <RadioButtonExample data={suggestions} value={value} />}
      {type === CONTROL_BUTTON_TOGGLES && <ButtonToggleExample data={suggestions} value={value} />}
      {type === CONTROL_DROPDOWN_MENU && <DropdownMenuExample data={suggestions} value={value} />}
      {type === CONTROL_BUTTON_GROUP && <ButtonGroupExample data={suggestions} value={value} />}
      {type === CONTROL_CHECKBOXES && <CheckboxExample data={suggestions} value={value} />}
      {type === CONTROL_TAG_LIST && <TagsListExample data={suggestions} value={value} />}
      {type === CONTROL_SLIDER && <SliderExample />}
      {type === CONTROL_RANGE_SLIDER && <RangeSliderExample />}
    </div>
  );
}

InlineWrapper.propTypes = {
  suggestions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
  value: PropTypes.any,
  type: PropTypes.string,
};

export default InlineWrapper;
