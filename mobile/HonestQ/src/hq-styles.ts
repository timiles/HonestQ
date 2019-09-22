import Constants from 'expo-constants';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

// tslint:disable:no-object-literal-type-assertion
export default StyleSheet.create({
  center: {
    justifyContent: 'center',
  } as ViewStyle,

  error: {
    color: 'red',
  } as TextStyle,

  fillSpace: {
    flexGrow: 1,
    flexShrink: 1,
  } as ViewStyle,

  icon: {
    alignItems: 'center',
    width: 25,
  } as ViewStyle,

  m1: {
    margin: 10,
  } as ViewStyle,

  mb1: {
    marginBottom: 10,
  } as ViewStyle,

  ml1: {
    marginLeft: 10,
  } as ViewStyle,

  mr1: {
    marginRight: 10,
  } as ViewStyle,

  mr2: {
    marginRight: 20,
  } as ViewStyle,

  mt1: {
    marginTop: 10,
  } as ViewStyle,

  mt2: {
    marginTop: 20,
  } as ViewStyle,

  mt3: {
    marginTop: 30,
  } as ViewStyle,

  mx1: {
    marginHorizontal: 10,
  } as ViewStyle,

  my1: {
    marginVertical: 10,
  } as ViewStyle,

  p1: {
    padding: 10,
  } as ViewStyle,

  p3: {
    padding: 30,
  } as ViewStyle,

  pl3: {
    paddingLeft: 30,
  } as ViewStyle,

  pr1: {
    paddingRight: 10,
  } as ViewStyle,

  pt0: {
    paddingTop: 0,
  } as ViewStyle,

  py1: {
    paddingVertical: 10,
  } as ViewStyle,

  primaryButtonText: {
    color: '#fff',
    textAlignVertical: 'center',
  } as TextStyle,

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  rowAlignStart: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  } as ViewStyle,

  rowAlignEnd: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  } as ViewStyle,

  rowJustifySpace: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,

  small: {
    fontSize: 11,
  } as TextStyle,

  statusBarMargin: {
    marginTop: Constants.statusBarHeight,
  } as ViewStyle,

  textAlignCenter: {
    textAlign: 'center',
  } as TextStyle,

  vAlignCenter: {
    textAlignVertical: 'center',
  } as TextStyle,
});
