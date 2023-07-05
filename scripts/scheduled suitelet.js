function findCustomerScheduled(type) {
  if (type != "scheduled" && type != "skipped" && queue == 5) return;

  var returncols = new Array();
  returncols[0] = new nlobjSearchColumn(
    "trandate",
    null,
    null,
    "sort=ASC",
    "type=date"
  );
  returncols[1] = new nlobjSearchColumn(
    "entityid",
    "customer",
    null,
    "type=text"
  );
  returncols[2] = new nlobjSearchColumn(
    "altname",
    "customer",
    null,
    "type=text"
  );
  returncols[3] = new nlobjSearchColumn(
    "email",
    "customer",
    null,
    "type=email"
  );
  returncols[4] = new nlobjSearchColumn(
    "thumbnailurl",
    "item",
    null,
    "type=text"
  );
  returncols[5] = new nlobjSearchColumn(
    "storedisplayimage",
    "item",
    null,
    "type=select"
  );
  returncols[6] = new nlobjSearchColumn(
    "postingperiod",
    null,
    null,
    "type=select"
  );
  returncols[7] = new nlobjSearchColumn("type", null, null, "type=select");
  returncols[8] = new nlobjSearchColumn("tranid", null, null, "type=text");
  returncols[9] = new nlobjSearchColumn("entity", null, null, "type=select");
  returncols[10] = new nlobjSearchColumn("account", null, null, "type=select");
  returncols[11] = new nlobjSearchColumn("memo", null, null, "type=text");
  returncols[12] = new nlobjSearchColumn("amount", null, null, "type=currency");
  returncols[13] = new nlobjSearchColumn(
    "parent",
    "item",
    null,
    "type=integer"
  );
  returncols[14] = new nlobjSearchColumn(
    "displayname",
    "item",
    null,
    "type=text"
  );

  var results = nlapiSearchRecord(
    "transaction",
    "customsearchfind_customer15daysago_229",
    null,
    null
  );

  var total_num = results.length;

  if (total_num > 0) {
    var base_name = results[0].getValue(returncols[2]);
  } else {
    var base_name = "";
  }
  var base_name = results[0].getValue(returncols[2]);

  var product_no = 0;
  var cust_no = 0;

  for (var i = 0; results != null && i <= results.length; i++) {
    if (i < results.length) {
      var searchResults = results[i];
      var columns = searchResults.getAllColumns();

      var cur_name = searchResults.getValue(returncols[2]);
    } else if (i == results.length) {
      var cur_name = "";
    }

    if (base_name == cur_name) {
      product_no++; //response.write(product_no + ':');
    } else {
      cust_no++;

      var customer_product_list = Array();

      for (var j = 0; j < product_no; j++) {
        var customer_product = new Object();

        customer_product["number"] = i - j - 1;
        customer_product["customer_no"] = cust_no;
        customer_product["product_no"] = j;

        customer_product["trandate"] = results[i - j - 1].getValue(
          returncols[0]
        );
        customer_product["altname"] = results[i - j - 1].getValue(
          returncols[2]
        );
        customer_product["email"] = results[i - j - 1].getValue(returncols[3]);

        if (results[i - j - 1].getValue(returncols[4]) != "") {
          customer_product["thumbnailurl"] = results[i - j - 1].getValue(
            returncols[4]
          );
        } else if (results[i - j - 1].getValue(returncols[13]) != null) {
          var searchParentFilters = new Array();
          searchParentFilters[0] = new nlobjSearchFilter(
            "internalidnumber",
            null,
            "equalto",
            results[i - j - 1].getValue(returncols[13])
          );

          var searchParentColumns = new Array();
          searchParentColumns[0] = new nlobjSearchColumn("thumbnailurl");

          var searchParentResults = nlapiSearchRecord(
            "item",
            null,
            searchParentFilters,
            searchParentColumns
          );

          customer_product["thumbnailurl"] = searchParentResults[0].getValue(
            searchParentColumns[0]
          );
        } else {
          //response.write("Thumbnail Empty Error");
        }

        customer_product["storedisplayimage"] = results[i - j - 1].getValue(
          returncols[5]
        );
        customer_product["displayname"] = results[i - j - 1].getValue(
          returncols[14]
        );
        customer_product["amount"] = results[i - j - 1].getValue(
          returncols[12]
        );
        customer_product["parent"] = results[i - j - 1].getValue(
          returncols[13]
        );

        if (
          customer_product["email"] != "" ||
          customer_product["thumbnailurl"] != ""
        ) {
          customer_product_list.push(customer_product);
        }
      }

      send_email_to_customer(
        "-5",
        customer_product_list[0]["email"],
        "Review Your SLAPPA Purchase and Get a 10% coupon",
        customer_product_list
      );
      //send_email_to_customer('-5', 'hakunamoni@yahoo.com', 'Slappa Product Review Scheduled Script',customer_product_list);
      send_email_to_customer(
        "-5",
        "scremme@hotmail.com",
        "Review Your SLAPPA Purchase and Get a 10% coupon",
        customer_product_list
      );

      product_no = 1;
      base_name = cur_name;
    }
  }
}

function send_email_to_customer(author, recipient, subject, customer_products) {
  var html_content =
    '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>Product Review</title><style>.top {margin : 20px 0px 20px 0px} .top ul{ text-align: center; list-style : none; float : left; padding : 0; margin : 0px 0px 20px 20px; } .top ul li{float: left; width : 60px; margin : 0 10px;} .top ul li a{ text-decoration: none; color : gray; }.content ul{ text-align : center; list-style : none; padding : 0; margin : 20px 0px 20px 0px; } .content ul li{ display: inline-block; width : 100px; margin : 0 5px; } .bottom ul{ text-align : center; list-style : none; padding : 0; margin : 0px 0px 0px 0px; }.bottom ul li{ display: inline-block; width : auto; margin : 0 5px;}.bottom ul li a{ text-decoration: none; color : gray; }</style></head><body>';
  html_content +=
    '<div style="width: 800px; margin: auto; text-align: center;"><div class = "top" style="border-bottom: 1px solid #00b8ff; height: 50px;"><a href="http://www.slappa.com/" target="_self" style="float:left;">' +
    '<img src="http://www.slappa.com/images/new-design/SLAPPA-logo.png" alt="SLAPPA Homepage" title="Slappa Homepage" border="0"></a>' +
    '<ul><li><a href="http://www.slappa.com/catalog/laptop-bags?mytabsmenu=0">Laptop Bags</a></li><li><a href="http://www.slappa.com/catalog/backpacks?mytabsmenu=1">Laptop Backpacks</a></li><li><a href="http://www.slappa.com/catalog/tablet-cases/">Tablet Cases</a></li><li><a href="http://www.slappa.com/catalog/headphonecases/">Headphone Cases</a></li><li><a href="http://www.slappa.com/catalog/dvd-cases?mytabsmenu=5">DVD Cases</a></li><li><a href="http://www.slappa.com/catalog/cd-cases?mytabsmenu=4">CD Cases</a></li><li><a href="http://www.slappa.com/catalog/vaporizer?mytabsmenu=4">Vaporizer Cases</a></li></ul></div>';
  html_content +=
    '<div class = "content" style="text-align: center;"><p>Hi <b style=" color:#00b8ff;">';
  html_content += customer_products[0]["altname"];
  html_content +=
    '</b> - tell us what you think of your SLAPPA products and get a 10% discount coupon</p><h3>Complete your review today and <br>save <b style="color: #3079B9;">10%*</b> on your next order!</h3><a href="http://www.slappa.com/reviews/Review2016" style="text-decoration: none;outline: none; " target="_self"><h3 style="background-color: #7B9E10; color: white; width: 200px; height: auto; padding:7px 0 7px 0; text-align: center; margin:auto; ">Rate & Review Now</h3></a><ul>';

  for (var i = 0; i < customer_products.length; i++) {
    html_content +=
      '<li><img src="' +
      customer_products[i]["thumbnailurl"] +
      '"/>' +
      customer_products[i]["displayname"] +
      "</li>";
  }

  html_content +=
    "</ul><p>Thank you for being a loyal SLAPPA customer. As a family owned and operated business, we are always listening <br>to your feedback so please don" +
    "'" +
    't hesitate to contact us via <label style="color: #00b8ff;"><a href="#" style=" color: #00b8ff;">email</a> or call 704-676-4891 <label style="font-size: smaller;">(10am-4pm ET, Mon-Fri)</label> </label></p></div>';
  html_content +=
    '<div class = "bottom" style="border-top: 1px solid gray; width: 1200px; height: 200px; margin-left: -200px; text-align: center;"><h4>SLAPPA products have been endored and recommended by top pubictions around the globe</h4><ul><li><a href="#"><img src="https://system.netsuite.com/core/media/media.nl?id=200871&c=455532&h=76e064df723c91819f63&whence="/></a></li><li><a href="#"><img src="https://system.netsuite.com/core/media/media.nl?id=200876&c=455532&h=89d827b0c4d8c845c595&whence="/></a></li><li><a href="#"><img src="https://system.netsuite.com/core/media/media.nl?id=200874&c=455532&h=602a651a187502588ab4&whence="/></a></li><li><a href="#"><img src="https://system.netsuite.com/core/media/media.nl?id=200869&c=455532&h=3dd5850910f8f8aebd49&whence="/></a></li><li><a href="#"><img src="https://system.netsuite.com/core/media/media.nl?id=200878&c=455532&h=c8c4a66ceb4fb3e3b695&whence="/></a></li><li><a href="#"><img src="https://system.netsuite.com/core/media/media.nl?id=200875&c=455532&h=2bfd352f33da2070517e&whence="/></a></li><li><a href="#"><img src="https://system.netsuite.com/core/media/media.nl?id=200873&c=455532&h=d918416b1e0a425ff263&whence="/></a></li><li><a href="#"><img src="https://system.netsuite.com/core/media/media.nl?id=200872&c=455532&h=4eebba69e138b36b562e&whence="/></a></li><li><a href="#"><img src="https://system.netsuite.com/core/media/media.nl?id=200870&c=455532&h=1b4b07221435f557ec34&whence="/></a></li></ul></div></div></body></html>';

  nlapiSendEmail(
    author,
    recipient,
    subject,
    html_content,
    null,
    null,
    null,
    null
  );
}
