//=================================================================================================
//
//  File: msg_axeda.js
//
//  Description:  This file is used to format communications with the Axeda cloud.
//                Normal communications is via the Axeda URL using json data.
//
//=================================================================================================


var platformName            = "JDO_TEMP_NextivityIoTHubQA.azure-devices.net";
var sasHubKey               = "sJBd8gHBNQUcrCKqfbnAdW8wfGQNwcSbITesLa/9J3A=";       // Specific key for NextivityIoTHubQA.azure-devices.net 
var sandboxName             = "NextivityIoTHubDev.azure-devices.net";
var sandboxSasHubKey        = "Xh86c4aekfwLnqXQUz6VaFn/Q4jFQo/roGhuGbjfiJA=";       // Specific key for NextivityIoTHubDev.azure-devices.net 
var sasDevKey               = "";                                                   // Use RetrieveCloudDeviceKey() to return key
var sasDevKeyName           = "";
var sasHubKeyName           = "iothubowner";
var sasDevToken             = "";                                                   // Generated hourly by GenerateSasDevTokenHourly();
var platformVer             = "2016-02-03";
//const CFG_RUN_ON_SANDBOX    = true;                 // true to run on Azure sandbox.  false to run on Azure production platform.


var azureDeviceId           = "";


// Azure IOT Hub message data...
var u8AzureTxBuff = new Uint8Array(4096);
const   D2CMSG_TECHDATA                         = 1;
const   D2CMSG_REGISTER_NEWSITE                 = 10;
const   D2CMSG_REGISTER_ASSOC_SYSTEM            = 11;
const   D2CMSG_REGISTER_DISASSOC_SYSTEM         = 12;
const   D2CMSG_REGISTER_ASSOC_BOARD             = 13;
const   D2CMSG_REGISTER_DISASSOC_BOARD          = 14;
const   D2CMSG_REGISTER_ASSOC_NOTIFICATION      = 15;
const   D2CMSG_INQUIRY                          = 20;
const   D2CMSG_SETPARAM_RSP                     = 30;
const   D2CMDG_SWUPDATE                         = 40;
const   D2CMDG_SWUPDATE_GETSAS                  = 41;
const   D2CMDG_DEBUG_ADDFAKEFACTORYINFO         = 90;


var tempCounter  = 0;

// RegisterCloudDev............................................................................................
function RegisterCloudDev( devId )
{
    
    if( CFG_RUN_ON_SANDBOX )
    {
        PrintLog(1, "Azure: RegisterCloudDev(" + devId + ") with sandbox at " + sandboxName );
        platformName = sandboxName;
        sasHubKey    = sandboxSasHubKey;
    }
    else
    {
        PrintLog(1, "Azure: RegisterCloudDev(" + devId + ") with platform at " + platformName );
    }
    
    if( azureDeviceId.length == 0 )
    {
        azureDeviceId = devId;
    } 
    
    if( sasDevKey.length == 0 )
    {
        RetrieveCloudDeviceKey();
    }
}




// SendCloudAsset - Needed by Axeda, now just a stub since Azure does not need .....................................................................
function SendCloudAsset()
{
    PrintLog( 1, "SendCloudAsset: Not needed with Azure." );
}

// SendCloudData............................................................................................
function SendCloudData(dataText)
{
    if( sasDevKey.length != 0 )
    {
        var myData    = "{" + dataText + "}";
        GenerateSasDevTokenHourly( "/devices/" + nxtyNuUniqueId );
        
        var myDataUrl = "https://" + platformName + "/devices/" + nxtyNuUniqueId + "/messages/events?api-version=" + platformVer;
        var myHeader  =  {"Authorization":sasDevToken};


//PrintLog(1,"myHeader     =" + JSON.stringify(myHeader) );

        PrintLog( 1, "SendCloudData: " + myDataUrl + "  " + myData );
        
        
        SendNorthBoundData( 
            "POST",
            myDataUrl,
            "application/octet-stream",
            myData,
            "",                             // response format
            myHeader,
            function(response) 
            {
                if( response != null )
                {
                    var responseText = JSON.stringify(response);    // Returns "" at a minimum
                    if( responseText.length > 2 )
                    {
                        PrintLog( 1, "Response success: SendCloudData()..." + responseText );
                        ProcessEgressResponse(response);
                    }
                }
            },
            function(response) 
            {
                PrintLog( 99, "Response error: SendCloudData()..." + JSON.stringify(response) );
            }
        );
        

    }
    else
    {
        PrintLog( 99, "SendCloudData: SAS key not retrieved from cloud yet." );
    }
    
}


// SendCloudAssociateSystem............................................................................................
//
//  typedef struct
//  {
//      char                    nameStr[WAVE2_SYSATTRIBNAME_LEN];
//      char                    valStr[WAVE2_SYSATTRIBVAL_LEN];
//  } systemAttribType;
//  
//  typedef struct
//  {
//      unsigned int            siteID;
//      long long               systemID;
//      unsigned char           systemIPAddress[WAVE2_SYSIPADDR_LEN];
//      unsigned int            numSystemAttrib;
//      systemAttribType        systemAttrib[1];//variable size field as determined by numSystemAttrib
//  } d2cMsg_Register_Assoc_System;             //Reference: D2CMSG_REGISTER_ASSOC_SYSTEM
//  
//  typedef struct
//  {
//      unsigned char           version;
//      E8(D2CMSGTYPE)          type;
//      unsigned char           reserved[2];
//      unsigned int            payloadSize;
//      long long               uniqueID;
//  } d2cMsgHdr;
//  
//  typedef struct
//  {
//      d2cMsgHdr               hdr;
//      unsigned int            payload[1];     //variable-size field as determined by hdr.type
//  } d2cMsg;


function SendCloudAssociateSystem()
{
    var i              = 0;
    var uniqueIdNu     =  parseInt( nxtyNuUniqueId, 16 );
    
    PrintLog(1,  "Azure: SendCloudAssociateSystem()" );
    
    

    // d2cMsg....................................
    // d2cMsgHdr size = 16 bytes
    u8AzureTxBuff[i++] = 1;                             // version
    u8AzureTxBuff[i++] = D2CMSG_REGISTER_ASSOC_SYSTEM;  // type  
    u8AzureTxBuff[i++] = 0;                             // reserved
    u8AzureTxBuff[i++] = 0;                             // reserved
    u8AzureTxBuff[i++] = 0;                             // payloadSize in bytes, fill in after payload.
    u8AzureTxBuff[i++] = 0;
    u8AzureTxBuff[i++] = 0;
    u8AzureTxBuff[i++] = 0;
    u8AzureTxBuff[i++] = 0; //(uniqueIdNu >> 56);            // uniqueID            
    u8AzureTxBuff[i++] = 0; //(uniqueIdNu >> 48);              
    u8AzureTxBuff[i++] = 0; //(uniqueIdNu >> 40);              
    u8AzureTxBuff[i++] = 0; //(uniqueIdNu >> 32);              
    u8AzureTxBuff[i++] = (uniqueIdNu >> 24);              
    u8AzureTxBuff[i++] = (uniqueIdNu >> 16);
    u8AzureTxBuff[i++] = (uniqueIdNu >> 8);
    u8AzureTxBuff[i++] = (uniqueIdNu >> 0);

    // payload assoc system
    u8AzureTxBuff[i++] = 0;                             // siteID
    u8AzureTxBuff[i++] = 0; //(uniqueIdNu >> 56);            // systemID same as uniqueID in header.             
    u8AzureTxBuff[i++] = 0; //(uniqueIdNu >> 48);              
    u8AzureTxBuff[i++] = 0; //(uniqueIdNu >> 40);              
    u8AzureTxBuff[i++] = 0; // (uniqueIdNu >> 32);              
    u8AzureTxBuff[i++] = (uniqueIdNu >> 24);              
    u8AzureTxBuff[i++] = (uniqueIdNu >> 16);
    u8AzureTxBuff[i++] = (uniqueIdNu >> 8);
    u8AzureTxBuff[i++] = (uniqueIdNu >> 0);
    u8AzureTxBuff[i++] = 0;                             // systemIPAddress[16]
    u8AzureTxBuff[i++] = 0;
    u8AzureTxBuff[i++] = 0;
    u8AzureTxBuff[i++] = 0;
    u8AzureTxBuff[i++] = 0;
    u8AzureTxBuff[i++] = 0;
    u8AzureTxBuff[i++] = 0;
    u8AzureTxBuff[i++] = 0;
    u8AzureTxBuff[i++] = 0;
    u8AzureTxBuff[i++] = 0;
    u8AzureTxBuff[i++] = 0;
    u8AzureTxBuff[i++] = 0;
    u8AzureTxBuff[i++] = 0;
    u8AzureTxBuff[i++] = 0;
    u8AzureTxBuff[i++] = 0;
    u8AzureTxBuff[i++] = 0;
    u8AzureTxBuff[i++] = 0;                             // numSystemAttrib
    u8AzureTxBuff[i++] = 0;
    u8AzureTxBuff[i++] = 0;
    u8AzureTxBuff[i++] = 0;

    // Fill in the payload size, assume less than 1 byte.    
    u8AzureTxBuff[7] = i - 16;          // Current number of bytes minus 16-byte header.
    
   

    GenerateSasDevTokenHourly( "/devices/" + nxtyNuUniqueId );
        
    var myDataUrl = "https://" + platformName + "/devices/" + nxtyNuUniqueId + "/messages/events?api-version=" + platformVer;
    var myHeader  =  {"Authorization":sasDevToken};

     SendNorthBoundDataBinary( 
        "POST",
        myDataUrl,
        "application/octet-stream",
        u8AzureTxBuff,
        i,                              // length
        "",                             // response format
        myHeader,
        function(response) 
        {
PrintLog( 1, "Response success: SendCloudAssociateSystem()..."  );        
            if( response != null )
            {
                var responseText = JSON.stringify(response);    // Returns "" at a minimum
                if( responseText.length > 2 )
                {
                    PrintLog( 1, "Response success: SendCloudAssociateSystem()..." + responseText );
                }
            }
        },
        function(response) 
        {
            PrintLog( 99, "Response error: SendCloudAssociateSystem()..." + JSON.stringify(response) );
        }
    );
   
  

}




// RetrieveCloudDeviceKey............................................................................................
//   First see if device exists by sending a "GET":  
//     Example: https://NextivityIoTHubDev.azure-devices.net/devices/0x1118B37326C26CAA?api-version=2015-08-15-preview
//     if successful then the primary key returned will contain the key for the device.
//     if not successful, check the return statusText and if it is "Not Found" then go register the device.
//
function RetrieveCloudDeviceKey()
{
    if( azureDeviceId.length )
    {
        var myDataUrl   = "https://" + platformName + "/devices/" + azureDeviceId + "?api-version=" + platformVer;
        var myData      = "";
        var sasHubToken = GetSasHubToken( "/devices/" + azureDeviceId );
        var myHeader    =  {"Authorization":sasHubToken};
        
        PrintLog( 1, "Azure: RetrieveCloudDeviceKey: " + myDataUrl );
        
        SendNorthBoundData( 
            "GET",
            myDataUrl,
            "application/json",
            myData,
            "",                             // response format
            myHeader,
            function(response) 
            {
                if( response != null )
                {
                    var responseText = JSON.stringify(response);    // Returns "" at a minimum
                    if( responseText.length > 2 )
                    {
//                        PrintLog( 1, "Response success: RetrieveCloudDeviceKey()..." + responseText );
                        sasDevKey = response.authentication.symmetricKey.primaryKey;
SendCloudAssociateSystem();
                    }
                }
            },
            function(response) 
            {
                if( response.statusText == "Not Found" )
                {
                    // Try to create the ID...
                    PrintLog( 1, "Azure: Device has not been created yet so go and create..." );
                    CreateCloudDeviceKey(azureDeviceId);
                }
                else
                {
                    PrintLog( 99, "Response error: RetrieveCloudDeviceKey()..." + JSON.stringify(response) );
                }
            }
        );

    }
    else
    {
        PrintLog( 99, "RetrieveCloudDeviceKey: Device ID, i.e. CU Unique ID, not available yet." );
    }
}


// CreateCloudDeviceKey............................................................................................
//   Create the device in Azure with a "PUT"...  
//     Example: https://NextivityIoTHubDev.azure-devices.net/devices/0x1118B37326C26CAA?api-version=2015-08-15-preview
//
function CreateCloudDeviceKey(myId)
{
    if( azureDeviceId.length )
    {
        var myDataUrl   = "https://" + platformName + "/devices/" + myId + "?api-version=" + platformVer;
        var myData      = "{'deviceId':'" + myId + "'}";
        var sasHubToken = GetSasHubToken( "/devices/" + myId );
        var myHeader    =  {"Authorization":sasHubToken};
        
        PrintLog( 1, "Azure: CreateCloudDeviceKey: " + myDataUrl + " " + myData );
        
        SendNorthBoundData( 
            "PUT",
            myDataUrl,
            "application/json",
            myData,
            "",                             // response format
            myHeader,
            function(response) 
            {
                if( response != null )
                {
                    var responseText = JSON.stringify(response);    // Returns "" at a minimum
                    if( responseText.length > 2 )
                    {
                        sasDevKey = response.authentication.symmetricKey.primaryKey;
                    }
                }
            },
            function(response) 
            {
                PrintLog( 99, "Response error: CreateCloudDeviceKey()..." + JSON.stringify(response) );
            }
        );

    }
    else
    {
        PrintLog( 99, "CreateCloudDeviceKey: Device ID, i.e. CU Unique ID, not available yet." );
    }
}


// ----------------------------------------------------------------------------------------------
// Generate a Device token with a 2 hour expiration.  
// Regenerate the token every hour.
var tokenTimeSec = 0;        // Last time the token was generated.
function GenerateSasDevTokenHourly(entityPath) 
{
    var ds    = new Date();
    var dsSec = (ds.getTime() / 1000);
    
    if( (tokenTimeSec - dsSec) < 60 )
    {
        sasDevToken = GetSasDevToken( entityPath );
        PrintLog(1, "Azure: Regenerate 2 hour SAS token:" + sasDevToken );    
    }
}


// ----------------------------------------------------------------------------------------------
function GetSasDevToken(entityPath) 
{ 
    var uri = platformName + entityPath; 

    var ds   = new Date();
    var expireInSeconds = Math.round((ds.getTime() / 1000) + (60 * 2));
    tokenTimeSec = expireInSeconds;

    var toBeHashed = utf8Encode(uri + "\n" + expireInSeconds); 
    var decodedKey = CryptoJS.enc.Base64.parse(sasDevKey);

    var hash = CryptoJS.HmacSHA256(toBeHashed, decodedKey); 
    var base64HashValue = CryptoJS.enc.Base64.stringify(hash); 

    var token = "SharedAccessSignature sr=" + uri + "&sig=" + 
        encodeURIComponent(base64HashValue) + "&se=" + expireInSeconds + "&skn=" + sasDevKeyName; 

    return token; 
} 

// ----------------------------------------------------------------------------------------------
function GetSasHubToken(entityPath) 
{ 
    var uri = platformName + entityPath; 

    var ds   = new Date();
    var expireInSeconds = Math.round((ds.getTime() / 1000) + (60 * 2));

    var toBeHashed = utf8Encode(uri + "\n" + expireInSeconds); 
    var decodedKey = CryptoJS.enc.Base64.parse(sasHubKey);

    var hash = CryptoJS.HmacSHA256(toBeHashed, decodedKey); 
    var base64HashValue = CryptoJS.enc.Base64.stringify(hash); 

    var token = "SharedAccessSignature sr=" + uri + "&sig=" + 
        encodeURIComponent(base64HashValue) + "&se=" + expireInSeconds + "&skn=" + sasHubKeyName; 

    return token; 
} 

function utf8Encode(s)
{ 
    for(var c, i = -1, l = (s = s.split("")).length, o = String.fromCharCode; ++i < l;
            s[i] = (c = s[i].charCodeAt(0)) >= 127 ? o(0xc0 | (c >>> 6)) + o(0x80 | (c & 0x3f)) : s[i]
        );
    return s.join("");    
} 







/*
var mySandboxPlatformUrl    = "https://nextivity-sandbox-connect.axeda.com:443/ammp/";
var myPlatformUrl           = "https://nextivity-connect.axeda.com:443/ammp/";
var myOperatorCode          = "0000";
var myLat                   = 32.987838;            // Nextivity lat
var myLong                  = -117.074195;          // Nextivity long
var s_CheckRspData          = "";       
var s_CheckRspCount         = 0;
const CFG_RUN_ON_SANDBOX    = false;                 // true to run on Axeda sandbox.  false to run on Axeda production platform.





// SendCloudData............................................................................................
function SendCloudData(dataText)
{
    if( (myModel != null) && (mySn != null) )
    {
        var myData    = "{'data':[{'di': {" + dataText + "}}]}";
        var myDataUrl = myPlatformUrl + "data/1/" + myModel + "!" + mySn;
        
        PrintLog( 1, "SendCloudData: " + myDataUrl + "  " + myData );
        
        SendNorthBoundData( 
            "POST",
            myDataUrl,
            "application/json;charset=utf-8",
            myData,
            "",  // 'json',    // response format
            function(response) 
            {
                if( response != null )
                {
                    var responseText = JSON.stringify(response);    // Returns "" at a minimum
                    if( responseText.length > 2 )
                    {
                        PrintLog( 1, "Response success: SendCloudData()..." + responseText );
                        ProcessEgressResponse(response);
                    }
                }
            },
            function(response) 
            {
                PrintLog( 99, "Response error: SendCloudData()..." + JSON.stringify(response) );
            }
        );

    }
    else
    {
        PrintLog( 99, "SendCloudData: Model and SN not available yet. myModel=" + myModel + " mySn=" + mySn );
    }
    
}

// SendCloudDataCheckRsp............................................................................................
function SendCloudDataCheckRsp(dataText)
{
    if( (myModel != null) && (mySn != null) )
    {
        if( s_CheckRspData.length == 0 )
        {
            s_CheckRspCount = 0;
        }
         
        s_CheckRspData = dataText; 
        var myData     = "{'data':[{'di': {" + dataText + "}}]}";
        var myDataUrl  = myPlatformUrl + "data/1/" + myModel + "!" + mySn;
        
        PrintLog( 1, "SendCloudDataCheckRsp: " + myDataUrl + "  " + myData );
        
        SendNorthBoundData( 
            "POST",
            myDataUrl,
            "application/json;charset=utf-8",
            myData,
            "",  // 'json',    // response format
            function(response) 
            {
                // Success, clear flag...
                s_CheckRspData = "";
                
                if( response != null )
                {
                    var responseText = JSON.stringify(response);    // Returns "" at a minimum
                    if( responseText.length > 2 )
                    {
                        PrintLog( 1, "Response success: SendCloudDataCheckRsp()..." + responseText );
                        ProcessEgressResponse(response);
                    }
                }
            },
            function(response) 
            {
                PrintLog( 99, "Response error: SendCloudDataCheckRsp()..." + JSON.stringify(response) );
                
                if( s_CheckRspCount < 3 )
                {
                    // Retry...
                    PrintLog( 1, "Retrying SendCloudDataCheckRsp()" );
                    setTimeout( function(){ SendCloudDataCheckRsp(s_CheckRspData); }, 10 );  // New thread in 10 mS.
                    s_CheckRspCount++;
                }
                else
                {
                    s_CheckRspData = "";
                }
            }
        );

    }
    else
    {
        PrintLog( 99, "SendCloudData: Model and SN not available yet. myModel=" + myModel + " mySn=" + mySn );
    }
    
}

// SendCloudLocation............................................................................................
function SendCloudLocation(lat, lng)
{
    if( (myModel != null) && (mySn != null) )
    {
        var myData    = "{'locations':[{'latitude':" + lat + ", 'longitude':" + lng + "}]}";
        var myDataUrl = myPlatformUrl + "data/1/" + myModel + "!" + mySn;
        
        PrintLog( 1, "SendCloudLocation: " + myDataUrl + "  " + myData );
        
        
        SendNorthBoundData( 
            "POST",
            myDataUrl,
            "application/json;charset=utf-8",
            myData,
            "",     // 'json',    // response format
            function(response) 
            {
                if( response != null )
                {
                    var responseText = JSON.stringify(response);    // Returns "" at a minimum
                    if( responseText.length > 2 )
                    {
                        PrintLog( 1, "Response success: SendCloudLocation()..." + responseText );
                        ProcessEgressResponse(response);
                    }
                }
            },
            function(response) 
            {
                PrintLog( 99, "Response error: SendCloudLocation()..." + JSON.stringify(response) );
                ShowConfirmPopUpMsg(
                        "No location information will be stored.",    // message
                        HandleLocationBack,             // callback to invoke with index of button pressed
                        'Unable to acquire GPS.',            // title
                        ['ok'] );                       // buttonLabels
            }
        );

    }
    else
    {
        PrintLog( 99, "SendCloudLocation: Model and SN not available yet" );
    }

    
}



// SendCloudEgressStatus............................................................................................
function SendCloudEgressStatus(packageId, myStatus)
{
    if( (myModel != null) && (mySn != null) )
    {
        var myData    = "{'status':" + myStatus + "}";
        var myDataUrl = myPlatformUrl + "packages/1/" + packageId + "/status/" + myModel + "!" + mySn;
        
        PrintLog( 1, "SendCloudEgressStatus: " + myDataUrl + "  " + myData );
        
        
        SendNorthBoundData( 
            "PUT",
            myDataUrl,
            "application/json;charset=utf-8",
            myData,
            "",     // 'json',    // response format
            function(response) 
            {
                if( response != null )
                {
                    var responseText = JSON.stringify(response);    // Returns "" at a minimum
                    if( responseText.length > 2 )
                    {
                        PrintLog( 1, "Response success: SendCloudEgressStatus()..." + responseText );
                        ProcessEgressResponse(response);
                    }
                }
            },
            function(response) 
            {
                PrintLog( 99, "Response error: SendCloudEgressStatus()..." + JSON.stringify(response) );
            }
        );
        
    }
    else
    {
        PrintLog( 99, "SendCloudEgressStatus: Model and SN not available yet" );
    }

    
}


// SendCloudPoll............................................................................................
function SendCloudPoll()
{
    if( (myModel != null) && (mySn != null) )
    {
        var myAssetUrl = myPlatformUrl + "assets/1/" + myModel + "!" + mySn;
        
        PrintLog( 1, "SendCloudPoll: " + myAssetUrl );
        
        
        SendNorthBoundData( 
            "POST",
            myAssetUrl,
            "",         // no contentType
            "",         // no data
            "",     // 'json',     // response format
            function(response) 
            {
                if( response != null )
                {
                    var responseText = JSON.stringify(response);    // Returns "" at a minimum
                    if( responseText.length > 2 )
                    {
                        PrintLog( 1, "Response success: SendCloudPoll()..." + responseText );
                        ProcessEgressResponse(response);
                    }
                }
            },
            function(response) 
            {
                PrintLog( 99, "Response error: SendCloudPoll()..." + JSON.stringify(response) );
            }
        );
        
    }
    else
    {
        PrintLog( 99, "SendCloudPoll: Model and SN not available yet" );
    }
}







// FixCloudVer....................................................................................
// 
// Convert version strings, 700.xxx.yyy.zzz to yyy.zzz.
//
function FixCloudVer(ver)
{
    var inVer = ver;

    // First check to make sure that there is a period "." in the string...
    if( ver.search(/\x2E/) != -1 )
    {
        // 700.xxx.yyy.zzz in xxx.yyy.zzz out
        var str1 = ver.substring(ver.search(/\x2E/) + 1);           // 0x2E is a period ".".
        
        
        // xxx.yyy.zzz in yyy.zzz out.
        var str2 = str1.substring(str1.search(/\x2E/) + 1);         // 0x2E is a period ".".
        
        // Make sure that there is at least one more period in the string...
        if( str2.search(/\x2E/) != -1 )
        {
            ver = str2;
            
            // Make sure that it is zero loaded up front... xxx.yyy
            if( ver.length < 7 )
            {
                str1 = ver.substring(0,ver.search(/\x2E/));         // grab xxx
                str2 = ver.substring(ver.search(/\x2E/) + 1);       // grab yyy
                
                if( str1.length == 1 )                        // test for x.yyy
                {
                    str1 = "00" + str1;
                }
                else if( str1.length == 2 )                   // test for xx.yyy
                {
                    str1 = "0" + str1;
                }
                
                if( str2.length == 1 )                        // test for xxx.y
                {
                    str2 = "00" + str2;
                }
                else if( str2.length == 2 )                   // test for xxx.yy
                {
                    str2 = "0" + str2;
                }
                
                ver = str1 + "." + str2;
            }
        }
    }    
    
    PrintLog(1, "FixCloudVer() in =" + inVer + " out=" + ver );

    return( ver );
}

// FixInternalVer....................................................................................
// 
// Convert version strings, yyy.zzz to yyy.zzz making sure 7 characters...
//
function FixInternalVer(ver)
{
    var inVer = ver;

    // First check to make sure that there is a period "." in the string...
    if( ver.search(/\x2E/) != -1 )
    {
        // Make sure that it is zero loaded up front... xxx.yyy
        if( ver.length < 7 )
        {
            var str1 = ver.substring(0,ver.search(/\x2E/));         // grab xxx
            var str2 = ver.substring(ver.search(/\x2E/) + 1);       // grab yyy
            
            if( str1.length == 0 )                        // test for .yyy
            {
                str1 = "000";
            }
            else if( str1.length == 1 )                   // test for x.yyy
            {
                str1 = "00" + str1;
            }
            else if( str1.length == 2 )                   // test for xx.yyy
            {
                str1 = "0" + str1;
            }
            
            if( str2.length == 0 )                        // test for xxx.null
            {
                str2 = "000";
            }
            else if( str2.length == 1 )                   // test for xxx.y
            {
                str2 = "00" + str2;
            }
            else if( str2.length == 2 )                   // test for xxx.yy
            {
                str2 = "0" + str2;
            }
            
            ver = str1 + "." + str2;
        }
    }
    else
    {
        // No period so make something up...
        ver = "000.000";
    }    
    
//    PrintLog(1, "FixInternalVer() in =" + inVer + " out=" + ver );

    return( ver );
}


// ProcessEgressResponse......................................................................................
function ProcessEgressResponse(eg)
{
    var i;
    var egStr;
    
    //  Set items loook like....    
    // {set:[
    //          {items:{firstName:"John"},priority:0},
    //          {items:{lastName:"Doe"},priority:0},
    //          {items:{city:"San Clemente"},priority:0},
    //          {items:{getUserInfoAction:"true"},priority:0},
    //      ]  
    //  } ;
    
    egStr = JSON.stringify(eg);
    if( egStr.search("set") != -1 )
    {
        PrintLog(1, "Egress: Number of set items equals " + eg.set.length );
    
        for( i = 0; i < eg.set.length; i++ )
        {
            egStr = JSON.stringify(eg.set[i].items);
            

            // Search for strings associated with getUserInfoAction (search() returns -1 if no match found)
            //   getUserInfoAction returns false if there is no information but set bGotUserInfoRspFromCloud
            //   just to know that the cloud has returned nothing or something.
            if(      egStr.search("getUserInfoAction") != -1 )   bGotUserInfoRspFromCloud   = true;        
            else if( egStr.search("firstName")         != -1 )   guiUserFirstName = szRegFirstName  = eg.set[i].items.firstName;
            else if( egStr.search("SKU_Number")        != -1 )   mySkuCld = eg.set[i].items.SKU_Number;
//            else if( egStr.search("SwVerNU_CF")        != -1 )   cldSwVerNuCf = FixCloudVer(eg.set[i].items.SwVerNU_CF);
            
            
            
                    

            // Search for strings associated with OperatorList egress...
            if(      egStr.search("OperatorList")      != -1 )   
            {
                bGotOperatorInfoRspFromCloud = true;
                szOperatorSkus               = eg.set[i].items.OperatorList;
                
                if( szOperatorCodeNames != null )
                {
                    GenerateOperatorList();
                }
            }        


                    
            // Search for strings associated with Registration egress...
            if(      egStr.search("regOpForce")        != -1 )   myRegOpForce               = eg.set[i].items.regOpForce;       // true to force
            else if( egStr.search("regDataFromOp")     != -1 )   myRegDataFromOp            = eg.set[i].items.regDataFromOp;
    
            
            // Search for strings associated with Software Download egress...
            else if( egStr.search("isUpdateAvailable") != -1 )  {isUpdateAvailableFromCloud = eg.set[i].items.isUpdateAvailable;  bGotUpdateAvailableRspFromCloud  = true;}
            else if( egStr.search("SwVerNU_CF_CldVer") != -1 )  {nxtySwVerNuCfCld           = eg.set[i].items.SwVerNU_CF_CldVer;  bNeedNuCfCldId    = true;  nxtySwVerNuCfCld  = FixCloudVer(nxtySwVerNuCfCld);}
            else if( egStr.search("SwVerCU_CF_CldVer") != -1 )  {nxtySwVerCuCfCld           = eg.set[i].items.SwVerCU_CF_CldVer;  bNeedCuCfCldId    = true;  nxtySwVerCuCfCld  = FixCloudVer(nxtySwVerCuCfCld);}
            else if( egStr.search("SwVerNU_PIC_CldVer") != -1 ) {nxtySwVerNuPicCld          = eg.set[i].items.SwVerNU_PIC_CldVer; bNeedNuPicCldId   = true;  nxtySwVerNuPicCld = FixCloudVer(nxtySwVerNuPicCld);}
            else if( egStr.search("SwVerCU_PIC_CldVer") != -1 ) {nxtySwVerCuPicCld          = eg.set[i].items.SwVerCU_PIC_CldVer; bNeedCuPicCldId   = true;  nxtySwVerCuPicCld = FixCloudVer(nxtySwVerCuPicCld);}
            else if( egStr.search("SwVer_BT_CldVer")    != -1 ) {nxtySwVerCuBtCld           = eg.set[i].items.SwVer_BT_CldVer;    bNeedBtCldId      = true;  nxtySwVerCuBtCld  = FixCloudVer(nxtySwVerCuBtCld);}
            
            else if( egStr.search("SwVerNU_UCFG_CldVer") != -1 ) {nxtySwVerNuUCfgCld        = eg.set[i].items.SwVerNU_UCFG_CldVer; bNeedNuUCfgCldId = true;  nxtySwVerNuUCfgCld = FixCloudVer(nxtySwVerNuUCfgCld);}
            else if( egStr.search("SwVerNU_SCFG_CldVer") != -1 ) {nxtySwVerNuSCfgCld        = eg.set[i].items.SwVerNU_SCFG_CldVer; bNeedNuSCfgCldId = true;  nxtySwVerNuSCfgCld = FixCloudVer(nxtySwVerNuSCfgCld);}
            else if( egStr.search("SwVerNU_SCFG_CldRev") != -1 ) {nxtySwVerNuSCfgCldRev     = eg.set[i].items.SwVerNU_SCFG_CldRev; }
            else if( egStr.search("SwVerNU_ART_CldVer") != -1 )  {nxtySwVerNuArtCld         = eg.set[i].items.SwVerNU_ART_CldVer;  bNeedNuArtCldId  = true;  nxtySwVerNuArtCld  = FixCloudVer(nxtySwVerNuArtCld);}
            else if( egStr.search("SwVerNU_EVM_CldVer") != -1 )  {nxtySwVerNuEvmCld         = eg.set[i].items.SwVerNU_EVM_CldVer;  bNeedNuEvmCldId  = true;  nxtySwVerNuEvmCld  = FixCloudVer(nxtySwVerNuEvmCld);}
            else if( egStr.search("SwVerCU_ART_CldVer") != -1 )  {nxtySwVerCuArtCld         = eg.set[i].items.SwVerCU_ART_CldVer;  bNeedCuArtCldId  = true;  nxtySwVerCuArtCld  = FixCloudVer(nxtySwVerCuArtCld);}
            
        }
        
        
        if( (bGotUserInfoRspFromCloud == true) && (mySkuCld == null) )
        {
            // If not SKU number in cloud then send first one...
            SendCloudData( "'SKU_Number':'" + mySku + "'" );
        }
        
        // Remove the "700.xxx" from the "700.xxx.yyy.zzz" cloud string.
//        nxtySwVerNuCfCld  = FixCloudVer(nxtySwVerNuCfCld);
//        nxtySwVerCuCfCld  = FixCloudVer(nxtySwVerCuCfCld);
//        nxtySwVerNuPicCld = FixCloudVer(nxtySwVerNuPicCld);
//        nxtySwVerCuPicCld = FixCloudVer(nxtySwVerCuPicCld);
//        nxtySwVerCuBtCld  = FixCloudVer(nxtySwVerCuBtCld);
    }


    // packages look like...
    // {packages:[
    //                  {id:641, instructions:[
    //                      {@type:down, id:921, fn:"WuExecutable.sec", fp:"."}], priority:0, time:1414810929705},
    //                  {id:642, instructions:[
    //                      {@type:down, id:922, fn:"BTFlashImg.bin", fp:"."}], priority:0, time:1414810929705}
    //               ]

    egStr = JSON.stringify(eg);
    if( egStr.search("packages") != -1 )
    {
        PrintLog(1, "Egress: Number of package instructions equals " + eg.packages.length );
        
        // Find the fixed file names and save the file ID numbers.   Note that the first ID is the package ID.
        //  File name "PICFlashImg.bin" is used for both the NU and CU PICs.
        //  Future proof in case there are different PIC images: "NuPICFlashImg.bin" and "CuPICFlashImg.bin"
        for( i = 0; i < eg.packages.length; i++ )
        {
            egStr = JSON.stringify(eg.packages[i].instructions);
            
            var packageId = eg.packages[i].id;
            SendCloudEgressStatus(packageId, 0);    // Indicate QUEUED
            SendCloudEgressStatus(packageId, 2);    // Indicate SUCCESS
            
            // Search for strings associated with software download (search() returns -1 if no match found)
            if(      egStr.search(myNuCfFileName)   != -1 )   fileNuCfCldId   = eg.packages[i].instructions[0].id;        
            else if( egStr.search(myCuCfFileName)   != -1 )   fileCuCfCldId   = eg.packages[i].instructions[0].id;  
            else if( egStr.search("PICFlashImg")    != -1 )   fileNuPicCldId  = fileCuPicCldId = eg.packages[i].instructions[0].id;  
            else if( egStr.search(myNuPicFileName)  != -1 )   fileNuPicCldId  = eg.packages[i].instructions[0].id;                     // Future proof  
            else if( egStr.search(myCuPicFileName)  != -1 )   fileCuPicCldId  = eg.packages[i].instructions[0].id;                     // Future proof
            else if( egStr.search(myBtFileName)     != -1 )   fileBtCldId     = eg.packages[i].instructions[0].id;
            else if( egStr.search(myNuSCfgFileName) != -1 )   fileNuSCfgCldId = eg.packages[i].instructions[0].id;  
            else if( egStr.search(myNuUCfgFileName) != -1 )   fileNuUCfgCldId = eg.packages[i].instructions[0].id;  
            else if( egStr.search(myNuArtFileName)  != -1 )   fileNuArtCldId  = eg.packages[i].instructions[0].id;  
            else if( egStr.search(myNuEvmFileName)  != -1 )   fileNuEvmCldId  = eg.packages[i].instructions[0].id;  
            else if( egStr.search(myCuArtFileName)  != -1 )   fileCuArtCldId  = eg.packages[i].instructions[0].id;  
        }
        

        // See if we received all needed packages after we received the set...
        if( isUpdateAvailableFromCloud )
        {  
            if( (bNeedNuCfCldId    && (fileNuCfCldId   == 0)) || 
                (bNeedCuCfCldId    && (fileCuCfCldId   == 0)) || 
                (bNeedNuPicCldId   && (fileNuPicCldId  == 0)) || 
                (bNeedNuSCfgCldId  && (fileNuSCfgCldId == 0)) || 
                (bNeedNuUCfgCldId  && (fileNuUCfgCldId == 0)) || 
                (bNeedNuArtCldId   && (fileNuArtCldId  == 0)) || 
                (bNeedNuEvmCldId   && (fileNuEvmCldId  == 0)) || 
                (bNeedCuPicCldId   && (fileCuPicCldId  == 0)) || 
                (bNeedCuArtCldId   && (fileCuArtCldId  == 0)) || 
                (bNeedBtCldId      && (fileBtCldId     == 0)) )
            {
                bGotPackageAvailableRspFromCloud = false;    
            }
            else
            {
                bGotPackageAvailableRspFromCloud = true;    
            }
        }
        
    }  
    
    PrintLog(1, "Egress:  bGotUpdateAvailableRspFromCloud=" + bGotUpdateAvailableRspFromCloud + " isUpdateAvailableFromCloud=" + isUpdateAvailableFromCloud + " bGotPackageAvailableRspFromCloud=" + bGotPackageAvailableRspFromCloud );
    
//    if( nxtySwVerNuCfCld != swVerNoCldText ) PrintLog(1, "  NU_CF = " + nxtySwVerNuCfCld + "  file id = " + fileNuCfCldId);
    PrintLog(1, "  NU_CF   = " + nxtySwVerNuCfCld   + "  file id = " + fileNuCfCldId);
    PrintLog(1, "  CU_CF   = " + nxtySwVerCuCfCld   + "  file id = " + fileCuCfCldId);
    PrintLog(1, "  NU_PIC  = " + nxtySwVerNuPicCld  + "  file id = " + fileNuPicCldId);
    PrintLog(1, "  CU_PIC  = " + nxtySwVerCuPicCld  + "  file id = " + fileCuPicCldId);
    PrintLog(1, "  BT      = " + nxtySwVerCuBtCld   + "  file id = " + fileBtCldId);
    PrintLog(1, "  NU_SCFG = " + nxtySwVerNuSCfgCld + "  file id = " + fileNuSCfgCldId + "  Rev = " + nxtySwVerNuSCfgCldRev);
    PrintLog(1, "  NU_UCFG = " + nxtySwVerNuUCfgCld + "  file id = " + fileNuUCfgCldId);
    PrintLog(1, "  NU_ART  = " + nxtySwVerNuArtCld  + "  file id = " + fileNuArtCldId);
    PrintLog(1, "  CU_ART  = " + nxtySwVerCuArtCld  + "  file id = " + fileCuArtCldId);
    PrintLog(1, "  NU_EVM  = " + nxtySwVerNuEvmCld  + "  file id = " + fileNuEvmCldId);
    
    var tempVerCount = 0;
    var tempPkgCount = 0;
    if( nxtySwVerNuCfCld   != swVerNoCldText )  tempVerCount++;
    if( nxtySwVerCuCfCld   != swVerNoCldText )  tempVerCount++;
    if( nxtySwVerNuPicCld  != swVerNoCldText )  tempVerCount++;
    if( nxtySwVerCuPicCld  != swVerNoCldText )  tempVerCount++;
    if( nxtySwVerCuBtCld   != swVerNoCldText )  tempVerCount++;
    if( nxtySwVerNuSCfgCld != swVerNoCldText )  tempVerCount++;
    if( nxtySwVerNuUCfgCld != swVerNoCldText )  tempVerCount++;
    if( nxtySwVerNuArtCld  != swVerNoCldText )  tempVerCount++;
    if( nxtySwVerCuArtCld  != swVerNoCldText )  tempVerCount++;
    if( nxtySwVerNuEvmCld  != swVerNoCldText )  tempVerCount++;
    if( fileNuCfCldId   != 0 )                  tempPkgCount++;
    if( fileCuCfCldId   != 0 )                  tempPkgCount++; 
    if( fileNuPicCldId  != 0 )                  tempPkgCount++; 
    if( fileCuPicCldId  != 0 )                  tempPkgCount++; 
    if( fileBtCldId     != 0 )                  tempPkgCount++; 
    if( fileNuSCfgCldId != 0 )                  tempPkgCount++; 
    if( fileNuUCfgCldId != 0 )                  tempPkgCount++; 
    if( fileNuArtCldId  != 0 )                  tempPkgCount++; 
    if( fileCuArtCldId  != 0 )                  tempPkgCount++; 
    if( fileNuEvmCldId  != 0 )                  tempPkgCount++; 

    // Calculate a percentage based on the total number of versions and packages.
    //  Example:  
    //     4 versions                = 100/5 = 20%
    //     4 versions and 1 package  = 200/5 = 40%
    //     4 versions and 4 packages = 500/5 = 100%
    
    if( tempVerCount > 0 )
    {
        var tempPercentComplete = (100 * (tempPkgCount + 1)) / (tempVerCount + 1);
        
        if( tempPercentComplete < 0 )
        {
            tempPercentComplete = 0;
        }
            
        if( tempPercentComplete > 100 )
        {
            tempPercentComplete = 100;
        }
        
        // Only allow an increase...
        if( tempPercentComplete > guiSoftwareCheckPercentComplete )
        {
            guiSoftwareCheckPercentComplete = tempPercentComplete;
        }
    }
        
    PrintLog(1, "VerCount=" + tempVerCount + " PkgCount=" + tempPkgCount + "  guiSoftwareCheckPercentComplete=" + guiSoftwareCheckPercentComplete );
    
}



*/

    

    
    
/*    

// SendAzureData Hard code example showing how to communicate with Azure ........................................................
function SendAzureData( )
{


    var nType = "POST";
//    var nUrl  = "https://myIotHubYavuz.azure-devices.net/devices/myFirstDevice/messages/events?api-version=2015-08-15-preview"
    var nUrl  = "https://NextivityIoTHubDev.azure-devices.net/devices/myFirstDevice/messages/events?api-version=2015-08-15-preview"
    var nContentType = "application/octet-stream";
//    var nData = "{'deviceId': 'myFirstDevice','App Speed':" + tempCounter + "}";
    var nData = "{'App Speed':" + tempCounter + "}";        // Does not look like we need the deviceId in the data....

    var nRespFormat = "";
    var nHeader     = {"Authorization":sasDevToken};

//PrintLog(1,"nType       =" + nType );
//PrintLog(1,"nUrl        =" + nUrl );
//PrintLog(1,"nContentType=" + nContentType );
//PrintLog(1,"nData       =" + nData );
//PrintLog(1,"nRespFormat =" + nRespFormat );
//PrintLog(1,"nHeader     =" + nHeader );


    PrintLog(1, "Azure: " + nType + " to " + nUrl + " Data:" + nData );

    
    // Verify that we have network connectivity....
    isNetworkConnected = NorthBoundConnectionActive();

    if( isNetworkConnected )
    {
        GenerateSasDevTokenHourly( "/devices/myFirstDevice" );
    
        // Send data to the cloud using a jQuery ajax call...        
        $.ajax({
            type       : nType,
            url        : nUrl,
            contentType: nContentType,
            data       : nData,
            crossDomain: true,                  // Needed to set to true to talk to Nextivity server.
            dataType   : nRespFormat,           // Response format
            headers    : nHeader,

//            headers: {
//                "iothub-to": "/devices/myFirstDevice/messages/events",
//                "Authorization": "SharedAccessSignature sr=myIotHubYavuz.azure-devices.net/devices/myFirstDevice&sig=xHMvGnZ67nBTXpLqfxxaEjFRFJPcTBPvLnVsTRyVtf4%3d&se=1457983280&skn=",
//                "Authorization": sasDevToken,
//            },
            
            success      : function(response)     // success call back
            {
                PrintLog(1, "Azure: Success" ); 
            },
            error     : function(response)                      // error call back
            {
                PrintLog(1, "Azure: Response error: " + JSON.stringify(response) );
            },
            
            timeout    : 10000                   // sets timeout to 10 seconds
        });
    }
    else
    {
        PrintLog( 99, "SendAzureData: No network connection (WiFi or Cell)." );
    }

  
tempCounter++;

    
}
*/    