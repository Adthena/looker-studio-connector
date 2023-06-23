function MenuOption(label, endpoint) {
  this.label = label;
  this.endpoint = endpoint;

  return this;
}

const TREND = 'trend';
const SHARE = 'share';
const ST_DETAIL = 'search_term_detail';
const TOP_ADS = 'top_ads';
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
const TOP_ADS_OPTIONS = [
  new MenuOption('Top Adverts', 'top-adverts')
];

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
    default:
      cc.newUserError()
        .setText('Please choose a valid dataset type.')
        .throwException();
  }
}
