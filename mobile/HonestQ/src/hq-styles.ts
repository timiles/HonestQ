import { StyleProp, StyleSheet, TextStyle } from 'react-native';

const flexRow: StyleProp<TextStyle> = {
  flexDirection: 'row',
};
const mb1: StyleProp<TextStyle> = {
  marginBottom: 10,
};
const mh1: StyleProp<TextStyle> = {
  marginHorizontal: 10,
};
const ml1: StyleProp<TextStyle> = {
  marginLeft: 10,
};
const mr1: StyleProp<TextStyle> = {
  marginRight: 10,
};
const mt3: StyleProp<TextStyle> = {
  marginTop: 30,
};
export default StyleSheet.create({ flexRow, mb1, mh1, ml1, mr1, mt3 });
