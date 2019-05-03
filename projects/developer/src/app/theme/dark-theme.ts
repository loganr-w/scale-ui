import { Theme } from './symbols';
import { environment } from '../../environments/environment';

export const darkTheme: Theme = {
    name: 'dark',
    properties: {
        '--background': 'linear-gradient(to bottom, #363636, #171717)',
        '--main-text': '#e3e3e3',
        '--main-hover': '#475359',
        '--panel-background': '#22292E',
        '--checkbox': '#6e7179',
        '--teal': '#2AC992',
        '--aqua': '#0FA3BD',
        '--light-blue': '#1bbcd8',
        '--purple': '#7f53d1',
        '--pink': '#E73C70',
        '--green': '#529D39',
        '--orange': '#e46f21',
        '--red': '#DC2A2A',
        '--yellow': '#FFC505',
        '--off-white': '#ccc',
        '--white': '#FFFFFF',
        '--grey-98': '#f3f3f3',
        '--grey-95': '#ededed',
        '--grey-90': '#e3e3e3',
        '--grey-85': '#d9d9d9',
        '--grey-80': '#cccccc',
        '--grey-75': '#c0c0c0',
        '--grey-70': '#b0b0b0',
        '--grey-60': '#999999',
        '--grey-50': '#808080',
        '--grey-45': '#727272',
        '--grey-40': '#696969',
        '--grey-30': '#4d4d4d',
        '--grey-20': '#363636',
        '--grey-15': '#222222',
        '--grey-10': '#171717',
        '--black': '#000000',
        '--scale-primary': environment.primaryColor,
        '--scale-secondary-light': environment.secondaryLightColor,
        '--scale-secondary-dark': environment.secondaryDarkColor,
        '--navbar-dark': '#22292E',
        '--navbar-light': '#2E3F50',
        '--navbar-text': '#fff',
        '--navbar-background': '#29333d',
        '--subnav-dark': '#0173bf',
        '--subnav-light': '#0185dd',
        '--status-good': '#529D39',
        '--status-error': '#be292e',
        '--status-warn': '#FF4500',
        '--status-unknown': '#808080',
        '--status-completed': '#017cce',
        '--status-failed': '#DC2A2A',
        '--status-pending': '#e46f21',
        '--status-queued': '#FFC505',
        '--status-running': '#529D39',
        '--status-blocked': '#1bbcd8',
        '--status-canceled': '#fff',
        '--status-data': '#F22613',
        '--status-algorithm': '#be292e',
        '--status-system': '#912125',
        '--status-offered': '#808080',
        '--status-free': '#0e0bb6',
        '--status-unavailable': '#c0c0c0',
        '--label-text': '#fff',
        '--label-text-default': '#777',
        '--label-text-default-hover': '#5e5e5e',
        '--label-text-primary': '#337ab7',
        '--label-text-primary-hover': '#286090',
        '--label-text-success': '#337ab7',
        '--label-text-success-hover': '#286090',
        '--label-text-info': '#5bc0de',
        '--label-text-info-hover': '#31b0d5',
        '--label-text-warning': '#FF4500',
        '--label-text-warning-hover': '#da3a00',
        '--label-text-danger': '#be292e',
        '--label-text-danger-hover': '#a02226',
        '--label-degraded': '#7c787e',
        '--label-deprecated': '#c97459',
        '--label-image-pull': '#c96dc1',
        '--label-initial-cleanup': '#6c31c9',
        '--label-offline': '#aaa',
        '--label-paused': '#0FA3BD',
        '--label-ready': '#2AC992',
        '--label-scheduler-stopped': '#be292e',
        '--table-striped-even': '#303b41',
        '--table-striped-odd': '#1f1f1f',
        '--recipe-container-background': '#303b41',
        '--recipe-container-border': '#626262',
        '--recipe-connection-background': '#444',
        '--pre-background': '#303b41',
        '--pre-border': '#777',
        '--pre-on': '#f5f5f5',
        '--panel-header-hover': '#333',
        '--panel-content-hover': '#3d4952'
    }
};
