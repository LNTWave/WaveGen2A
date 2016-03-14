//=================================================================================================
//
//  File: cloud.js
//
//  Description:  This file contains the actual Northbound network calls to the cloud.
//
//=================================================================================================


var isNetworkConnected = null;


// SendAzureData............................................................................................
function SendAzureData( )
{

    var nType = "POST";
    var nUrl  = "https://myIotHubYavuz.azure-devices.net/devices/myFirstDevice/messages/events?api-version=2015-08-15-preview"
//    var nUrl  = "https://myIotHubYavuz.azure-devices.net/devices/myFirstDevice/messages/events"
    var nContentType = "application/octet-stream";
    var nData = "{'deviceId': 'myFirstDevice','App Speed': 0}";
    var nRespFormat = "";


    PrintLog(1, "Azure: " + nType + " to " + nUrl );
    
    // Verify that we have network connectivity....
    isNetworkConnected = NorthBoundConnectionActive();

    if( isNetworkConnected )
    {
        // Send data to the cloud using a jQuery ajax call...        
        $.ajax({
            type       : nType,
            url        : nUrl,
            contentType: nContentType,
            data       : nData,
            crossDomain: true,                  // Needed to set to true to talk to Nextivity server.
            dataType   : nRespFormat,           // Response format
            
            headers: {
                "iothub-to": "/devices/myFirstDevice/messages/events",
                "Authorization": "SharedAccessSignature sr=myIotHubYavuz.azure-devices.net/devices/myFirstDevice&sig=I6szWS%2fW2I1gICF%2bVTJrK73rKCXj4uSY%2fpaTFkd7iPI%3d&se=1457980264&skn=",
            },
            success      : function(response)     // success call back
            {
                PrintLog(1, "Azure: Success" ); 
            },
            error     : function(response)                      // error call back
            {
                PringLog(1, "Azure: Response error: " + JSON.stringify(response) );
            },
            
            timeout    : 5000                   // sets timeout to 5 seconds
        });
    }
    else
    {
        PrintLog( 99, "SendAzureData: No network connection (WiFi or Cell)." );
    }
}


// SendNorthBoundData............................................................................................
function SendNorthBoundData( nType, nUrl, nContentType, nData, nRespFormat, successCb, errorCb )
{
    // Verify that we have network connectivity....
    isNetworkConnected = NorthBoundConnectionActive();

    if( isNetworkConnected )
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
            timeout    : 5000                   // sets timeout to 5 seconds
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
