'use strict';

module.exports = function (flowContext, query) {
  let queryParams = [];

  //Queried dates are exclusive so skew by 1 ms to create an equivalent inclusive range
  queryParams.push("updated_at_min=" + new Date(Date.parse(query.modifiedDateRange.startDateGMT) - 1).toISOString());
  queryParams.push("updated_at_max=" + new Date(Date.parse(query.modifiedDateRange.endDateGMT) + 1).toISOString());

  if (flowContext.orderStatus) {
    queryParams.push(`status=${flowContext.orderStatus}`);
  }
  if (flowContext.financialStatus) {
    queryParams.push(`financial_status=${flowContext.financialStatus}`);
  }
  if (flowContext.fulfillmentStatus) {
    queryParams.push(`fulfillment_status=${flowContext.fulfillmentStatus}`);
  }

  if (query.pageSize) {
    queryParams.push("limit=" + query.pageSize);
  }

  let nextPage;
  if (query.pagingContext && query.pagingContext.next) {
    nextPage = query.pagingContext.next.url;
  } else {
    nextPage = `${this.baseUri}/admin/api/${this.apiVersion}/orders.json?${queryParams.join('&')}`;
  }

  return this.queryForSalesOrders(nextPage);
};
