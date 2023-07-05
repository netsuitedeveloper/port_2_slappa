/****************************************************
 * This scheduled script looks for customers that
 * have placed orders in the last 15 days ago.
 * It will send a thank you email to these customers
 * on behalf of their sales reps.
 */
function findCustomerScheduled(type) {
  //only execute when run from the scheduler and the script is in queue 5,
  // based on the deployment options set in the UI
  if (type != "scheduled" && type != "skipped" && queue == 5) return;

  //Invoke only when it is scheduled
  if (type == "scheduled") {
    //Obtaining the context object and logging the remaining usage available
    var context = nlapiGetContext();
    nlapiLogExecution(
      "DEBUG",
      "Remaining usage at script beginning",
      context.getRemainingUsage()
    );

    //Setting up filters to search for sales orders
    //with trandate of 15 days ago.
    var fifteenSOFilters = new Array();
    var fifteenDaysAgo = nlapiAddDays(new Date(), -15);
    fifteenSOFilters[0] = new nlobjSearchFilter(
      "trandate",
      null,
      "on",
      fifteenDaysAgo
    );

    //Setting up the columns.  Note the join entity.salesrep column.
    var fifteenSOColumns = new Array();
    fifteenSOColumns[0] = new nlobjSearchColumn("tranid", null, null);
    fifteenSOColumns[1] = new nlobjSearchColumn("entity", null, null);
    fifteenSOColumns[2] = new nlobjSearchColumn("salesrep", "entity", null);

    //Search for the sales orders with trandate of fifteen days ago
    var fifteenSO = nlapiSearchRecord(
      "salesorder",
      null,
      fifteenSOFilters,
      fifteenSOColumns
    );
    nlapiLogExecution(
      "DEBUG",
      "Remaining usage after searching sales orders 15 days ago",
      context.getRemainingUsage()
    );

    //Looping through each result found
    for (var i = 0; fifteenSO != null && i < fifteenSO.length; i++) {
      //obtain a result
      var so = fifteenSO[i];

      nlapiLogExecution(
        "DEBUG",
        "Remaining usage after in for loop, i=" + i,
        context.getRemainingUsage()
      );

      //If results are found, send a thank you email
      if (so != null) {
        //Setting up the subject and body of the email
        var subject = "Thank you!";
        var body =
          "Dear " +
          so.getText("entity") +
          ", thank you for your business in the last 15 days ago.";

        //Sending the thank you email to the customer on behalf of the sales rep
        //Note the code to obtain the join column entity.salesrep

        nlapiSendEmail(
          so.getValue("salesrep", "entity"),
          so.getValue("entity"),
          subject,
          body
        );
      }
    }
  }
}
