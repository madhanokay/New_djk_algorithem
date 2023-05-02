/**
 * src/components/filters/FilterModal/cmp/examples/ExampleWrapper.js
 * Wrapper component for showing example filter
 */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@material-ui/core';
import { Accordion2, Button, Popover } from '@looker/components';

import InlineWrapper from './InlineWrapper';

function ExampleWrapper({ config, dataType, display, type }) {
  const getSuggestions = useCallback(() => {
    if (dataType === 'number') {
      return ['1', '2', '3'].map((m) => {
        return { label: m, value: m };
      });
    }
    return ['1', '2', '3'].map((m) => {
      return { label: `Option ${m}`, value: `Option ${m}` };
    });
  }, [dataType]);

  const getValue = useCallback(() => {
    if (dataType === 'number') {
      if (config === 'single') {
        return '1';
      } else {
        return ['1', '2'];
      }
    } else {
      if (config === 'single') {
        return 'Option 1';
      }
      return [1, 2].map((m) => `Option ${m}`);
    }
  }, [config, dataType]);

  return (
    <Accordion2 indicatorPosition="left" label="Example">
      <Box sx={{ marginTop: '10px' }}>
        {display === 'inline' && <InlineWrapper suggestions={getSuggestions()} type={type} value={getValue()} />}
        {display === 'popover' && (
          <Popover
            width={350}
            content={
              <Box sx={{ padding: '8px', minWidth: '200px' }}>
                <InlineWrapper suggestions={getSuggestions()} type={type} value={getValue()} />
              </Box>
            }
          >
            <Button>Click for Filter</Button>
          </Popover>
        )}
      </Box>
    </Accordion2>
  );
}

ExampleWrapper.propTypes = {
  config: PropTypes.string,
  dataType: PropTypes.string,
  display: PropTypes.string,
  type: PropTypes.string,
};

export default ExampleWrapper;
