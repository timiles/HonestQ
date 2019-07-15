import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

// tslint:disable:no-object-literal-type-assertion
export default StyleSheet.create({
  center: {
    justifyContent: 'center',
  } as ViewStyle,

  error: {
    color: 'red',
  } as TextStyle,

  flexRow: {
    flexDirection: 'row',
  } as ViewStyle,

  flexRowPullRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  } as ViewStyle,

  icon: {
    alignItems: 'center',
    width: 25,
  } as ViewStyle,

  mb1: {
    marginBottom: 10,
  } as ViewStyle,

  mh1: {
    marginHorizontal: 10,
  } as ViewStyle,

  ml1: {
    marginLeft: 10,
  } as ViewStyle,

  mr1: {
    marginRight: 10,
  } as ViewStyle,

  mt3: {
    marginTop: 30,
  } as ViewStyle,

  p1: {
    padding: 10,
  } as ViewStyle,

  pr1: {
    paddingRight: 10,
  } as ViewStyle,

  primaryButtonText: {
    color: '#fff',
    textAlignVertical: 'center',
  } as TextStyle,

  small: {
    fontSize: 11,
  } as TextStyle,

  vAlignCenter: {
    textAlignVertical: 'center',
  } as TextStyle,
});
