function saveReview(request, response)	{
	
	// GET THE ITEM IF IT IS, IF NOT ALERT AND CANCEL
	var nsitemid = request.getParameter('custrecordreviewnsitemid');
	var customerid = request.getParameter('custrecordreviewcustomerid');
	var rating = request.getParameter('custrecordreviewrating');
	var title = request.getParameter('custrecordreviewtitle') || "";
	var message = request.getParameter('custrecordreviewmessage') || "";
	var reviewer = request.getParameter('custrecordreviewreviewer') || "";
	var location = request.getParameter('custrecordreviewlocation') || "";
	var useful = request.getParameter('custrecordreviewwasthisuseful') || "";
	
	if(!nsitemid || !rating)	{
		response.write('/*\nDeploy requires the following parameters:\n"custrecordreviewnsitemid"\n"custrecordreviewrating"\n*/');
		return false;
	}
	
	var review = nlapiCreateRecord('customrecordreviewentry');
	
	review.setFieldValue('custrecordreviewnsitemid', nsitemid);
	review.setFieldValue('custrecordreviewcustomerid', customerid);
	review.setFieldValue('custrecordreviewrating', rating);
	review.setFieldValue('custrecordreviewtitle', title);
	review.setFieldValue('custrecordreviewmessage', message);
	review.setFieldValue('custrecordreviewreviewer', reviewer);
	review.setFieldValue('custrecordreviewlocation', location);
	review.setFieldValue('custrecordreviewwasthisuseful', useful);
	
	try	{
		nlapiSubmitRecord(review, true);
	}
	catch(err)	{
		response.write(err);
	}
	
}

function updateReviews(request, response)	{
	
	function updateItem( recordId )	{
		
		var record = nlapiLoadRecord( 'inventoryitem', recordId );
		
		var finalHtml = '';
		var qty = 0;
		var average = 0;
		var wtuqty = 0;
		
		var filters = [];
		filters.push( new nlobjSearchFilter( 'custrecordreviewnsitemid', null, 'is', recordId ) );
		
		var columns = [];
		columns.push( new nlobjSearchColumn( 'custrecordreviewnsitemname', null, null ) );
		columns.push( new nlobjSearchColumn( 'custrecordreviewrating', null, null ) );
		columns.push( new nlobjSearchColumn( 'custrecordreviewtitle', null, null ) );
		columns.push( new nlobjSearchColumn( 'custrecordreviewmessage', null, null ) );
		columns.push( new nlobjSearchColumn( 'custrecordreviewreviewer', null, null ) );
		columns.push( new nlobjSearchColumn( 'custrecordreviewlocation', null, null ) );
		columns.push( new nlobjSearchColumn( 'custrecordreviewdatecreated', null, null ) );
		columns.push( new nlobjSearchColumn( 'custrecordreviewwasthisuseful', null, null ) );
		columns.push( new nlobjSearchColumn( 'custrecordreviewstatus', null, null ) );
		
		var reviews = nlapiSearchRecord( 'customrecordreviewentry', null, filters, columns );
		
		if( reviews )	{
			for( var i = 0; i < reviews.length; i++ )	{
				if( reviews[i].getValue( 'custrecordreviewstatus' ) != 2 ) continue;
				var itemUrl = "/s.nl/c.734395/it.A/id." + reviews[i].getValue( 'custrecordreviewnsitemid' ) + "/.f";
				var itemName = reviews[i].getValue( 'custrecordreviewnsitemname' );
				var rating = reviews[i].getValue( 'custrecordreviewrating' );
				var title = reviews[i].getValue( 'custrecordreviewtitle' );
				var message = reviews[i].getValue( 'custrecordreviewmessage' );
				var reviewer = reviews[i].getValue( 'custrecordreviewreviewer' );
				var location = reviews[i].getValue( 'custrecordreviewlocation' );
				var dateCreated = reviews[i].getValue( 'custrecordreviewdatecreated' );
				var useful = reviews[i].getValue( 'custrecordreviewwasthisuseful' );
				
				var html = template;
				
				html = html.replace(/<itemName>/gi, itemName);
				html = html.replace(/<title>/gi, title);
				html = html.replace(/<itemUrl>/gi, itemUrl);
				html = html.replace(/<comment>/gi, message);	
				html = html.replace(/<location>/gi, location);
				html = html.replace(/<name>/gi, reviewer);
				html = html.replace(/<datecreated>/gi, dateCreated);
				html = html.replace(/<rating>/gi, rating);
				html = html.replace(/<useful>/gi, useful);
				
				finalHtml = html + finalHtml;
				qty++;
				if( useful == 1 ) wtuqty++;
				average += parseInt( rating );
			}
		
			averageString = Math.ceil( average / qty ) + '';
			wtuqtyString = wtuqty + '';
			qtyString = qty + '';
			
			record.setFieldValue('custitemreviewshtml', finalHtml);
			record.setFieldValue('custitemreviewsquantity', qtyString);
			record.setFieldValue('custitemreviewaverage', averageString);
			record.setFieldValue('custitemreviewsusefulquantity', wtuqtyString);
			record.setFieldValue('custitemreviewlastupdate', _todayGMT);
		}
		
		if( response ) response.write( recordId + " : " + _5days + "\n<br>" );
		record.setFieldValue( 'custitemreviewlastupdateasd', _today );
		nlapiSubmitRecord( record );
		
	}
	
	// UPDATE REVIEWS
	
	var date = new Date();
	_today = date.getTime();
	_todayGMT = date.toGMTString();
	
	_5days = _today - ( 1000 * 60 * 60 );
	_5days += "";
	
	_5days = parseInt( _5days.substring( 0, 9 ) );
	_today = parseInt( ( _today + "" ).substring( 0, 9 ) );
	
	var template = nlapiLoadRecord('customrecordreviewtemplate', 3);
	template = template.getFieldValue('custrecordreviewtemplatecode');
	
	var itemFilters = [];
	itemFilters.push( new nlobjSearchFilter( 'custitemreviewlastupdateasd', null, 'lessthan', _5days ) );
	
	var itemColumns = [];
	itemColumns.push( new nlobjSearchColumn( 'internalid', null, null ) );
	itemColumns.push( new nlobjSearchColumn( 'custitemreviewlastupdateasd', null, null ) );
	
	var itemsToUpdate = nlapiSearchRecord( 'inventoryitem', null, itemFilters, itemColumns );
	if( !itemsToUpdate ) return false;
	
	var end = itemsToUpdate.length;
	if( end > 24 ) end = 24;
	
	if( response ) response.write( 'Today: ' + _today + '<br><br>' );
	
	for( var i = 0; i < end; i++ )	{
		updateItem( itemsToUpdate[i].getValue( 'internalid' ) );
	}
	
	if( itemsToUpdate.length >= 24 && response )	{
		response.write( '<br>Updating..<script>document.location.href = document.URL</script>' );
	}
	else if( response )	{
		response.write( 'Done' );
	}
	
	if( end == 24 ) response.write( '<script> document.location.href = document.URL; </script>' );
	
}
