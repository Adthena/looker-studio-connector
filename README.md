# Adthena Looker Studio Data Connector
This data connector allows existing Adthena API users to pull data in Looker Studio. This allows customers to easily
visualize and interact with their account data. You can also blend your data from Adthena with other data sources
available in Looker Studio to create even richer reports.

# Functionality
The Adthena Looker Studio connector is built on top of the Adthena API. We currently support a mixture of endpoints
defined in the V1 and V2 API.

## V1 API Support
We support majority of the V1 endpoints defined in here: https://api.adthena.com/. The connector currently supports the following
API filters and parameters:
* `periodstart` and `periodend` - used to limit the date range of the report. To adjust those, you can use a date range control.
* `device` - this can be adjusted during the data source set up and a user can choose to make it overridable.
* `traffictype` - this can be adjusted during the data source set up and a user can choose to make it overridable.
* `wholemarket` - this can be adjusted during the data source set up and a user can choose to make it overridable.
* `kg` - list of search term groups. Adjustable from the advanced filtering options in the connector set up page. The user can enter a comma-separated list of search term groups.
* `searchterm` - list of search terms. Adjustable from the advanced filtering options in the connector set up page. The user can enter a comma-separated list of search terms.
* `cg` - list of competitor groups. Adjustable from the advanced filtering options in the connector set up page. The user can enter a comma-separated list of competitor groups.
* `competitor` - list of competitor domains. Adjustable from the advanced filtering options in the connector set up page. The user can enter a comma-separated list of competitor domains.

## V2 API Support
V2 API support is currently being rolled out. The new API supports more flexible filtering and segmentation options. It ensures
easier integration and data access for our customers. It is recommended to use the V2 API datasets for new integrations. It is also
recommended to migrate existing reports to the V2 API datasets. The V2 API documentation can be found here: https://api.adthena.com/v2/redoc.

We support the following filters and parameters:
* `start_date` and `end_date` - used to limit the date range of the report. To adjust those, you can use a date range control.
* `device` - this can be adjusted during the data source set up and a user can choose to make it overridable.
* `ad_type` - this can be adjusted during the data source set up and a user can choose to make it overridable.
* `time_period` - ability to enforce time period granularity. This can be adjusted during the data source set up and a user can choose to make it overridable.
* `segment_by` - ability to segment data by device or ad type. This is used to return totals or segmented data sets. 
  It can be adjusted during the data source set up and a user can choose to make it overridable.
* `filtering_options` - relative (default) or absolute filtering when filtering by competitors or competitor groups. This 
  can be adjusted during the data source set up and a user can choose to make it overridable.
* `is_whole_market` - this can be adjusted during the data source set up and a user can choose to make it overridable.
* `search_term_group` - list of search term groups. Adjustable from the advanced filtering options in the connector set up page. The user can enter a comma-separated list of search term groups.
* `search_term` - list of search terms. Adjustable from the advanced filtering options in the connector set up page. The user can enter a comma-separated list of search terms.
* `competitor_group` - list of competitor groups. Adjustable from the advanced filtering options in the connector set up page. The user can enter a comma-separated list of competitor groups.
* `competitor` - list of competitor domains. Adjustable from the advanced filtering options in the connector set up page. The user can enter a comma-separated list of competitor domains.


There are a number of other available filters in the Adthena API which are currently not supported. For example, exclusion of
search terms, competitors, search term groups and competitor groups, as well as filtering by Google Ads campaign names. Those will be rolled out
in a future release, but if you need them, please feel free to request this functionality via GitHub.

# Usage
In order to use the Adthena Looker Studio Data Connector, you will first need to obtain and API key. If you have access
to multiple accounts, and you would like to visualize data from more than one account in Looker Studio, you will need to have an API key for
every account.

When adding a data source from Adthena, you need to choose the dataset you would like to add. The datasets correspond to the Adthena API endpoints. Each dataset could
have a different schema. If you would like to add multiple Adthena datasets, for example share of clicks and share of spend trends, you can add those as 2 separate data sources
in Looker Studio.
