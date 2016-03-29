//=================================================================================================
//
//  File: main.js
//
//  Description:  Main javascript entry point.   
//                Contains main menu logic and misc support functions.
//
//=================================================================================================

var isRegistered 				= true;
var myModel                     = null;
var mySn                        = null;
var mySku                       = null;
var mySkuCld                    = null;

const   MAIN_LOOP_COUNTER_MAX   = 120;
const   UNII_TRY_COUNTER_MAX    = 45;
const   SwPnNuCu                = "700.036.";
const   SwPnPic                 = "700.040.";
const   SwPnBt                  = "700.041.";
const   SwPnNuCfg               = "700.037.";       // Both Secured and Unsecured  (Hash Alpha)
const   SwPnArt                 = "800.003.";
const   SwPnNuEvm               = "800.004.";


const   PROG_MODE_MAIN          = 100;
const   PROG_MODE_DOWNLOAD      = 200;
const   PROG_MODE_DOWNLOAD_AUTO = 201;      // Same as DOWNLOAD but no user button presses.
const   PROG_MODE_TECH          = 300;
const   PROG_MODE_SETTINGS      = 400;
const   PROG_MODE_REGISTRATION  = 500;
const   NUM_CHANNELS            = 4;
const   BOOST_TOO_CLOSE         = -1;
const   BOOST_TOO_FAR           = 10;
const	PROG_MODE_ADVANCED		= 600;


var bSendLocalInfoToCloud       = false;
var bUniiUp                     = false;
var bUniiStatusKnown            = false;
var uMainLoopCounter            = 0;
var uStateCounter               = 0;
var uRemoteStateCounter         = 0;
var MainLoopIntervalHandle      = null; 
var uRegLockStateCounter        = 0;

var bGotUserInfoRspFromCloud    = false;
var bPrivacyViewed              = false;
var bCheckSouthBoundIfOnStartup = true;
var bSpinner                    = false;
var checkUniiStatusMainTimer    = null;
var bCnxToCu                    = true;             // Set to true if connected locally to CU after reading local BoardConfig.
var bCnxToOneBoxNu              = false;            // Set to true if connected to a 1-Box NU, all UART redirects are disabled.

var bGotRegLockStatus           = false;
var bForceSwUpdate              = false;

var iOSPlatform                 = "iOS";
var androidPlatform             = "Android";
var pcBrowserPlatform           = "PcBrowser";
var szNoBoosterCnxMsg           = "This functionality is not available until you reconnect to your booster.";
var isNxtyStatusCurrentMain     = false;


// V1 old PIC additions
var v1GatheringMainData         = false;



var uIcd                    = 0;
var swVerBtScan             = "--.--";          // Filled in by scan results. 
var szVerApp                = "01.05.85";       // In BCD, remember config.xml as well.


// Determine which messages get sent to the console.  1 normal, 10 verbose.
// Level  1: Flow and errors.
// Level  2: Raw bluetooth Tx data
// Level  3: Raw bluetooth Rx Data partial msgs
// Level  4: Timing loops
// Level 10: Bluetooth processing.
// Level 99: Error, print in red.

var PrintLogLevel = 3;
var softwareVersionFlag = false;







//.................................................................................................
function StartMainLoop( loopTime )
{
    PrintLog(1, "StartMainLoop(" + loopTime + ")" );        
    if( MainLoopIntervalHandle != null )
    {
        StopMainLoop();
    }

    MainLoopIntervalHandle = setInterval(app.mainLoop, loopTime );
}


//.................................................................................................
function StopMainLoop()
{
//    PrintLog(1, "StopDownloadLoop()" );
    clearInterval(MainLoopIntervalHandle)
    MainLoopIntervalHandle = null;
}


// RequestModeChange............................................................................................
function RequestModeChange(newMode)
{
    if( newMode == PROG_MODE_MAIN )
    {
        PrintLog(1, "RequestModeChange(MAIN) -----------------------------------------------------------------");
        
        HandleBackKey();
    }
    else if( newMode == PROG_MODE_REGISTRATION )
    {
        PrintLog(1, "RequestModeChange(REGISTRATION) -----------------------------------------------------------------");
        mainScreenSelectedTab = "";
        // Handle if button is displayed...
        //if( guiButtonRegHtml.length > 10 )
        //{
            StopMainLoop();            
            if( isSouthBoundIfCnx && bUniiUp )
            {
                StopGatheringTechData();
//                clearTimeout(checkUniiStatusMainTimer);
                SendCloudPoll();
//                setTimeout(reg.renderRegView, 300);
                reg.renderRegView();
            }
            else
            {
                if( isSouthBoundIfCnx == false )
                {
                    ShowAlertPopUpMsg(szSouthBoundIfNotCnxMsg, szNoBoosterCnxMsg);
                }
                else
                {
                    ShowAlertPopUpMsg("Wireless link down.", "Registration mode not allowed...");
                }
            }
       // }   // if button is displayed
    }
    else if( newMode == PROG_MODE_TECH )
    {
        PrintLog(1, "RequestModeChange(TECH) -----------------------------------------------------------------");
    
    
        // Handle if button is displayed...
        if( guiButtonTkHtml.length > 10 )
        {
            StopMainLoop();            
                        
            if( isSouthBoundIfCnx )
            {
//                clearTimeout(checkUniiStatusMainTimer);
//                setTimeout(tech.renderTechView, 300);
                tech.renderTechView();
            }
            else
            {
                ShowAlertPopUpMsg(szSouthBoundIfNotCnxMsg, szNoBoosterCnxMsg);
            }
        }   // if button is displayed...
    }
    else if( newMode == PROG_MODE_ADVANCED )
    {
        PrintLog(1, "RequestModeChange(ADVANCED) -----------------------------------------------------------------");
        
        // Handle if button is displayed...
        if( guiButtonTkHtml.length > 10 )
        {
            StopMainLoop();            
                        
            if( isSouthBoundIfCnx )
            {
//                clearTimeout(checkUniiStatusMainTimer);
//                setTimeout(advncd.renderAdvancedView, 300);
                advncd.renderAdvancedView();
            }
            else
            {
                ShowAlertPopUpMsg(szSouthBoundIfNotCnxMsg, szNoBoosterCnxMsg);
            }
        }   // if button is displayed...
    }
    else if( newMode == PROG_MODE_SETTINGS )
    {
        PrintLog(1, "RequestModeChange(SETTINGS) -----------------------------------------------------------------");

        // Handle if button is displayed...
        //if( (guiAntennaFlag == true) || (guiBoosterFlag == true) )
        //{
            StopMainLoop();            
           
            //if( isSouthBoundIfCnx && bUniiUp )
            //{
                StopGatheringTechData();
//                clearTimeout(checkUniiStatusMainTimer);
//                setTimeout(Stg.renderSettingsView, 300);
                Stg.renderSettingsView();
            //}
            //else
            //{
                /*if( isSouthBoundIfCnx == false )
                {
                    ShowAlertPopUpMsg(szSouthBoundIfNotCnxMsg, szNoBoosterCnxMsg);
                }
                else
                {
                    ShowAlertPopUpMsg("Wireless link down", "Antenna mode not allowed...");
                }*/
            //}
        //}   // If button is displayed
    }
    else if( newMode == PROG_MODE_DOWNLOAD )
    {
        PrintLog(1, "RequestModeChange(DOWNLOAD) -----------------------------------------------------------------");

        // Handle if button is displayed...
        if( guiButtonSwHtml.length > 10 )
        {
            StopMainLoop();            
        
            if( isSouthBoundIfCnx )
            {
                StopGatheringTechData();
                StopSettingsLoop();
                
//                clearTimeout(checkUniiStatusMainTimer);
                Dld.renderDldView();  
            }
            else
            {
                ShowAlertPopUpMsg(szSouthBoundIfNotCnxMsg, szNoBoosterCnxMsg );
            }
        } // if button is displayed...            
        
    }
    else if( newMode == PROG_MODE_DOWNLOAD_AUTO )
    {
        {
            PrintLog(1, "RequestModeChange(DOWNLOAD_AUTO) -----------------------------------------------------------------");
            StopMainLoop();            
        
            if( isSouthBoundIfCnx )
            {
                StopGatheringTechData();
//                clearTimeout(checkUniiStatusMainTimer);
                bDldAutoMode = true;
                Dld.renderDldView();  
            }
            else
            {
                ShowAlertPopUpMsg(szSouthBoundIfNotCnxMsg, szNoBoosterCnxMsg );
            }
        } // if button is displayed...            
        
    }
    else
    {
        PrintLog(99, "RequestModeChange(unknown)=" + newMode );
    }
    
}


// HandleBackKey............................................................................................
function HandleBackKey()
{
    
    if( guiCurrentMode == PROG_MODE_MAIN )
    {
        // Android:  Go to background mode.  No longer ask to exit app...
        navigator.app.exitApp()
    }
    else if( guiCurrentMode == PROG_MODE_REGISTRATION )
    {
        reg.handleBackKey();
    }
    else if( guiCurrentMode == PROG_MODE_TECH )
    {
        tech.handleBackKey();
    }
    else if( guiCurrentMode == PROG_MODE_SETTINGS )
    {
        Stg.handleBackKey();
    }
    else if( (guiCurrentMode == PROG_MODE_DOWNLOAD) || (guiCurrentMode == PROG_MODE_DOWNLOAD_AUTO)  )
    {
        Dld.handleBackKey();
    }
    else if( guiCurrentMode == PROG_MODE_ADVANCED )
    {
    	advncd.handleBackKey();
    }
    else
    {
        ShowAlertPopUpMsg("Back...", "Back to where?");
    }
}




// PrintLog............................................................................................
function PrintLog(level, txt)
{
    var d       = new Date();
    var myMs    = d.getMilliseconds();
    
    
    if( myMs < 10 )
    {
        myMs = "00" + myMs;
    }
    else if( myMs < 100 )
    {
        myMs = "0" + myMs;
    }
    
    
    if( level == 99 )
    {
//        console.log("**** Error: (" + d.getSeconds() + "." + d.getMilliseconds() + ") " + txt);
        var logText = "(" + d.getMinutes() + ":" + d.getSeconds() + "." + myMs + ") **** Error: " + txt;
        console.log( logText );
        WriteLogFile( logText );
        
//jdo        console.error(txt);            // console.error does not work on phonegap
    }
    else if( level <= PrintLogLevel )
    { 
        var logText = "(" + d.getMinutes() + ":" + d.getSeconds() + "." + myMs + ") " + txt;
        console.log( logText );
        WriteLogFile( logText );
    }
    
}



// HandleButtonDown............................................................................................
function HandleButtonDown()
{
    // No transparency when pressed...
    $(this).css("opacity","1.0");
    $(this).css("outline", "none" );       // Used to remove orange box for android 4+
}

// HandleButtonUp............................................................................................
function HandleButtonUp()
{
    $(this).css("opacity","0.5");
    $(this).css("outline", "none" );       // Used to remove orange box for android 4+
}


//.................................................................................................................
function FindMyCelfi()
{
    if( nxtyRxStatusIcd <= V1_ICD )
    {
        PrintLog(1, "FindMyCelfi called but not allowed for V1_ICD, i.e. old PIC");
    }
    else
    {
        PrintLog(1, "FindMyCelfi called");
        
        // If some message is pending then schedule a come back...
        if( isNxtyMsgPending() == true )
        {
            setTimeout( FindMyCelfi, 130 );
        }
        else
        {
            WriteAddrReq( NXTY_PCCTRL_CLOUD_INFO, CLOUD_INFO_FLASH_LEDS_CMD );
        }
    }
}


// handleBtInfo............................................................................................
function handleBtInfo()
{
    var cnxText;
    if( isSouthBoundIfCnx )
    {
        FindMyCelfi();
        cnxText = "CONNECTED";
    }
    else
    {
        cnxText = "NOT CONNECTED";
    }
     
    ShowAlertPopUpMsg( "Southbound IF ICON", szSouthBoundIfInfoMsg );
}


// handleRegInfo............................................................................................
function handleRegInfo()
{
    var jText = "Indicates if registered or not.\nCurrent status: ";
    
    if( isRegistered )
    {
        jText += "REGISTERED";
    }
    else
    {
        jText += "NOT REGISTERED";
    }
     
    ShowAlertPopUpMsg( "Registered ICON", jText );
}



// handleUniiInfo............................................................................................
function handleUniiInfo()
{
    var jText = "Indicates if wireless link between units is up or down.\nCurrent status: ";
    
    if( bUniiUp )
    {
        jText += "UP.";
    }
    else
    {
        jText += "DOWN.";
    }
     
    ShowAlertPopUpMsg( "Wireless Link ICON", jText );
}

// UpdateUniiIcon....................................................................................
function UpdateUniiIcon(bStatus)
{
    if( bCnxToOneBoxNu == false )
    {
        bUniiUp          = bStatus;
        bUniiStatusKnown = true;
        
        // Set to UNII Up...
        if( bUniiUp )
        {
            guiIconUniiHtml = szUniiIconUp;     // unii_yes.png
        }
        else
        {
            guiIconUniiHtml = szUniiIconDown;     // unii_no.png
        }
    }
}


// CheckUniiStatusMain....................................................................................
function CheckUniiStatusMain()
{
    var u8Buff  = new Uint8Array(20);
 
    if( guiCurrentMode == PROG_MODE_MAIN )
    {
        // Check to see if UNII is up...
        GetNxtySuperMsgLinkStatus();
    
        // Return here in x seconds....
        checkUniiStatusMainTimer = setTimeout(CheckUniiStatusMain, 5000);
    }
}




// U8ToHexText............................................................................................
function U8ToHexText(u8)
{
    if( u8 < 0x10 )
    {
        return( "0" + u8.toString(16).toUpperCase() );     // Add a leading 0....
    }
    else
    {
        return( u8.toString(16).toUpperCase() );     
    }
}

// DecTo3Text............................................................................................
function DecTo3Text(u8)
{
    if( u8 < 10 )
    {
        return( "00" + u8.toString(10) );     // Add a leading 00....
    }
    else if( u8 < 100 )
    {
        return( "0" + u8.toString(10) );     // Add a leading 0....
    }

    else
    {
        return( u8.toString(10) );     
    }
}

// HexTo3Text.....................................................................................................
function HexTo3Text(myNum) 
{
    if(myNum < 0x010) 
    {
        return( "00" + myNum.toString(16).toUpperCase() );
    } 
    else if(myNum < 0x100) 
    {
        return( "0" + myNum.toString(16).toUpperCase() );
    } 
    else 
    {
        return( myNum.toString(16).toUpperCase() );
    }
}

// UpdateRegIcon....................................................................................
function UpdateRegIcon(reg)
{
    // Enable the ICON button to allow info if user touches.                
    guiIconRegDisabled = false;  
                    
    if(reg == 1)
    {
        // Set to Registered...
//        if( isRegistered == false )
        {
            guiIconRegHtml = szRegIconReg;     // reg_yes.png
            isRegistered = true;

/*
4/14/15: No longer change backgrounds if registered or unregistered...
            // Only change the background if not IOS.   IOS has problem scaling new background on the fly.                
            if( window.device.platform != iOSPlatform )
            {
                $('body').css("background","white url('../www/img/hbackground_reg.png') no-repeat fixed center bottom");
            }
*/
            
        }
    }
    else
    {
        // Set to NOT Registered...
//        if( isRegistered == true )
        {
            guiIconRegHtml = szRegIconNotReg;    // reg_no.png   line across
            isRegistered = false;
            
/*
4/14/15: No longer change backgrounds if registered or unregistered...
            // Only change the background if not IOS.   IOS has problem scaling new background on the fly.                
            if( window.device.platform != iOSPlatform )
            {
                $('body').css("background","white url('../www/img/hbackground.png') no-repeat fixed center bottom");
            }
*/
            
        }
    }
}

// UpdateRegButton....................................................................................
function UpdateRegButton(reg)
{
    if(reg == 1)
    {
        // Already registered so remove button and disable.
        guiButtonRegHtml     = "";
        guiButtonRegDisabled = true;
    }
    else
    {
        // Not registered so add button and enable...
        guiButtonRegHtml     = szRegButtonImg;
        guiButtonRegDisabled = false;
    }
}









// HandleOsConfirmation.......................................................................................
function HandleOsConfirmation(buttonIndex) 
{
    // buttonIndex = 0 if dialog dismissed, i.e. back button pressed.
    // buttonIndex = 1 if 'Ok'
    if( buttonIndex == 1 )
    {
        // Do nothing since we no longer want to kill the app.  This will force the user to manually kill.
        // Ok...Exit...Kill the app...
//        navigator.app.exitApp();                
    }
}



// HandleSwUpdateConfirmation.......................................................................................
function HandleSwUpdateConfirmation(buttonIndex) 
{
    // buttonIndex = 0 if dialog dismissed, i.e. back button pressed.
    // buttonIndex = 1 if 'Ok'
    if( (buttonIndex == 0) || (buttonIndex == 1) )
    {
        // Go to the software download page...
        Dld.renderDldView(); 
    }
}

// HandlePrivacyConfirmation.......................................................................................
function HandlePrivacyConfirmation(buttonIndex) 
{
    // buttonIndex = 0 if dialog dismissed, i.e. back button pressed.
    // buttonIndex = 1 if 'Ok'
    if( buttonIndex == 0 )
    {
        // If they dismiss, then give it to them again....
        ShowConfirmPopUpMsg(
            "Your privacy is important to us. Please refer to 'www.cel-fi.com/privacypolicy' for our detailed privacy policy.",    // message
            HandlePrivacyConfirmation,      // callback to invoke with index of button pressed
            'Privacy Policy',               // title
            ['Ok'] );                       // buttonLabels

        UpdateStatusLine("Please select Ok..."); 
    }
    else if( (buttonIndex == 1) || (buttonIndex == 2) )
    {
        // Ok...
        bPrivacyViewed = true;
        
        if( buttonIndex == 1 )
        {
/*        
            if( (isSouthBoundIfCnx == false) && (guiDeviceFlag == false) )
            {
                // Start the spinner..if BT not connected and we are not asking the user to select a BT device.
                ShowWaitPopUpMsg( "Please wait", "Searching for Cel-Fi devices..." );
                UpdateStatusLine("Searching for Cel-Fi devices...");
            }
*/            
        }
        
    }
}

// HandleUniiRetry.......................................................................................
// process the confirmation dialog result
function HandleUniiRetry(buttonIndex) 
{
    // buttonIndex = 0 if dialog dismissed, i.e. back button pressed.
    // buttonIndex = 1 if 'Retry' try again.
    // buttonIndex = 2 if 'Exit'
    if( buttonIndex == 1 )
    {
        // Retry...
        //ShowWaitPopUpMsg( "Please wait", "Retrying..." );
    	document.getElementById("searchMessageBox").innerHTML = "Retrying...";
    	StartMainLoop(1000);
        nxtySwVerNuCf          = null;
//        nxtySwVerCuCf          = null;      // Set to Null so new NU version gets sent to cloud.  Bug 1324
//        bUniiUp                = true;
    }
    
    
}

// HandleCloudRetry.......................................................................................
// process the confirmation dialog result
function HandleCloudRetry(buttonIndex) 
{
    // buttonIndex = 0 if dialog dismissed, i.e. back button pressed.
    // buttonIndex = 1 if 'Retry' try again.
    // buttonIndex = 2 if 'Exit'
    if( buttonIndex == 1 )
    {
        // Retry...
        //ShowWaitPopUpMsg( "Please wait", "Retrying..." );
    	document.getElementById("searchMessageBox").innerHTML = "Retrying...";
        StartMainLoop(1000);
                    
        // See if we have a network connection, i.e. WiFi or Cell.
        isNetworkConnected = NorthBoundConnectionActive();
    }
    
    
}




            
            
            
//-----------------------------------------------------------------------------------
//  
//   Returns an array of bytes representing the ASCII equivalent of the string.
//
//      var u8rsp;
//      var temp  = "regOpForce:true";
//      u8rsp = stringToBytes(temp);
//
//      var outText = u8rsp[0].toString(16);    // Convert to hex output...
//      for( var i = 1; i < u8rsp.length; i++ )
//      {
//          outText = outText + " " + u8rsp[i].toString(16);
//      }
//      PrintLog(1,"          stringToBytes: " + outText );     --> stringToBytes: 72 65 67 4f 70 46 6f 72 63 65 3a 74 72 75 65
//
//
function stringToBytes(inString)
{
    var rtnBytes = [];

    for( var i = 0; i < inString.length; ++i ) 
    {
        rtnBytes.push(inString.charCodeAt(i));
    }
    
    return(rtnBytes);
}


//-----------------------------------------------------------------------------------
//
//
function bytesToString(array) 
{
    var rtnString = "";
  
    for( var i = 0; i < array.length; i++ ) 
    {
        rtnString += String.fromCharCode(array[i]);
    }
    return rtnString;
}



// ..................................................................................
var app = {
     
    // deviceready Event Handler
    //
    // PhoneGap is now loaded and it is now safe to make calls using PhoneGap
    //
    onDeviceReady: function() {

/*
        if( window.device.platform != iOSPlatform )
        {
            // IOS did not like opening the file system this early, no error just stalled.
            OpenFileSystem();
    
            PrintLog(10,  "device ready:  Running on phone version: " + window.device.version + " parseFloat:" + parseFloat(window.device.version) );
        }
*/

        
        isNxtyStatusCurrent = false;
        isNxtySnCurrent     = false;
        
        if( CFG_RUN_ON_SANDBOX )
        {
            myPlatformUrl = mySandboxPlatformUrl;
        }
        


        // Register the event listener if the back button is pressed...
        // This is not part of the GUI but the Android's hardware back button...
        document.addEventListener("backbutton", HandleBackKey, false);
        
        app.renderHomeView();
        
        // Start the GUI...
        StartGuiInterface();
       
        OpenFileSystem();
        
        // Only start bluetooth if on a phone...
        if( window.device.platform == iOSPlatform )
        {
//            OpenFileSystem();
        
            if (parseFloat(window.device.version) >= 7.0) 
            {
                StatusBar.hide();
            }
            
        } 
        
        // Start after 1 second...
        setTimeout(OpenSouthBoundIf, 1000 );
        //setTimeout(function(){OpenSouthBoundIf();util.showSearchAnimation();}, 1000 );
               
    },   
       
       












    
    


    renderHomeView: function() 
    {
        PrintLog(1, "RenderHomeView()...");
    
        guiButtonSwDisabled     = true;
        guiButtonTkDisabled     = true;
        guiButtonRegDisabled    = true;
        guiIconRegDisabled      = true;
        
        uMainLoopCounter = 0;

        // if Phone, Check the OS version.
        // Android must be >= 4.4.2 for WebSocket and Bluetooth LE plugin
        // IOS     must be >= 7.1   for WebSocket and Bluetooth LE plugin.
        if(ImRunningOnPhone == true)
        {
            PrintLog(1, "Phone Model: " + window.device.model + "  OS: " + window.device.platform + " Ver: " + window.device.version );
            if( ((window.device.platform == androidPlatform) && (parseFloat(window.device.version) < 4.4))      ||
                ((window.device.platform == iOSPlatform)     && (parseFloat(window.device.version) < 7.1))      )
            {
                PrintLog(1, "Phone's Operating System is out of date.   Please upgrade to latest version." );
                
                ShowConfirmPopUpMsg(
                    'Phone Operating System is out of date.   Please upgrade to latest version.  Exiting Wave App.',    // message
                    HandleOsConfirmation,                   // callback to invoke with index of button pressed
                    'Update Phone Software',                // title
                    ['Ok'] );                               // buttonLabels
            } 
            else
            {
            	softwareVersionFlag = true;
                // Start the handler to be called every second...
                StartMainLoop(1000);
            } 
        }                
        else
        {
            softwareVersionFlag = true;
            // Start the handler to be called every second...
            StartMainLoop(1000);
        }
        
        
        

//        PrintLog(1, "Screen density: low=0.75 med=1.0 high=1.5  This screen=" +  window.devicePixelRatio );    
        guiCurrentMode = PROG_MODE_MAIN;
    },


    initialize: function() 
    {
         
        if(ImRunningOnPhone != true)
        {
            PrintLog(10, "running on desktop");
            this.onDeviceReady();
        }
        else
        {
            PrintLog(10, "running on phone");
            // Call onDeviceReady when PhoneGap is loaded.
            //
            // At this point, the document has loaded but phonegap-1.0.0.js has not.
            // When PhoneGap is loaded and talking with the native device,
            // it will call the event `deviceready`.
            // 
            document.addEventListener('deviceready', this.onDeviceReady, false);
        }
    },





    // V2 Main Loop.............................................................................
    mainLoop: function() 
    {
  
        PrintLog(4, "App: Main loop..." );
        if( bCheckSouthBoundIfOnStartup )
        {

            if( isSouthBoundIfStarted == false )
            {
              // Do nothing until interface has started...
              return;
            }
            else
            {
                // Interface is not connected...see if user enabled...
                if( isSouthBoundIfEnabled == false )
                {
                    if( uMainLoopCounter == 0 )
                    {
                        UpdateStatusLine( szSouthBoundIfEnableMsg );
                    }
                    
                    if( ++uMainLoopCounter >= 4 )
                    {
                        // Kill the app...
//                        navigator.app.exitApp();
                    }
                    
                    return;
                }
                else
                {
                    
                    
                    // Normal flow should come here once bluetooth has been enabled...
                    bCheckSouthBoundIfOnStartup = false;

                    // Privacy policy...
                    
                    if(window.localStorage.getItem("privacyPolicy")==null){
                    ShowConfirmPopUpMsg(
                        "Your privacy is important to us. Please refer to <span class='emailTo' onclick='window.open(\"https://www.cel-fi.com/privacypolicy\", \"_system\")'>www.cel-fi.com/privacypolicy</span> for our detailed privacy policy.",    // message
                        HandlePrivacyConfirmation,      // callback to invoke with index of button pressed
                        'Privacy Policy',               // title
                        ['Ok'] );                       // buttonLabels
        
                    UpdateStatusLine("Privacy policy..."); 
                    }else{
                    	//buttonIndex = 1;
                    	HandlePrivacyConfirmation(1);
                    }
                    
                    
                    if( CFG_RUN_ON_SANDBOX )
                    {
                        UpdateStatusLine("App sw: " + szVerApp + "(S)  Cel-fi BT sw: " + swVerBtScan );
                    }
                    else
                    {
                        UpdateStatusLine("App sw: " + szVerApp + "(P)  Cel-fi BT sw: " + swVerBtScan );
                    }
                    
                                       
                }
            }
        }
        
        if( bPrivacyViewed == false )
        {
            return;
        }
        
       

        // Wait until the BT device has been selected...
        if( isSouthBoundIfListDone == false )
        {
            return;
        }
        
        
        // ------------------------------------------------------------------------------------------
        if( isSouthBoundIfCnx )
        {
            // Get the Status message from the Unit..................................................
            if( isNxtyStatusCurrentMain == false )
            {
                if( uMainLoopCounter == 0 )
                {
                    // See if we have a network connection, i.e. WiFi, Cell or Ethernet.
                    isNetworkConnected = NorthBoundConnectionActive();
 
                    // Start the spinner..
                    util.deviceIdentified();
                    //ShowWaitPopUpMsg( "Please wait", "Syncing data..." );
                    
                    // Get the status...returns build config for previous versions of the ICD
                    UpdateStatusLine("Main: Get status to determine ICD level...");
                    
                    var u8TempBuff  = new Uint8Array(2);
                    u8TempBuff[0] = NXTY_PHONE_ICD_VER;
                    nxty.SendNxtyMsg(NXTY_STATUS_REQ, u8TempBuff, 1);
                    
                }
                else if( uMainLoopCounter == 1 )
                {
                    // Stay here until we get a correct status.  If we get the wrong ICD version we are messed up...
                    if( isNxtyStatusCurrent == false )
                    {
                        // Bump the counter back so when incremented below we come back here.
                        uMainLoopCounter--;
                        
                        // Get the status...returns build config for previous versions of the ICD
                        UpdateStatusLine("Main: Get status to determine ICD level...");
                    
                        var u8TempBuff  = new Uint8Array(2);
                        u8TempBuff[0] = NXTY_PHONE_ICD_VER;
                        nxty.SendNxtyMsg(NXTY_STATUS_REQ, u8TempBuff, 1);
                    }
                    
                }
                else if( uMainLoopCounter == 2 )
                {
                    // We should have retrieved the ICD version in the BT connection logic.
                    // If old PIC then bypass the V2 messages...
                    if( nxtyRxStatusIcd <= V1_ICD )
                    {
                        uMainLoopCounter = 5;
                    }
                }
                else if( uMainLoopCounter == 3 )
                {
                    // Wait at least 3 seconds after BT connection to make sure any pending NAKs are flushed...
                    // Make sure that whatever we are connected to is local and not redirected.
                    // This command will only work for V2 and higher, for V1 it will be dropped and NAKed.
                    ReadAddrReq( NXTY_PCCTRL_UART_REDIRECT );
//                    SetUartLocal();       // If NU is stuck using this super msg does not work
                }
                else if( uMainLoopCounter == 4 )
                {
                    // Tell the Ares code to slow down the debug traffic so Bluetooth is responsive.
                    // This was necessary on the 1-Box otherwise the Tech Mode data would timeout.
                    WriteAddrReq( NXTY_PCCTRL_CLOUD_INFO, CLOUD_INFO_MIN_TRAFFIC_CMD );
                }                
                else if( uMainLoopCounter > 4 )
                {
                    isNxtyStatusCurrentMain = true;
                    bNxtySuperMsgRsp        = false;
                }
            } 

            // Get the local information from the unit that the BT is attached to, i.e. CU ..............
            else if( bNxtySuperMsgLocalInfo == false )
            {
            
/*
Do not auto update PIC at this time....
            
                // Automatically update the NU and CU PIC software if the ICD is too old. 
                if( nxtyRxStatusIcd <= V1_ICD )
                {
                    PrintLog(1, "PIC software needs to be updated:  PIC ICD=" + nxtyRxStatusIcd  );
                    UpdateStatusLine("PIC SW Update Required...");
                
                    StopMainLoop();            
                    StopWaitPopUpMsg();
                    
                    // Make sure that after the PIC update that we grab the new status so we can update the ICD version of the new PIC
                    isNxtyStatusCurrent = false;
                    bUniiUp             = true;     // Do not want to show UNII down in any download error message.
                    bForceSwUpdate      = true;     // Set flag to be picked up in download...
                    
                    ShowConfirmPopUpMsg(
                        'PIC software is out of date.   Select Ok to update...',    // message
                        HandleSwUpdateConfirmation,                                // callback to invoke with index of button pressed
                        'Update PIC Software',                                      // title
                        ['Ok'] );                                                   // buttonLabels
                    
                    
                    // Pull the file from the WWW directory and write to the download directory...
                    // Use one file for both NU and CU.
                    var tempFileName = myInternalPicFileName + "_" + myInternalPicVer;
                    CopyFile("PIC.bin", tempFileName);
                    
                    return;
                }
*/

                if( nxtyRxStatusIcd <= V1_ICD )
                {
                    if( v1GatheringMainData == false )
                    {
                        // Start gathering V1 data and set bNxtySuperMsgRsp to true when done.
                        StartV1MainLoop(1000);
                        v1GatheringMainData = true;
                    }
                }                
            
                if( bNxtySuperMsgRsp == false )
                {
                    UpdateStatusLine("Retrieving Local Info...");
                    GetNxtySuperMsgInfo();
                }
                else
                {
                    bNxtySuperMsgLocalInfo = true;
                    bCnxToCu               = (nxtyRxStatusBoardConfig & IM_A_CU_MASK)?true:false;
                    bCnxToOneBoxNu         = (nxtyRxStatusBoardConfig & IM_A_1BOX_NU_MASK)?true:false;
                    
                    // if connected to NU and it is not a OneBox, then do not continue
                    if( (bCnxToCu==false) && (bCnxToOneBoxNu==false) )
                    {
                        ShowAlertPopUpMsg("Connected to Network Unit", "Unable to continue, application must be connected to Coverage Unit.<br>Please close application, connect USB cable to Coverage Unit and restart application.");
                        return;
                    }

 
                    // If on a 1-Box perform some house keeping...
                    if( bCnxToOneBoxNu )
                    {
                        // UNII is always up...
                        bUniiUp = true;
                        UpdateUniiIcon(bUniiUp);
                        
                        // Since Tech mode pulls from the CU cloud buffer set it to the retrieved NU address...
                        nxtyCuCloudBuffAddr = nxtyNuCloudBuffAddr;
                        nxtyCuUniqueId      = nxtyNuUniqueId;
                        
                        // Bug 1553:  Change the SW names from "NU xxx" to just "xxx" and set CU to null.
                        //           ["UnSec Cfg", "NU_ART", "NU_EVM", "NU_PIC", "Sec Cfg", "Bluetooth", "NU_Ares",  "CU_ART", "CU_PIC", "CU_Ares"];         // Software image names
                        guiSwNames = ["UnSec Cfg", "ART",    "EVM",    "PIC",    "Sec Cfg", "Bluetooth", "Ares",     "",        "",        ""  ];
                        
                        
                        // Update the CU's build ID to be used on Build ID check below.
                        nxtySwBuildIdCu     = nxtySwBuildIdNu;
                        
                        GetNxtyOperatorCode(nxtyConfigPn);
                    }

                    // Get SKU, i.e. now the Model Number...
                    // First check to see if we have retrieved the SKU previously...                    
                    myModel = window.localStorage.getItem(nxtyCuUniqueId);              // returns null if key not found...
                    
                    if( (myModel != null) && (myModel.length > 15) )        // length should be 20 for new SKU
                    {
                        ProcessSku(myModel);
                    }
                    else
                    {
                        // Get the SKU from the Nextivity server...
                        GetNxtyPartNumber( nxtyCuUniqueId );                                // Get the SKU, i.e. 590N number which is now the model number.
                    }
                    GetNxtyOperatorList();                          
                    bNxtySuperMsgRsp = false;

                }
            }    

            // Get the 2nd Glob of local information from the unit that the BT is attached to, i.e. CU ..............
            else if( bNxtySuperMsgLocalInfo2 == false )
            {
                if( bNxtySuperMsgRsp == false )
                {
                    UpdateStatusLine("Retrieving Local Info 2...");
                    GetNxtySuperMsgInfo2();
                }
                else
                {
                    bNxtySuperMsgLocalInfo2 = true;
                }
            }    

            // Wait until the model number is retrieved from the Nextivity Server........................
            else if( myModel == null )
            {
                // Wait until we get the model number...
                PrintLog(1, "Main: Waiting on model number to be returned from Nextivity server..." );
                return;
            }

            // Send first round of information to the cloud.............................................
            else if( bSendLocalInfoToCloud == false )
            {
                // We now have both the status and SN so notify the cloud that we are here...
                bSendLocalInfoToCloud = true;
                SendCloudAsset();
                SendCloudData( "'SerialNumber':'" + mySn + "'" );
                guiSerialNumber = mySn;
  
                // Get the user's first name just in case local storage got cleared: getUserInfoAction.
                // Get the list of Operators, i.e. 590 numbers, that this device can be changed to: getOperatorInfoAction.             
                SendCloudData( "'getUserInfoAction':'true', 'getOperatorInfoAction':'true'" );  
                    
                // Make sure we have a legit SKU in the cloud...              
//                 SendCloudData( "'SKU_Number':'" + mySku + "'" );     // jdo: moved to egress processing so do not overwrite operator change.

/*
Do not force a SW update....

                // Force a SW update if build ID < SW5_1_45
                if( parseInt(nxtySwBuildIdCu, 16) < parseInt("0x0501002D", 16) )
                {
                    PrintLog(1, "Cel-Fi software needs to be updated:  Build ID = " + nxtySwBuildIdCu  );
                    UpdateStatusLine("SW Update Required...");
                
                    guiSoftwareStatus = SW_STATUS_UNKNOWN;
                    bDldAutoMode      = true;

                    // Bug 1656:  Update the NU's build ID to be used on Build ID check in DLD_STATE_5_1_9_CHECK_VER.
                    // Since we do not complete the main loop before updating the NU info may not have been retrieved.
                    nxtySwBuildIdNu = nxtySwBuildIdCu;
                
                    StopMainLoop();            
                    StopWaitPopUpMsg();
                    
                    // Make sure that after the SW update that we grab the new status so we can update the Build ID
                    isNxtyStatusCurrent = false;
                    bForceSwUpdate      = true;     // Set flag to be picked up in download...

                    // If not on a 1-box then assume that the NU has the same software version as the CU
                    // since we are not talking to the NU yet.
                    if( bCnxToOneBoxNu == false )
                    {
                        nxtySwVerNuCf  = nxtySwVerCuCf;
                        nxtySwVerNuPic = nxtySwVerCuPic;
                    }

                    // Make sure that we update our versions before checking the cloud on a new system...
                    var cloudText = "'isUpdateAvailable':'false'";
                     
                    if( nxtySwVerCuCf   != null)  cloudText += ",'SwVerCU_CF':'"   + SwPnNuCu   + nxtySwVerCuCf   + "'"; 
                    if( nxtySwVerCuPic  != null)  cloudText += ",'SwVerCU_PIC':'"  + SwPnPic    + nxtySwVerCuPic  + "'";
                    if( nxtySwVerCuBt   != null)  cloudText += ",'SwVer_BT':'"     + SwPnBt     + nxtySwVerCuBt   + "'";
                    if( nxtySwVerNuCf   != null)  cloudText += ",'SwVerNU_CF':'"   + SwPnNuCu   + nxtySwVerNuCf   + "'";
                    if( nxtySwVerNuPic  != null)  cloudText += ",'SwVerNU_PIC':'"  + SwPnPic    + nxtySwVerNuPic  + "'";
                    if( nxtySwVerNuSCfg != null)  cloudText += ",'SwVerNU_SCFG':'" + SwPnNuCfg  + nxtySwVerNuSCfg + "'";
                    if( nxtySwVerNuUCfg != null)  cloudText += ",'SwVerNU_UCFG':'" + SwPnNuCfg  + nxtySwVerNuUCfg + "'";
                    if( nxtySwVerNuArt  != null)  cloudText += ",'SwVerNU_ART':'"  + SwPnArt    + nxtySwVerNuArt  + "'";
                    if( nxtySwVerNuEvm  != null)  cloudText += ",'SwVerNU_EVM':'"  + SwPnNuEvm  + nxtySwVerNuEvm  + "'";
                    if( nxtySwVerCuArt  != null)  cloudText += ",'SwVerCU_ART':'"  + SwPnArt    + nxtySwVerCuArt  + "'";
    
                    SendCloudData( cloudText );


                    // Call in 5 seconds to allow version info to populate cloud...                    
                    setTimeout( function()
                    {                    
                        ShowConfirmPopUpMsg(
                            'Cel-Fi software is out of date.   Select Ok to update...',    // message
                            HandleSwUpdateConfirmation,                                 // callback to invoke with index of button pressed
                            'Cel-Fi Software Update Required',                          // title
                            ['Ok'] );                                                   // buttonLabels
                    }
                    , 5000 );
                
                    return;
                }
*/



            
                // Register for push notifications after we can communicate with the cloud
                // so we can send our regID.
                if( window.device.platform == androidPlatform )
                {
                    InitGcmPush('deviceready');
                    SendCloudData( "'DeviceType':'Android'" );
                }
                else if( window.device.platform == iOSPlatform )
                {
                    InitIosPush('deviceready');
                    SendCloudData( "'DeviceType':'IOS'" );                        
                }
                else if (window.device.platform == pcBrowserPlatform)
                {
                    SendCloudData( "'DeviceType':'" + window.device.PlatformOS + "'" );
                }
                
                
                // Send the data to the cloud
                if( bCnxToCu )
                {
                    if( nxtySwVerCuCf   != null) SendCloudData( "'SwVerCU_CF':'"  + SwPnNuCu + nxtySwVerCuCf    + "', 'BuildCu':'" + nxtySwBuildIdCu + "'" );
                    if( nxtySwVerCuPic  != null) SendCloudData( "'SwVerCU_PIC':'" + SwPnPic  + nxtySwVerCuPic   + "'" );
                    if( nxtySwVerCuBt   != null) SendCloudData( "'SwVer_BT':'"    + SwPnBt   + nxtySwVerCuBt    + "', 'OperatorCode':'" + myOperatorCode + "'"  );
                    if( nxtySwVerCuArt  != null) SendCloudData( "'SwVerCU_ART':'" + SwPnArt  + nxtySwVerCuArt + "'" );
                }
                else
                {
                    if( nxtySwVerNuCf   != null) SendCloudData( "'SwVerNU_CF':'"  + SwPnNuCu + nxtySwVerNuCf  + "', 'BuildNu':'" + nxtySwBuildIdNu + "'" );
                    if( nxtySwVerNuPic  != null) SendCloudData( "'SwVerNU_PIC':'" + SwPnPic  + nxtySwVerNuPic + "'" );
// TBD                    SendCloudData( "'SwVerNU_BT':'"    + SwPnBt   + nxtySwVerNuBt    + "', 'OperatorCode':'" + myOperatorCode + "'"  );
                    SendCloudData( "'OperatorCode':'" + myOperatorCode + "'"  );
                    if( nxtySwVerNuSCfg != null) SendCloudData( "'SwVerNU_SCFG':'" + SwPnNuCfg  + nxtySwVerNuSCfg + "'" );
                    if( nxtySwVerNuUCfg != null) SendCloudData( "'SwVerNU_UCFG':'" + SwPnNuCfg  + nxtySwVerNuUCfg + "'" );
                    if( nxtySwVerNuArt  != null) SendCloudData( "'SwVerNU_ART':'"  + SwPnArt    + nxtySwVerNuArt  + "'" );
                    if( nxtySwVerNuEvm  != null) SendCloudData( "'SwVerNU_EVM':'"  + SwPnNuEvm  + nxtySwVerNuEvm + "'" );
                }

                
                SendCloudData( "'UniqueId':'"   + nxtyCuUniqueId + "'" );
//                SendCloudData( "'SKU_Number':'" + mySku + "'" );
                
                
                if( bCnxToOneBoxNu == true )
                {
                    // Get the mode and band parameters for the settings page if this is a 1-Box
                    GetNxtySuperMsgBoosterParams();
                }
                else
                {
                    GetNxtySuperMsgLinkStatus();
                }
                    
                    
                // Prepare to get the remote info...
                InitGetRegLockStatus();
                
                bNxtySuperMsgRsp    = false;
                uStateCounter       = 0;
                uRemoteStateCounter = 0;

            }
            
            // Wait here until the UNII is up...........................................................
            else if( bUniiUp == false )
            {
                uStateCounter++;
                
                if( uStateCounter < UNII_TRY_COUNTER_MAX )
                {
                    UpdateStatusLine("Checking Wireless link: " + uStateCounter + " of " + UNII_TRY_COUNTER_MAX ); 
                    GetNxtySuperMsgLinkStatus();
                }
                else
                {
                
                    // Clear the loop timer to stop the loop...
                    StopMainLoop();            
                    StopWaitPopUpMsg();
                    uMainLoopCounter = 0;
                    uStateCounter    = 0;
                
                    if( guiSoftwareStatus == SW_STATUS_UNKNOWN )
                    {
                        // If the UNII is down we cannot trust the NU PIC version because
                        // in V1 ICD the CU PIC is holding on to the last NU PIC version
                        // that it may have retrieved when the UNII was up.
                        nxtySwVerNuPic = null;
                        CheckForSoftwareUpdates();
                    }
                    
                    
                    if( guiSoftwareStatus == SW_STATUS_PLEASE_UPDATE )
                    {
                        guiButtonSwHtml = szSwButtonImg;
                        guiButtonTkHtml = szTkButtonImg;
                        util.promptSoftwareUpdate();
                    }
                    else
                    {
                                        
                        var eText = "Wireless link between the Network Unit and Coverage Unit is down.  Please wait for the link to connect and try again.  Checking for SW Updates.";
                        UpdateStatusLine( eText + "<br>Cnx: " + myModel + ":" + mySn );            
                        ShowConfirmPopUpMsg(
                            eText,    // message
                            HandleUniiRetry,                    // callback to invoke with index of button pressed
                            'Wireless Link Down',               // title
                            ['Retry'] );                        // buttonLabels
                    }                                     
                
                }                    
            }


            // Get info from remote unit...................................................................................
            else if( (bNxtySuperMsgRemoteInfo == false) && (bCnxToOneBoxNu == false) )
            {
            
                if( nxtyRxStatusIcd <= V1_ICD )
                {
                    bNxtySuperMsgRemoteInfo = true;
                    uStateCounter    = 0;
  
                    // Cannot get the Operator string for guiOperator since we do not have nxtyConfigPn, i.e. 700N037-ATUS-01.      
//                    GetNxtyOperatorCode(nxtyConfigPn);


                    
                    // Since we cannot retrieve the following SW version info for V1 just set to 0.  
                    nxtySwVerNuSCfg = "000.000";
                    nxtySwVerNuUCfg = "000.000";
                    nxtySwVerNuArt  = "000.000";
                    nxtySwVerNuEvm  = "000.000";

                    // Fall through...                    
                    bNxtySuperMsgRsp     = true;
                    bGotRegLockStatus    = true;
                    guiGotTechModeValues = true;
                    
                    // Slow the main loop down since we are falling through and do not want to trigger the SW update check too quickly.
                    StartMainLoop(5000);
                }
                else
                {            
                    UpdateStatusLine("Retrieving Remote Info...");
    
                    if( IsUartRemote() == false )     
                    {
                        SetUartRemote();
                        uRemoteStateCounter = 1;               
                    }
                    else
                    {
                        // The first time in this portion of the else we want to reset a couple of flags.
                        if( uRemoteStateCounter )
                        {
                            bNxtySuperMsgRsp    = false;
                            uRemoteStateCounter = 0;
                        }
                    
                        // The UART should now be redirected to get remote data...
                        if( bNxtySuperMsgRsp == false )
                        {
                            GetNxtySuperMsgInfo();
                        }
                        else
                        {
                            bNxtySuperMsgRemoteInfo = true;
                            uStateCounter    = 0;
        
                            GetNxtyOperatorCode(nxtyConfigPn);
                            bNxtySuperMsgRsp    = false;
                        }
                    }
                }  // End V2
            }

            // Wait until we receive the device key from Azure..........................
            else if( sasDevKey.length == 0 )
            {
                PrintLog(1, "Main: Waiting on the device key from Azure..." );
                RegisterCloudDev(nxtyNuUniqueId);
                return;
            }

            // Get the 2nd Glob of information ..............
            else if( (bNxtySuperMsgRemoteInfo2 == false) && (bCnxToOneBoxNu == false) )
            {
                UpdateStatusLine("Retrieving Remote Info 2...");
                
                if( bNxtySuperMsgRsp == false )
                {
                    GetNxtySuperMsgInfo2();
                }
                else
                {
                    bNxtySuperMsgRemoteInfo2 = true;
                    
                    if( !bCnxToCu )
                    {
                        if( nxtySwVerCuCf   != null) SendCloudData( "'SwVerCU_CF':'"  + SwPnNuCu + nxtySwVerCuCf  + "', 'BuildCu':'" + nxtySwBuildIdCu + "'" );
                        if( nxtySwVerCuPic  != null) SendCloudData( "'SwVerCU_PIC':'" + SwPnPic  + nxtySwVerCuPic + "'" );
                        if( nxtySwVerCuBt   != null) SendCloudData( "'SwVer_BT':'"    + SwPnBt   + nxtySwVerCuBt    + "', 'OperatorCode':'" + myOperatorCode + "'"  );
                        if( nxtySwVerCuArt  != null) SendCloudData( "'SwVerCU_ART':'" + SwPnArt  + nxtySwVerCuArt + "'" );
                    }
                    else
                    {
                        if( nxtySwVerNuCf   != null) SendCloudData( "'SwVerNU_CF':'"  + SwPnNuCu + nxtySwVerNuCf  + "', 'BuildNu':'" + nxtySwBuildIdNu + "'" );
                        if( nxtySwVerNuPic  != null) SendCloudData( "'SwVerNU_PIC':'" + SwPnPic  + nxtySwVerNuPic + "'" );
// TBD                    SendCloudData( "'SwVerNU_BT':'"    + SwPnBt   + nxtySwVerNuBt    + "', 'OperatorCode':'" + myOperatorCode + "'"  );
                        if( nxtySwVerNuSCfg != null) SendCloudData( "'SwVerNU_SCFG':'" + SwPnNuCfg  + nxtySwVerNuSCfg + "'" );
                        if( nxtySwVerNuUCfg != null) SendCloudData( "'SwVerNU_UCFG':'" + SwPnNuCfg  + nxtySwVerNuUCfg + "'" );
                        if( nxtySwVerNuArt  != null) SendCloudData( "'SwVerNU_ART':'"  + SwPnArt    + nxtySwVerNuArt  + "'" );
                        if( nxtySwVerNuEvm  != null) SendCloudData( "'SwVerNU_EVM':'"  + SwPnNuEvm  + nxtySwVerNuEvm + "'" );
                    }
                    
                }
            }    

            // Get Reg Lock status...........................................................
            else if( bGotRegLockStatus == false )
            {
                // Keep calling until function returns true.
                bGotRegLockStatus = GetRegLockStatus();
            }            
            
            // Bug #1337: Wait here until we gather the Tech Mode data and send to cloud.......................................................................
            else if( (guiGotTechModeValues == false) && (isNetworkConnected == true) )
            {
                if( bGatheringTechData == false )
                {
                    // Start gathering the tech mode data.............                    
                    StartGatheringTechData();
                    //ShowWaitPopUpMsg( "Please wait", "Gathering data..." );
                    /*document.getElementById("searchMessageBox").innerHTML = "Gathering data...";
                    document.getElementById("searchIconContainer").style.background = "";
            	    document.getElementById("searchIconContainer").style.background = "url('img/assets/icons/Done.svg') no-repeat";*/
                    util.gatheringDeviceData();
                    
                    // Also, silently start checking for Software updates...
                    if( guiSoftwareStatus == SW_STATUS_UNKNOWN )
                    {
                        CheckForSoftwareUpdates();
                    }
                    
//                    setInterval(geoTrack, 10000 );
                }
            
                UpdateStatusLine("Gathering Tech Mode Data...");
            }            
            else 
            {

                // Clear the loop timer to stop the loop...
                StopMainLoop();            
                StopWaitPopUpMsg();
                uMainLoopCounter = 0;

                    
                if( isNetworkConnected == false )
                {
                    var eText = "Unable to connect to cloud, no WiFi or Cell available.";
                    ShowAlertPopUpMsg("Network Status.",  eText);
                    UpdateStatusLine( eText + "<br>Cnx: " + myModel + ":" + mySn );
                    ShowConfirmPopUpMsg(
                        eText,                               // message
                        HandleCloudRetry,                    // callback to invoke with index of button pressed
                        'No WiFi or Cell',                   // title
                        ['Retry'] );                         // buttonLabels                                     
                                                 
                }
                else
                {
                
                    if( nxtyRxStatusIcd <= V1_ICD )
                    {
                        // If we have a new 590 formatted SKU, i.e. length equal 20, then see if any SW available.
                        if( mySku.length == 20 )
                        {
                            if( guiSoftwareStatus == SW_STATUS_UNKNOWN )
                            {
                                CheckForSoftwareUpdates();
                            }
                        }
                    }                    

                    // No critical alerts so post the buttons....
                    guiButtonSwHtml = szSwButtonImg;
                    guiButtonTkHtml = szTkButtonImg;

                    // Enable the buttons...
                    guiButtonSwDisabled     = false;
                    guiButtonTkDisabled     = false;
                    guiMainButtonsDisabled  = false;
                    
                    UpdateStatusLine( "Select button...<br>Cnx: " + myModel + ":" + mySn );                             


                    // Fill in some interface variables...
                    // Version info from the hardware...    should have already been filled in by now...
                    FillSwCelFiVers();

                    // Take a snapshot of where we are...
                    DumpDataTables();

                    var bEvalRegLockBits = true;
                    
                    // See if location lock bit is set... 
                    if( nxtyRxRegLockStatus & 0x01 )
                    { 
                        if( nxtyRegSupportData != null )
                        {
                            // See if we are in cell-search...
                            if( (nxtyRegSupportData & REG_SUPPORT_DATA_TYPE_MASK) == REG_SUPPORT_DATA_TYPE_CELL_SEARCH )
                            {
                                // We are still in cell search so do not evaluate the bits yet.   Must wait for cell search to complete.
                                PrintLog(1, "Location lock bit set and cell search is still in progress.  RegLoc = 0x" + nxtyRxRegLockStatus.toString(16) + "  RegSupportData = 0x" + nxtyRegSupportData.toString(16) );
                                PrintLog(1, "Do not evaluate the RegLock bits until cell search has completed." );
                                bEvalRegLockBits = false;
                                
                                // Start the periodic check for cell-search to complete.   
                                setTimeout( LocationLockLoop, 30000 );
                                
                                // Display the dashboard...
                                RequestModeChange(PROG_MODE_TECH);
                            }
                        }
                    }
                     
                     
                    if( bEvalRegLockBits == true )
                    { 
                        EvalRegLockBits();
                        
                    }

                } 
            }  // End of else


           
          
            uMainLoopCounter++;
            
            if( uMainLoopCounter > MAIN_LOOP_COUNTER_MAX )
            {
                // Clear the loop timer to stop the loop...
                StopMainLoop();            
                StopWaitPopUpMsg();
                uMainLoopCounter = 0;
                
                var     eTxt                                     = "Unable to sync data...";
                if( isNxtyStatusCurrent == false )          eTxt = "Unable to get Model Number from Cel-Fi";
                else if( nxtySwVerNuCf  == null )           eTxt = "Unable to get NU SW Ver from Cel-Fi";
                else if( nxtySwVerNuPic == null )           eTxt = "Unable to get NU PIC SW Ver from Cel-Fi";
                else if( nxtyNuUniqueId   == null )         eTxt = "Unable to get NU Unique ID from Cel-Fi";
                
                if( bCnxToOneBoxNu == false )
                {
                    if( nxtySwVerCuCf  == null )            eTxt = "Unable to get CU SW Ver from Cel-Fi";
                    else if( nxtySwVerCuPic == null )       eTxt = "Unable to get CU PIC SW Ver from Cel-Fi";
                    else if( nxtySwVerCuBt  == null )       eTxt = "Unable to get BT SW Ver from Cel-Fi";
                    else if( nxtyCuUniqueId   == null )     eTxt = "Unable to get CU Unique ID from Cel-Fi";
                }
                
                UpdateStatusLine( "Timeout: " + eTxt );
                                
                //ShowAlertPopUpMsg("Timeout",  eTxt);
                ShowConfirmPopUpMsg(
                		"Move closer to the booster and retry",    // message
                        util.showSearchAnimation,      // callback to invoke with index of button pressed
                        'Unable to sync',               // title
                        ['Ok'] );  

            }

        }   // End if( isSouthBoundIfCnx )

        
    }, // End of MainLoop()

};




// GetProductTypeFromSku...........................................................................................................
function GetProductTypeFromSku(tempSku) 
{ 
    var tempProd = "";

    // sku looks like "590NP34...etc"                    
    if( tempSku.search("P34") == 4 )
    {
        tempProd = PRODUCT_TYPE_PRO;    
    }
    else if( tempSku.search("D32") == 4 )
    {
        tempProd = PRODUCT_TYPE_DUO;    
    }
    else if( tempSku.search("S32") == 4 )
    {
        tempProd = PRODUCT_TYPE_PRIME;    
    }
    else if( tempSku.search("G31") == 4 )
    {
        tempProd = PRODUCT_TYPE_GO;  
        guiBoosterFlag = true;  
    }
    else if( tempSku.search("Q34") == 4 )
    {
        tempProd = PRODUCT_TYPE_CABLE;    
    }
    else
    {
        tempProd = PRODUCT_TYPE_UNKNOWN;    
    }

    return( tempProd );
}  



// InitGetRegLockStatus...........................................................................................................
function InitGetRegLockStatus() 
{
    uRegLockStateCounter = 0; 
}

// GetRegLockStatus...........................................................................................................
// Call until function returns true which means that we have received Reg Lock status 
// and variable nxtyRxRegLockStatus has been updated.
function GetRegLockStatus() 
{
    if( uRegLockStateCounter == 0 )
    {
        if( SetUartToNu() == true )
        {
          uRegLockStateCounter  = 1;
        }
    }
    
    if( uRegLockStateCounter == 1 )
    {
        nxtyReadAddrRsp = 0;
        WriteAddrReq( NXTY_PCCTRL_CLOUD_INFO, CLOUD_INFO_REG_LOCK_BITS_CMD );
        uRegLockStateCounter  = 2;
    }
    else if( uRegLockStateCounter >= 2 )
    {                        
        if( bWriteAddrRsp )
        {
            if( (nxtyReadAddrRsp & CLOUD_INFO_CMD_RSP_BIT) != 0 )
            {
                // Got em...
                nxtyRxRegLockStatus  = nxtyReadAddrRsp & CLOUD_INFO_DATA_MASK;
                uRegLockStateCounter = 0;
                
                guiRegistrationLockBits = nxtyRxRegLockStatus;
           
                var rLock = (nxtyRxRegLockStatus & 0x08)?"Reg Desired":"";
                rLock    += (nxtyRxRegLockStatus & 0x04)?"/Reg Required":"";
                rLock    += (nxtyRxRegLockStatus & 0x02)?"/Reg Complete":"";
                rLock    += (nxtyRxRegLockStatus & 0x01)?"/Loc Lock":"";
                PrintLog(1,  "  RegLock=0x" + nxtyRxRegLockStatus.toString(16).toUpperCase() + " (" + rLock + ")");               
                
                SetUartLocal();            // If remote then cancel the UART redirect...if local then no problem...
                return( true );
            }
            else
            {
                // Read to get Reg Lock bits...
                ReadAddrReq( NXTY_PCCTRL_CLOUD_INFO );
            }
        }
        else
        {
            uRegLockStateCounter++;
            
            if( uRegLockStateCounter > 4 )
            {
                // Send the message again if we do not get a response...
                InitGetRegLockStatus();
            }
        }
    }                        
    
    
    return( false );
}  

// rtnHexAsciiOrZero...........................................................................................................
function rtnHexAsciiOrZero(inByte) 
{
    if( ((inByte >= 0x30) && (inByte <= 0x39)) ||       // 0 to 9
        ((inByte >= 0x41) && (inByte <= 0x46)) ||       // A to F
        ((inByte >= 0x61) && (inByte <= 0x66)) )        // a to f
    {
        return( inByte );
    }
        
    return( 0x30 ); // Return ASCII zero.
    
}





// LocationLockLoop .................................................................................................................
// Called periodically to send a request for RegSupportData...
function LocationLockLoop()
{
    
    // See if we are still in cell-search...
    if( (nxtyRegSupportData & REG_SUPPORT_DATA_TYPE_MASK) == REG_SUPPORT_DATA_TYPE_CELL_SEARCH )
    {
        // Cell-search is still in progress, request more data and come back...
        if( guiSoftwareStatus != SW_STATUS_UPDATE_IN_PROGRESS )
        {
            PrintLog(1, "LocationLockLoop() Cell search still in progress... Reg Support = 0x" + nxtyRegSupportData.toString(16) );
            RequestRegSupportData();
        }
        else
        {
            PrintLog(1, "LocationLockLoop() Wait for SW update to complete before checking on Cell Search progress..." );
        }
        setTimeout( LocationLockLoop, 30000 );
    }
    else
    {
    
    
        // No longer is cell search, see if the location lock bit is still set.
        // The reg lock bits are 0x4Rsp where R is the reg lock bits.
        nxtyRxRegLockStatus = (nxtyRegSupportData & 0x0F00) >> 8;
        
        PrintLog(1, "LocationLockLoop() Cell search complete... Evaluate RegLock bits = 0x" + nxtyRxRegLockStatus.toString(16) );
         
        EvalRegLockBits();
        
        // If registration is needed then explain to user...
        if( guiCurrentMode == PROG_MODE_REGISTRATION )
        {
            ShowAlertPopUpMsg( "Registration required", "Please register product to use.");
        }
    }
}


// RequestRegSupportData .................................................................................................................
var RequestRegSupportDataTimer = null;
function RequestRegSupportData()
{
    if( RequestRegSupportDataTimer != null )
    {
        clearTimeout(RequestRegSupportDataTimer);
    }
    
    // If some message is pending then schedule a come back at an odd interval...
    if( isNxtyMsgPending() == true )
    {
        RequestRegSupportDataTimer = setTimeout( RequestRegSupportData, 121 );
    }
    else
    {
        GetRegSupportData();
        RequestRegSupportDataTimer = null;
    }
    
}


// EvalRegLockBits .................................................................................................................
//  0x00    No action           0x04    register        0x08    no action    
//  0x01    Call provider       0x05    register        0x09    register
//  0x02    not possible        0x06    no action       0x0A    no action
//  0x03    Call provider       0x07    register        0x0B    register
function EvalRegLockBits()
{
    if((nxtyRxRegLockStatus == 0x00) || (nxtyRxRegLockStatus == 0x01) || (nxtyRxRegLockStatus == 0x02) || (nxtyRxRegLockStatus == 0x03) || (nxtyRxRegLockStatus == 0x06) || (nxtyRxRegLockStatus == 0x0A))
    {
        if( (nxtyRxRegLockStatus == 0x01) || (nxtyRxRegLockStatus == 0x03) )     // State 2 (0x01) or state 4 (0x03):  Loc Lock bit set.
        {
            var eText;
            if( nxtyRxRegLockStatus == 0x01 )
            {
                eText = "Please call your service provider. (Reg State 2)";
            }
            else
            {
                eText = "Please call your service provider. (Reg State 4)";
            }
            ShowAlertPopUpMsg("Location Lock Set.",  eText);
            UpdateStatusLine( eText + "<br>Cnx: " + myModel + ":" + mySn );                             
        }

        isRegistered = true;
        RequestModeChange(PROG_MODE_TECH);
    }
    else if((nxtyRxRegLockStatus == 0x04) || (nxtyRxRegLockStatus == 0x05) || (nxtyRxRegLockStatus == 0x07) || (nxtyRxRegLockStatus == 0x09) || (nxtyRxRegLockStatus == 0x0B))
    {
        isRegistered = false;
        
        // MAIN is only first pass through the MAIN loop when screen is showing Syncing.
        if( (guiCurrentMode == PROG_MODE_MAIN) || (guiCurrentMode == PROG_MODE_TECH)  )
        {
            RequestModeChange(PROG_MODE_REGISTRATION); //Loading registration screen without prompting to user
        }
        else
        {
            PrintLog(1, "Registration mode needed but not allowed since system is busy." );
            ShowAlertPopUpMsg( "Registration required", "Unable to register.  Please restart app in a few minutes to register.");
        }
    }
    else if(nxtyRxRegLockStatus == 0x08)
    {
        isRegistered = false;
        RequestModeChange(PROG_MODE_TECH);
    }
      
    guiRegistrationFlag = isRegistered;
                                            
    
    // Look at the registered status to update the cloud.   Must wait until after the nxtyRxRegLockStatus check above
    // so the logic will update the isRegistered variable.
    if( isRegistered )
    {
        SendCloudData( "'Registered':" + 1 );
    }
    else
    {
        SendCloudData( "'Registered':" + 0 );
    }
}


/*
jdo: used for GPS tracking while driving for GO
var bGpsOnMsg = false;

function geoTrack()
{ 
    navigator.geolocation.getCurrentPosition(geoSuccessTrack, geoErrorTrack, {timeout:9000});
}



function geoSuccessTrack(position) 
{
    SendCloudData( "'latTrack':" + position.coords.latitude + ", 'longTrack':" + position.coords.longitude );
    
    // If we have a success we do not want to throw up an error message later.
    bGpsOnMsg = true;  
}


function geoErrorTrack(error) 
{
    PrintLog(1, "geoErrorTrack(): GPS error on phone while tracking." );
    
    if( bGpsOnMsg == false )
    {
        bGpsOnMsg = true;
        
        ShowAlertPopUpMsg( "Location Service",  "Location services (GPS) may be off or weak signal.  Verify Location Services are On and restart app." );
    }
}

*/
