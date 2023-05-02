/**
 * src/components/filters/FilterModal/cmp/examples/TagsListExample.js
 * Example dropdown menu
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { SelectMulti } from '@looker/components';

function TagsListExample({ data, value }) {
  const [selectValue, setSelectValue] = useState(value);

  return (
    <SelectMulti
      clearIconLabel="remove all chips"
      values={selectValue}
      onChange={setSelectValue}
      options={data}
      placeholder={selectValue.length === 0 ? 'Select value(s)' : ''}
      data-test-id="custom-tags-list"
    />
  );
}

TagsListExample.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
  value: PropTypes.any,
};

export default TagsListExample;
