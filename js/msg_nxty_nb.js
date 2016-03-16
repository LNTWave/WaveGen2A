//=================================================================================================
//
//  File: msg_nxty_nb.js
//
//  Description:  This file is used to format communications with the Nextivity server.
//                The Nextivity server is used to get part number information.
//
//=================================================================================================

//var myNextivityUrl    = "https://celfitest.nextivityinc.com/";
var myNextivityUrl    = "https://celfi.nextivityinc.com/";

var ConfigFile           = null; 
var bGotConfigFile       = false;

// Bug 1522: Retry if server error...
var retryMax                = 3;
var retryPartNumberArg      = null;
var retryPartNumberCount    = 0;
var retryOperatorListCount  = 0;
var retryOperatorCodeArg    = null;
var retryOperatorCodeCount  = 0;


// ProcessSku............................................................................................
function ProcessSku(textIn)
{
    myModel = mySku = textIn;
    newOperatorSku  = mySku;         // Fill in as a default until user selects a new operator.
    guiProductType  = GetProductTypeFromSku( mySku );

    // If the 590 number power plug option is Auto, then this is mobility, per JC.
    // 590N P   3   4   FT  UK  1   VF  UK  6   B   B   1
    //                                      ^
    //                                   6 means Auto
    if( textIn.substring(16,17) == '6' )
    {
        guiMobilityFlag = true;
    }
    
    // The new 590 should be at least 20 characters in length...
    if( textIn.length >= 20 )
    {
        myOperatorCode = textIn.substring(12,16);
    } 
    
    PrintLog(1, "SKU: " + mySku + "  Model Number: " + myModel + "  Product type based on SKU: " + guiProductType + " OpCode: " + myOperatorCode );
}

// GetNxtyPartNumber............................................................................................
// Should return: "590NP34FTUK1VFUK6BB1"
function GetNxtyPartNumber(uniqueId)
{
    retryPartNumberArg = uniqueId;
    
    // Build the URL...
    var myBigUrl  = myNextivityUrl + "PartNumberReq/"+ uniqueId.substring(2);
    
    PrintLog( 1, "GetNxtyPartNumber: " + myBigUrl );
    
    SendNorthBoundData( 
        "GET",
        myBigUrl,
        "text/plain",     
        "",
        "",                                 // response format
        "",                                     // headers
        function(response)                      // success call back
        {
            retryPartNumberCount = 0;
            PrintLog( 1, "Response success: GetNxtyPartNumber()..." + JSON.stringify(response) );
            if( response != null )
            {
                ProcessSku(response);
                
                // Store the SKU on the phone if new sku format, i.e. 20 bytes...
                if( mySku.length == 20 )
                {
                    PrintLog( 1, "  Store SKU on phone to get later..." );
                    window.localStorage.setItem(nxtyCuUniqueId, response);
                }
            }
        },
        function(response)                      // error call back
        {
            PrintLog( 99, "Response error: GetNxtyPartNumber()..." + JSON.stringify(response) );
            
            if( retryPartNumberCount < retryMax )
            {
                PrintLog(1, "Retry GetNxtyPartNumber()" );
                GetNxtyPartNumber(retryPartNumberArg);
                retryPartNumberCount++;
            } 
            else
            {
                retryPartNumberCount = 0;
            }
        }
    );
    
    
}

// GetNxtyOperatorList............................................................................................
// Should return: "A1AT:A1 Telecom Austria AG,AEBR:Accenture Brazil,ALSA:Aljawal STC Saudi Arabia,ATUS:AT&T,BLCA:Bell Canada,RGCA:Rogers Canada,TUCA:Telus Canada,VMCA:Videotron Canada,WMCA:Wind Mobile Canada"
function GetNxtyOperatorList()
{
    // Build the URL...
    var myBigUrl  = myNextivityUrl + "OperatorListReq";
    
    PrintLog( 1, "GetNxtyOperatorList: " + myBigUrl );
    
    SendNorthBoundData( 
        "GET",
        myBigUrl,
        "text/plain",     
        "",
        "",                                 // response format
        "",                                     // headers
        function(response)                      // success call back
        {
            retryOperatorListCount = 0;
            PrintLog( 1, "Response success: GetNxtyOperatorList()..." + JSON.stringify(response) );
            if( response != null )
            {
                // looks like: "A1AT:A1 Telecom Austria AG,AEBR:Accenture Brazil,ALSA:Aljawal STC Saudi Arabia,ATUS:AT&T"
                szOperatorCodeNames = response;    
            }
        },
        function(response)                      // error call back
        {
            PrintLog( 99, "Response error: GetNxtyOperatorList()..." + JSON.stringify(response) );
            
            if( retryOperatorListCount < retryMax )
            {
                PrintLog(1, "Retry GetNxtyOperatorList()" );
                GetNxtyOperatorList();
                retryOperatorListCount++;
            } 
            else
            {
                retryOperatorListCount = 0;
            }
        }
    );
}



// GetNxtyConfigFile............................................................................................
function GetNxtyConfigFile(uniqueId, partNum)
{
    // Build the URL...
    var myBigUrl  = myNextivityUrl + "SpecificBinaryReq/"+ uniqueId.substring(2) + "/" + partNum;
    
    PrintLog( 1, "GetNxtyConfigFile: " + myBigUrl );
    
            
    // Path:   "file:///storage/emulated/0/Download/590...."
    var myPhoneFilePath;
    if( window.device.platform != pcBrowserPlatform )
    {
        myPhoneFilePath = g_fileSystemDir.toURL() + "NuSCfg.bin_" + nxtySwVerNuSCfgCld;
    }
    else
    {
        myPhoneFilePath = g_fileSystemDir + "NuSCfg.bin_" + nxtySwVerNuSCfgCld;
    }
            
    FileTransferDownload( myBigUrl, myPhoneFilePath );
    
    return(myPhoneFilePath); 
    
}


// GetNxtyOperatorCode............................................................................................
// Should return:  "ATUS:AT&T"
function GetNxtyOperatorCode(sevenHundredNumber)
{
    retryOperatorCodeArg = sevenHundredNumber;
    
    // Build the URL...
    var myBigUrl  = myNextivityUrl + "OperatorCodeReq/" + sevenHundredNumber;
    
    
    if( sevenHundredNumber.length > 5 )
    {
        PrintLog( 1, "GetNxtyOperatorCode: " + myBigUrl );
        
        SendNorthBoundData( 
            "GET",
            myBigUrl,
            "text/plain",     
            "",
            "",                                 // response format
            "{}",                                     // headers
            function(response)                      // success call back
            {
                retryOperatorCodeCount = 0;
                PrintLog( 1, "Response success: GetNxtyOperatorCode()..." + JSON.stringify(response) );
                if( response != null )
                {
                    // Response looks like: "ATUS:AT&T"
                    guiOperatorCode = response.substring(0,4);      // 4 digit code
                        
                    var textIdx = response.search(":");
                    if( textIdx != -1 )
                    {
                        guiOperator = response.substring(textIdx+1);
                    }
                    
                    PrintLog(1, "Operator Code: " + guiOperatorCode + "  Operator: " + guiOperator );
                }
            },
            function(xhr, textStatus, errorThrown)                      // error call back
            {
                PrintLog( 99, "Response error: GetNxtyOperatorCode()..." + JSON.stringify(xhr) + " status:" + textStatus + " err:" + errorThrown );
                
                if( retryOperatorCodeCount < retryMax )
                {
                    PrintLog(1, "Retry GetNxtyOperatorCode()" );
                    GetNxtyOperatorCode(retryOperatorCodeArg);
                    retryOperatorCodeCount++;
                } 
                else
                {
                    retryOperatorCodeCount = 0;
                }
                
            }
        );
    }
    else
    {
        PrintLog(99, "GetNxtyOperatorCode: " + myBigUrl + " Invalid Secured Config PN." );
    }
    
}
