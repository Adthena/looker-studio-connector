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
    .addOption(config.newOptionBuilder().setLabel('Market Trends').setValue(TREND_V2))
    .addOption(config.newOptionBuilder().setLabel('Segmented Market Trends').setValue(SEGMENTED_TREND_V2))
    .addOption(config.newOptionBuilder().setLabel('Market Share').setValue(SHARE_V2))
    .addOption(config.newOptionBuilder().setLabel('Segmented Market Share').setValue(SEGMENTED_SHARE_V2))
    .addOption(config.newOptionBuilder().setLabel('Market Trends (Deprecated)').setValue(TREND))
    .addOption(config.newOptionBuilder().setLabel('Segmented Market Trends (Deprecated)').setValue(SEGMENTED_TREND))
    .addOption(config.newOptionBuilder().setLabel('Market Share (Deprecated)').setValue(SHARE))
    .addOption(config.newOptionBuilder().setLabel('Segmented Market Share (Deprecated)').setValue(SEGMENTED_SHARE))
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
    } else if ([TREND, SEGMENTED_TREND, SHARE, SEGMENTED_SHARE].includes(configParams.datasetType)) {
      config
        .newInfo()
        .setId('deprecationWarning')
        .setText('You have chosen a dataset that uses the Adthena API V1. There is an alternative dataset that uses the API V2. Please consider switching to the new dataset. It provides more flexibility and will keep your reports future proof.');
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
      case DEVICE_V2:
        config
          .newSelectMultiple()
          .setId('deviceV2')
          .setName("Device")
          .setHelpText('Select one or more devices.')
          .addOption(config.newOptionBuilder().setLabel('Desktop').setValue('desktop'))
          .addOption(config.newOptionBuilder().setLabel('Mobile').setValue('mobile'))
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
      case AD_TYPE_V2:
        config
          .newSelectMultiple()
          .setId('adTypeV2')
          .setName("Ad Type")
          .setHelpText('Select one or more ad types.')
          .addOption(config.newOptionBuilder().setLabel('Text Ad').setValue('textad'))
          .addOption(config.newOptionBuilder().setLabel('PLA').setValue('pla'))
          .addOption(config.newOptionBuilder().setLabel('Organic').setValue('organic'))
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
      case IS_WHOLE_MARKET_V2:
        config
          .newSelectSingle()
          .setId('isWholeMarketV2')
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
      case PAGE_V2:
        config
          .newTextInput()
          .setId('pageV2')
          .setName('Page')
          .setHelpText('Page number to request. Default: 1')
          .setAllowOverride(true);
        break;
      case PAGE_SIZE_V2:
        config
          .newTextInput()
          .setId('pageSizeV2')
          .setName('Page Size')
          .setHelpText('The page size to request. Set to 0 to disable pagination and return all data (easier to work with, but could cause issues with large datasets). Default: 50')
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
      case SEGMENT_BY:
        config
          .newSelectMultiple()
          .setId('segmentBy')
          .setName("Segment By")
          .setHelpText('Select fields to segment data by.')
          .addOption(config.newOptionBuilder().setLabel('Ad Type').setValue('ad_type'))
          .addOption(config.newOptionBuilder().setLabel('Device').setValue('device'))
          .setAllowOverride(true);
        break;
      case PRIMARY_DIMENSION:
        config
          .newSelectSingle()
          .setId('primaryDimension')
          .setName('Primary Dimension')
          .setHelpText('The primary dimension used for sorting and limiting domains in market trends.')
          .addOption(config.newOptionBuilder().setLabel('Share of Clicks').setValue('share_of_clicks'))
          .addOption(config.newOptionBuilder().setLabel('Share of Spend').setValue('share_of_spend'))
          .addOption(config.newOptionBuilder().setLabel('Share of Impressions').setValue('share_of_impressions'))
          .addOption(config.newOptionBuilder().setLabel('Average Position').setValue('average_position'))
          .addOption(config.newOptionBuilder().setLabel('Average CPC').setValue('average_cpc'))
          .addOption(config.newOptionBuilder().setLabel('Frequency Share').setValue('frequency_share'));
        break;
      case FILTERING_OPTIONS:
        config
          .newSelectSingle()
          .setId('filteringOptions')
          .setName('Filtering Options')
          .setHelpText('When filtering by competitors or groups, choose whether relative or absolute filtering should be applied.')
          .addOption(config.newOptionBuilder().setLabel('Relative').setValue('relative'))
          .addOption(config.newOptionBuilder().setLabel('Absolute').setValue('absolute'));
        break;
      case TIME_PERIOD:
        config
          .newSelectSingle()
          .setId('timePeriod')
          .setName('Time Period')
          .setHelpText('Choose time period if you want to enforce data granularity regardless of the chosen date range.')
          .addOption(config.newOptionBuilder().setLabel('Daily').setValue('daily'))
          .addOption(config.newOptionBuilder().setLabel('Weekly').setValue('weekly'))
          .addOption(config.newOptionBuilder().setLabel('Monthly').setValue('monthly'))
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
    .setId('shareOfImpressions')
    .setName('Share of Impressions')
    .setType(types.PERCENT);

  fields
    .newMetric()
    .setId('averagePosition')
    .setName('Average Position')
    .setType(types.NUMBER);

  return fields;
}

function getMarketShareV2Fields(isSegmented) {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  if (isSegmented) {
    fields
      .newDimension()
      .setId('search_term_group')
      .setName('Search Term Group')
      .setType(types.TEXT);
  }

  fields
    .newDimension()
    .setId('competitor')
    .setName('Competitor')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('device')
    .setName('Device')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('ad_type')
    .setName('Ad Type')
    .setType(types.TEXT);

  fields
    .newMetric()
    .setId('estimated_impressions')
    .setName('Estimated Impressions')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('share_of_clicks')
    .setName('Share of Clicks')
    .setType(types.PERCENT);

  fields
    .newMetric()
    .setId('share_of_spend')
    .setName('Share of Spend')
    .setType(types.PERCENT);

  fields
    .newMetric()
    .setId('share_of_impressions')
    .setName('Share of Impressions')
    .setType(types.PERCENT);

  fields
    .newMetric()
    .setId('average_position')
    .setName('Average Position')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('relevant_search_terms')
    .setName('Relevant Search Terms')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('total_pages')
    .setName('Total Pages')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('total_items')
    .setName('Total Items')
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

function getMarketTrendsV2Fields(isSegmented) {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  if (isSegmented) {
    fields
      .newDimension()
      .setId('search_term_group')
      .setName('Search Term Group')
      .setType(types.TEXT);
  }

  fields
    .newDimension()
    .setId('competitor')
    .setName('Competitor')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('device')
    .setName('Device')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('ad_type')
    .setName('Ad Type')
    .setType(types.TEXT);

  var date = fields
    .newDimension()
    .setId('date')
    .setName('Date')
    .setType(types.YEAR_MONTH_DAY);

  var shareOfClicks = fields
    .newMetric()
    .setId('share_of_clicks')
    .setName('Share of Clicks')
    .setType(types.PERCENT);

  fields
    .newMetric()
    .setId('share_of_spend')
    .setName('Share of Spend')
    .setType(types.PERCENT);

  fields
    .newMetric()
    .setId('share_of_impressions')
    .setName('Share of Impressions')
    .setType(types.PERCENT);

  fields
    .newMetric()
    .setId('average_position')
    .setName('Average Position')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('average_cpc')
    .setName('Average CPC')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('frequency_share')
    .setName('Frequency Share')
    .setType(types.PERCENT);

  fields.setDefaultMetric(shareOfClicks.getId());
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

function getBrandActivatorLogsFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields
    .newDimension()
    .setId('searchTerm')
    .setName('Search Term')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('event')
    .setName('Event')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('reason')
    .setName('Reason')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('details')
    .setName('Details')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('dateTime')
    .setName('Date & Time')
    .setType(types.YEAR_MONTH_DAY_SECOND);

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
  var virtualEndpoint = request.configParams.apiEndpoint;
  var fields = null;
  switch(datasetType) {
    case TREND:
      fields = getMarketTrendsFields(false);
      break;
    case TREND_V2:
      fields = getMarketTrendsV2Fields(false);
      break;
    case SEGMENTED_TREND:
      fields = getMarketTrendsFields(true);
      break;
    case SEGMENTED_TREND_V2:
      fields = getMarketTrendsV2Fields(true);
      break;
    case SHARE:
      fields = getMarketShareFields(false);
      break;
    case SEGMENTED_SHARE:
      fields = getMarketShareFields(true);
      break;
    case SHARE_V2:
      fields = getMarketShareV2Fields(false);
      break;
    case SEGMENTED_SHARE_V2:
      fields = getMarketShareV2Fields(true);
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
      // sub-switch for BA as endpoints come with different models
      // TODO: Cleanup and reuse virtual endpoint strings.
      switch(virtualEndpoint) {
        case 'ba-daily-savings':
          fields = getBrandActivatorFields();
          break;
        case 'ba-activity-logs':
          fields = getBrandActivatorLogsFields();
          break;
        default:
          cc.newUserError()
            .setDebugText('Unknown virtual endpoint for brand activator: ' + virtualEndpoint)
            .setText(
              'The connector has encountered an unrecoverable error. Please try again later, or file an issue if this error persists.'
            )
            .throwException();
      }
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
  // V1 defaults
  configParams.device = configParams.device || DEFAULTS.device;
  configParams.adType = configParams.adType || DEFAULTS.adType;
  configParams.isWholeMarket = configParams.isWholeMarket || DEFAULTS.isWholeMarket;
  // V2 defaults
  configParams.deviceV2 = configParams.deviceV2 || DEFAULTS_V2.device;
  configParams.adTypeV2 = configParams.adTypeV2 || DEFAULTS_V2.adType;
  configParams.isWholeMarketV2 = configParams.isWholeMarketV2 || DEFAULTS_V2.isWholeMarket;
  return configParams;
}

// https://developers.google.com/datastudio/connector/reference#getschema
function getSchema(request) {
  validateConfig(request.configParams);
  return {schema: getFields(request).build()};
}

// https://developers.google.com/datastudio/connector/reference#getdata
function getData(request) {
  var userEmail = Session.getActiveUser().getEmail();
  console.log('Running get data for user: %s', userEmail);
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
    var isV2Api = isV2ApiDataset(configParams.datasetType);
    var accountId = configParams.accountId;
    var apiKey = configParams.apiKey;
    var startDate = request.dateRange.startDate;
    var endDate = request.dateRange.endDate;
    var device = configParams.device;
    var adType = configParams.adType;
    var isWholeMarket = configParams.isWholeMarket;
    var deviceV2 = configParams.deviceV2;
    var adTypeV2 = configParams.adTypeV2;
    var isWholeMarketV2 = configParams.isWholeMarketV2;
    var isSegmentedResponse = isSegmentedDataset(configParams.datasetType);
    var searchTermGroupSegments = isSegmentedResponse ? configParams.searchTermGroups.split(',').map(v => v.trim()).filter(v => v !== '') : [configParams.searchTermGroups];
    var endpointWithFilters;
    var data = searchTermGroupSegments.flatMap(function (segment) {
      if (isV2Api) {
        endpointWithFilters = getEndpointWithFilters(configParams.apiEndpoint)
          .withAdditionalFilters('device', deviceV2)
          .withAdditionalFilters('ad_type', adTypeV2)
          .withAdditionalFilters('is_whole_market', isWholeMarketV2)
          .withAdditionalFilters('competitor_group', configParams.competitorGroups)
          .withAdditionalFilters('competitor', configParams.competitors)
          .withAdditionalFilters('search_term_group', segment)
          .withAdditionalFilters('search_term', configParams.searchTerms)
          .withAdditionalFilters('segment_by', configParams.segmentBy)
          .withAdditionalFilters('primary_dimension', configParams.primaryDimension)
          .withAdditionalFilters('filtering_options', configParams.filteringOptions)
          .withAdditionalFilters('time_period', configParams.timePeriod)
          .withAdditionalFilters('page', configParams.pageV2)
          .withAdditionalFilters('page_size', configParams.pageSizeV2);
      } else {
        endpointWithFilters = getEndpointWithFilters(configParams.apiEndpoint)
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
      }
      apiResponse = fetchData(accountId, apiKey, startDate, endDate, endpointWithFilters, isV2Api);
      console.log('Formatting data for requested fields.');
      var dt = isV2Api
        ? getFormattedDataV2(apiResponse, requestedFields, isSegmentedResponse ? SegmentedOption('search_term_group', segment) : null)
        : getFormattedData(apiResponse, requestedFields, isSegmentedResponse ? SegmentedOption('searchTermGroup', segment) : null);
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
function fetchData(accountId, apiKey, startDate, endDate, endpointWithFilters, isV2Api) {
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
    apiResponse = JSON.parse(fetchDataFromApi(accountId, apiKey, startDate, endDate, endpointWithFilters, isV2Api));
    setInCache(apiResponse, cache);
  }
  return apiResponse;
}

/**
 * Builds a URL for the API V1
 */
function buildApiV1Url(accountId, startDate, endDate, endpointWithFilters) {
  return [
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
  ].join('')
}

/**
 * Builds a URL for the API V2
 */
function buildApiV2Url(accountId, startDate, endDate, endpointWithFilters) {
  return [
    'https://api.adthena.com/v2/',
    accountId,
    '/',
    endpointWithFilters.endpoint,
    '?start_date=',
    startDate,
    '&end_date=',
    endDate,
    endpointWithFilters.filters ? '&' + endpointWithFilters.filters : '',
    '&platform=looker_studio'
  ].join('')
}

/**
 * Gets response from the API using UrlFetchApp.
 *
 * @param {Object} request Data request parameters.
 * @returns {string} Response text for UrlFetchApp.
 */
function fetchDataFromApi(accountId, apiKey, startDate, endDate, endpointWithFilters, isV2Api) {
  if (endpointWithFilters.containsForbiddenFilters()) {
    console.log('Forbidden filters detected: %s. Returning empty Json array. Full filter: %s.', endpointWithFilters.forbiddenFilters.join('; '), endpointWithFilters.filters);
    return '[]';
  }
  var url = isV2Api
    ? buildApiV2Url(accountId, startDate, endDate, endpointWithFilters)
    : buildApiV1Url(accountId, startDate, endDate, endpointWithFilters);
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
    console.log('Fetched successfully from cache. Length', response.length || response.data?.length);
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
    case 'shareOfImpressions':
      return handlePercentageResult(outer.ShareOfImpressions || outer.shareOfImpressions);
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
    case 'dateTime':
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
    case 'event':
      return outer.Event;
    case 'reason':
      return outer.Reason;
    case 'details':
      return outer.Details;
    default:
      return '';
  }
}

function getMappedDataV2(outer, inner, point, requestedField, segment) {
  if (segment && segment.fieldName === requestedField) {
    return segment.value;
  }
  switch (requestedField) {
    case 'competitor':
      return inner.competitor || outer.competitor;
    case 'device':
      return outer.device;
    case 'ad_type':
      return outer.ad_type;
    case 'date':
      return transformDate(point.date);
    case 'share_of_clicks':
      return point.share_of_clicks || outer.share_of_clicks;
    case 'share_of_spend':
      return point.share_of_spend || outer.share_of_spend;
    case 'share_of_impressions':
      return point.share_of_impressions || outer.share_of_impressions;
    case 'average_position':
      return point.average_position || outer.average_position;
    case 'average_cpc':
      return point.average_cpc;
    case 'frequency_share':
      return point.frequency_share;
    case 'estimated_impressions':
      return outer.estimated_impressions;
    case 'relevant_search_terms':
      return outer.relevant_search_terms;
    case 'total_pages':
      return outer.pagination ? outer.pagination.total_pages : null;
    case 'total_items':
      return outer.pagination ? outer.pagination.total_items : null;
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

/**
 * Formats the parsed response from external data source from the V2 API
 * into correct tabular format and returns only the requestedFields
 *
 * @param {Object} responseString The response string from external data source.
 * @param {Array} requestedFields The fields requested in the getData request.
 * @param {Object} segment An optional segment option to put to the final formatted data.
 * @returns {Array} Array containing rows of data in key-value pairs for each field.
 */
function getFormattedDataV2(response, requestedFields, segment) {
  // get the field IDs and use them in getMappedData, because getId() is very expensive.
  var fields = requestedFields.asArray().map(f => f.getId());
  var data = response.data;
  // keep everything except the data as metadata.
  var metaData = (({ data, ...object }) => object)(response);

  return data.flatMap(function(item) {
    var outer = {...item, ...metaData};
    // trends response - has nested competitors and time_series
    if (outer.competitors) {
      return outer.competitors.flatMap(
        function(competitor) {
          return competitor.time_series.map(
            function(point) {
              row = fields.map(requestedField => getMappedDataV2(outer, competitor, point, requestedField, segment));
              return { values: row };
            }
          )
        }
      );
    // market share response - flat structure with direct fields
    } else if (outer.competitor !== undefined) {
      row = fields.map(requestedField => getMappedDataV2(outer, outer, {}, requestedField, segment));
      return [{ values: row }];
    } else {
      return [{ values: [] }];
    }
  });
}

// https://developers.google.com/datastudio/connector/reference#isadminuser
function isAdminUser() {
  return false;
}
