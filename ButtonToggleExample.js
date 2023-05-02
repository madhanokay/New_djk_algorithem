/**
 * src/components/filters/FilterModal/cmp/examples/ButtonToggleExample.js
 * Example button toggle layout
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ButtonToggle, ButtonItem } from '@looker/components';

function ButtonToggleExample({ data, value }) {
  const [groupValue, setGroupValue] = useState(value);

  function handleButtonToggleClick(evt) {
    evt.preventDefault();
    const {
      target: { value },
    } = evt;
    setGroupValue(value + '');
  }

  return (
    <div>
      <ButtonToggle value={groupValue} onClick={handleButtonToggleClick} data-test-id="custom-button-groupEx">
        {data.map((m) => {
          return <ButtonItem key={m.label}>{m.label}</ButtonItem>;
        })}
      </ButtonToggle>
    </div>
  );
}

ButtonToggleExample.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
  value: PropTypes.any,
};

export default ButtonToggleExample;
