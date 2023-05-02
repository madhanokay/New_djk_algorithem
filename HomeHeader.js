import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  OutlinedInput,
  SvgIcon,
  TextField,
  Typography,
  makeStyles,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup, Autocomplete } from '@material-ui/lab';
import { Grid, List, Search, X } from 'react-feather';
import clsx from 'clsx';
import FilterDropDown from './FilterDropDown';
import LoaderButton from '../../components/loader-button/LoaderButton';
import { eligibility, hasDashboardCreationEntitlement } from 'platformCore/auth';
import { hasFeatureFlag } from 'platformCore/FeatureFlag';
import { FEATURE_FLAGS, MESSAGES } from '../../constants';
import ImportDialog from 'components/import-dialog/ImportDialog';
import { ReactComponent as ImportIcon } from '../../static/images/custom-icons/Import.svg';

const useStyles = makeStyles((theme) => ({
  header: {
    height: '50px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boxMargin: {
    marginRight: '5px',
    marginLeft: '5px',
  },
  filterContainer: {
    border: `1px solid ${theme.palette.primary.light}`,
    height: '36px',
    width: '36px',
    alignItems: 'center',
    display: 'flex',
  },
  iconSize: {
    height: '24px',
    width: '24px',
  },
  iconSizeSmall: {
    height: '16px',
    width: '16px',
  },
  iconColor: {
    color: theme.palette.primary.light,
  },
  filterIcon: {
    display: 'flex',
    margin: 'auto',
  },
  searchInput: {
    height: '36px',
    padding: theme.spacing(1, 2),
    width: '100%',
    background: theme.palette.type === 'dark' ? 'rgb(0, 29, 64)' : theme.palette.background.default,
  },
  searchIcon: {
    marginRight: theme.spacing(1),
  },
  newDashboard: {
    height: '36px',
    lineHeight: '16px',
  },
  createDashboardButton: {
    height: '24px',
    color: theme.palette.common.white,
    fontSize: '16px',
    fontWeight: 'normal',
    letterSpacing: '0px',
    lineHeight: '24px',
  },
  modal: {
    position: 'absolute',
    top: `50%`,
    left: `50%`,
    transform: `translate(-50%, -50%)`,
    width: 400,
    backgroundColor: theme.palette.type === 'dark' ? theme.palette.background.action : theme.palette.background.default,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  modalTitle: {
    fontSize: '16px',
    marginTop: theme.spacing(1),
  },
  spacing: {
    marginBottom: theme.spacing(3),
  },
  spacingDivider: {
    marginBottom: theme.spacing(2),
  },
  closeModal: {
    height: '36px',
    lineHeight: '16px',
    marginRight: theme.spacing(1),
  },
  closeIcon: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
    color: theme.palette.primary.light,
    cursor: 'pointer',
  },
  toggleButtonGroup: {
    height: '36px',
    border: `1px solid ${theme.palette.primary.light}`,
  },
  item: {
    marginTop: '5px',
    marginBottom: '5px',
  },
  searchInputContainer: {
    flex: 1,
  },
  chips: {
    height: '20px !important',
    margin: '0 2px',
  },
  optionContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  newTag: {
    color: theme.palette.text.secondary,
  },
  importButton: {
    marginLeft: theme.spacing(1),
    '& path': {
      fill: theme.palette.common.white,
    },
  },
  errorBorder: {
    borderTopColor: theme.palette.error.main,
  },
}));

const { canCreateDashboard } = eligibility;

const HomeHeader = ({
  dataLength,
  layout,
  tagList,
  setLayout,
  onSearchChange,
  createNewDashboard,
  filterBy,
  tabValue,
  isLoading,
  dashboardHomeFilter,
  importDashboardFromConfig,
  onImportComplete,
  disableCreateDashboards,
}) => {
  const importExportFeatureEnabled = hasFeatureFlag(FEATURE_FLAGS.ENABLE_DASHBOARD_IMPORT_EXPORT);
  const [open, setOpen] = useState(false);
  const [importDashboardDialogOpen, setImportDashboardDialogOpen] = useState(false);
  const [tags, setTags] = useState([]);
  const [hasOptions, setHasOptions] = useState(true);
  const [inputVal, setInputVal] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isError, setIsError] = useState(false);
  const [dashboardCreationInProgress, setDashboardCreationInProgress] = useState(false);
  const classes = useStyles();
  const tagOptions = tagList.map((tag) => tag.title);

  const resetCreateDashboardForm = () => {
    setTags([]);
    setTitle('');
    setDescription('');
  };

  const onTagChange = (e, value) => {
    const tags = [];
    value.map((v) => {
      tags.push(v.trim());
    });
    setTags(tags);
  };

  const onInputChange = (e, value) => {
    setInputVal(value);
    if (value) {
      let hasOptions = false;
      let fullyMatch = false;
      for (let i = 0; i < tagOptions.length; i++) {
        if (tagOptions[i] === value.trim()) {
          fullyMatch = true;
        }
        if (tagOptions[i].toLowerCase() === value.trim().toLowerCase()) {
          hasOptions = true;
          break;
        }
      }
      setHasOptions(hasOptions && fullyMatch);
    } else {
      setHasOptions(true);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    resetCreateDashboardForm();
  };

  const handleImportOpen = () => {
    setImportDashboardDialogOpen(true);
  };

  const handleImportClose = () => {
    setImportDashboardDialogOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    setIsError(false);
  };

  const toggleButtonOnChange = () => {
    layout === 'list' ? setLayout('grid') : setLayout('list');
  };

  const onDashboardTitleChange = (d) => {
    setTitle(d.target.value);
  };

  const onDashdoardDescriptionChange = (d) => {
    setDescription(d.target.value);
  };

  const createNewDashboardWrapper = async () => {
    try {
      setDashboardCreationInProgress(true);
      let value = await createNewDashboard(title, description, tags, handleClose);
      if (value) {
        setIsError(value);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDashboardCreationInProgress(false);
    }
  };

  return (
    <Box className={classes.header}>
      <Box className={clsx(classes.boxMargin, classes.filterContainer)}>
        <FilterDropDown tagOptions={tagOptions} filterBy={filterBy} tabValue={tabValue} />
      </Box>
      <Box className={classes.boxMargin}>{`${dataLength ? dataLength : 0} Dashboards`}</Box>
      <Box className={clsx(classes.boxMargin, classes.searchInputContainer)}>
        <OutlinedInput
          className={classes.searchInput}
          placeholder={'Search'}
          fullWidth={true}
          onChange={(d) => onSearchChange(d)}
          startAdornment={
            <SvgIcon className={clsx(classes.iconSize, classes.searchIcon)}>
              <Search />
            </SvgIcon>
          }
          data-test-id="custom-search-dashboard"
        />
      </Box>
      <Box className={classes.boxMargin}>
        {hasDashboardCreationEntitlement() && (
          <>
            <LoaderButton
              tooltipMessage={disableCreateDashboards ? MESSAGES.CUSTOM_DASHBOARDS_LIMIT_TOOLTIP : ''}
              data-test-id="custom-modal-open"
              buttonProps={{
                onClick: () => handleOpen(),
                color: 'primary',
                disabled: isLoading || !canCreateDashboard || disableCreateDashboards,
                variant: 'contained',
              }}
            >
              New Dashboard
            </LoaderButton>
            {importExportFeatureEnabled && (
              <Button
                onClick={() => handleImportOpen()}
                color="primary"
                disabled={isLoading || !canCreateDashboard}
                variant="contained"
                data-test-id="custom-modal-open"
                className={classes.importButton}
                startIcon={<ImportIcon />}
              >
                Import
              </Button>
            )}
          </>
        )}
        <Dialog
          open={open}
          onClose={handleClose}
          fullWidth={true}
          maxWidth="sm"
          aria-labelledby="dashboard-modal-title"
          aria-describedby="dashboard-modal-description"
          classes={{ paper: disableCreateDashboards ? classes.errorBorder : '' }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Typography id="dashboard-modal-title" className={clsx(classes.spacing, classes.modalTitle)}>
                {disableCreateDashboards ? 'Dashboards Limit Reached' : 'Create Dashboard'}
              </Typography>
              <X onClick={() => handleClose()} className={classes.closeIcon} />
            </Box>
          </DialogTitle>
          <DialogContent>
            {disableCreateDashboards ? (
              MESSAGES.CUSTOM_DASHBOARDS_LIMIT_CREATION
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <TextField
                  required
                  error={isError}
                  helperText={isError ? 'Possible Duplicate Dashboard Name' : ''}
                  id="outlined-required"
                  label="Dashboard name"
                  defaultValue={title}
                  variant="outlined"
                  className={classes.spacing}
                  onChange={onDashboardTitleChange}
                  data-test-id="custom-dashboard-input"
                />
                <TextField
                  id="outlined-required"
                  label="Description (Optional)"
                  defaultValue={description}
                  variant="outlined"
                  multiline
                  rows={3}
                  className={classes.spacing}
                  onChange={onDashdoardDescriptionChange}
                  data-test-id="custom-dashboard-description"
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Autocomplete
                    multiple
                    freeSolo
                    openOnFocus
                    inputValue={inputVal}
                    onInputChange={onInputChange}
                    options={hasOptions ? tagOptions : [`${inputVal}`, ...tagOptions]}
                    ChipProps={{ size: 'small', className: clsx(classes.chips), deleteIcon: <X /> }}
                    renderOption={(props) => (
                      <div class={classes.optionContainer}>
                        <div>{props}</div>
                        {!tagOptions.find((tag) => tag === props) && <div class={classes.newTag}>New Tag</div>}
                      </div>
                    )}
                    onChange={onTagChange}
                    renderInput={(params) => (
                      <TextField {...params} variant="outlined" label="Tags (optional)" margin="none" fullWidth />
                    )}
                    data-test-id="custom-autocomplete-dashboard"
                  />
                </Box>
                <Divider className={classes.spacingDivider} />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Box sx={{ position: 'relative', float: 'right' }}>
              <Button
                onClick={() => handleClose()}
                className={classes.closeModal}
                variant="outlined"
                color="primary"
                data-test-id="custom-cancel"
              >
                Cancel
              </Button>
              <LoaderButton
                buttonProps={{
                  onClick: () => createNewDashboardWrapper(),
                  className: classes.newDashboard,
                  variant: 'contained',
                  color: 'primary',
                  disabled: disableCreateDashboards || dashboardCreationInProgress,
                }}
                showLoader={dashboardCreationInProgress}
                data-test-id="custom-create-dashboard"
              >
                Create Dashboard
              </LoaderButton>
            </Box>
          </DialogActions>
        </Dialog>
        {/* Import Dashboards Dialog */}
        {importDashboardDialogOpen && (
          <ImportDialog
            onClose={handleImportClose}
            importDashboardFromConfig={importDashboardFromConfig}
            onImportComplete={onImportComplete}
          />
        )}
      </Box>
      <Box className={classes.boxMargin}>
        <ToggleButtonGroup
          className={classes.toggleButtonGroup}
          value={layout}
          exclusive
          onChange={toggleButtonOnChange}
          data-test-id="custom-toggle"
        >
          <ToggleButton value="grid">
            <Grid className={clsx(classes.iconSize, classes.iconColor)} />
          </ToggleButton>
          <ToggleButton value="list">
            <List className={clsx(classes.iconSize, classes.iconColor)} />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
};

export default HomeHeader;
