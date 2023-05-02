/**
 * src/components/filters/FilterModal/ContextDebug.js
 * Debug JSON view of the context
 */
import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core';

import { FilterModalContext } from '../context/FilterModalContext';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '10px',
    width: '100%',
    wordBreak: 'break-all',
    height: '250px',
    overflowY: 'scroll',
  },
}));

function ContextDebug() {
  const [ctx] = useContext(FilterModalContext);
  const { filterPayload } = ctx;

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <pre>{JSON.stringify(filterPayload, null, 2)}</pre>
    </div>
  );

  // return <div className={classes.root} dangerouslySetInnerHTML={{ __html: JSON.stringify(filterPayload, null, 2) }} />;
}

export default ContextDebug;
