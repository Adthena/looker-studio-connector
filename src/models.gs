function MenuOption(label, virtualEndpoint) {
  this.label = label;
  this.virtualEndpoint = virtualEndpoint;

  return this;
}

function EndpointWithFilters(endpoint, filters = null) {
  this.endpoint = endpoint;
  this.filters = filters;

  return this;
}

EndpointWithFilters.prototype.withAdditionalFilters = function(filterKey, filterValues) {
  if (filterValues === undefined || filterValues.trim() === '') {
    return this;
  }
  var newFilters = filterValues.split(',').map(value => [filterKey, encodeURIComponent(value.trim())].join('=')).join('&');
  return new EndpointWithFilters(this.endpoint, this.filters ? [this.filters, newFilters].join('&') : newFilters);
};

const DEFAULTS = {
  device: 'desktop',
  adType: 'paid',
  isWholeMarket: 'true'
};

const TREND = 'trend';
const SHARE = 'share';
const ST_DETAIL = 'search_term_detail';
const TOP_ADS = 'top_ads';
const TOP_PLAS = 'top_plas';
const ST_OPPORTUNITIES = 'search_term_opportunities';
const INFRINGEMENTS = 'infringements';
const TREND_OPTIONS = [
  new MenuOption('Share of Clicks', 'share-of-clicks-trend'),
  new MenuOption('Share of Spend', 'share-of-spend-trend'),
  new MenuOption('Share of Impressions', 'impression-share-trend'),
  new MenuOption('Average Position', 'average-position-trend'),
  new MenuOption('Average CPC', 'average-cpc-trend')
];
const SHARE_OPTIONS = [
  new MenuOption('Market Share', 'market-share')
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
  new MenuOption('Top PLAs (Coming Soon)', 'top-pla')
];
const INFRINGEMENTS_OPTIONS = [
  new MenuOption('Infringements', 'infringement')
];
const VIRTUAL_ENDPOINT_MAPPINGS = {
  'search-term-opportunities-1': new EndpointWithFilters('search-term-opportunities'),
  'search-term-opportunities-2': new EndpointWithFilters('search-term-opportunities', 'segment=missing_brand_terms'),
  'search-term-opportunities-3': new EndpointWithFilters('search-term-opportunities', 'segment=new_terms'),
  'search-term-opportunities-4': new EndpointWithFilters('search-term-opportunities', 'segment=missing_organic_terms'),
  'search-term-opportunities-5': new EndpointWithFilters('search-term-opportunities', 'segment=low_cost_terms'),
  'search-term-opportunities-6': new EndpointWithFilters('search-term-opportunities', 'segment=not_in_adwords_terms'),
  'search-term-opportunities-7': new EndpointWithFilters('search-term-opportunities', 'segment=underperforming_adwords_terms')
};

function getOptionsForDatasetType(datasetType) {
  switch (datasetType) {
    case SHARE:
      return SHARE_OPTIONS;
    case TREND:
      return TREND_OPTIONS;
    case ST_DETAIL:
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
