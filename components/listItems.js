import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InfoIcon from '@mui/icons-material/Info';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import GitHubIcon from '@mui/icons-material/GitHub';
import GavelIcon from '@mui/icons-material/Gavel';


export const mainListItems = (
  <React.Fragment>
    <ListItemButton>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <CloudDownloadIcon />
      </ListItemIcon>
      <ListItemText primary="Downloads" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <InfoIcon />
      </ListItemIcon>
      <ListItemText primary="About" />
    </ListItemButton>
  </React.Fragment>
);

export const secondaryListItems = (
  <React.Fragment>
    <ListSubheader component="div" inset>
      External Resources
    </ListSubheader>
    <ListItemButton>
      <ListItemIcon>
        <GavelIcon />
      </ListItemIcon>
      <ListItemText primary="ECI" />
    </ListItemButton>

    <ListItemButton>
      <ListItemIcon>
        <GitHubIcon />
      </ListItemIcon>
      <ListItemText primary="Source Code" />
    </ListItemButton>

  </React.Fragment>
);
