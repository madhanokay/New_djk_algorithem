import React from 'react';
import HomeGridItem from './HomeGridItem';
import HomeListItem from './HomeListItem';

const HomeContent = ({
  data,
  layout,
  handleHeart,
  deleteDashboard,
  duplicateDashboard,
  exportDashboard,
  viewDashboard,
  editDashboard,
  index,
  searchValue,
  show,
  dashboardsSelectedForExports,
  handleDashboardSelectionForExports,
  disableCreateDashboards,
}) => {
  if (layout === 'list') {
    return (
      show &&
      data.name.toLowerCase().includes(searchValue) && (
        <HomeListItem
          data={data}
          handleHeart={handleHeart}
          deleteDashboard={deleteDashboard}
          duplicateDashboard={duplicateDashboard}
          exportDashboard={exportDashboard}
          viewDashboard={viewDashboard}
          editDashboard={editDashboard}
          disableCreateDashboards={disableCreateDashboards}
          index={index}
          dashboardsSelectedForExports={dashboardsSelectedForExports}
          handleDashboardSelectionForExports={handleDashboardSelectionForExports}
        />
      )
    );
  }
  if (layout === 'grid') {
    return (
      show &&
      data.name.toLowerCase().includes(searchValue) && (
        <HomeGridItem
          data={data}
          handleHeart={handleHeart}
          deleteDashboard={deleteDashboard}
          duplicateDashboard={duplicateDashboard}
          exportDashboard={exportDashboard}
          viewDashboard={viewDashboard}
          editDashboard={editDashboard}
          disableCreateDashboards={disableCreateDashboards}
          index={index}
          dashboardsSelectedForExports={dashboardsSelectedForExports}
          handleDashboardSelectionForExports={handleDashboardSelectionForExports}
        />
      )
    );
  }
};

export default HomeContent;
