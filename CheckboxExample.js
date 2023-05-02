/**
 * src/components/filters/FilterModal/cmp/examples/CheckboxExample.js
 * Example radio button layout
 */
import React from 'react';
import PropTypes from 'prop-types';
import { CheckboxGroup } from '@looker/components';

function CheckboxExample({ data, value }) {
  return <CheckboxGroup defaultValue={value} inline name="cbx-group" options={data} wrap={true} />;
}

CheckboxExample.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
  value: PropTypes.any,
};

export default CheckboxExample;
