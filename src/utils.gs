function transformDate(date) {
  if (/^([0-9]{4}-[0-9]{2}-[0-9]{2})$/) {
    return _transformCommonDate(date);
  } else if (/^([0-9]{2}-[0-9]{2}-[0-9]{4})$/) {
    return _transformInfringementDate(date);
  } else {
    console.log('Unsupported date format detected: %s', date);
    return null;
  }
}

function _transformCommonDate(date) {
  return date.replaceAll('-', '');
}

function transformTime(time) {
  return time.replaceAll(':', '');
}

/**
 * Parses a date in DD-MM-YYYY format. This is account dependent and
 * is waiting for a fix in the API to make it consistent regardless of account settings.
 */
function _transformInfringementDate(date) {
  return date.split('-').reverse().join('');
}

function handlePercentageResult(percentage) {
  return fastIsNaN(percentage) ? percentageStringToNumeric(percentage) : percentage;
}

/**
 * The built-in isNaN is very slow. This is a much faster implementation.
 */
function fastIsNaN(value) {
  return !(value <= 0) && !(value > 0);
}

function percentageStringToNumeric(percentage) {
  return parseFloat(percentage) / 100;
}

function getYesterday() {
  const tmp = new Date();
  return new Date(tmp.setDate(tmp.getDate() - 1));
}
