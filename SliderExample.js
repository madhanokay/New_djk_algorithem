/**
 * src/components/filters/FilterModal/cmp/examples/SliderExample.js
 * Example for slider
 */
import React, { useState } from 'react';
import { Slider } from '@looker/components';

function SliderExample() {
  const [value, setValue] = useState(15);

  function handleSlideChange(evt) {
    const {
      target: { value },
    } = evt;
    setValue(+value);
  }

  return <Slider min={0} max={20} value={value} onChange={handleSlideChange} data-test-id="custom-slide" />;
}

export default SliderExample;
