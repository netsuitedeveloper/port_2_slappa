function updateExchangeRate(type) {
  //if ( type != 'scheduled' && type != 'skipped' ) return;

  if (type == "scheduled") {
    //Obtaining the context object and logging the remaining usage available
    var context = nlapiGetContext();
    nlapiLogExecution(
      "DEBUG",
      "Remaining usage at script beginning",
      context.getRemainingUsage()
    );

    var returncols = new Array();
    returncols[0] = new nlobjSearchColumn("trandate");
    returncols[1] = new nlobjSearchColumn("entitystatus");
    returncols[2] = new nlobjSearchColumn("exchangerate");
    returncols[3] = new nlobjSearchColumn("internalid");

    var results = nlapiSearchRecord(
      "transaction",
      "customsearch_update_exchange_rate_229",
      null,
      returncols
    );
    nlapiLogExecution(
      "DEBUG",
      "Remaining usage after searching open Opp transactions",
      context.getRemainingUsage()
    );

    for (var i = 0; results != null && i < results.length; i++) {
      var opp = results[i];
      nlapiLogExecution(
        "DEBUG",
        "Remaining usage after in for loop, i=" + i,
        context.getRemainingUsage()
      );

      var searchBaseCurrencyFilters = new Array();
      searchBaseCurrencyFilters[0] = new nlobjSearchFilter(
        "internalid",
        null,
        "is",
        opp.getValue("subsidiary")
      );

      var searchBaseCurrencyColumns = new Array();
      searchBaseCurrencyColumns[0] = new nlobjSearchColumn("currency");

      var searchBaseCurrencyResults = nlapiSearchRecord(
        "subsidiary",
        null,
        searchBaseCurrencyFilters,
        searchBaseCurrencyColumns
      );

      var row_opp = new Object();

      row_opp["internalid"] = opp.getValue("internalid");
      row_opp["trandate"] = opp.getValue("trandate");
      row_opp["entitystatus"] = opp.getText("entitystatus");
      row_opp["exchangerate"] = opp.getValue("exchangerate");
      row_opp["base_currency"] =
        searchBaseCurrencyResults[0].getValue("currency");

      if (row_opp["currency"] != row_opp["base_currency"]) {
        row_opp["today_exchangerate"] = nlapiExchangeRate(
          row_opp["currency"],
          row_opp["base_currency"]
        );
      } else {
        row_opp["today_exchangerate"] = 1;
      }

      if (row_opp["exchangerate"] != row_opp["today_exchangerate"]) {
      }

      nlapiLogExecution(
        "DEBUG",
        "Remaining usage after creating new Opp",
        context.getRemainingUsage()
      );
    }
  }
}
