function MenuOption(label, virtualEndpoint) {
  this.label = label;
  this.virtualEndpoint = virtualEndpoint;

  return this;
};

function FilterOption(id) {
  this.id = id;

  return this;
};

function FilterOptionsConfig(basic, advanced) {
  this.basic = basic;
  this.advanced = advanced;

  return this;
};

FilterOptionsConfig.prototype.isBasicDataset = function() {
  return this.advanced.length === 0; // basic datasets have noadvanced filtering
};

function DatasetOptions(menuOptions, filterOptions) {
  this.menuOptions = menuOptions;
  this.filterOptions = filterOptions;

  return this;
};

function EndpointWithFilters(endpoint, filters = null, forbiddenFilters = []) {
  this.endpoint = endpoint;
  this.filters = filters;
  this.forbiddenFilters = forbiddenFilters;

  return this;
};

EndpointWithFilters.prototype.withAdditionalFilters = function(filterKey, filterValues) {
  if (filterValues === undefined || filterValues.trim() === '') {
    return this;
  }
  var newFilters = filterValues.split(',').map(value => [filterKey, encodeURIComponent(value.trim())].join('=')).join('&');
  return new EndpointWithFilters(this.endpoint, this.filters ? [this.filters, newFilters].join('&') : newFilters, this.forbiddenFilters);
};

EndpointWithFilters.prototype.containsForbiddenFilters = function() {
  return this.filters ? this.forbiddenFilters.find(f => this.filters.includes(f)) !== undefined : false;
};

function SegmentedOption(fieldName, value) {
  this.fieldName = fieldName;
  this.value = value;

  return this;
};

const DEFAULTS = {
  device: 'desktop',
  adType: 'paid',
  isWholeMarket: 'true'
};

// start: filter ids
// basic
const DEVICE = 'device';
const AD_TYPE = 'adType';
const IS_TOTAL = 'isTotal';
const IS_WHOLE_MARKET = 'isWholeMarket';
const PAGE = 'page';
const PAGE_SIZE = 'pageSize';
// advanced
const SEARCH_TERM_GROUPS = 'searchTermGroups';
const SEARCH_TERMS = 'searchTerms';
const COMPETITOR_GROUPS = 'competitorGroups';
const COMPETITORS = 'competitors';
const INFRINGEMENT_RULE_IDS = 'infringementRuleIds';
// end: filter ids

// start: API V1
const TREND = 'trend';
const SEGMENTED_TREND = 'segmented_trend';
const SHARE = 'share';
const ALL_SHARE = 'all_share';
const SEGMENTED_SHARE = 'segmented_share';
const ST_DETAIL = 'search_term_detail';
const SEGMENTED_ST_DETAIL = 'segmented_search_term_detail';
const TOP_ADS = 'top_ads';
const TOP_PLAS = 'top_plas';
const ST_OPPORTUNITIES = 'search_term_opportunities';
const INFRINGEMENTS = 'infringements';
const BRAND_ACTIVATOR = 'brand_activator';
const TREND_OPTIONS = new DatasetOptions(
  [
    new MenuOption('Share of Clicks', 'share-of-clicks-trend'),
    new MenuOption('Share of Spend', 'share-of-spend-trend'),
    new MenuOption('Share of Impressions', 'impression-share-trend'),
    new MenuOption('Frequency', 'frequency-trend'),
    new MenuOption('Average Position', 'average-position-trend'),
    new MenuOption('Average CPC', 'average-cpc-trend')
  ],
  new FilterOptionsConfig(
    [
      new FilterOption(DEVICE),
      new FilterOption(AD_TYPE),
      new FilterOption(IS_WHOLE_MARKET)
    ],
    [
      new FilterOption(SEARCH_TERM_GROUPS),
      new FilterOption(SEARCH_TERMS),
      new FilterOption(COMPETITOR_GROUPS),
      new FilterOption(COMPETITORS)
    ]
  )
);
const SHARE_OPTIONS = new DatasetOptions(
  [
    new MenuOption('Market Share', 'market-share')
  ],
  new FilterOptionsConfig(
    [
      new FilterOption(DEVICE),
      new FilterOption(AD_TYPE),
      new FilterOption(IS_WHOLE_MARKET)
    ],
    [
      new FilterOption(SEARCH_TERM_GROUPS),
      new FilterOption(SEARCH_TERMS),
      new FilterOption(COMPETITOR_GROUPS),
      new FilterOption(COMPETITORS)
    ]
  )
);
const ALL_SHARE_OPTIONS = new DatasetOptions(
  [
    new MenuOption('Market Share for All Groups and Locations', 'market-share-groups-and-locations')
  ],
  new FilterOptionsConfig(
    [
      new FilterOption(IS_TOTAL),
      new FilterOption(IS_WHOLE_MARKET)
    ],
    []
  )
);
const SEARCH_TERM_DETAIL_OPTIONS = new DatasetOptions(
  [
    new MenuOption('Search Term Detail', 'search-term-detail')
  ],
  new FilterOptionsConfig(
    [
      new FilterOption(DEVICE),
      new FilterOption(AD_TYPE),
      new FilterOption(IS_WHOLE_MARKET)
    ],
    [
      new FilterOption(SEARCH_TERM_GROUPS),
      new FilterOption(SEARCH_TERMS),
      new FilterOption(COMPETITOR_GROUPS),
      new FilterOption(COMPETITORS)
    ]
  )
);
const SEARCH_TERM_OPPORTUNITIES_OPTIONS = new DatasetOptions(
  [
    new MenuOption('All Opportunities', 'search-term-opportunities-1'),
    new MenuOption('Missing Brand Terms', 'search-term-opportunities-2'),
    new MenuOption('New Terms', 'search-term-opportunities-3'),
    new MenuOption('Missing Organic Terms', 'search-term-opportunities-4'),
    new MenuOption('Low Cost Terms', 'search-term-opportunities-5'),
    new MenuOption('Not In Google Ads', 'search-term-opportunities-6'),
    new MenuOption('Underperforming Google Ads', 'search-term-opportunities-7')
  ],
  new FilterOptionsConfig(
    [
      new FilterOption(DEVICE),
      new FilterOption(AD_TYPE),
      new FilterOption(IS_WHOLE_MARKET)
    ],
    [
      new FilterOption(SEARCH_TERM_GROUPS),
      new FilterOption(SEARCH_TERMS),
      new FilterOption(COMPETITOR_GROUPS),
      new FilterOption(COMPETITORS)
    ]
  )
);
const TOP_ADS_OPTIONS = new DatasetOptions(
  [
    new MenuOption('Top Adverts', 'top-adverts')
  ],
  new FilterOptionsConfig(
    [
      new FilterOption(DEVICE),
      new FilterOption(AD_TYPE),
      new FilterOption(IS_WHOLE_MARKET)
    ],
    [
      new FilterOption(SEARCH_TERM_GROUPS),
      new FilterOption(SEARCH_TERMS),
      new FilterOption(COMPETITOR_GROUPS),
      new FilterOption(COMPETITORS)
    ]
  )
);
const TOP_PLAS_OPTIONS = new DatasetOptions(
  [
    new MenuOption('Top PLAs', 'top-pla')
  ],
  new FilterOptionsConfig(
    [
      new FilterOption(DEVICE),
      new FilterOption(AD_TYPE),
      new FilterOption(IS_WHOLE_MARKET),
      new FilterOption(PAGE),
      new FilterOption(PAGE_SIZE)
    ],
    [
      new FilterOption(SEARCH_TERM_GROUPS),
      new FilterOption(SEARCH_TERMS),
      new FilterOption(COMPETITOR_GROUPS),
      new FilterOption(COMPETITORS)
    ]
  )
);
const INFRINGEMENTS_OPTIONS = new DatasetOptions(
  [
    new MenuOption('Infringements', 'infringement')
  ],
  new FilterOptionsConfig(
    [
      new FilterOption(DEVICE),
      new FilterOption(AD_TYPE),
      new FilterOption(IS_WHOLE_MARKET)
    ],
    [
      new FilterOption(SEARCH_TERM_GROUPS),
      new FilterOption(SEARCH_TERMS),
      new FilterOption(COMPETITOR_GROUPS),
      new FilterOption(COMPETITORS),
      new FilterOption(INFRINGEMENT_RULE_IDS)
    ]
  )
);
const BRAND_ACTIVATOR_OPTIONS = new DatasetOptions(
  [
    new MenuOption('Daily Savings', 'ba-daily-savings'),
    new MenuOption('Activity Logs', 'ba-activity-logs')
  ],
  new FilterOptionsConfig(
    [
      new FilterOption(PAGE),
      new FilterOption(PAGE_SIZE)
    ],
    [
      new FilterOption(SEARCH_TERMS)
    ]
  )
);
// end: API V1

// start: API V2
const DEFAULTS_V2 = {
  device: 'desktop',
  adType: 'textad',
  isWholeMarket: 'true'
};
// start: filter ids
// basic
const DEVICE_V2 = 'deviceV2';
const AD_TYPE_V2 = 'adTypeV2';
const IS_WHOLE_MARKET_V2 = 'isWholeMarketV2';
const SEGMENT_BY = 'segmentBy'; // device or ad_type. Supports multiple.
const PAGE_V2 = 'pageV2';
const PAGE_SIZE_V2 = 'pageSizeV2';
// advanced
const PRIMARY_DIMENSION = 'primaryDimension'; // for trends
const FILTERING_OPTIONS = 'filteringOptions'; // relative (default), absolute
const TIME_PERIOD = 'timePeriod'; // daily, weekly, monthly

// end: filter ids

const TREND_V2 = 'trend_v2';
const TREND_V2_OPTIONS = new DatasetOptions(
  [
    new MenuOption('Market Trends', 'trends-v2')
  ],
  new FilterOptionsConfig(
    [
      new FilterOption(DEVICE_V2),
      new FilterOption(AD_TYPE_V2),
      new FilterOption(IS_WHOLE_MARKET_V2),
      new FilterOption(SEGMENT_BY)
    ],
    [
      new FilterOption(PRIMARY_DIMENSION),
      new FilterOption(FILTERING_OPTIONS),
      new FilterOption(TIME_PERIOD),
      new FilterOption(SEARCH_TERM_GROUPS),
      new FilterOption(SEARCH_TERMS),
      new FilterOption(COMPETITOR_GROUPS),
      new FilterOption(COMPETITORS)
    ]
  )
);
const SEGMENTED_TREND_V2 = 'segmented_trend_v2';

const SHARE_V2 = 'share_v2';
const SHARE_V2_OPTIONS = new DatasetOptions(
  [
    new MenuOption('Market Share', 'market-share-v2')
  ],
  new FilterOptionsConfig(
    [
      new FilterOption(DEVICE_V2),
      new FilterOption(AD_TYPE_V2),
      new FilterOption(IS_WHOLE_MARKET_V2),
      new FilterOption(SEGMENT_BY),
      new FilterOption(PAGE_V2),
      new FilterOption(PAGE_SIZE_V2)
    ],
    [
      new FilterOption(FILTERING_OPTIONS),
      new FilterOption(TIME_PERIOD),
      new FilterOption(SEARCH_TERM_GROUPS),
      new FilterOption(SEARCH_TERMS),
      new FilterOption(COMPETITOR_GROUPS),
      new FilterOption(COMPETITORS)
    ]
  )
);
const SEGMENTED_SHARE_V2 = 'segmented_share_v2';
// end: API V2

const VIRTUAL_ENDPOINT_MAPPINGS = {
  // trends (deprecated)
  'share-of-clicks-trend': new EndpointWithFilters('share-of-clicks-trend/all'),
  'share-of-spend-trend': new EndpointWithFilters('share-of-spend-trend/all'),
  'impression-share-trend': new EndpointWithFilters('impression-share-trend/all'),
  'frequency-trend': new EndpointWithFilters('frequency-trend/all'),
  'average-position-trend': new EndpointWithFilters('average-position-trend/all'),
  'average-cpc-trend': new EndpointWithFilters('average-cpc-trend/all'),
  // trends-v2
  'trends-v2': new EndpointWithFilters('market-trends'),
  // market share (deprecated)
  'market-share': new EndpointWithFilters('market-share/all'),
  'market-share-groups-and-locations': new EndpointWithFilters('market-share/groups-and-locations'),
  // market share v2
  'market-share-v2': new EndpointWithFilters('market-share'),
  // search term detail
  'search-term-detail': new EndpointWithFilters('search-term-detail/all'),
  // search term opportunities
  'search-term-opportunities-1': new EndpointWithFilters('search-term-opportunities/all'),
  'search-term-opportunities-2': new EndpointWithFilters('search-term-opportunities/all', 'segment=missing_brand_terms', ['device=total']),
  'search-term-opportunities-3': new EndpointWithFilters('search-term-opportunities/all', 'segment=new_terms', ['device=total']),
  'search-term-opportunities-4': new EndpointWithFilters('search-term-opportunities/all', 'segment=missing_organic_terms', ['device=total']),
  'search-term-opportunities-5': new EndpointWithFilters('search-term-opportunities/all', 'segment=low_cost_terms', ['device=total']),
  'search-term-opportunities-6': new EndpointWithFilters('search-term-opportunities/all', 'segment=not_in_adwords_terms', ['device=total']),
  'search-term-opportunities-7': new EndpointWithFilters('search-term-opportunities/all', 'segment=underperforming_adwords_terms', ['device=total']),
  // top ads
  'top-adverts': new EndpointWithFilters('top-adverts/all'),
  // top pla
  'top-pla': new EndpointWithFilters('google-shopping/v2'),
  // infringements
  'infringement': new EndpointWithFilters('infringement/all', 'type=infringementTracker'),
  // brand activator
  'ba-daily-savings': new EndpointWithFilters('brand-activator/daily-savings'),
  'ba-activity-logs': new EndpointWithFilters('brand-activator/activity-logs')
};

function getOptionsForDatasetType(datasetType) {
  switch (datasetType) {
    case SHARE:
      return SHARE_OPTIONS;
    case SEGMENTED_SHARE:
      return SHARE_OPTIONS;
    case SHARE_V2:
      return SHARE_V2_OPTIONS;
    case SEGMENTED_SHARE_V2:
      return SHARE_V2_OPTIONS;
    case ALL_SHARE:
      return ALL_SHARE_OPTIONS;
    case TREND:
      return TREND_OPTIONS;
    case TREND_V2:
      return TREND_V2_OPTIONS;
    case SEGMENTED_TREND:
      return TREND_OPTIONS;
    case SEGMENTED_TREND_V2:
      return TREND_V2_OPTIONS;
    case ST_DETAIL:
      return SEARCH_TERM_DETAIL_OPTIONS;
    case SEGMENTED_ST_DETAIL:
      return SEARCH_TERM_DETAIL_OPTIONS;
    case TOP_ADS:
      return TOP_ADS_OPTIONS;
    case TOP_PLAS:
      return TOP_PLAS_OPTIONS;
    case ST_OPPORTUNITIES:
      return SEARCH_TERM_OPPORTUNITIES_OPTIONS;
    case INFRINGEMENTS:
      return INFRINGEMENTS_OPTIONS;
    case BRAND_ACTIVATOR:
      return BRAND_ACTIVATOR_OPTIONS;
    default:
      cc.newUserError()
        .setText('Please choose a valid dataset type.')
        .throwException();
  }
}

function getEndpointWithFilters(virtualEndpoint) {
  return VIRTUAL_ENDPOINT_MAPPINGS[virtualEndpoint] || new EndpointWithFilters(virtualEndpoint);
}

function isSegmentedDataset(datasetType) {
  return [SEGMENTED_TREND, SEGMENTED_TREND_V2, SEGMENTED_SHARE, SEGMENTED_SHARE_V2, SEGMENTED_ST_DETAIL].includes(datasetType);
}

function isV2ApiDataset(datasetType) {
  return [TREND_V2, SEGMENTED_TREND_V2, SHARE_V2, SEGMENTED_SHARE_V2].includes(datasetType);
}
