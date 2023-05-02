import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInViewport } from 'react-in-viewport';
import { Box, makeStyles, Divider, Card, Typography, Checkbox, Badge } from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { User } from 'react-feather';
import DropDownMenu from './DropDownMenu';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import StarIcon from '@material-ui/icons/Star';
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import LocalOfferOutlinedIcon from '@material-ui/icons/LocalOfferOutlined';
import ScheduleOutlinedIcon from '@material-ui/icons/ScheduleOutlined';
import MoreVertOutlinedIcon from '@material-ui/icons/MoreVertOutlined';
import ExabeamIcon from './ExabeamIcon';
import clsx from 'clsx';
import DashboardSnapshot from 'components/dashboard-snapshot/DashboardSnapshot';
import OverflowTextTooltip from 'components/overflow-text-tooltip/OverflowTextTooltip';
import { getBaseUrl } from 'utils';
import { hasFeatureFlag } from 'platformCore/FeatureFlag';
import { FEATURE_FLAGS } from '../../constants';

const useStyles = makeStyles((theme) => ({
  gridItem: {
    border: `1px solid ${theme.palette.divider}`,
    position: 'relative',
    '&:hover': {
      backgroundColor: 'rgba(3, 113, 224, 0.06)',
    },
    cursor: 'pointer',
    padding: theme.spacing(0.5),
  },
  badgeItem: {
    marginLeft: 8,
    marginTop: 4,
    padding: theme.spacing(0.125, 0.75),
    backgroundColor: theme.palette.secondary.main,
    borderRadius: 64,
    fontSize: 12,
    lineHeight: 18,
    color: theme.palette.common.white,
  },
  topDataContainer: {
    display: 'flex',
    margin: theme.spacing(1),
    height: theme.spacing(5),
  },
  metadataContainer: {
    minWidth: 0,
    flex: 1,
    margin: theme.spacing(0, 1),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  gridItemHeartContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  gridItemHeart: {
    color: theme.palette.primary.light,
  },
  menuContainer: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
  menuSubContainer: {
    display: 'flex',
    position: 'absolute',
    top: 4,
    right: 2,
  },
  tileCountContainer: {
    display: 'flex',
    marginRight: theme.spacing(1),
  },
  viewsContainer: {
    bottom: theme.spacing(1),
    right: theme.spacing(1),
    display: 'flex',
  },
  centerDataContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '180px',
    width: '100%',
    overflow: 'hidden',
    marginBottom: theme.spacing(1),
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.background.action,
    borderRadius: '50%',
    height: theme.spacing(4),
    width: theme.spacing(4),
  },
  exabeamIcon: {
    color: theme.palette.secondary.main,
    width: 16,
    height: 16,
  },
  userIcon: {
    color: '#9c5d00',
    width: 16,
    height: 16,
  },
  iconSize: {
    fontSize: 'medium',
  },
  iconSizeLarge: {
    fontSize: 'large',
    cursor: 'pointer',
  },
  iconColor: {
    color: theme.palette.primary.light,
  },
  tagIconColor: {
    color: theme.palette.grey[500],
  },
  secondaryIconColor: {
    color: 'rgb(135, 142, 153)',
  },
  tagContainer: {
    width: 'fit-content',
    maxWidth: 145,
    padding: '3px',
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.06)' : theme.palette.grey.A100,
    alignItems: 'center',
    marginRight: theme.spacing(1),
  },
  iconSpacing: {
    marginRight: theme.spacing(1),
  },
  bottomDataContainer: {
    display: 'flex',
    alignItems: 'center',
    margin: theme.spacing(1, 1, 0.5, 1),
  },
  content: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tagsOverflow: {
    minWidth: 0,
  },
  loadingGridItem: {
    border: `1px solid ${theme.palette.divider}`,
    height: 277,
    padding: 8,
  },
  loadingSnapshot: {
    height: 180,
  },
  loadingDashboardTitle: {
    height: 70,
    marginTop: 8,
  },
  loading: {
    animationDuration: '1.5s',
    animationFillMode: 'forwards',
    animationIterationCount: 'infinite',
    animationName: '$shimmer',
    animationTimingFunction: 'linear',
    background: '#ddd',
    background:
      theme.palette.type === 'dark'
        ? 'linear-gradient(to right, #2c2d34 8%, #393b44 18%, #2c2d34 33%)'
        : 'linear-gradient(to right, #F6F6F6 8%, #F0F0F0 18%, #F6F6F6 33%)',
    backgroundSize: '1200px 100%',
  },
  '@keyframes shimmer': {
    '0%': {
      backgroundPosition: '100% 0',
    },
    '100%': {
      backgroundPosition: '-100% 0',
    },
  },
  gridItemAnchorContainer: {
    textDecoration: 'none',
    color: theme.palette.text.primary,
  },

  showCheckbox: {
    display: 'initial',
  },
  labelContainer: {
    position: 'absolute',
  },
  customCheckbox: {
    padding: 0,
  },
  selectedGridItem: {
    border: `1px solid ${theme.palette.divider}`,
    position: 'relative',
    backgroundColor: theme.palette.info.background,
    cursor: 'pointer',
    padding: theme.spacing(0.5),
  },
}));

const HomeGridItem = ({
  data,
  handleHeart,
  deleteDashboard,
  duplicateDashboard,
  exportDashboard,
  editDashboard,
  viewDashboard,
  disableCreateDashboards,
  index,
  dashboardsSelectedForExports,
  handleDashboardSelectionForExports,
}) => {
  const dashboardId = data.index;
  const homeItemRef = useRef();
  const [anchorEl, setAnchorEl] = useState(null);
  const { inViewport } = useInViewport(homeItemRef, {}, { disconnectOnLeave: false });
  const baseUrl = getBaseUrl();

  const classes = useStyles();

  const [isHovered, toggleHover] = useState(false);

  const exportFeatureEnabled = hasFeatureFlag(FEATURE_FLAGS.ENABLE_DASHBOARD_IMPORT_EXPORT);

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAnchorEl(null);
  };

  const handleGridItemClick = () => {
    viewDashboard(dashboardId);
  };

  const handleHeartClick = (e, data) => {
    e.stopPropagation();
    e.preventDefault();
    handleHeart(data);
  };

  const handleCheckboxChange = (e, dashboardId) => {
    e.preventDefault();
    e.stopPropagation();
    handleDashboardSelectionForExports(dashboardId, e.target.checked);
  };

  useEffect(() => {
    if (!dashboardsSelectedForExports[dashboardId]) {
      toggleHover(false);
    }
  }, [dashboardsSelectedForExports[dashboardId]]);
 
  console.log("vvv",dashboardsSelectedForExports[dashboardId]);
  const isChecked = !!dashboardsSelectedForExports[dashboardId];

  return (
    <Link
      className={classes.gridItemAnchorContainer}
      to={`${baseUrl}/dashboards/${dashboardId}`}
      onMouseEnter={() => toggleHover(true)}
      onMouseLeave={() => toggleHover(false)}
    >
      <div ref={homeItemRef}>
        {inViewport ? (
          <Card
            className={isChecked ? classes.selectedGridItem : classes.gridItem}
            onClick={handleGridItemClick}
            key={index}
          >
            <Box
              classes={{
                root: classes.labelContainer,
              }}
            >
              {exportFeatureEnabled && (isHovered || isChecked) && classes.showCheckbox && (
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<CheckBoxIcon fontSize="small" />}
                  checked={isChecked}
                  onClick={(e) => handleCheckboxChange(e, dashboardId)}
                  inputProps={{ 'aria-label': 'controlled' }}
                  size="small"
                  classes={{
                    root: classes.customCheckbox,
                  }}
                />
              )}
              {data.isDraft && <Badge className={classes.badgeItem}>DRAFT</Badge>}
            </Box>

            <Box className={classes.centerDataContainer}>
              <DashboardSnapshot snapshot={data.dashboardSnapshot} />
            </Box>
            <Box className={classes.topDataContainer}>
              <div className={classes.iconContainer}>
                {data.owner === 'Exabeam' ? (
                  <ExabeamIcon className={classes.exabeamIcon} />
                ) : (
                  <User className={classes.userIcon} />
                )}
              </div>
              <div className={classes.metadataContainer}>
                <OverflowTextTooltip text={data.name} variant="h5" />
                <OverflowTextTooltip text={data.caption} variant="body2" />
              </div>
              <div className={classes.menuSubContainer}>
                <div>
                  <MoreVertOutlinedIcon
                    className={clsx(classes.iconSizeLarge, classes.iconColor)}
                    onClick={handleClick}
                  />
                  <DropDownMenu
                    data={data}
                    anchorEl={anchorEl}
                    handleClose={handleClose}
                    deleteDashboard={deleteDashboard}
                    duplicateDashboard={duplicateDashboard}
                    viewDashboard={viewDashboard}
                    editDashboard={editDashboard}
                    exportDashboard={exportDashboard}
                    disableCreateDashboards={disableCreateDashboards}
                  />
                </div>
              </div>
            </Box>
            <Divider />
            <Box className={classes.bottomDataContainer}>
              <Box>
                {data?.tags?.length > 0 && (
                  <Box className={classes.tagContainer}>
                    <LocalOfferOutlinedIcon
                      className={clsx(classes.iconSize, classes.iconSpacing, classes.tagIconColor)}
                    />
                    <Box className={classes.tagsOverflow}>
                      <OverflowTextTooltip text={data.tags.join(', ')} variant="body2" />
                    </Box>
                  </Box>
                )}
              </Box>
              <Box className={classes.tileCountContainer}>
                <ScheduleOutlinedIcon
                  className={clsx(classes.iconSize, classes.iconSpacing, classes.secondaryIconColor)}
                />
                <Box>{`${data.tileCount} tiles`}</Box>
              </Box>
              <Box className={classes.viewsContainer}>
                <VisibilityOutlinedIcon
                  className={clsx(classes.iconSize, classes.iconSpacing, classes.secondaryIconColor)}
                />
                <Box>{`${data.views} views`}</Box>
              </Box>
              <Box className={classes.gridItemHeartContainer}>
                {data?.isFavorite ? (
                  <StarIcon
                    onClick={(e) => handleHeartClick(e, data)}
                    className={clsx(classes.gridItemHeart, classes.iconSizeLarge)}
                  />
                ) : (
                  <StarBorderIcon
                    onClick={(e) => handleHeartClick(e, data)}
                    className={clsx(classes.gridItemHeart, classes.iconSizeLarge)}
                  />
                )}
              </Box>
            </Box>
          </Card>
        ) : (
          <div className={classes.loadingGridItem}>
            <div className={`${classes.loading} ${classes.loadingSnapshot}`}></div>
            <div className={`${classes.loading} ${classes.loadingDashboardTitle}`}></div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default HomeGridItem;
