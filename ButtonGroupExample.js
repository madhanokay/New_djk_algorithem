/**
 * src/components/filters/FilterModal/cmp/examples/ButtonGroupExample.js
 * Example button toggle layout
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, ButtonItem } from '@looker/components';

function ButtonGroupExample({ data, value }) {
  const [groupValue, setGroupValue] = useState([]);

  function handleButtonGroupClick(evt) {
    evt.preventDefault();
    const {
      target: { value },
    } = evt;

    if (groupValue.includes(value)) {
      setGroupValue(groupValue.filter((f) => f !== value));
    } else {
      setGroupValue(groupValue.concat([value]));
    }
  }

  return (
    <div>
      <ButtonGroup value={groupValue} onClick={handleButtonGroupClick} data-test-id="custom-button-group">
        {data.map((m) => {
          return <ButtonItem key={m.label}>{m.label}</ButtonItem>;
        })}
      </ButtonGroup>
    </div>
  );
}

ButtonGroupExample.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
  value: PropTypes.any,
};

export default ButtonGroupExample;
