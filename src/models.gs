function MenuOption(label, virtualEndpoint) {
  this.label = label;
  this.virtualEndpoint = virtualEndpoint;

  return this;
}

function EndpointWithFilters(endpoint, filters = null, forbiddenFilters = []) {
  this.endpoint = endpoint;
  this.filters = filters;
  this.forbiddenFilters = forbiddenFilters;

  return this;
}

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
const TREND_OPTIONS = [
  new MenuOption('Share of Clicks', 'share-of-clicks-trend'),
  new MenuOption('Share of Spend', 'share-of-spend-trend'),
  new MenuOption('Share of Impressions', 'impression-share-trend'),
  new MenuOption('Frequency', 'frequency-trend'),
  new MenuOption('Average Position', 'average-position-trend'),
  new MenuOption('Average CPC', 'average-cpc-trend')
];
const SHARE_OPTIONS = [
  new MenuOption('Market Share', 'market-share')
];
const ALL_SHARE_OPTIONS = [
  new MenuOption('Market Share for All Groups and Locations', 'market-share-groups-and-locations')
];
const SEARCH_TERM_DETAIL_OPTIONS = [
  new MenuOption('Search Term Detail', 'search-term-detail')
];
const SEARCH_TERM_OPPORTUNITIES_OPTIONS = [
  new MenuOption('All Opportunities', 'search-term-opportunities-1'),
  new MenuOption('Missing Brand Terms', 'search-term-opportunities-2'),
  new MenuOption('New Terms', 'search-term-opportunities-3'),
  new MenuOption('Missing Organic Terms', 'search-term-opportunities-4'),
  new MenuOption('Low Cost Terms', 'search-term-opportunities-5'),
  new MenuOption('Not In Google Ads', 'search-term-opportunities-6'),
  new MenuOption('Underperforming Google Ads', 'search-term-opportunities-7')
];
const TOP_ADS_OPTIONS = [
  new MenuOption('Top Adverts', 'top-adverts')
];
const TOP_PLAS_OPTIONS = [
  new MenuOption('Top PLAs', 'top-pla')
];
const INFRINGEMENTS_OPTIONS = [
  new MenuOption('Infringements', 'infringement')
];
const VIRTUAL_ENDPOINT_MAPPINGS = {
  // trends
  'share-of-clicks-trend': new EndpointWithFilters('share-of-clicks-trend/all'),
  'share-of-spend-trend': new EndpointWithFilters('share-of-spend-trend/all'),
  'impression-share-trend': new EndpointWithFilters('impression-share-trend/all'),
  'frequency-trend': new EndpointWithFilters('frequency-trend/all'),
  'average-position-trend': new EndpointWithFilters('average-position-trend/all'),
  'average-cpc-trend': new EndpointWithFilters('average-cpc-trend/all'),
  // market share
  'market-share': new EndpointWithFilters('market-share/all'),
  'market-share-groups-and-locations': new EndpointWithFilters('market-share/groups-and-locations'),
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
  'infringement': new EndpointWithFilters('infringement/all', 'type=infringementTracker')
};

function getOptionsForDatasetType(datasetType) {
  switch (datasetType) {
    case SHARE:
      return SHARE_OPTIONS;
    case SEGMENTED_SHARE:
      return SHARE_OPTIONS;
    case ALL_SHARE:
      return ALL_SHARE_OPTIONS;
    case TREND:
      return TREND_OPTIONS;
    case SEGMENTED_TREND:
      return TREND_OPTIONS;
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
  return datasetType === SEGMENTED_TREND || datasetType === SEGMENTED_SHARE || datasetType === SEGMENTED_ST_DETAIL;
}

function isNonAdvancedDataset(datasetType) {
  return datasetType === ALL_SHARE;
}

function isBasicDataset(datasetType) {
  return datasetType === ALL_SHARE;
}
