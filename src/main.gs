var cc = DataStudioApp.createCommunityConnector();

/**
 * Get a configuration for the data connector. Here the user can add their account id and API key for interaction with the API.
 */
function getConfig(request) {
  var configParams = request.configParams;
  var config = cc.getConfig();
  var isFirstRequest = configParams === undefined;
  var isSteppedConfig = isFirstRequest;
  config.setIsSteppedConfig(isSteppedConfig);

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
    .setId('datasetType')
    .setName('Dataset')
    .setHelpText('Choose your dataset first.')
    .setIsDynamic(true)
    .addOption(config.newOptionBuilder().setLabel('Market Trends').setValue(TREND))
    .addOption(config.newOptionBuilder().setLabel('Segmented Market Trends').setValue(SEGMENTED_TREND))
    .addOption(config.newOptionBuilder().setLabel('Market Share').setValue(SHARE))
    .addOption(config.newOptionBuilder().setLabel('Segmented Market Share').setValue(SEGMENTED_SHARE))
    .addOption(config.newOptionBuilder().setLabel('Market Share for Groups and Locations').setValue(ALL_SHARE))
    .addOption(config.newOptionBuilder().setLabel('Search Term Detail').setValue(ST_DETAIL))
    .addOption(config.newOptionBuilder().setLabel('Segmented Search Term Detail').setValue(SEGMENTED_ST_DETAIL))
    .addOption(config.newOptionBuilder().setLabel('Search Term Opportunities').setValue(ST_OPPORTUNITIES))
    .addOption(config.newOptionBuilder().setLabel('Top Adverts').setValue(TOP_ADS))
    .addOption(config.newOptionBuilder().setLabel('Google Shopping').setValue(TOP_PLAS))
    .addOption(config.newOptionBuilder().setLabel('Infringements').setValue(INFRINGEMENTS))
    .addOption(config.newOptionBuilder().setLabel('Brand Activator').setValue(BRAND_ACTIVATOR));

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
    endpointOptions.menuOptions.forEach(menuOption => endpoint.addOption(config.newOptionBuilder().setLabel(menuOption.label).setValue(menuOption.virtualEndpoint)));

    if (isSegmentedDataset(configParams.datasetType)) {
      // enable advanced filtering when the user chooses a segmented dataset type and don't let the user remove it
      configParams.isAdvancedFiltering = 'true';
    } else if (endpointOptions.filterOptions.isBasicDataset()) {
      configParams.isAdvancedFiltering = 'false';
    } else {
      config
      .newCheckbox()
      .setId('isAdvancedFiltering')
      .setName('Enable advanced filtering options')
      .setHelpText('If selected, you will be able to add search term groups, competitor groups, search terms and competitor domains to your dataset filters.')
      .setIsDynamic(true);
    }

    addConfigOptions(config, endpointOptions.filterOptions.basic);
    if (configParams.isAdvancedFiltering === 'true') {
      addConfigOptions(config, endpointOptions.filterOptions.advanced);
    }
  }

  config.setDateRangeRequired(true);

  return config.build();
}

function addConfigOptions(config, filterOptions) {
  filterOptions.forEach(filterOption => {
    switch (filterOption.id) {
      case DEVICE:
        config
          .newSelectSingle()
          .setId('device')
          .setName('Device')
          .addOption(config.newOptionBuilder().setLabel('Desktop').setValue('desktop'))
          .addOption(config.newOptionBuilder().setLabel('Mobile').setValue('mobile'))
          .addOption(config.newOptionBuilder().setLabel('Total').setValue('total'))
          .setAllowOverride(true);
        break;
      case AD_TYPE:
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
        break;
      case IS_TOTAL:
        config
          .newSelectSingle()
          .setId('isTotal')
          .setName('Share aggregation type')
          .addOption(config.newOptionBuilder().setLabel('Total').setValue('true'))
          .addOption(config.newOptionBuilder().setLabel('By Device').setValue('false'))
          .setHelpText('Whether to get total market share data or market share aggregated by device.')
          .setAllowOverride(true);
        break;
      case IS_WHOLE_MARKET:
        config
          .newSelectSingle()
          .setId('isWholeMarket')
          .setName('Market Type')
          .addOption(config.newOptionBuilder().setLabel('Whole Market').setValue('true'))
          .addOption(config.newOptionBuilder().setLabel('My Terms').setValue('false'))
          .setAllowOverride(true);
        break;
      case PAGE:
        config
          .newTextInput()
          .setId('page')
          .setName('Page')
          .setHelpText('A zero-based page number. Default: 0')
          .setAllowOverride(true);
        break;
      case PAGE_SIZE:
        config
          .newTextInput()
          .setId('pageSize')
          .setName('Page Size')
          .setHelpText('The page size to request. Default: 50')
          .setAllowOverride(true);
        break;
      case SEARCH_TERM_GROUPS:
        config
          .newTextInput()
          .setId('searchTermGroups')
          .setName('Search Term Groups')
          .setHelpText('A comma-separated list of search term groups.')
          .setAllowOverride(true);
        break;
      case SEARCH_TERMS:
        config
          .newTextInput()
          .setId('searchTerms')
          .setName('Search Terms')
          .setHelpText('A comma-separated list of search terms.')
          .setAllowOverride(true);
        break;
      case COMPETITOR_GROUPS:
        config
          .newTextInput()
          .setId('competitorGroups')
          .setName('Competitor Groups')
          .setHelpText('A comma-separated list of competitor groups.')
          .setAllowOverride(true);
        break;
      case COMPETITORS:
        config
          .newTextInput()
          .setId('competitors')
          .setName('Competitors')
          .setHelpText('A comma-separated list of domains.')
          .setAllowOverride(true);
        break;
      case INFRINGEMENT_RULE_IDS:
        config
          .newTextInput()
          .setId('infringementRuleIds')
          .setName('Infringement Rule IDs')
          .setHelpText('A comma-separated list of infringement rule IDs.')
          .setAllowOverride(true);
        break;
      default:
        cc.newUserError()
          .setDebugText('Unknown filter id: ' + filterOption.id)
          .setText(
            'The connector has encountered an unrecoverable error. Please try again later, or file an issue if this error persists.'
          )
          .throwException();
        break;
    }
  });
}

function getMarketShareFields(isSegmented) {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  if (isSegmented) {
    fields
      .newDimension()
      .setId('searchTermGroup')
      .setName('Search Term Group')
      .setType(types.TEXT);
  }

  fields
    .newDimension()
    .setId('competitor')
    .setName('Competitor')
    .setType(types.TEXT);

  fields
    .newMetric()
    .setId('searchTerms')
    .setName('Search Terms')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('estimatedImpressions')
    .setName('Estimated Impressions')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('averagePosition')
    .setName('Average Position')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('shareOfClicks')
    .setName('Share of Clicks')
    .setType(types.PERCENT);

  fields
    .newMetric()
    .setId('shareOfSpend')
    .setName('Share of Spend')
    .setType(types.PERCENT);

  return fields;
}

function getAllMarketShareFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields
    .newDimension()
    .setId('location')
    .setName('Location')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('searchTermGroup')
    .setName('Search Term Group')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('device')
    .setName('Device')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('adType')
    .setName('Ad Type')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('competitor')
    .setName('Competitor')
    .setType(types.TEXT);

  fields
    .newMetric()
    .setId('estimatedImpressions')
    .setName('Estimated Impressions')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('totalImpressions')
    .setName('Total Impressions')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('shareOfClicks')
    .setName('Share of Clicks')
    .setType(types.PERCENT);

  fields
    .newMetric()
    .setId('shareOfSpend')
    .setName('Share of Spend')
    .setType(types.PERCENT);


  fields
    .newMetric()
    .setId('averagePosition')
    .setName('Average Position')
    .setType(types.NUMBER);

  return fields;
}

function getMarketTrendsFields(isSegmented) {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  if (isSegmented) {
    fields
      .newDimension()
      .setId('searchTermGroup')
      .setName('Search Term Group')
      .setType(types.TEXT);
  }

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

function getSearchTermDetailAndOpportunitiesFields(isSegmented) {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  if (isSegmented) {
    fields
      .newDimension()
      .setId('searchTermGroup')
      .setName('Search Term Group')
      .setType(types.TEXT);
  }

  fields
    .newDimension()
    .setId('searchTerm')
    .setName('Search Term')
    .setType(types.TEXT);

  fields
    .newMetric()
    .setId('competitors')
    .setName('Competitors')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('estimatedImpressions')
    .setName('Estimated Impressions')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('estimatedClicks')
    .setName('Estimated Clicks')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('averagePosition')
    .setName('Average Position')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('topCompetitor')
    .setName('Top Competitor')
    .setType(types.TEXT);

  fields
    .newMetric()
    .setId('minCpc')
    .setName('Min CPC')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('maxCpc')
    .setName('Max CPC')
    .setType(types.NUMBER);

  return fields;
}

function getTopAdsFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields
    .newDimension()
    .setId('adId')
    .setName('Ad ID')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('competitor')
    .setName('Competitor')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('title')
    .setName('Title')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('description')
    .setName('Description')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('displayUrl')
    .setName('Display URL')
    .setType(types.TEXT);

  fields
    .newMetric()
    .setId('estimatedImpressions')
    .setName('Estimated Impressions')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('averagePosition')
    .setName('Average Position')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('bestPosition')
    .setName('Best Position')
    .setType(types.TEXT);

  fields
    .newMetric()
    .setId('searchTerms')
    .setName('Search Terms')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('frequency')
    .setName('Frequency')
    .setType(types.PERCENT);

  fields
    .newMetric()
    .setId('displayLength')
    .setName('Display Length')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('firstSeen')
    .setName('First Seen')
    .setType(types.YEAR_MONTH_DAY);

  fields
    .newDimension()
    .setId('lastSeen')
    .setName('Last Seen')
    .setType(types.YEAR_MONTH_DAY);

  return fields;
}

function getTopPlasFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields
    .newDimension()
    .setId('adId')
    .setName('Ad ID')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('competitor')
    .setName('Competitor')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('title')
    .setName('Title')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('displayText')
    .setName('DisplayText')
    .setType(types.TEXT);

  fields
    .newMetric()
    .setId('frequency')
    .setName('Frequency')
    .setType(types.PERCENT);

  fields
    .newMetric()
    .setId('estimatedImpressions')
    .setName('Estimated Impressions')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('searchTerms')
    .setName('Search Terms')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('price')
    .setName('Price')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('oldPrice')
    .setName('Old Price')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('firstSeen')
    .setName('First Appearance')
    .setType(types.YEAR_MONTH_DAY);

  fields
    .newDimension()
    .setId('lastSeen')
    .setName('Last Appearance')
    .setType(types.YEAR_MONTH_DAY);

  fields
    .newDimension()
    .setId('image')
    .setName('Image')
    .setType(types.URL);

  fields
    .newMetric()
    .setId('displayLength')
    .setName('Appearance Duration')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('tag')
    .setName('Tag')
    .setType(types.TEXT);

  fields
    .newMetric()
    .setId('returnPolicy')
    .setName('Return Policy')
    .setType(types.TEXT);

  fields
    .newMetric()
    .setId('rating')
    .setName('Rating')
    .setType(types.TEXT);

  fields
    .newMetric()
    .setId('badge')
    .setName('Badge')
    .setType(types.TEXT);

  fields
    .newMetric()
    .setId('comparisonShoppingServices')
    .setName('Comparison Shopping Services')
    .setType(types.TEXT);

  fields
    .newMetric()
    .setId('total')
    .setName('Total')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('pageCount')
    .setName('Page Count')
    .setType(types.NUMBER);

  return fields;
}

function getInfringementsFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields
    .newDimension()
    .setId('ruleName')
    .setName('Rule Name')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('infringementId')
    .setName('Infringement ID')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('infringementDateTime')
    .setName('Date & Time')
    .setType(types.YEAR_MONTH_DAY_SECOND);

  fields
    .newDimension()
    .setId('searchTerm')
    .setName('Search Term')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('position')
    .setName('Position')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('competitor')
    .setName('Competitor')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('title')
    .setName('Title')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('description')
    .setName('Description')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('displayUrl')
    .setName('Display URL')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('destinationUrl')
    .setName('Destination URL')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('acClickUrl')
    .setName('Ad Click URL')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('evidenceLink')
    .setName('Evidence Link')
    .setType(types.URL);

  return fields;
}

function getBrandActivatorFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields
    .newDimension()
    .setId('accountId')
    .setName('Account ID')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('keyword')
    .setName('Keyword')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('date')
    .setName('Date')
    .setType(types.YEAR_MONTH_DAY);

  fields
    .newDimension()
    .setId('currency')
    .setName('Currency')
    .setType(types.TEXT);

  fields
    .newMetric()
    .setId('savings')
    .setName('Savings')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('inNegativeList')
    .setName('In Negative List')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('competitorCount')
    .setName('Competitor Count')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('total')
    .setName('Total')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('pageCount')
    .setName('Page Count')
    .setType(types.NUMBER);

  return fields;
}

function getFields(request) {
  var datasetType = request.configParams.datasetType;
  var fields = null;
  switch(datasetType) {
    case TREND:
      fields = getMarketTrendsFields(false);
      break;
    case SEGMENTED_TREND:
      fields = getMarketTrendsFields(true);
      break;
    case SHARE:
      fields = getMarketShareFields(false);
      break;
    case SEGMENTED_SHARE:
      fields = getMarketShareFields(true);
      break;
    case ALL_SHARE:
      fields = getAllMarketShareFields();
      break;
    case ST_DETAIL:
      fields = getSearchTermDetailAndOpportunitiesFields(false);
      break;
    case SEGMENTED_ST_DETAIL:
      fields = getSearchTermDetailAndOpportunitiesFields(true);
      break;
    case ST_OPPORTUNITIES:
      fields = getSearchTermDetailAndOpportunitiesFields(false);
      break;
    case TOP_ADS:
      fields = getTopAdsFields();
      break;
    case TOP_PLAS:
      fields = getTopPlasFields();
      break;
    case INFRINGEMENTS:
      fields = getInfringementsFields();
      break;
    case BRAND_ACTIVATOR:
      fields = getBrandActivatorFields();
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

function validateConfig(configParams) {
  configParams = configParams || {};
  if (!configParams.accountId || isNaN(configParams.accountId)) {
    cc.newUserError().setText('Please specify an Adthena Account ID').throwException();
  }
  if (!configParams.apiKey) {
    cc.newUserError().setText('Please specify an Adthena API Key.').throwException();
  }
  if (!configParams.apiEndpoint) {
    cc.newUserError().setText('Please select an enpoint for your dataset.').throwException();
  }
  if (isSegmentedDataset(configParams.datasetType) && (!configParams.searchTermGroups || configParams.searchTermGroups.split(',').map(v => v.trim()).filter(v => v !== '').length === 0)) {
    cc.newUserError().setText('You have chosen a segmented endpoint. Please add comma-separated search term groups to segment by.').throwException();
  }
  configParams.device = configParams.device || DEFAULTS.device;
  configParams.adType = configParams.adType || DEFAULTS.adType;
  configParams.isWholeMarket = configParams.isWholeMarket || DEFAULTS.isWholeMarket;
  return configParams;
}

// https://developers.google.com/datastudio/connector/reference#getschema
function getSchema(request) {
  validateConfig(request.configParams);
  return {schema: getFields(request).build()};
}

// https://developers.google.com/datastudio/connector/reference#getdata
function getData(request) {
  var requestedFields;
  try {
    requestedFields = getFields(request).forIds(
      request.fields.map(function(field) {
        if (field.forFilterOnly) {
          console.log('For filter only field: ', field.name);
          console.log(JSON.stringify(request.dimensionsFilters));
        }
        return field.name;
      })
    );
  } catch(e) {
    // request.fields is sometimes undefined. Log some more details so we can debug
    console.log('Caught exception trying to get requested fields. Request: ', request);
    throw e;
  }

  try {
    var configParams = validateConfig(request.configParams);
    var accountId = configParams.accountId;
    var apiKey = configParams.apiKey;
    var startDate = request.dateRange.startDate;
    var endDate = request.dateRange.endDate;
    var device = configParams.device;
    var adType = configParams.adType;
    var isWholeMarket = configParams.isWholeMarket;
    var isSegmentedResponse = isSegmentedDataset(configParams.datasetType);
    var searchTermGroupSegments = isSegmentedResponse ? configParams.searchTermGroups.split(',').map(v => v.trim()).filter(v => v !== '') : [configParams.searchTermGroups];
    var data = searchTermGroupSegments.flatMap(function (segment) {
      var endpointWithFilters = getEndpointWithFilters(configParams.apiEndpoint)
        .withAdditionalFilters('device', device)
        .withAdditionalFilters('traffictype', adType)
        .withAdditionalFilters('wholemarket', isWholeMarket)
        .withAdditionalFilters('cg', configParams.competitorGroups)
        .withAdditionalFilters('competitor', configParams.competitors)
        .withAdditionalFilters('kg', segment)
        .withAdditionalFilters('searchterm', configParams.searchTerms)
        .withAdditionalFilters('infringementrule', configParams.infringementRuleIds)
        .withAdditionalFilters('isTotal', configParams.isTotal)
        .withAdditionalFilters('page', configParams.page)
        .withAdditionalFilters('pagesize', configParams.pageSize);
      apiResponse = fetchData(accountId, apiKey, startDate, endDate, endpointWithFilters);
      console.log('Formatting data for requested fields.');
      var dt = getFormattedData(apiResponse, requestedFields, isSegmentedResponse ? SegmentedOption('searchTermGroup', segment) : null);
      console.log('Data format complete. Ready to return.');
      return dt;
    });
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
function fetchData(accountId, apiKey, startDate, endDate, endpointWithFilters) {
  var cache = new DataCache(
    CacheService.getUserCache(),
    accountId,
    startDate,
    endDate,
    endpointWithFilters.endpoint,
    endpointWithFilters.filters
  );
  var apiResponse = null;
  apiResponse = fetchDataFromCache(cache);
  if (!apiResponse) {
    apiResponse = JSON.parse(fetchDataFromApi(accountId, apiKey, startDate, endDate, endpointWithFilters));
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
function fetchDataFromApi(accountId, apiKey, startDate, endDate, endpointWithFilters) {
  if (endpointWithFilters.containsForbiddenFilters()) {
    console.log('Forbidden filters detected: %s. Returning empty Json array. Full filter: %s.', endpointWithFilters.forbiddenFilters.join('; '), endpointWithFilters.filters);
    return '[]';
  }
  var url = [
    'https://api.adthena.com/wizard/',
    accountId,
    '/',
    endpointWithFilters.endpoint,
    '?periodstart=',
    startDate,
    '&periodend=',
    endDate,
    endpointWithFilters.filters ? '&' + endpointWithFilters.filters : '',
    '&platform=looker_studio'
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
    console.log('Cache set successfully.');
  } catch (e) {
    console.log('Error when storing in cache', e);
  }
}

function getMappedData(outer, inner, requestedField, segment) {
  if (segment && segment.fieldName === requestedField) {
    return segment.value;
  }
  switch (requestedField) {
    case 'competitor':
      return outer.Competitor || outer.CompetitorDomain || outer.competitor;
    case 'topCompetitor':
      return outer.TopCompetitor;
    case 'searchTerm':
      return outer.SearchTerm;
    case 'searchTermGroup':
      return outer.GroupName;
    case 'date':
      return transformDate(inner.Date);
    case 'value':
      return inner.Value;
    case 'competitors':
      return outer.Competitors;
    case 'searchTerms':
      return outer.SearchTerms || outer.searchTerms;
    case 'estimatedImpressions':
      return outer.EstimatedImpressions || outer.impressions || outer.Impressions;
    case 'totalImpressions':
      return outer.TotalImpressions;
    case 'estimatedClicks':
      return outer.EstimatedClicks;
    case 'averagePosition':
      return outer.AveragePosition;
    case 'shareOfClicks':
      return handlePercentageResult(outer.ShareOfClicks);
    case 'shareOfSpend':
      return handlePercentageResult(outer.ShareOfSpend);
    case 'minCpc':
      return outer.MinCPC;
    case 'maxCpc':
      return outer.MaxCPC;
    case 'adId':
      return outer.AdId || outer.adId;
    case 'title':
      return outer.Title || outer.title;
    case 'displayText':
      return outer.DisplayText || outer.displayText;
    case 'description':
      return outer.Description;
    case 'displayUrl':
      return outer.DisplayUrl;
    case 'bestPosition':
      return outer.BestPosition;
    case 'frequency':
      return handlePercentageResult(outer.Frequency || outer.frequency);
    case 'marketCoverage':
      return handlePercentageResult(outer.MarketCoverage);
    case 'displayLength':
      return outer.DisplayLength || outer.appearanceDuration || outer.AppearanceDuration;
    case 'firstSeen':
      return transformDate(outer.FirstSeen || outer.FirstAppearance || outer.firstAppearance);
    case 'lastSeen':
      return transformDate(outer.LastSeen || outer.LastAppearance || outer.lastAppearance);
    case 'ruleName':
      return outer.RuleName;
    case 'infringementId':
      return outer.InfringementId;
    case 'infringementDateTime':
      return transformDate(outer.Date) + transformTime(outer.Time);
    case 'position':
      return outer.Position;
    case 'destinationUrl':
      return outer.DestinationUrl;
    case 'adClickUrl':
      return outer.AdClickUrl;
    case 'evidenceLink':
      return outer.EvidenceLink;
    case 'price':
      return outer.price || outer.Price;
    case 'oldPrice':
      return outer.oldPrice || outer.OldPrice;
    case 'image':
      return outer.image || outer.Image;
    case 'location':
      return outer.LocationName;
    case 'device':
      return outer.Device;
    case 'adType':
      return outer.AdType;
    case 'tag':
      return outer.tag || outer.Tag;
    case 'returnPolicy':
      return outer.returnPolicy || outer.ReturnPolicy;
    case 'rating':
      return outer.rating || outer.Rating;
    case 'badge':
      return outer.badge || outer.Badge;
    case 'comparisonShoppingServices':
      return outer.comparisonShoppingServices || outer.ComparisonShoppingServices;
    case 'total':
      return outer.total || outer.Total;
    case 'pageCount':
      var total = outer.total || outer.Total;
      var pageSize = outer.pageSize || outer.PageSize;
      var adjustment = total % pageSize == 0 ? 0 : 1;
      return Math.floor(total / pageSize) + adjustment;
    case 'accountId':
      return outer.AccountId;
    case 'keyword':
      return outer.Keyword;
    case 'currency':
      return outer.Currency;
    case 'savings':
      return outer.Savings;
    case 'inNegativeList':
      return outer.InNegativeList;
    case 'competitorCount': // can be merged with competitors above.
      return outer.CompetitorCount;
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
 * @param {Object} segment An optional segment option to put to the final formatted data.
 * @returns {Array} Array containing rows of data in key-value pairs for each
 *     field.
 */
function getFormattedData(response, requestedFields, segment) {
  // get the field IDs and use them in getMappedData, because getId() is very expensive.
  var fields = requestedFields.asArray().map(f => f.getId());
  var data = response;
  var metaData = {};
  if (response.data) {
    // new paged responses will be objects with a data field. Otherwise it's an array and we can flat map the actual response.
    data = response.data;
    // if it's a new paged response, keep everything except the data as metadata.
    metaData = (({ data, ...object }) => object)(response);
  } else if (response.Data) {
    // new paged responses will be objects with a data field. Otherwise it's an array and we can flat map the actual response.
    data = response.Data;
    // if it's a new paged response, keep everything except the data as metadata.
    metaData = (({ Data, ...object }) => object)(response);
  }
  return data.flatMap(function(comp) {
    var outer = {...comp, ...metaData};
    if (outer.Data) {
      return outer.Data.map(
        function(point) {
          row = fields.map(requestedField => getMappedData(outer, point, requestedField, segment));
          return { values: row };
        });
    } else {
      return [{ values: fields.map(requestedField => getMappedData(outer, outer, requestedField, segment)) }];
    }
  });
}

// https://developers.google.com/datastudio/connector/reference#isadminuser
function isAdminUser() {
  return false;
}
