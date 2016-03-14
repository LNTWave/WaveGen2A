//=================================================================================================
//
//  File: pcApp_cloud.js
//
//  Description:  This file contains the actual Northbound network calls to the cloud.
//
//=================================================================================================

var isNetworkConnected = null;

var QtNbManager        = null; // Qt object that will do the work


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

// NorthBoundConnectionActive............................................................................................
function NorthBoundConnectionActive()
{
    if (navigator.connection !== undefined)
    {
        if (navigator.connection.type !== undefined)
            return (navigator.connection.type == Connection.NONE)?false:true;
        else if(navigator.connection.ManualCheckInternetUp !== undefined)
            return navigator.connection.ManualCheckInternetUp();
    }

    PrintLog( 99, "NorthBoundConnectionActive() needs to be updated for your platform" );
    return false;
}

// FileTransferDownload..............................................................................................
//
//  Downloads a file from server.
// 
//  Input: fromUrl:  URL to download from including file name.
//         toUrl:    URL to download to including file name.
//
//  Outputs: none
//
//
function FileTransferDownload( fromUrl, toUrl )
{

    PrintLog(1, "FileTransferDownload: from: " + fromUrl + "  to: " + toUrl );

    // Perform a file transfer from the platform to the destination directory...        
    g_fileTransferSuccess   = null;
    
    if(QtNbManager != null)
    {
        QtNbManager.doDownload(fromUrl, toUrl);
    }
}

// Download from Cloud File transfer callback..................................................................
function FileTransferDownloadResponse(nPassFail, sFileName)
{
    PrintLog(10, "FileTransferDownloadResponse with " + nPassFail + " for " + sFileName);
    if(nPassFail == 0)
    {
        PrintLog(1, "Download from cloud successfully complete: " + sFileName);
        g_fileTransferSuccess = true;
    }
    else
    {
        PrintLog(99, "Download from cloud failed: " + sFileName + " Error code: " + nPassFail);
        g_fileTransferSuccess = false;
    }
    return 0;
}

