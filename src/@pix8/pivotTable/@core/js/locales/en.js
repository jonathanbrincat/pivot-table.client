import { aggregators } from '../aggregators'

const locales = {
  en: {
    aggregators,
    localeStrings: {
      renderError: 'An error occurred rendering the PivotTable results.',
      computeError: 'An error occurred computing the PivotTable results.',
      uiRenderError: 'An error occurred rendering the PivotTable UI.',
      selectAll: 'Select All',
      selectNone: 'Select None',
      tooMany: '(too many to list)',
      filterResults: 'Filter values',
      apply: 'Apply',
      cancel: 'Cancel',
      totals: 'Totals',
      vs: 'vs',
      by: 'by',
    },
  },
}

// dateFormat deriver l10n requires month and day names to be passed in directly
const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',];
const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const zeroPad = number => `0${number}`.substr(-2, 2); // eslint-disable-line no-magic-numbers

const derivers = {
  bin(col, binWidth) {
    return record => record[col] - (record[col] % binWidth);
  },
  dateFormat(
    col,
    formatString,
    utcOutput = false,
    mthNames = monthNamesEn,
    dayNames = dayNamesEn
  ) {
    const utc = utcOutput ? 'UTC' : '';
    return function(record) {
      const date = new Date(Date.parse(record[col]));
      if (isNaN(date)) {
        return '';
      }
      return formatString.replace(/%(.)/g, function(m, p) {
        switch (p) {
          case 'y':
            return date[`get${utc}FullYear`]();
          case 'm':
            return zeroPad(date[`get${utc}Month`]() + 1);
          case 'n':
            return mthNames[date[`get${utc}Month`]()];
          case 'd':
            return zeroPad(date[`get${utc}Date`]());
          case 'w':
            return dayNames[date[`get${utc}Day`]()];
          case 'x':
            return date[`get${utc}Day`]();
          case 'H':
            return zeroPad(date[`get${utc}Hours`]());
          case 'M':
            return zeroPad(date[`get${utc}Minutes`]());
          case 'S':
            return zeroPad(date[`get${utc}Seconds`]());
          default:
            return `%${p}`;
        }
      });
    };
  },
};

export {
  locales,
  derivers,
}
