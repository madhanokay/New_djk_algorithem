/**
 * src/components/filters/FilterModal/cmp/examples/DropdownMenuExample.js
 * Example dropdown menu
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Select } from '@looker/components';

function DropdownMenuExample({ data, value }) {
  const [selectValue, setSelectValue] = useState(value);

  return (
    <Select
      options={data}
      defaultValue={value}
      onChange={(v) => setSelectValue(v)}
      value={selectValue}
      data-test-id="custom-select-cmp"
    />
  );
}

DropdownMenuExample.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
  value: PropTypes.any,
};

export default DropdownMenuExample;
