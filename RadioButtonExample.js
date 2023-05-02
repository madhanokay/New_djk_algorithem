/**
 * src/components/filters/FilterModal/cmp/examples/RadioButtonExample.js
 * Example radio button layout
 */
import React from 'react';
import PropTypes from 'prop-types';
import { RadioGroup } from '@looker/components';

function RadioButtonExample({ data, value }) {
  return <RadioGroup defaultValue={value} inline name="radio-group" options={data} wrap={true} />;
}

RadioButtonExample.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
  value: PropTypes.any,
};

export default RadioButtonExample;
