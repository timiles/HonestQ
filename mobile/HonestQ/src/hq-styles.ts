import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

// tslint:disable:no-object-literal-type-assertion
export default StyleSheet.create({
  error: {
    color: 'red',
  } as TextStyle,

  flexRow: {
    flexDirection: 'row',
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

  small: {
    fontSize: 11,
  } as TextStyle,

  vAlignCenter: {
    textAlignVertical: 'center',
  } as TextStyle,
});
