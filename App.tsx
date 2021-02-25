/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Provider } from 'react-redux';
import { MenuProvider } from 'react-native-popup-menu';
import App from './src/App';
import store from './src/state/store';

export default function Main(props: any) {
    return (
        <Provider store={store}>
            <MenuProvider>
                <App {...props} />
            </MenuProvider>
        </Provider>
    );
};
