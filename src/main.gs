var cc = DataStudioApp.createCommunityConnector();

const TREND = 'trend';
const SHARE = 'share';
const TREND_OPTIONS = [
  ['Share of Clicks', 'share-of-clicks-trend'],
  ['Share of Spend', 'share-of-spend-trend'],
  ['Share of Impressions', 'impression-share-trend'],
  ['Average Position', 'average-position-trend'],
  ['Average CPC', 'average-cpc-trend']
];
const SHARE_OPTIONS = [
  ['Market Share', 'market-share']
];

function getOptionsForDatasetType(datasetType) {
  switch (datasetType) {
    case SHARE:
      return SHARE_OPTIONS;
    case TREND:
      return TREND_OPTIONS;
    default:
      cc.newUserError()
        .setText('Please choose a valid dataset type.')
        .throwException();
  }
}

/**
 * Get a configuration for the data connector. Here the user can add their account id and API key for interaction with the API.
 */
function getConfig(request) {
  var configParams = request.configParams;
  var config = cc.getConfig();
  var isFirstRequest = configParams === undefined;
  if (isFirstRequest) {
    config.setIsSteppedConfig(true);
  }

  config
    .newInfo()
    .setId('instructions')
    .setText(
      'Please complete all of the fields below. This connector allows you to add a single dataset into your report. If you need to add multiple datasets into the same report, use the Add Data functionality and include as many instances of the Adthena data connector as you need.'
    );

  config
    .newTextInput()
    .setId('accountId')
    .setName('Account ID')
    .setPlaceholder('1234')
    .setHelpText('Your Adthena Account ID.');

  config
    .newTextInput()
    .setId('apiKey')
    .setName('API key.')
    .setPlaceholder('your-api-key')
    .setHelpText('Your Adthena API Key');

  config
    .newSelectSingle()
    .setId('device')
    .setName('Device')
    .addOption(config.newOptionBuilder().setLabel('Desktop').setValue('desktop'))
    .addOption(config.newOptionBuilder().setLabel('Mobile').setValue('mobile'))
    .addOption(config.newOptionBuilder().setLabel('Total').setValue('total'))
    .setAllowOverride(true);

  config
    .newSelectSingle()
    .setId('adType')
    .setName('Ad Type')
    .addOption(config.newOptionBuilder().setLabel('Text Ad').setValue('paid'))
    .addOption(config.newOptionBuilder().setLabel('PLA').setValue('pla'))
    .addOption(config.newOptionBuilder().setLabel('PLA + Text Ad').setValue('totalpaid'))
    .addOption(config.newOptionBuilder().setLabel('Organic').setValue('organic'))
    .addOption(config.newOptionBuilder().setLabel('Total').setValue('total'))
    .setAllowOverride(true);

  config
    .newSelectSingle()
    .setId('isWholeMarket')
    .setName('Market Type')
    .addOption(config.newOptionBuilder().setLabel('Whole Market').setValue('true'))
    .addOption(config.newOptionBuilder().setLabel('My Terms').setValue('false'))
    .setAllowOverride(true);

  // choose the dataset type and enpoint at the very end
  config
    .newSelectSingle()
    .setId('datasetType')
    .setName('Dataset')
    .setHelpText('Choose your dataset first. Market Trends provides trending data across time. Market Share provides aggregated results over time.')
    .setIsDynamic(true)
    .addOption(config.newOptionBuilder().setLabel('Market Trends').setValue(TREND))
    .addOption(config.newOptionBuilder().setLabel('Market Share').setValue(SHARE));

  if (!isFirstRequest) {
    if (configParams.datasetType === undefined) {
      cc.newUserError().setText('Please choose a dataset type first.').throwException();
    }
    var endpoint = config
      .newSelectSingle()
      .setId('apiEndpoint')
      .setName('API Endpoint')
      .setHelpText('The API endpoint gives you a choice of what data to pull into your report.');
    var endpointOptions = getOptionsForDatasetType(configParams.datasetType);
    endpointOptions.forEach(labelAndValue => endpoint.addOption(config.newOptionBuilder().setLabel(labelAndValue[0]).setValue(labelAndValue[1])));
  }

  config.setDateRangeRequired(true);

  return config.build();
}

function getMarketShareFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields
    .newDimension()
    .setId('competitor')
    .setName('Competitor')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('searchTerms')
    .setName('Search Terms')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('estimatedImpressions')
    .setName('Estimated Impressions')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('averagePosition')
    .setName('Average Position')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('shareOfClicks')
    .setName('Share of Clicks')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('shareOfSpend')
    .setName('Share of Spend')
    .setType(types.NUMBER);

  return fields;
}

function getMarketTrendsFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields
    .newDimension()
    .setId('competitor')
    .setName('Competitor')
    .setType(types.TEXT);

  var date = fields
    .newDimension()
    .setId('date')
    .setName('Date')
    .setType(types.YEAR_MONTH_DAY);

  var value = fields
    .newMetric()
    .setId('value')
    .setName('Value')
    .setType(types.NUMBER);

  fields.setDefaultMetric(value.getId());
  fields.setDefaultDimension(date.getId());

  return fields;
}

function getFields(request) {
  var datasetType = request.configParams.datasetType;
  var fields = null;
  switch(datasetType) {
    case TREND:
      fields = getMarketTrendsFields();
      break;
    case SHARE:
      fields = getMarketShareFields();
      break;
    default:
      cc.newUserError()
      .setDebugText('Unknown dataset type: ' + datasetType)
      .setText(
        'The connector has encountered an unrecoverable error. Please try again later, or file an issue if this error persists.'
      )
      .throwException();
  }
  return fields;
}

// https://developers.google.com/datastudio/connector/reference#getschema
function getSchema(request) {
  return {schema: getFields(request).build()};
}

// https://developers.google.com/datastudio/connector/reference#getdata
function getData(request) {
  var requestedFields = getFields(request).forIds(
    request.fields.map(function(field) {
      return field.name;
    })
  );

  try {
    var accountId = request.configParams.accountId;
    var apiKey = request.configParams.apiKey;
    var startDate = request.dateRange.startDate;
    var endDate = request.dateRange.endDate;
    var device = request.configParams.device;
    var adType = request.configParams.adType;
    var isWholeMarket = request.configParams.isWholeMarket;
    var apiEndpoint = request.configParams.apiEndpoint;
    apiResponse = fetchData(accountId, apiKey, startDate, endDate, apiEndpoint, device, adType, isWholeMarket);
    var data = getFormattedData(apiResponse, requestedFields);
  } catch (e) {
    cc.newUserError()
      .setDebugText('Error fetching data from API. Exception details: ' + e)
      .setText(
        'The connector has encountered an unrecoverable error. Please try again later, or file an issue if this error persists. Error fetching data from API. Exception details: ' + e
      )
      .throwException();
  }

  var result = {
    schema: requestedFields.build(),
    rows: data
  };

  return result;
}

/**
 * Fetch the data from the Adthena API. First check if it's available in the cache and then fall back to the API.
 */
function fetchData(accountId, apiKey, startDate, endDate, trendPath, device, adType, isWholeMarket) {
  var cache = new DataCache(
    CacheService.getUserCache(),
    accountId,
    startDate,
    endDate,
    trendPath,
    device,
    adType,
    isWholeMarket
  );
  var apiResponse = null;
  apiResponse = fetchDataFromCache(cache);
  if (!apiResponse) {
    apiResponse = JSON.parse(fetchDataFromApi(accountId, apiKey, startDate, endDate, trendPath, device, adType, isWholeMarket));
    setInCache(apiResponse, cache);
  }
  return apiResponse;
}

/**
 * Gets response from the API using UrlFetchApp.
 *
 * @param {Object} request Data request parameters.
 * @returns {string} Response text for UrlFetchApp.
 */
function fetchDataFromApi(accountId, apiKey, startDate, endDate, apiPath, device, adType, isWholeMarket) {
  var url = [
    'https://api.adthena.com/wizard/',
    accountId,
    '/',
    apiPath,
    '/all?periodstart=',
    startDate,
    '&periodend=',
    endDate,
    '&device=',
    device,
    '&traffictype=',
    adType,
    '&wholemarket=',
    isWholeMarket
  ].join('');
  var options = {
    'method': 'GET',
    'headers': {
      'adthena-api-key': apiKey,
      'accept': 'application/json'
    }
  };
  return UrlFetchApp.fetch(url, options);
}

function fetchDataFromCache(cache) {
  var response = null;
  console.log('Trying to fetch from cache...');
  try {
    var responseString = cache.get();
    response = JSON.parse(responseString);
    console.log('Fetched succesfully from cache. Length', response.length);
  } catch (e) {
    console.log('Error when fetching from cache:', e);
  }

  return response;
}

function setInCache(apiResponse, cache) {
  console.log('Setting data to cache...');
  try {
    cache.set(JSON.stringify(apiResponse));
  } catch (e) {
    console.log('Error when storing in cache', e);
  }
}

function getMappedData(outer, inner, requestedField) {
  switch (requestedField.getId()) {
    case 'competitor':
      return outer.Competitor;
    case 'date':
      return inner.Date.replaceAll('-', '');
    case 'value':
      return inner.Value;
    case 'searchTerms':
      return outer.SearchTerms;
    case 'estimatedImpressions':
      return outer.EstimatedImpressions;
    case 'averagePosition':
      return outer.AveragePosition;
    case 'shareOfClicks':
      return parseFloat(outer.ShareOfClicks) / 100;
    case 'shareOfSpend':
      return parseFloat(outer.ShareOfSpend) / 100;
    default:
      return '';
  }
}

/**
 * Formats the parsed response from external data source into correct tabular
 * format and returns only the requestedFields
 *
 * @param {Object} responseString The response string from external data source.
 * @param {Array} requestedFields The fields requested in the getData request.
 * @returns {Array} Array containing rows of data in key-value pairs for each
 *     field.
 */
function getFormattedData(response, requestedFields) {
  var fields = requestedFields.asArray();
  return response.flatMap(function(comp) {
    if (comp.Data) {
      return comp.Data.map(
        function(point) {
          row = fields.map(requestedField => getMappedData(comp, point, requestedField));
          return { values: row};
        });
    } else {
      return [{ values: fields.map(requestedField => getMappedData(comp, comp, requestedField)) }];
    }
  });
}

// https://developers.google.com/datastudio/connector/reference#isadminuser
function isAdminUser() {
  return false;
}
