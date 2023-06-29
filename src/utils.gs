function transformDate(date) {
  return date.replaceAll('-', '');
}

function transformTime(time) {
  return time.replaceAll(':', '');
}

/**
 * Parses a date in DD-MM-YYYY format. This is account dependent and
 * is waiting for a fix in the API to make it consistent regardless of account settings.
 */
function transformInfringementDate(date) {
  return date.split('-').reverse().join('');
}

function handlePercentageResult(percentage) {
  return isNaN(percentage) ? percentageStringToNumeric(percentage) : percentage;
}

function percentageStringToNumeric(percentage) {
  return parseFloat(percentage) / 100;
}
