/**
 * src/components/filters/FilterModal/cmp/RecursiveTree.js
 * Taking an array of model->explore-dimensions data and making into an expandable / collapsible tree component
 */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core';
import { TreeCollection, Tree, TreeItem } from '@looker/components';

import { REGEXES, compositeLabelFromId, toTitleCase } from '../utils/utils';
import { isFieldFilterable } from '../../../../utils/filterHelpers';
import { hasFeatureFlag } from '../../../../platformCore/FeatureFlag';
import { FEATURE_FLAGS } from '../../../../constants';

const useStyles = makeStyles((theme) => ({
  root: {
    '& ul li div span': {
      cursor: 'pointer',
    },
  },
}));

const filterFn = (field, group) => {
  const lookbackPeriodEnabled = hasFeatureFlag(FEATURE_FLAGS.ENABLE_LOOKBACK_PERIOD);

  if (lookbackPeriodEnabled) {
    return field.field_group_label === group && isFieldFilterable(field);
  } else {
    return field.field_group_label === group;
  }
};

function RecursiveTree({ exploreDataArray, searchTerm, selectHandler }) {
  const classes = useStyles();

  const [baseTreeData, setBaseTreeData] = useState([]);
  const [workingTreeData, setWorkingTreeData] = useState([]);

  /**
   * Recursively filter data (label) by a regular expression.
   * @param {*} data
   * @param {*} re
   * @returns
   */
  function regexFilter(data, re) {
    return data.reduce(function fr(acc, curr) {
      if (curr.items) {
        const items = curr.items.reduce(fr, []);
        if (items.length) {
          return acc.concat({ ...curr, items });
        }
      }
      if (re.test(curr.label)) {
        return acc.concat(curr);
      } else {
        return acc;
      }
    }, []);
  }

  /**
   * This useEffect will transform the exploreDataArray into a tree-like structure
   */
  useEffect(() => {
    const treeData = [];
    const cats = [];
    const scopeCollection = [];

    for (let index in exploreDataArray) {
      const ead = exploreDataArray[index];
      const model = ead?.model_name;
      const dimensions = ead?.fields?.dimensions || [];
      const measures = ead?.fields?.measures || [];
      const uniqueScopes = [...new Set(dimensions.map((m) => m.scope))];
      scopeCollection.push(...uniqueScopes);

      // the model->explore entry
      const category = {
        id: ead.id,
        items: null,
        label: compositeLabelFromId(ead.id),
        model,
        name: null,
        scope: null,
        type: 'model-explore',
        uniqueScopes,
      };
      cats.push(category);

      // run through the scopes and dimensions
      const categoryItems = [];
      uniqueScopes.forEach((scope) => {
        // const scopeSlice = dimensions.filter((f) => f.scope === scope);
        const scopeSlice = [...dimensions, ...measures].filter((f) => f.scope === scope);

        const uniqueGroupsForScope = [
          ...new Set(scopeSlice.filter((f) => f.field_group_label).map((m) => m.field_group_label)),
        ];
        uniqueGroupsForScope.sort();

        uniqueGroupsForScope.forEach((group, index) => {
          const matches = scopeSlice
            .filter((f) => filterFn(f, group))
            .map((m, i) => {
              return {
                id: `${m.name}-${i}`,
                items: null,
                label: toTitleCase(m?.label_short.replace(REGEXES.spaceUnderscore, ' ')),
                category: m?.category || 'dimension',
                model, // "model"
                name: m.name, // "field"
                scope: m.scope, // "view"
                type: m.type,
              };
            });
          matches.sort((a, b) => a.label > b.label);

          categoryItems.push({
            id: `${group}-${index}`,
            items: matches,
            label: toTitleCase(toTitleCase(group.replace(REGEXES.spaceUnderscore, ' '))),
            category: 'dimension', // <--- not really a dimension, but a grouping...required for sorting
            model,
            name: null,
            scope,
          });
        });

        // non-grouped
        const nonGrouped = scopeSlice.filter((f) => !f.field_group_label);
        nonGrouped.forEach((item, index) => {
          categoryItems.push({
            id: `${item.name}-${index}`,
            items: null,
            label: (item?.label_short || '? Label').trim(),
            category: item?.category || 'dimension',
            model,
            name: item.name,
            scope: item.scope,
            type: item.type,
          });
        });
      });

      // sort by dimensions first, then measures, then alpha by label
      // by label
      categoryItems.sort((a, b) => {
        // return a.label > b.label ? 1 : -1;
        return a.category === b.category ? (a.label > b.label ? 1 : -1) : a.category > b.category ? 1 : -1;
      });

      category.items = categoryItems;

      treeData.push(category);
    }

    // sort modelExplores
    treeData.sort((a, b) => {
      return a.label > b.label ? 1 : -1;
    });

    setBaseTreeData(treeData);
    setWorkingTreeData(treeData);
  }, [exploreDataArray]);

  /**
   * This useEffect will filter based on search term
   */
  useEffect(() => {
    if (baseTreeData.length > 0) {
      if (searchTerm) {
        const re = new RegExp(searchTerm, 'i');
        const filtered = regexFilter(baseTreeData, re);

        setWorkingTreeData(filtered);
      } else {
        setWorkingTreeData(baseTreeData);
      }
    }
  }, [baseTreeData, searchTerm]);

  /**
   * An internal component for recursive tree structure building to be consumed
   * by the Looker Tree component(s)
   * @param {*} param0
   * @returns
   */
  const RecursiveTreeBuilder = ({ data }) => {
    const createBranch = (item) => {
      return item.items && item.items.length > 0 ? (
        <Tree border label={item.label} key={item.id} defaultOpen={!!searchTerm}>
          {item.items.map((m) => {
            return <React.Fragment key={m.label}>{createBranch(m)}</React.Fragment>;
          })}
        </Tree>
      ) : (
        <TreeItem
          itemRole="none"
          onClick={() => selectHandler(item)}
          color={item.category === 'measure' ? 'goldenrod' : 'dimension'}
        >
          {item?.label}
        </TreeItem>
      );
    };

    return (
      <div className={classes.root}>
        <TreeCollection>
          {workingTreeData.map((m) => {
            return (
              <Tree
                key={m.id}
                border
                defaultOpen={true}
                label={toTitleCase(m.label.replace(REGEXES.spaceUnderscore, ' '))}
              >
                {m.uniqueScopes.map((s) => {
                  return (
                    <Tree
                      key={s}
                      border
                      defaultOpen={true}
                      label={toTitleCase(s.replace(REGEXES.spaceUnderscore, ' '))}
                    >
                      {m.items
                        .filter((f) => f.scope === s)
                        .map((m) => {
                          return <React.Fragment key={m.id}>{createBranch(m)}</React.Fragment>;
                        })}
                    </Tree>
                  );
                })}
              </Tree>
            );
          })}
        </TreeCollection>
      </div>
    );
  };

  return workingTreeData.length > 0 ? <RecursiveTreeBuilder data={workingTreeData} /> : null;
}

RecursiveTree.propTypes = {
  exploreDataArray: PropTypes.array,
  searchTerm: PropTypes.string,
  selectHandler: PropTypes.func,
};

export default React.memo(RecursiveTree);
