/**
 * src/components/filters/FilterModal/cmp/examples/RangeSlider.js
 * Example for slider
 */
import React, { useState } from 'react';
import { RangeSlider } from '@looker/components';

function RangeSliderExample() {
  const [value, setValue] = useState([13, 17]);

  function handleRangeSliderChange(value) {
    setValue(value);
  }

  return <RangeSlider min={10} max={20} value={value} onChange={handleRangeSliderChange} />;
}

export default RangeSliderExample;
