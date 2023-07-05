function userEventUpdateReview( type, form )	{
	
	var record = nlapiGetOldRecord();
	var itemid = record.getFieldValue( 'custrecordreviewnsitemid' );
	var template = nlapiLoadRecord('customrecordreviewtemplate', 3);
	template = template.getFieldValue('custrecordreviewtemplatecode');
	
	var itemobject = {
		type: null,
		quantity: 0,
		useful: 0,
		totalRating: 0,
		html: ''
	}
	
	var filters = [];
	filters.push( new nlobjSearchFilter( 'custrecordreviewnsitemid', null, 'is', itemid ) );
	var columns = [];
	columns.push( new nlobjSearchColumn( 'custrecordreviewreviewer', null, null ) );
	columns.push( new nlobjSearchColumn( 'custrecordreviewlocation', null, null ) );
	columns.push( new nlobjSearchColumn( 'custrecordreviewrating', null, null ) );
	columns.push( new nlobjSearchColumn( 'custrecordreviewtitle', null, null ) );
	columns.push( new nlobjSearchColumn( 'custrecordreviewmessage', null, null ) );
	columns.push( new nlobjSearchColumn( 'custrecordreviewnsitemname', null, null ) );
	columns.push( new nlobjSearchColumn( 'custrecordreviewdatecreated', null, null ) );
	columns.push( new nlobjSearchColumn( 'custrecordreviewnsitemid', null, null ) );
	columns.push( new nlobjSearchColumn( 'custrecordreviewstatus', null, null ) );
	columns.push( new nlobjSearchColumn( 'custrecordreviewwasthisuseful', null, null ) );
	// Rin the search.
	var reviews = nlapiSearchRecord( 'customrecordreviewentry', null, filters, columns );
	if( !reviews ) return false;
	
	for( var i = 0; i < reviews.length; i++ )	{
		if( reviews[i].getValue( 'custrecordreviewstatus' ) == '2' )	{
			itemobject.quantity++;
			itemobject.totalRating += parseInt( reviews[i].getValue( 'custrecordreviewrating' ) );
			itemobject.html += parseTemplate( reviews[i] );
			if( reviews[i].getValue( 'custrecordreviewwasthisuseful' ) == '1' ) itemobject.useful++;
		}
	}
	
	function parseTemplate( review )	{
		var html = template;
		
		var itemId = review.getValue( 'custrecordreviewnsitemid' );
		var itemName = review.getValue( 'custrecordreviewnsitemname' );
		var title = review.getValue( 'custrecordreviewtitle' );
		var itemUrl = '/s.nl/it.A/id.' + itemId + '/.f';
		var message = review.getValue( 'custrecordreviewmessage' );
		var location = review.getValue( 'custrecordreviewlocation' );
		var reviewer = review.getValue( 'custrecordreviewreviewer' );
		var dateCreated = review.getValue( 'custrecordreviewdatecreated' );
		var rating = review.getValue( 'custrecordreviewrating' );
		var useful = review.getValue( 'custrecordreviewwasthisuseful' );
		
		html = html.replace(/<itemName>/gi, itemName);
		html = html.replace(/<title>/gi, title);
		html = html.replace(/<itemUrl>/gi, itemUrl);
		html = html.replace(/<comment>/gi, message);	
		html = html.replace(/<location>/gi, location);
		html = html.replace(/<name>/gi, reviewer);
		html = html.replace(/<datecreated>/gi, dateCreated);
		html = html.replace(/<rating>/gi, rating);
		html = html.replace(/<useful>/gi, useful);
		
		return html;
	}
	
	var itemrecord = null;
	try	{
		itemrecord = nlapiLoadRecord( 'assemblyitem', itemid );
	}
	catch(e)	{
		try	{
			itemrecord = nlapiLoadRecord( 'inventoryitem', itemid );
		}
		catch(e)	{
			try	{
				itemrecord = nlapiLoadRecord( 'noninventoryitem', itemid );
			}
			catch(e)	{
			}
		}
	}
	itemobject.type = itemrecord.getRecordType();
	var average = ( itemobject.totalRating != 0 && itemobject.quantity != 0 ) ? itemobject.totalRating / itemobject.quantity : 0;
	
	if( itemrecord )	{
		// Format the results taking away the .
		var formattedAverage = average + "";
		formattedAverage = ( formattedAverage.indexOf( '.' ) != -1 ) ? formattedAverage.substring( 0, formattedAverage.indexOf( '.' ) ) : formattedAverage;
		var formattedQuantity = itemobject.quantity + "";
		formattedQuantity = ( formattedQuantity.indexOf( '.' ) != -1 ) ? formattedQuantity.substring( 0, formattedQuantity.indexOf( '.' ) ) : formattedQuantity;
		var formattedUseful = itemobject.useful + "";
		formattedUseful = ( formattedUseful.indexOf( '.' ) != -1 ) ? formattedUseful.substring( 0, formattedUseful.indexOf( '.' ) ) : formattedUseful;
		// Set the fields to the formatted values.
		itemrecord.setFieldValue( 'custitemreviewaverage', formattedAverage );
		itemrecord.setFieldValue( 'custitemreviewsquantity', formattedQuantity );
		itemrecord.setFieldValue( 'custitemreviewshtml', itemobject.html );
		itemrecord.setFieldValue( 'custitemreviewsusefulquantity', itemobject.useful );
		// Submit.
		nlapiSubmitRecord( itemrecord );
		// Log row for showing that the record was updated successfully.
		nlapiLogExecution( 'ERROR', 'Item successfully updated.', 'Item: ' + itemid + '; RQuantity: ' + itemobject.quantity + '; RAverage: ' + average + ';' );
	}
}