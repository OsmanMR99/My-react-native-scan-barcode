'use strict';

import React, { Component } from 'react';
import { requireNativeComponent, PermissionsAndroid, View, Text, Platform } from 'react-native';
import PropTypes from 'prop-types';
import Viewfinder from './Viewfinder';

class BarcodeScannerView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthorized: false,
      isAuthorizationChecked: false
    }
    this.disableScan = false;
  }

  componentDidMount() {
    if (Platform.OS === 'android' && !this.state.isAuthorizationChecked && !this.state.isAuthorized) {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
        title: this.props.permissionDialogTitle,
        message: this.props.permissionDialogMessage,
      }).then(granted => {
        const isAuthorized =
          Platform.Version >= 23
            ? granted === PermissionsAndroid.RESULTS.GRANTED
            : granted === true;
        this.setState({ isAuthorized, isAuthorizationChecked: true });
      });
    }
  }

  onChange = (event) => {
    if (!this.props.onBarCodeRead) return;
    if (event && event.nativeEvent && event.nativeEvent.data) {
      const { type, data } = event.nativeEvent;
      if (!this.disableScan) {
        this.disableScan = true;
        setTimeout(() => {
          this.props.onBarCodeRead({ type, data });
          this.disableScan = false;
        }, this.props.reactivateTimeout);
      }
    }
  }

  render() {
    const { isAuthorizationChecked, isAuthorized } = this.state;
    const {
      notAuthorizedView, pendingAuthorizationView,
      viewFinderBackgroundColor, viewFinderBorderColor, viewFinderBorderWidth,
      viewFinderBorderLength, viewFinderHeight, viewFinderShowLoadingIndicator,
      viewFinderWidth, customMarker
    } = this.props;
    if (isAuthorized) {
      let viewFinder = this.props.showViewFinder ? (
        <Viewfinder
          backgroundColor={viewFinderBackgroundColor}
          color={viewFinderBorderColor}
          borderWidth={viewFinderBorderWidth}
          borderLength={viewFinderBorderLength}
          height={viewFinderHeight}
          isLoading={viewFinderShowLoadingIndicator}
          width={viewFinderWidth}
        />
      ) : null;

      return (
        <RNBarcodeScannerView {...this.props} onChange={this.onChange}>
          <View style={this.props.style} collapsable={false}>
            {customMarker || viewFinder}
            {this.props.children}
          </View>
        </RNBarcodeScannerView>
      );
    } else if (!isAuthorizationChecked) {
      return pendingAuthorizationView;
    } else {
      return notAuthorizedView;
    }
  }
}

BarcodeScannerView.propTypes = {
  ...View.propTypes,
  cameraType: PropTypes.string,
  onBarCodeRead: PropTypes.func,
  showLoadingIndicator: PropTypes.bool,
  showViewFinder: PropTypes.bool,
  torchMode: PropTypes.string,
  viewFinderBackgroundColor: PropTypes.string,
  viewFinderBorderColor: PropTypes.string,
  viewFinderBorderWidth: PropTypes.number,
  viewFinderBorderLength: PropTypes.number,
  viewFinderShowLoadingIndicator: PropTypes.bool,
};

BarcodeScannerView.defaultProps = {
  reactivateTimeout: 800,
  showViewFinder: true,
  cameraType: 'back',
  notAuthorizedView: (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          textAlign: 'center',
          fontSize: 16,
        }}
      >
        Camera not authorized
        </Text>
    </View>
  ),
  pendingAuthorizationView: (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          textAlign: 'center',
          fontSize: 16,
        }}
      >
        ...
        </Text>
    </View>
  ),
};

const RNBarcodeScannerView = requireNativeComponent('RNBarcodeScannerView', BarcodeScannerView, {
  nativeOnly: { onChange: true }
});

module.exports = BarcodeScannerView;
