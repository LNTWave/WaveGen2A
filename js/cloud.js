//=================================================================================================
//
//  File: cloud.js
//
//  Description:  This file contains the actual Northbound network calls to the cloud.
//
//=================================================================================================


var isNetworkConnected = null;



// SendNorthBoundData............................................................................................
function SendNorthBoundData( nType, nUrl, nContentType, nData, nRespFormat, nHeader, successCb, errorCb )
{
    // Verify that we have network connectivity....
    isNetworkConnected = NorthBoundConnectionActive();

    if( isNetworkConnected )
    {
        if( nHeader.length == 0 )
        {
            // Send data to the cloud using a jQuery ajax call...        
            $.ajax({
                type       : nType,
                url        : nUrl,
                contentType: nContentType,
                data       : nData,
                crossDomain: true,                  // Needed to set to true to talk to Nextivity server.
                dataType   : nRespFormat,           // Response format
                success    : successCb,             // Success callback
                error      : errorCb,               // Error callback
                timeout    : 10000                  // sets timeout to 10 seconds
            });
        }
        else
        {
  
            // Send data to the cloud using a jQuery ajax call with headers...        
            $.ajax({
                type       : nType,
                url        : nUrl,
                contentType: nContentType,
                data       : nData,
                crossDomain: true,                  // Needed to set to true to talk to Nextivity server.
                dataType   : nRespFormat,           // Response format
                headers    : nHeader,
                success    : successCb,             // Success callback
                error      : errorCb,               // Error callback
                timeout    : 10000                  // sets timeout to 10 seconds
            });
        }
        
    }
    else
    {
        PrintLog( 99, "SendNorthBoundData: No network connection (WiFi or Cell)." );
    }
}

// SendNorthBoundDataBinary............................................................................................
function SendNorthBoundDataBinary( nType, nUrl, nContentType, u8Data, nLen, nRespFormat, nHeader, successCb, errorCb )
{
    // Verify that we have network connectivity....
    isNetworkConnected = NorthBoundConnectionActive();

    if( isNetworkConnected )
    {
        // Create an array of the exact size to send...
        var u8Send = new Uint8Array(nLen);
        for( var j = 0; j < u8Send.length; j++ )
        {
            u8Send[j] = u8Data[j];
        }
    
  
        // Send data to the cloud using a jQuery ajax call with headers...        
        $.ajax({
            type       : nType,
            url        : nUrl,
            contentType: nContentType,
            data       : u8Send,
            crossDomain: true,                  // Needed to set to true to talk to Nextivity server.
            dataType   : nRespFormat,           // Response format
            processData: false,                 // Set to false so that binary data can be sent.
            headers    : nHeader,
            success    : successCb,             // Success callback
            error      : errorCb,               // Error callback
            timeout    : 10000                  // sets timeout to 10 seconds
        });
    }
    else
    {
        PrintLog( 99, "SendNorthBoundData: No network connection (WiFi or Cell)." );
    }
}

function NorthBoundConnectionActive()
{
    return (navigator.connection.type == Connection.NONE)?false:true;
}
