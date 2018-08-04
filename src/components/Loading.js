import React, { Component } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { Spinner } from 'native-base';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const {
    width: ScreenWidth,
    height: ScreenHeight,
} = Dimensions.get('window');

class Loading extends Component {
    static propTypes = {
        loading: PropTypes.string,
    }
    render() {
        const { loading } = this.props;
        if (!loading) {
            return null;
        }

        return (
            <View style={styles.loadingView}>
                <View style={styles.loadingBox}>
                    <Spinner color="white" />
                    <Text style={styles.loadingText}>{loading}</Text>
                </View>
            </View>
        );
    }
}

export default connect(state => ({
    loading: state.getIn(['ui', 'loading']),
}))(Loading);

const styles = StyleSheet.create({
    loadingView: {
        width: ScreenWidth,
        height: ScreenHeight,
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingBox: {
        width: 120,
        height: 120,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 10,
        alignItems: 'center',
    },
    loadingText: {
        color: 'white',
    },
});
