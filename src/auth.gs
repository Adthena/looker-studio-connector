var cc = DataStudioApp.createCommunityConnector();

function getAuthType() {
  var AuthTypes = cc.AuthType;
  return cc
    .newAuthTypeResponse()
    .setAuthType(AuthTypes.NONE)
    .build();
}

function isAuthValid() {
  return true;
}

// Below is an example of using PATH_KEY authentication. Since a single user can access multiple accounts, this isn't suitable and
// the account id and api key must be changeable via the configuration rather than the authentication.
/*
function AdthenaCredentials(accountId, apiKey) {
  this.accountId = accountId;
  this.apiKey = apiKey;

  return this;
}

function getAdthenaCredentials() {
  var userProperties = PropertiesService.getUserProperties();
  var accountId = userProperties.getProperty('dscc.accountId');
  var apiKey = userProperties.getProperty('dscc.apiKey');
  return new AdthenaCredentials(accountId, apiKey);
}

function getAuthType() {
  var AuthTypes = cc.AuthType;
  return cc
    .newAuthTypeResponse()
    .setAuthType(AuthTypes.PATH_KEY)
    .build();
}

function resetAuth() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('dscc.accountId');
  userProperties.deleteProperty('dscc.apiKey');
}

function isAuthValid() {
  var adthenaCredentials = getAdthenaCredentials();
  return validateCredentials(adthenaCredentials.accountId, adthenaCredentials.apiKey);
}

function setCredentials(request) {
  var creds = request.pathKey;
  var accountId = creds.path;
  var apiKey = creds.key;

  var validCreds = validateCredentials(accountId, apiKey);
  if (!validCreds) {
    return {
      errorCode: 'INVALID_CREDENTIALS'
    };
  }
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('dscc.accountId', accountId);
  userProperties.setProperty('dscc.apiKey', apiKey);
  return {
    errorCode: 'NONE'
  };
}

function validateCredentials(accountId, apiKey) {
  if (!accountId || !apiKey) return false;
  // call the market trends share of clicks endpoint and verify we get a valid response
  const date = Utilities.formatDate(getYesterday(), 'GMT', 'yyyy-MM-dd');
  var url = [
    'https://api.adthena.com/wizard/',
    accountId,
    '/share-of-clicks-trend/all?periodstart=',
    date,
    '&periodend=',
    date,
    '&device=desktop&traffictype=paid&wholemarket=true&platform=looker_studio'
  ].join('');
  var options = {
    'method': 'GET',
    'headers': {
      'adthena-api-key': apiKey,
      'accept': 'application/json'
    }
  };
  return UrlFetchApp.fetch(url, options).getResponseCode() === 200;
}
*/
