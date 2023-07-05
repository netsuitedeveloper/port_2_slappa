function suitelet(request, response) {
  var list = nlapiCreateList("Update Open Opportunity Transaction List");

  // You can set the style of the list to grid, report, plain, or normal, or you can get the
  // default list style that users currently have specified in their accounts.
  list.setStyle(request.getParameter("style"));

  var column = list.addColumn("number", "text", "Number", "left");
  column.setURL(nlapiResolveURL("RECORD", "salesorder"));
  column.addParamToURL("id", "id", true);

  list.addColumn("trandate", "date", "Date", "left");
  list.addColumn("entitystatus", "text", "Opportunity Status", "left");
  list.addColumn("exchangerate", "float", "Exchange Rate", "left");
  list.addColumn("base_currency", "text", "Base Currency", "left");
  list.addColumn("today_exchangerate", "float", "Today Exchange Rate", "right");

  var returncols = new Array();
  returncols[0] = new nlobjSearchColumn("trandate");
  returncols[1] = new nlobjSearchColumn("number");
  returncols[2] = new nlobjSearchColumn("entitystatus");
  returncols[4] = new nlobjSearchColumn("exchangerate");

  var results = nlapiSearchRecord(
    "transaction",
    "customsearch_update_exchange_rate_225",
    null,
    returncols
  );

  for (var i = 0; results != null && i < results.length; i++) {
    var opp = results[i];

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

    row_opp["number"] = opp.getText("number");
    row_opp["trandate"] = opp.getValue("trandate");
    row_opp["entitystatus"] = opp.getText("entitystatus");
    row_opp["exchangerate"] = opp.getValue("exchangerate");
    row_opp["base_currency"] =
      searchBaseCurrencyResults[0].getValue("currency");

    if (row_opp["currency"] != row_opp["base_currency"]) {
      row_opp["today_exchangerate"] = 1;
    } else {
      row_opp["today_exchangerate"] = 1;
    }

    if (row_opp["exchangerate"] != row_opp["today_exchangerate"]) {
    }

    list.addRow(row_opp);
  }

  list.addPageLink(
    "crosslink",
    "Create Phone Call",
    nlapiResolveURL("TASKLINK", "EDIT_CALL")
  );
  list.addPageLink(
    "crosslink",
    "Create Sales Order",
    nlapiResolveURL("TASKLINK", "EDIT_TRAN_SALESORD")
  );

  list.addButton("custombutton", "Simple Button", "alert('Hello World')");
  response.writePage(list);
}
