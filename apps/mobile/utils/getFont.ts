type CircularFont =
  | 'Black'
  | 'BlackItalic'
  | 'Bold'
  | 'BoldItalic'
  | 'Book'
  | 'BookItalic'
  | 'Medium'
  | 'MediumItalic';

// expand on this if we add more kinds of CooperBT
// type CooperFont = 'Light';

export function getCircular(font: CircularFont) {
  switch (font) {
    case 'Black':
      return {fontFamily: 'CircularStd-Black'};
    case 'BlackItalic':
      return {fontFamily: 'CircularStd-BlackItalic'};
    case 'Bold':
      return {fontFamily: 'CircularStd-Bold'};
    case 'BoldItalic':
      return {fontFamily: 'CircularStd-BoldItalic'};
    case 'Book':
      return {fontFamily: 'CircularStd-Book'};
    case 'BookItalic':
      return {fontFamily: 'CircularStd-BookItalic'};
    case 'Medium':
      return {fontFamily: 'CircularStd-Medium'};
    case 'MediumItalic':
      return {fontFamily: 'CircularStd-MediumItalic'};
    default:
      return {fontFamily: 'CircularStd-Book'};
  }
}

export function getCooper() {
  return {fontFamily: 'CooperBT-Light'};
}
