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
import Link from '@mui/material/Link';
import { Link as RouterLink, MemoryRouter } from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server';
import PropTypes from 'prop-types';

// https://mui.com/material-ui/integrations/routing/#link
// FIXME: not working for somne reason
function Router(props) {
  const { children } = props;
  if (typeof window === 'undefined') {
    return <StaticRouter location="/">{children}</StaticRouter>;
  }

  return <MemoryRouter>{children}</MemoryRouter>;
}
Router.propTypes = {
  children: PropTypes.node,
};

export const mainListItems = (
  <Router>
    <Link href="/" underline="hover" color="inherit"><ListItemButton>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItemButton></Link>
    <Link href="/rawdata" underline="hover" color="inherit"><ListItemButton>
      <ListItemIcon>
        <CloudDownloadIcon />
      </ListItemIcon>
      <ListItemText primary="Downloads" />
    </ListItemButton></Link>
    <Link href="/about" underline="hover" color="inherit"><ListItemButton>
      <ListItemIcon>
        <InfoIcon />
      </ListItemIcon>
      <ListItemText primary="About" />
    </ListItemButton></Link>
  </Router>
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
