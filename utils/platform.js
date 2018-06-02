import { Platform } from 'react-native';
import packageInfo from '../package';

const os = Platform.OS === 'ios' ? 'iOS' : 'Android';

export default {
    os,
    browser: 'App',
    environment: `App ${process.env.NODE_ENV === 'development' ? '开发版' : packageInfo.version} on ${os} ${Platform.Version}`,
};

