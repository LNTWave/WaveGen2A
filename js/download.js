
// Software download...
//
//  Flow:
//      User presses "Check for SW" button on main page.
//        - renderDldView()
//          - Send "isUpdateAvailable:false" to the cloud to get ready to look for updates
//          - Set state to DLD_STATE_INIT
//
//  Phase 1: Look for updates...
//      DLD_STATE_INIT  
//        - Send "isUpdateAvailable:true" to the cloud to trigger the look for updates
//      DLD_STATE_CHECK_FOR_UPDATES
//        - Continue polling the cloud, up to 12 times, once per second.    
//        - Egress response will be handled in function ProcessEgressResponse().
//
//  Phase 2: User to select which image to update and press "Update Selected"
//        - handleDldKey()
//          - startFileDownload() - determine which image to download.
//          - Set state to DLD_STATE_GET_FROM_CLOUD
//
//  Phase 3: Download from the cloud to the phone's /Download directory 
//      DLD_STATE_GET_FROM_CLOUD
//      DLD_STATE_WAIT_ON_CLOUD
//
//  Phase 4: Download the file from the phone's directory to the Cel-Fi...
//      DLD_STATE_TO_CELFI_INIT
//      DLD_STATE_START_REQ
//      DLD_STATE_START_RSP
//      DLD_STATE_TRANSFER_REQ
//      DLD_STATE_TRANSFER_RSP
//      DLD_STATE_END_REQ
//      DLD_STATE_END_RSP
//        - call startFileDownload() to see if any more files to download.  If not wait on reset to complete.
//
//      DLD_STATE_RESET               
//      DLD_STATE_UNII_UP               // Only here if NU was reset.   Wait for UNII to be back up...
//
//      
//      DLD_STATE_CHECK_VER_5_1_9       // Special processing to send 2nd reset to NU and or CU for ver 5.1.9 or prev.
//      DLD_STATE_5_1_9_RESET               
//      DLD_STATE_5_1_9_UNII_UP         // Only here if NU was reset.   Wait for UNII to be back up...
//
//      DLD_STATE_UPDATE_LOCAL_VER
//      DLD_STATE_DONE    
//
//  Notes:
//    - Order of download is based on DldOrderArray[];
//    - If the NU is selected for download then delay 6 seconds assuming that an NU_PIC was just downloaded
//      and allow at least 5 seconds for the NU redirect to expire so the CU can talk to the NU again.
//    - If the CU is selected for download then at the end of the download when a CU reset is requested,
//      the PIC times out waiting on the response from the CU so the app must ignore the END RSP timeout.
//    - If the NU or CU are selected for download request a reset.
//
//
//     Android Speed:  Phone to Cel-Fi
//                   cnt  Tx Timer    DL Timer     Size       Time        Bytes/Sec    BAUD
//       CU PIC:          40 mS        50 mS       74094       3:30 sec    352         3,520
//                        20 mS        50 mS       74094       2:20 sec    529         5,290
//                        20 mS        25 mS       74094       2:10 sec    569         5,690
//                   4    20           25          74094       1:50
//                   7    40           25          74094       1:33        797         7,970
//
//   
//     IOS Speed:  Phone to Cel-Fi
//                   cnt  Tx Timer    DL Timer     Size       Time        Bytes/Sec    BAUD
//       CU PIC:          40 mS        25 mS       74094       1:10 sec    1058         10,580



var DldLoopIntervalHandle           = null;
var DldState                        = DLD_STATE_DONE;
var DldTimeoutCount                 = 0;
var DldResyncCount                  = 0;
var DldNakCount                     = 0;
var BluetoothTimeoutTimer           = null;
var bDldAutoMode                    = false;    // Set to true when DOWNLOAD_AUTO.

const DLD_STATE_INIT                = 1;
const DLD_STATE_CHECK_FOR_UPDATES   = 2;
const DLD_STATE_GET_FROM_CLOUD      = 3;
const DLD_STATE_WAIT_ON_CLOUD       = 4
const DLD_STATE_WAIT_ON_READ_FILE   = 5;
const DLD_STATE_TO_CELFI_INIT       = 6;
const DLD_STATE_START_REQ           = 7;
const DLD_STATE_START_RSP           = 8;
const DLD_STATE_TRANSFER_REQ        = 9;
const DLD_STATE_TRANSFER_RSP        = 10;
const DLD_STATE_END_REQ             = 11;
const DLD_STATE_END_RSP             = 12;
const DLD_STATE_RESET               = 13;
const DLD_STATE_UNII_UP             = 14;
const DLD_STATE_5_1_9_CHECK_VER     = 15;
const DLD_STATE_5_1_9_RESET         = 16;               
const DLD_STATE_5_1_9_UNII_UP       = 17;
const DLD_STATE_UPDATE_LOCAL_VER    = 18;
const DLD_STATE_DONE                = 19;
const DLD_STATE_WAIT_USER           = 20;

const DldStateNames                 = ["N/A", "Init", "Check for Updates", "Get From Cloud", "Wait on Cloud", "Wait on Read File", "To Cel-Fi Init", 
                                        "Start Req", "Start Rsp", "Transfer Req", "Transfer Rsp", "End Req", "End Rsp", 
                                        "Reset", "UNII UP", 
                                        "5_1_9 Check", "5_1_9 Reset", "5_1_9 UNII UP", "Update Ver", "Done", "Wait User"];

var   currentDldIndex               = -1;
const DLD_NU_UCFG                   = 0;
const DLD_NU_ART                    = 1;
const DLD_NU_EVM                    = 2;
const DLD_NU_PIC                    = 3;
const DLD_NU_SCFG                   = 4;
const DLD_CU_BT                     = 5;
const DLD_NU                        = 6;
const DLD_CU_ART                    = 7;
const DLD_CU_PIC                    = 8;
const DLD_CU                        = 9;
 
 
// The images will be downloaded in the following order...  
//const DldNames                      = ["UnSec Cfg", "NU_ART", "NU_EVM", "NU_PIC", "Sec Cfg", "NU", "CU_ART", "Bluetooth", "CU_PIC", "CU"]; 
//const DldOrderArray                 = [DLD_NU_UCFG, DLD_NU_ART, DLD_NU_EVM, DLD_NU_PIC, DLD_NU_SCFG, DLD_NU, DLD_CU_ART, DLD_CU_BT, DLD_CU_PIC, DLD_CU];

// Move Bluetooth in front of NU so ONE-Box makes sense.
const DldNames                      = ["UnSec Cfg", "NU_ART", "NU_EVM", "NU_PIC", "Sec Cfg", "Bluetooth", "NU", "CU_ART", "CU_PIC", "CU"]; 
const DldOrderArray                 = [DLD_NU_UCFG, DLD_NU_ART, DLD_NU_EVM, DLD_NU_PIC, DLD_NU_SCFG, DLD_CU_BT, DLD_NU, DLD_CU_ART, DLD_CU_PIC, DLD_CU];

const DLD_NAK_COUNT_MAX             = 3;
const DLD_TIMEOUT_COUNT_MAX         = 12;
const DLD_CLD_PKG_TIMEOUT_COUNT_MAX = 360;
const DLD_CLD_TIMEOUT_COUNT_MAX     = 60;
const DLD_RESET_TIMEOUT             = 25;
const DLD_UNII_UP_TIMEOUT           = 30;
const DLD_TRANSFER_LOOP_MS          = 25;



// Fixed file names to search for in the package info...
const myNuCfFileName                = "WuExecutable.sec";        
const myCuCfFileName                = "CuExecutable.sec";  
const myNuPicFileName               = "NuPICFlashImg.bin";  
const myCuPicFileName               = "CuPICFlashImg.bin";
const myBtFileName                  = "BTFlashImg.bin";
const myNuSCfgFileName              = "NuSCfg.bin";
const myNuUCfgFileName              = "NuUCfg.bin";
const myNuArtFileName               = "NuBmpFlash.bin";
const myCuArtFileName               = "CuBmpFlash.bin";
const myNuEvmFileName               = "NuEvm.bin";


const myInternalPicFileName         = "InternalPic.bin";
const myInternalPicVer              = "002.098";
const szNoUnii                      = " Wireless link between units is down.";

const u8AresFlashAddr               = 0xF8100000;
const u8PicFlashAddr                = 0xF8FE0000;
const u8BtFlashAddr                 = 0xF8FC0000;
const u8ArtFlashAddr                = 0xF8800000;
const u8EvmFlashAddr                = 0xF8000000;


var startType                       = null;
var startAddr                       = null;
var resumeAddr                      = null;

           
// var fileSystemDownloadDir           = null;
var u8FileBuff                      = null;
var actualFileLen                   = 0;
var resumeFileLen                   = 0;
var fileIdx                         = 0;
var completedFileIdx                = 0;

var fileNuCfCldId                   = 0;  
var fileCuCfCldId                   = 0;  
var fileNuPicCldId                  = 0;
var fileCuPicCldId                  = 0;
var fileBtCldId                     = 0;
var fileNuSCfgCldId                 = 0;
var fileNuUCfgCldId                 = 0;
var fileNuArtCldId                  = 0;
var fileCuArtCldId                  = 0;
var fileNuEvmCldId                  = 0;


var bNeedNuCfCldId                  = false;  
var bNeedCuCfCldId                  = false;  
var bNeedNuPicCldId                 = false;
var bNeedCuPicCldId                 = false;
var bNeedBtCldId                    = false;
var bNeedNuSCfgCldId                = false;  
var bNeedNuUCfgCldId                = false;  
var bNeedNuArtCldId                 = false;  
var bNeedCuArtCldId                 = false;  
var bNeedNuEvmCldId                 = false;  



var myDownloadFileCldId             = null
var myDownloadFileName              = null;
var myDownloadFileVer               = null;
var bReadFileSuccess                = false;
var readFileEvt                     = null;

var isUpdateAvailableFromCloud      = false;
var bGotUpdateAvailableRspFromCloud = false;
var bGotPackageAvailableRspFromCloud= false;
var bGotUpdateFromCloudTimedOut     = false;


var bNuCfUpdate                     = false;
var bCuCfUpdate                     = false;
var bNuPicUpdate                    = false;
var bCuPicUpdate                    = false;
var bBtUpdate                       = false;
var bNuSCfgUpdate                   = false;
var bNuUCfgUpdate                   = false;
var bNuArtUpdate                    = false;
var bCuArtUpdate                    = false;
var bNuEvmUpdate                    = false;

var bNuPicReset                     = false;
var bCuPicReset                     = false;
var bBtReset                        = false;
var bCelFiReset                     = false;
var bNuSCfgReset                    = false;
var bNuUCfgReset                    = false;
var bNuArtReset                     = false;
var bCuArtReset                     = false;
var bNuEvmReset                     = false;

var SubState_5_1_9                  = 0;
var SubStateV2Reset                 = 0;
var SubStateV2Start                 = 0;
var SubStateV2GetVer                = 0;



//.................................................................................................
function StartDownloadLoop( loopTime )
{
    if( DldLoopIntervalHandle != null )
    {
        PrintLog(1, "StartDownloadLoop(" + loopTime + ")." );        
        StopDownloadLoop();
    }
    else
    {
        PrintLog(1, "StartDownloadLoop(" + loopTime + ")" );
    }


    DldLoopIntervalHandle = setInterval(DldLoop, loopTime);
}


//.................................................................................................
function StopDownloadLoop()
{
//    PrintLog(1, "StopDownloadLoop()" );
    clearInterval(DldLoopIntervalHandle)
    DldLoopIntervalHandle = null;
}


function DownloadWho()
{
    // Determine what gets downloaded.  If the cloud version has been filled in by the ProcessEgressResponse()
    // function and the cloud version is not equal than the local version then set the update flag to true.
      
    // Also determine if the NU should be reset after the NU PIC/ART/EVM/SCFG/UCFG has been downloaded or
    // if the CU should be reset if the CU PIC/ART/BT has been downloaded...
    bNuPicReset = false;
    bCuPicReset = false;
    bBtReset    = false;
    bNuSCfgReset = false;
    bNuUCfgReset = false;
    bNuArtReset  = false;
    bCuArtReset  = false;
    bNuEvmReset  = false;
      
      
    // Function localCompare() returns -1 if str1 < str2 (str1.localCompage(str2))...
//    if( (nxtySwVerNuCfCld != swVerNoCldText) && (nxtySwVerNuCf.localeCompare(nxtySwVerNuCfCld) == -1) )
    if( (nxtySwVerNuCfCld != swVerNoCldText) && (nxtySwVerNuCf != nxtySwVerNuCfCld) )
    {
        bNuCfUpdate = true;
    }
    else
    {
        bNuCfUpdate = false;
    }

//    if( (nxtySwVerCuCfCld != swVerNoCldText) && (nxtySwVerCuCf.localeCompare(nxtySwVerCuCfCld) == -1) )
    if( (nxtySwVerCuCfCld != swVerNoCldText) && (nxtySwVerCuCf != nxtySwVerCuCfCld) )
    {
        bCuCfUpdate = true;
    }
    else
    {
        bCuCfUpdate = false;
    }

               

//    if( (nxtySwVerNuSCfgCld != swVerNoCldText) && (nxtySwVerNuSCfg.localeCompare(nxtySwVerNuSCfgCld) == -1) )
    if( (nxtySwVerNuSCfgCld != swVerNoCldText) && (nxtySwVerNuSCfg != nxtySwVerNuSCfgCld) && (nxtyRxStatusIcd > V1_ICD) )
    {
        bNuSCfgUpdate = true;
        bNuSCfgReset  = true;       // The Secured Setup final download command causes an NU reset
    }
    else
    {
        bNuSCfgUpdate = false;
    }


//    if( (nxtySwVerNuUCfgCld != swVerNoCldText) && (nxtySwVerNuUCfg.localeCompare(nxtySwVerNuUCfgCld) == -1) )
    if( (nxtySwVerNuUCfgCld != swVerNoCldText) && (nxtySwVerNuUCfg != nxtySwVerNuUCfgCld) && (nxtyRxStatusIcd > V1_ICD) )
    {
        bNuUCfgUpdate = true;
        
        if( (bNuCfUpdate == false) && (bNuSCfgUpdate == false)  )
        {
            // Since the NU is not going to be downloaded and reset automatically, then force a reset after downloading.
            bNuUCfgReset = true;
        }
    }
    else
    {
        bNuUCfgUpdate = false;
    }


//    if( (nxtySwVerNuArtCld != swVerNoCldText) && (nxtySwVerNuArt.localeCompare(nxtySwVerNuArtCld) == -1) )
    if( (nxtySwVerNuArtCld != swVerNoCldText) && (nxtySwVerNuArt != nxtySwVerNuArtCld) && (nxtyRxStatusIcd > V1_ICD) )
    {
        bNuArtUpdate = true;
        
        if( (bNuCfUpdate == false) && (bNuSCfgUpdate == false)  )
        {
            // Since the NU is not going to be downloaded and reset automatically, then force a reset after downloading.
            bNuArtReset  = true;
            bNuUCfgReset = false;       // Make sure UCFG does not cause a reset
        }
    }
    else
    {
        bNuArtUpdate = false;
    }

//    if( (nxtySwVerNuEvmCld != swVerNoCldText) && (nxtySwVerNuEvm.localeCompare(nxtySwVerNuEvmCld) == -1) )
    if( (nxtySwVerNuEvmCld != swVerNoCldText) && (nxtySwVerNuEvm != nxtySwVerNuEvmCld) && (nxtyRxStatusIcd > V1_ICD) )
    {
        bNuEvmUpdate = true;
        
        if( (bNuCfUpdate == false) && (bNuSCfgUpdate == false)  )
        {
            // Since the NU is not going to be downloaded and reset automatically, then force a reset after downloading.
            bNuEvmReset  = true;
            bNuArtReset  = false;       // Make sure Art does not cause a reset
            bNuUCfgReset = false;       // Make sure UCFG does not cause a reset
        }
    }
    else
    {
        bNuEvmUpdate = false;
    }


//    if( (nxtySwVerNuPicCld != swVerNoCldText) && (nxtySwVerNuPic.localeCompare(nxtySwVerNuPicCld) == -1) )
    if( (nxtySwVerNuPicCld != swVerNoCldText) && (nxtySwVerNuPic != nxtySwVerNuPicCld) )
    {
        bNuPicUpdate = true;
        
        if( (bNuCfUpdate == false) && (bNuSCfgUpdate == false)  )
        {
            // Since the NU is not going to be downloaded and reset automatically, then force a reset after downloading the NU PIC.
            bNuPicReset  = true;
            bNuEvmReset  = false;       // Make sure Evm does not casue a reset
            bNuArtReset  = false;       // Make sure Art does not cause a reset
            bNuUCfgReset = false;       // Make sure UCFG does not cause a reset
        }
    }
    else
    {
        bNuPicUpdate = false;
    }

//    if( (nxtySwVerCuArtCld != swVerNoCldText) && (nxtySwVerCuArt.localeCompare(nxtySwVerCuArtCld) == -1) )
    if( (nxtySwVerCuArtCld != swVerNoCldText) && (nxtySwVerCuArt != nxtySwVerCuArtCld) && (nxtyRxStatusIcd > V1_ICD) )
    {
        bCuArtUpdate = true;
        
        if( bCuCfUpdate == false )
        {
            // Since the CU is not going to be downloaded and reset automatically, then force a reset after downloading.
            bCuArtReset = true;
        }         
    }
    else
    {
        bCuArtUpdate = false;
    }    

//    if( (nxtySwVerCuBtCld != swVerNoCldText) && (nxtySwVerCuBt.localeCompare(nxtySwVerCuBtCld) == -1) )
    if( (nxtySwVerCuBtCld != swVerNoCldText) && (nxtySwVerCuBt != nxtySwVerCuBtCld) && (nxtyRxStatusIcd > V1_ICD) )
    {
        bBtUpdate = true;
        
        if( bCnxToOneBoxNu == false )
        {
            if( (bCuCfUpdate == false) && (bNuCfUpdate == false) )
            {
                // Since the CU is not going to be downloaded and reset automatically, then force a reset after downloading the BT.
                // However, now that BT is downloaded before the NU due to 1-box issues, we do not want to reset after a BT download
                // if the NU still needs to be downloaded.
                // This creates an issue for the 2-box scenario of BT/NU download with no CU.   NU will be reset but BT downloaded to CU
                // will not be reset.
                bBtReset    = true;
                bCuArtReset = false;    // Make sure no reset.
            }
        }        
    }
    else
    {
        bBtUpdate = false;
    }
    
//    if( (nxtySwVerCuPicCld != swVerNoCldText) && (nxtySwVerCuPic.localeCompare(nxtySwVerCuPicCld) == -1) )
    if( (nxtySwVerCuPicCld != swVerNoCldText) && (nxtySwVerCuPic != nxtySwVerCuPicCld) )
    {
        bCuPicUpdate = true;
        
        if( bCuCfUpdate == false )
        {
            // Since the CU is not going to be downloaded and reset automatically, then force a reset after downloading the CU PIC.
            bCuArtReset = false;    // Make sure no reset.
            bBtReset    = false;    // Make sure that the BT does not cause a reset.
            bCuPicReset = true;
        }         
    }
    else
    {
        bCuPicUpdate = false;
    }    
   
}

function DownloadError( strHead, strText, bBtMsgFail )
{
    PrintLog(1, "DownloadError(" + strHead + ":" + strText + ")" );
    if( bBtMsgFail )
    {
        // Slow the BT down by reducing the number of buffers written to.
//        SetMaxTxPhoneBuffers(4);
    }
    
    util.removeSWProgressPopup();
    
    StopDownloadLoop();
    StopWaitPopUpMsg();
    UpdateStatusLine(strText);
    if( strHead != null )
    {
        ShowAlertPopUpMsg(strHead,  strText );
    }
    DldState = DLD_STATE_WAIT_USER;
    
    // Start the download loop in the WAIT_USER state.   
    // In the WAIT_USER state we send out a simple get status message to unclog the pipe.
    StartDownloadLoop(1000);
    
    // Set the current download in progress back to 0 so that it can start again...
    if( (currentDldIndex >= 0) && (currentDldIndex < DldOrderArray.length) )
    {
//        document.getElementById("s" + DldOrderArray[currentDldIndex]).innerHTML = "0%";
        guiSwStatus[DldOrderArray[currentDldIndex]] = "0%";
    }
    
    // Change the button from "Update" to "Update-Retry"
    //guiSoftwareButtonText = "Update-Retry";
    
    if(deviceType=="phone"){
    	$('#versionWrapper').html("<div class='versionLbl col-xs-7'>Please update your software</div><div class='form-group col-xs-4'><button type='button' class='primaryButton' id='versionUpdate' onclick='SetSoftwareUpdate()'>Retry</button></div>");
    }else{
    	$('#versionWrapper').html("<div class='versionLbl col-sm-7'>Please update your software</div><div class='form-group col-sm-4' align='right'><button type='button' class='primaryButton' id='versionUpdate' onclick='SetSoftwareUpdate()'>Update</button></div>");
    }
    
    guiSoftwareStatus     = SW_STATUS_PLEASE_UPDATE;
    guiSoftwareDirtyFlag  = true;
    
}
   


function DldBluetoothTimeout()
{
    // Ok to stop the download if we are not waiting on the user, not done and not waiting on a reset in the END_RSP state or in reset state.
    if( guiCurrentMode == PROG_MODE_DOWNLOAD )
    {
        if( !((DldState == DLD_STATE_WAIT_USER) || (DldState == DLD_STATE_DONE) || (DldState == DLD_STATE_END_RSP) || (DldState == DLD_STATE_RESET)) )
        {
            StopDownloadLoop();
            StopWaitPopUpMsg();
            UpdateStatusLine( "Update aborted, Bluetooth connection lost...");
            ShowAlertPopUpMsg("Update aborted",  "Bluetooth connection lost..." );
            DldState = DLD_STATE_WAIT_USER;
            
            // Set the current download in progress back to 0 so that it can start again...
            if( (currentDldIndex >= 0) && (currentDldIndex < DldOrderArray.length) )
            {
                guiSwStatus[DldOrderArray[currentDldIndex]] = "0%";
                guiSoftwareDirtyFlag  = true;
            }
        }
    }    
}


function successAcquirePowerManagement()
{
    PrintLog(1, "Power management acquire success.  Autolock disabled so phone does not go to sleep." );
}

function failAcquirePowerManagement()
{
    PrintLog(1, "Power management acquire fail.  Autolock not disabled so phone may go to sleep." );
}

function successReleasePowerManagement()
{
    PrintLog(1, "Power management release success.  Autolock re-enabled so phone can go to sleep." );
}

function failReleasePowerManagement()
{
    PrintLog(1, "Power management release fail.  Autolock not re-enabled so phone may have problems going to sleep." );
}

            
var Dld = {

    // Handle the Back key
    handleBackKey: function()
    {
        if( (DldState == DLD_STATE_DONE) || (DldState == DLD_STATE_WAIT_USER) )
        {
             PrintLog(1, "");
             PrintLog(1, "Sw: SW Mode Back key pressed----------------------------------------------------");
             
             // Disable the Update button
             guiSoftwareButtonFlag = false;
             guiSoftwareDirtyFlag  = true;
             StopDownloadLoop();
             StopWaitPopUpMsg();
             DumpDataTables();
                     
             // allow device to sleep
// jdo: moved to DLD_STATE_DONE             if( window.device.platform != pcBrowserPlatform ) { window.plugins.powerManagement.release( successReleasePowerManagement, failReleasePowerManagement ); }
         
             // Back to main menu after 500 mS to allow the powerManagement to release...
             // Without waiting was causing unit not to go into Tech mode if user pressed from main menu.
             //setTimeout(app.renderHomeView, 500);
             RequestModeChange(PROG_MODE_TECH);
        }
        else
        {    
            ShowAlertPopUpMsg("Update in progress...", "Back key not allowed!");
         }
    },


    // Update key pressed................................................................................................................
    handleDldKey: function()
    {
    	PrintLog(1, "Update Key pressed");
    	swDriverCurrentNum = 0;
    	swDriverUpdateCnt = 0;
    	var deViceUpdatePositiveState = "OK";
	    for (var sw = 0; sw < guiSwStatus.length; sw++) {
	        if (deViceUpdatePositiveState != guiSwStatus[sw]) {
	            swDriverUpdateCnt = swDriverUpdateCnt + 1;
	        }
	    }  
        //changing the software update inline status
    	if(!checkUpdateLoader && guiCurrentMode == PROG_MODE_SETTINGS){
        	$('#versionWrapper').html("<div class='versionLbl fl'>Checking for updates...</div><div id='spinnerImgContainer' class='spinnerImgContainer waitLoader fl'></div>");
        	$('#spinnerImgContainer').css('margin-top', '8px');
        	checkUpdateLoader = true;
    	}else{
    		//ShowWaitPopUpMsg( "Please wait", "Checking for updates" );
    	}
        
        
        
        if( DldState == DLD_STATE_WAIT_USER )
        {
            // Kick off the process...
            currentDldIndex = -1;
            
            // Clear any Tx block...
            msgRxLastCmd = NXTY_INIT;
                
            guiSoftwareStatus           = SW_STATUS_UPDATE_IN_PROGRESS;
            guiSoftwareDirtyFlag        = true;
            
            //ShowAlertPopUpMsg("Starting update...", "Please do not interrupt the Update!  Press ok...");
            ShowWaitPopUpMsg( "Please wait", "Checking for updates" );
            if( window.device.platform == androidPlatform )
            {
                // The connection interval should be 20 mS on the Android.
//                SetBluetoothTxTimer(20);
            }
            else if( window.device.platform == iOSPlatform )
            {
                // The connection interval should be 30 mS on the IOS.
//                SetBluetoothTxTimer(30);
                
                // Make sure that IOS uses all buffers...
                SetMaxTxPhoneBuffers(7);
            }

            if( bGotUpdateFromCloudTimedOut )
            {
                // Retry the get status from the cloud...
                DldState = DLD_STATE_INIT;
                StartDownloadLoop(1000);
            }
            else
            {
                // Try to download from cloud to Cel-Fi
                Dld.startFileDownload();
            }
           
        }
        else if( DldState == DLD_STATE_DONE )
        {
            ShowAlertPopUpMsg("Update Complete", "Nothing to do...");
        }
        else
        {
            ShowAlertPopUpMsg("Please Wait", "Update in progress...");
        }
        
    },
    
    // Determine which image to download.
    startFileDownload: function()
    {
    	var idx;
                
        var bOkToDownload = false;
        
        PrintLog(1, "StartFileDownload()" );
        
        // Make sure that we don't timeout while picking our next download...
        if( BluetoothTimeoutTimer != null )
        {
            clearTimeout(BluetoothTimeoutTimer);
            BluetoothTimeoutTimer = null;
        }
        
                
        StopDownloadLoop();
//        StopWaitPopUpMsg();        
        
        
        currentDldIndex++;
                    
        for( ; currentDldIndex < DldOrderArray.length; currentDldIndex++ )
        {
        	idx = DldOrderArray[currentDldIndex];
            if( guiSwStatus[idx] == "0%" )
            {
                break;
            }
        }


        if( currentDldIndex < DldOrderArray.length )
        {
        	
            StopWaitPopUpMsg();
                     
            // See if the NU was selected 
            if( idx == DLD_NU )
            {
    //            if( document.getElementById("ckbx_nu_id").checked )
                {
                    PrintLog(1, "NU selected for download." );
    
                    // Fill in the information necessary to transfer from the cloud to the phone                
                    myDownloadFileCldId = fileNuCfCldId;
                    myDownloadFileName  = myNuCfFileName;
                    myDownloadFileVer   = nxtySwVerNuCfCld;
    
                    // Fill in the information necessary to open the file on the phone and download to Cel-Fi
                    
                    // Use the V2 protocol NONE for type since the NU should never be downloaded using a V1 PIC.
                    startType           = NXTY_SW_NONE_TYPE;
                    startAddr           = u8AresFlashAddr;
                    resumeAddr          = startAddr;
                    bOkToDownload       = true;

                    if( nxtyRxStatusIcd <= V1_ICD )
                    {
                        // If the ICD is 0x07 then the PIC must be told the type to redirect the UART.
                        startType           = NXTY_SW_CF_NU_TYPE;
                    }
                                    
                }
            }
            
            if( idx == DLD_CU )
            {
    //            if( document.getElementById("ckbx_cu_id").checked )
                {
                    PrintLog(1, "CU selected for download." );
                    
                    // Fill in the information necessary to transfer from the cloud to the phone                
                    myDownloadFileCldId = fileCuCfCldId;
                    myDownloadFileName  = myCuCfFileName;
                    myDownloadFileVer   = nxtySwVerCuCfCld;
    
                    // Fill in the information necessary to open the file on the phone and download to Cel-Fi
                    startType           = NXTY_SW_NONE_TYPE;
                    startAddr           = u8AresFlashAddr;
                    resumeAddr          = startAddr;
                    bOkToDownload       = true;                
                }
            }
            
            if( idx == DLD_NU_PIC )
            {
    //            if( document.getElementById("ckbx_nupic_id").checked )
                {
                    PrintLog(1, "NU PIC selected for download." );
                    
                    // Fill in the information necessary to transfer from the cloud to the phone
                    myDownloadFileCldId = fileNuPicCldId;
                    myDownloadFileName  = myNuPicFileName;
                    myDownloadFileVer   = nxtySwVerNuPicCld;
    
                    startType       = NXTY_SW_NONE_TYPE;
                    startAddr           = u8PicFlashAddr;
                    resumeAddr          = startAddr;
                    bOkToDownload       = true;
                    
                    
                    // Use the internal PIC name to download...
                    if( nxtyRxStatusIcd <= V1_ICD )
                    {
                        // If the ICD is 0x07 then the PIC must be told the type to redirect the UART.
                        startType           = NXTY_SW_NU_PIC_TYPE;
// jdo: Pull from cloud                        myDownloadFileName  = myInternalPicFileName;
                    }
                    
                                    
                }
            }


            if( idx == DLD_NU_UCFG )
            {
                {
                    PrintLog(1, "NU Un-Secured Setup selected for download." );
                    
                    // Fill in the information necessary to transfer from the cloud to the phone
                    myDownloadFileCldId = fileNuUCfgCldId;
                    myDownloadFileName  = myNuUCfgFileName;
                    myDownloadFileVer   = nxtySwVerNuUCfgCld;
    
                    startType           = NXTY_SW_NONE_TYPE;
                    startAddr           = nxtyNuChanListFlashAddr;
                    resumeAddr          = startAddr;
                    bOkToDownload       = true;
                }
            }

            if( idx == DLD_NU_SCFG )
            {
                {
                    PrintLog(1, "NU Secured Setup selected for download." );
                    
                    // Fill in the information necessary to transfer from the cloud to the phone
                    myDownloadFileCldId = fileNuSCfgCldId;
                    myDownloadFileName  = myNuSCfgFileName;
                    myDownloadFileVer   = nxtySwVerNuSCfgCld;
    
                    startType           = NXTY_SW_NONE_TYPE;
                    startAddr           = nxtyNuXferBufferAddr;
                    resumeAddr          = startAddr;
                    bOkToDownload       = true;
                }
            }

            if( idx == DLD_NU_ART )
            {
                {
                    PrintLog(1, "NU Art selected for download." );
                    
                    // Fill in the information necessary to transfer from the cloud to the phone
                    myDownloadFileCldId = fileNuArtCldId;
                    myDownloadFileName  = myNuArtFileName;
                    myDownloadFileVer   = nxtySwVerNuArtCld;
    
                    startType           = NXTY_SW_NONE_TYPE;
                    startAddr           = u8ArtFlashAddr;
                    resumeAddr          = startAddr;
                    bOkToDownload       = true;
                }
            }

            if( idx == DLD_NU_EVM )
            {
                {
                    PrintLog(1, "NU EVM selected for download." );
                    
                    // Fill in the information necessary to transfer from the cloud to the phone
                    myDownloadFileCldId = fileNuEvmCldId;
                    myDownloadFileName  = myNuEvmFileName;
                    myDownloadFileVer   = nxtySwVerNuEvmCld;
    
                    startType           = NXTY_SW_NONE_TYPE;
                    startAddr           = u8EvmFlashAddr;
                    resumeAddr          = startAddr;
                    bOkToDownload       = true;
                }
            }



            if( idx == DLD_CU_ART )
            {
                {
                    PrintLog(1, "CU Art selected for download." );
                    
                    // Fill in the information necessary to transfer from the cloud to the phone
                    myDownloadFileCldId = fileCuArtCldId;
                    myDownloadFileName  = myCuArtFileName;
                    myDownloadFileVer   = nxtySwVerCuArtCld;
    
                    startType           = NXTY_SW_NONE_TYPE;
                    startAddr           = u8ArtFlashAddr;
                    resumeAddr          = startAddr;
                    bOkToDownload       = true;
                }
            }

            
            if( idx == DLD_CU_PIC )
            {
    //            if( document.getElementById("ckbx_cupic_id").checked )
                {
                    PrintLog(1, "CU PIC selected for download." );
                    
                    // Fill in the information necessary to transfer from the cloud to the phone
                    myDownloadFileCldId = fileCuPicCldId;
                    myDownloadFileName  = myCuPicFileName;
                    myDownloadFileVer   = nxtySwVerCuPicCld;
    
                    // Fill in the information necessary to open the file on the phone and download to Cel-Fi
                    startType           = NXTY_SW_NONE_TYPE;
                    startAddr           = u8PicFlashAddr;
                    resumeAddr          = startAddr;
                    bOkToDownload       = true;

                    // Use the internal PIC name to download...
                    if( nxtyRxStatusIcd <= V1_ICD )
                    {
// jdo: Pull from cloud                        myDownloadFileName  = myInternalPicFileName;
                    }
    
                }
            }
             
            
            if( idx == DLD_CU_BT )
            {   
                {
                    PrintLog(1, "CU BT selected for download." );
                    
                    // Fill in the information necessary to transfer from the cloud to the phone
                    myDownloadFileCldId = fileBtCldId;
                    myDownloadFileName  = myBtFileName;
                    myDownloadFileVer   = nxtySwVerCuBtCld;
    
                    // Fill in the information necessary to open the file on the phone and download to Cel-Fi
                    startType           = NXTY_SW_NONE_TYPE;
                    startAddr           = u8BtFlashAddr;
                    resumeAddr          = startAddr;
                    bOkToDownload       = true;                
                }        
            }
    
    
            if( bOkToDownload )
            {
                if( g_fileSystemDir != null )
                {
                	swDriverCurrentNum++;
                    var infoText = "Downloading file: " + myDownloadFileName + " Ver: " + myDownloadFileVer + " from cloud."
                    DldState              = DLD_STATE_GET_FROM_CLOUD;
/*
jdo pull from cloud
                    if( nxtyRxStatusIcd <= V1_ICD )
                    {
                        // bypass getting file from cloud since we copied over...
                        DldState = DLD_STATE_WAIT_ON_CLOUD;
                        g_fileTransferSuccess = true;
                    }                           
*/                    
                                    
                    DldTimeoutCount       = 0;
                    
                    if( idx == DLD_NU )
                    {
                        // Wait additional time between downloading the NU PIC and the NU to
                        // clear any UART redirect issues...
                        StartDownloadLoop(6000);
                    }
                    else
                    {
                        StartDownloadLoop(1000);
                    }
                    
                    // Add version to end of file name...
                    myDownloadFileName += ("_" + myDownloadFileVer);
//                    ShowWaitPopUpMsg( "Please wait", infoText );
                    UpdateStatusLine(infoText);
                }
                else
                {
                    PrintLog(99, "Unable to open file system on phone." );
                }
            }
        }
        else
        {
            // End the download process...
            if( bCelFiReset )
            {
                DldState        = DLD_STATE_RESET;
                DldTimeoutCount = 0;
            }
            else
            {
                // Should always end with a reset, but if not then just verify versions...
                DldState         = DLD_STATE_UPDATE_LOCAL_VER;
                SubStateV2GetVer = 0;
                nxtyCurrentReq   = 0;
            }


            StartDownloadLoop(1000);
        }
    },

    
    
    renderDldView: function() 
    {    
        PrintLog(1, "RenderDldView()...");
        
        if( guiSoftwareStatus == SW_STATUS_UP_TO_DATE )
        {
            ShowAlertPopUpMsg( "SW up to Date", "No SW Update Required..." );
            return;
        }
        
        // If we land here after CheckForSoftwareUpdates() and we need an update go directly to waiting on user.
        else if( guiSoftwareStatus == SW_STATUS_PLEASE_UPDATE )
        {
            DldState = DLD_STATE_WAIT_USER;
        }
        else
        {
            swDriverCurrentNum = 0;

// Moved to INIT
//        	swDriverUpdateCnt = 0;
//        	var deViceUpdatePositiveState = "OK";
//    	    for (var sw = 0; sw < guiSwStatus.length; sw++) {
//    	        if (deViceUpdatePositiveState != guiSwStatus[sw]) {
//    	            swDriverUpdateCnt = swDriverUpdateCnt + 1;
//    	        }
//    	    }
  
            if( nxtyRxStatusIcd > V1_ICD )
            {
                UpdateStatusLine("Checking for updates...");
                ShowWaitPopUpMsg( "Please wait", "Checking for updates..." );
                SendCloudData(  "'isUpdateAvailable':'false'" );
            }
            
                    
            // Make sure that we are at full download speed.
//            SetMaxTxPhoneBuffers(7);
      
            // Start the ball rolling...this allows the false above to go out about 1 second before the true.
            DldState = DLD_STATE_INIT;
            StartDownloadLoop(1000);
 
            
            // Version info from the hardware... 
            FillSwCelFiVers();
        }
        

        guiSoftwareButtonText = "Update";
        guiSoftwareDirtyFlag  = true;
        
        guiCurrentMode = PROG_MODE_DOWNLOAD;
    },
};



    
function DldLoop() 
{
    var i;
    var u8Buff  = new Uint8Array(20);

    if( DldState != DLD_STATE_TRANSFER_RSP )
    {
        PrintLog(1, "Download loop...DldState=" + DldStateNames[DldState] );
    }
    
    
    DldTimeoutCount++; 
    
    
    // Make sure bluetooth stays alive...
    if( window.device.platform != pcBrowserPlatform )
    {
        if( isSouthBoundIfCnx )
        {
            if( BluetoothTimeoutTimer != null )
            {
                clearTimeout(BluetoothTimeoutTimer);
                BluetoothTimeoutTimer = null;
            }
        }
        else
        {
            if( BluetoothTimeoutTimer == null )
            {
                BluetoothTimeoutTimer = setTimeout(DldBluetoothTimeout, 15000);
            }
        }
    }
    
        
    switch( DldState )
    {
    
        //---------------------------------------------------------------------------------------
        // Phase 1: Look for updates...
        case DLD_STATE_INIT:
        {
            // Pre fill with a known value before requesting from cloud...
            nxtySwVerNuCfCld                 = swVerNoCldText;
            nxtySwVerCuCfCld                 = swVerNoCldText;
            nxtySwVerNuPicCld                = swVerNoCldText;
            nxtySwVerCuPicCld                = swVerNoCldText;
            nxtySwVerCuBtCld                 = swVerNoCldText;
            nxtySwVerNuSCfgCld               = swVerNoCldText;
            nxtySwVerNuUCfgCld               = swVerNoCldText;
            nxtySwVerNuArtCld                = swVerNoCldText;
            nxtySwVerCuArtCld                = swVerNoCldText;
            nxtySwVerNuEvmCld                = swVerNoCldText;
            
            fileNuCfCldId                    = 0;        
            fileCuCfCldId                    = 0;  
            fileNuPicCldId                   = 0;               // future proof  
            fileCuPicCldId                   = 0;               // Future proof
            fileBtCldId                      = 0;
            fileNuSCfgCldId                  = 0;    
            fileNuUCfgCldId                  = 0;    
            fileNuArtCldId                   = 0;    
            fileCuArtCldId                   = 0;    
            fileNuEvmCldId                   = 0;    
            
            bNeedNuCfCldId                   = false;  
            bNeedCuCfCldId                   = false;  
            bNeedNuPicCldId                  = false;
            bNeedCuPicCldId                  = false;
            bNeedBtCldId                     = false;
            bNeedNuSCfgCldId                  = false;
            bNeedNuUCfgCldId                  = false;
            bNeedNuArtCldId                  = false;
            bNeedNuEvmCldId                  = false;
            bNeedCuArtCldId                  = false;
            
            isUpdateAvailableFromCloud       = false;
            bGotUpdateAvailableRspFromCloud  = false;
            bGotPackageAvailableRspFromCloud = false;
            
            // No need to do if called at startup...            
            if( guiCurrentMode == PROG_MODE_DOWNLOAD )
            {
                // Blast out a download end to reset the PIC state machine just in case we start a download
                // without ending the previous download, i.e. walk away.   This caused a neg % complete
                // since the PIC would return a memory address response for a different download, Ares instead of PIC for example.
                var u8Buff  = new Uint8Array(2);
                u8Buff[0] = 0;                      // No reset
                nxty.SendNxtyMsg(NXTY_DOWNLOAD_END_REQ, u8Buff, 1);
                
                // Take over the phone's auto lock feature so it does not go to sleep.
                // prevent device from sleeping
// jdo: moved to SetSoftwareUpdate()                if( window.device.platform != pcBrowserPlatform ) { window.plugins.powerManagement.acquire( successAcquirePowerManagement, failAcquirePowerManagement ); }
            }


            // If old PIC or old Ares SW...
            if( bForceSwUpdate )
            {
                // Take over the phone's auto lock feature so it does not go to sleep.
                // prevent device from sleeping
                if( window.device.platform != pcBrowserPlatform ) 
                { 
                    window.plugins.powerManagement.acquire( successAcquirePowerManagement, failAcquirePowerManagement ); 
                }
            }
                
                
/*
// jdo: Do not start V1 PIC download this way, allow normal cloud processing to find            
            if( nxtyRxStatusIcd <= V1_ICD )
            {
                // Download the internal PIC so that the ICD version is > 0x07.
                bNuPicUpdate = true;
                bNuPicReset  = true;
                nxtySwVerNuPicCld = myInternalPicVer;

                // Download to both NU and CU if not a one-box                
                if( bCnxToOneBoxNu == false )
                {
                    bCuPicUpdate = true;
                    bCuPicReset  = true;
                    nxtySwVerCuPicCld = myInternalPicVer;
                }
                

                // Put something in for version even though we don't know versions...
                guiSwCelFiVers[0] = "-";
                guiSwCelFiVers[1] = "-";
                guiSwCelFiVers[2] = "-";
                guiSwCelFiVers[3] = "-";
                guiSwCelFiVers[4] = "-";
                guiSwCelFiVers[5] = "-";
                guiSwCelFiVers[6] = "-";
                guiSwCelFiVers[7] = "-";
                guiSwCelFiVers[8] = "-";
                guiSwCelFiVers[9] = "-";
                

                // Drop our cloud version in...
                FillSwCldVers();
        
                // Add 0% status to those available in the cloud...
                guiSwStatus[0] = (bNuUCfgUpdate)?"0%":"OK";
                guiSwStatus[1] = (bNuArtUpdate)?"0%":"OK";
                guiSwStatus[2] = (bNuEvmUpdate)?"0%":"OK";
                guiSwStatus[3] = (bNuPicUpdate)?"0%":"OK";
                guiSwStatus[4] = (bNuSCfgUpdate)?"0%":"OK";
                guiSwStatus[5] = (bBtUpdate)?"0%":"OK";
                guiSwStatus[6] = (bNuCfUpdate)?"0%":"OK";
                guiSwStatus[7] = (bCuArtUpdate)?"0%":"OK";
                guiSwStatus[8] = (bCuPicUpdate)?"0%":"OK";
                guiSwStatus[9] = (bCuCfUpdate)?"0%":"OK";
                
                
                guiSoftwareDirtyFlag = true; 
                SetMaxTxPhoneBuffers(2);            // Slow it down...
                
                
                currentDldIndex = -1;
                msgRxLastCmd    = NXTY_INIT;
                //ShowAlertPopUpMsg("Starting update...", "Please do not interrupt the Update!  Press ok...");
                ShowWaitPopUpMsg( "Please wait", "Checking for updates" );
                Dld.startFileDownload();                
            }
            else
*/            
            {
                // Send a request to the cloud to send updates...
                // Bug #1361:  Make sure version on HW is current...
/*                
                var cloudText = "'SwVerCU_CF':'"   + SwPnNuCu   + nxtySwVerCuCf   + "',"    + 
                                "'SwVerCU_PIC':'"  + SwPnPic    + nxtySwVerCuPic  + "',"    +
                                "'SwVer_BT':'"     + SwPnBt     + nxtySwVerCuBt   + "',"    +
                                "'SwVerNU_CF':'"   + SwPnNuCu   + nxtySwVerNuCf   + "',"    +
                                "'SwVerNU_PIC':'"  + SwPnPic    + nxtySwVerNuPic  + "',"    +
                                "'SwVerNU_SCFG':'" + SwPnNuCfg  + nxtySwVerNuSCfg + "',"    +
                                "'SwVerNU_UCFG':'" + SwPnNuCfg  + nxtySwVerNuUCfg + "',"    +
                                "'SwVerNU_ART':'"  + SwPnArt    + nxtySwVerNuArt  + "',"    +
                                "'SwVerNU_EVM':'"  + SwPnNuEvm  + nxtySwVerNuEvm  + "',"    +
                                "'SwVerCU_ART':'"  + SwPnArt    + nxtySwVerCuArt  + "',"    +
                                "'isUpdateAvailable':'true'";
*/
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

                // Make sure that the trigger is at the end...
                cloudText += ",'isUpdateAvailable':'true'";                                
                SendCloudDataCheckRsp( cloudText );

                
                
                DldState                    = DLD_STATE_CHECK_FOR_UPDATES;
                DldTimeoutCount             = 0;
                guiSoftwareStatus           = SW_STATUS_CHECKING;
                guiSoftwareDirtyFlag        = true;
                bGotUpdateFromCloudTimedOut = false;
                
                
            }
            
            
            // Moved here from renderDldView to init for V1_ICD
            swDriverUpdateCnt = 0;
            
            var deViceUpdatePositiveState = "OK";
            for (var sw = 0; sw < guiSwStatus.length; sw++) 
            {
                if (deViceUpdatePositiveState != guiSwStatus[sw]) 
                {
                    swDriverUpdateCnt = swDriverUpdateCnt + 1;
                }
            }  
            
            break; 
        }
            
        case DLD_STATE_CHECK_FOR_UPDATES:
        {
 
            if( (bGotUpdateAvailableRspFromCloud) && ((isUpdateAvailableFromCloud == false) || (isUpdateAvailableFromCloud == "false")) )
            {
                if( guiCurrentMode == PROG_MODE_DOWNLOAD )
                {
                    StopDownloadLoop();
                    StopWaitPopUpMsg();
                    ShowAlertPopUpMsg("Software update status", "No software updates pending");
                    UpdateStatusLine("No software updates pending.");
                }
                
                // Disable the "Update" button.
                guiSoftwareButtonFlag = false;
                guiSoftwareStatus     = SW_STATUS_UP_TO_DATE;
                guiSoftwareDirtyFlag  = true;
                DldState = DLD_STATE_DONE;
            }
            else if( (bGotUpdateAvailableRspFromCloud) && (isUpdateAvailableFromCloud) && (bGotPackageAvailableRspFromCloud) )
            {
                // Received response and handled in ProcessEgressResponse
                
                // Version info from the cloud...
                FillSwCldVers();
       
                // Add 0% status to those available in the cloud...
                DownloadWho();
                guiSwStatus[SWVER_NU_UCFG] = (bNuUCfgUpdate)?"0%":"OK";
                guiSwStatus[SWVER_NU_ART]  = (bNuArtUpdate)?"0%":"OK";
                guiSwStatus[SWVER_NU_EVM]  = (bNuEvmUpdate)?"0%":"OK";
                guiSwStatus[SWVER_NU_PIC]  = (bNuPicUpdate)?"0%":"OK";
                guiSwStatus[SWVER_NU_SCFG] = (bNuSCfgUpdate)?"0%":"OK";
                guiSwStatus[SWVER_CU_BT]   = (bBtUpdate)?"0%":"OK";
                guiSwStatus[SWVER_NU]      = (bNuCfUpdate)?"0%":"OK";
                guiSwStatus[SWVER_CU_ART]  = (bCuArtUpdate)?"0%":"OK";
                guiSwStatus[SWVER_CU_PIC]  = (bCuPicUpdate)?"0%":"OK";
                guiSwStatus[SWVER_CU]      = (bCuCfUpdate)?"0%":"OK";
                guiSoftwareButtonFlag = true;
                guiSoftwareStatus     = SW_STATUS_PLEASE_UPDATE;
                guiSoftwareDirtyFlag  = true; 
                
                if( guiCurrentMode == PROG_MODE_DOWNLOAD )
                {
                    StopDownloadLoop();
                    StopWaitPopUpMsg();
                    UpdateStatusLine("Update status acquired.");
                }
                
                DldState = DLD_STATE_WAIT_USER;
                
                
                if( bDldAutoMode == true )
                {
                    PrintLog(1, "Download State Auto so automatically start the download...." );
                    Dld.handleDldKey();
                }
            }
            else
            {
                // Send the poll command to look for package updates...
                SendCloudPoll();

                if( guiCurrentMode == PROG_MODE_DOWNLOAD )
                {
                    UpdateStatusLine("Checking for updates...poll: " + DldTimeoutCount + " of " + DLD_CLD_PKG_TIMEOUT_COUNT_MAX );
                } 
            }
            
            if( DldTimeoutCount >= DLD_CLD_PKG_TIMEOUT_COUNT_MAX )
            {
                // after DLD_CLD_PKG_TIMEOUT_COUNT_MAX times exit stage left...
                bGotUpdateFromCloudTimedOut = true;
                guiSoftwareStatus     = SW_STATUS_UNKNOWN;
                guiSoftwareDirtyFlag  = true; 
                
                if( (guiCurrentMode == PROG_MODE_DOWNLOAD) || (nxtyRxStatusIcd <= V1_ICD) )
                {
                    DownloadError( "Timeout", "Sorry, the server is taking too long to respond. Please try again later.", false );
                    
                    if( nxtyRxStatusIcd <= V1_ICD )
                    {
                        // Reset the status since DownloadError() changes above.
                        guiSoftwareStatus     = SW_STATUS_UNKNOWN;
                    }            
                }
                
            }
     
            break; 
        }

        //---------------------------------------------------------------------------------------
        // Phase 3: Download from the cloud to the phone's /Download directory 
        case DLD_STATE_GET_FROM_CLOUD:
        {
            if( myDownloadFileCldId )
            {
                // URL looks like: "https://nextivity-sandbox-connect.axeda.com/ammp/packages/1/files/MN8!900425000022/323",
                var myDownloadUrl = myPlatformUrl + "packages/1/files/" + myModel + "!" + mySn + "/" + myDownloadFileCldId;
            
                // Path:   "file:///storage/emulated/0/Download/PicFromCloud.bin"
                var myPhoneFilePath;
                if( window.device.platform != pcBrowserPlatform )
                {
                    myPhoneFilePath = g_fileSystemDir.toURL() + myDownloadFileName;
                }
                else
                {
                    myPhoneFilePath = g_fileSystemDir + myDownloadFileName;
                }
            
                DldState                    = DLD_STATE_WAIT_ON_CLOUD;
//                DldTimeoutCount             = 0;

                if( DldOrderArray[currentDldIndex] == DLD_NU_SCFG)
                {
                    // If a Secured Setup Config then get from Nextivity Server...
                    GetNxtyConfigFile(nxtyNuUniqueId, newOperatorSku + nxtySwVerNuSCfgCldRev);
                }
                else
                { 
                    FileTransferDownload( myDownloadUrl, myPhoneFilePath );
                }
            }
            else
            {
                // After download and reset user will have to try again.
//                document.getElementById("s" + DldOrderArray[currentDldIndex]).innerHTML = "error";
                guiSwStatus[DldOrderArray[currentDldIndex]] = "error";
                guiSoftwareDirtyFlag = true;
                
                // Get the next download...
                Dld.startFileDownload();
            }
                    
            break;
        }
        
        case DLD_STATE_WAIT_ON_CLOUD:
        {
            if( g_fileTransferSuccess != null )
            {
                if( g_fileTransferSuccess )
                {
                    // File is now on the phone, download from phone to Cel-Fi
                    var infoText = "Downloading file: " + myDownloadFileName + " from phone to Cel-Fi."
//                    ShowWaitPopUpMsg( "Please wait", infoText );
                    UpdateStatusLine(infoText);
//                    StopDownloadLoop();


                    DldState                    = DLD_STATE_WAIT_ON_READ_FILE;
                    DldTimeoutCount             = 0;
            
                    // Get the file... The success call back will set the state to CELFI_INIT 
                    ReadFile( myDownloadFileName );   
//                    bReadFileSuccess = false;
//                    fileSystemDownloadDir.getFile( myDownloadFileName, {create:false}, gotFileEntryCB, onGetFileErrorCB );                  
                }
            }


            // If we have gone half way through our timeout, assume something failed and retry...
            if( DldTimeoutCount == (DLD_CLD_TIMEOUT_COUNT_MAX / 2) )
            {
                PrintLog( 1, "Retry to get file from cloud." );
                g_fileTransferSuccess = null;
                DldState              = DLD_STATE_GET_FROM_CLOUD;
            }



            
//            if( (DldTimeoutCount >= (DLD_CLD_TIMEOUT_COUNT_MAX)) || (g_fileTransferSuccess == false) )
            if( DldTimeoutCount >= (DLD_CLD_TIMEOUT_COUNT_MAX) )
            {
                // after so many times exit stage left...
                DownloadError( "Timeout", "Unable to download file from platform.", false );
            }
            
            break;
        }       


        case DLD_STATE_WAIT_ON_READ_FILE:
        {
            if( g_fileReadSuccess != null )
            {
                if( g_fileReadSuccess )
                {
                    // Make an array of UINT8 type.  evt.target.result holds the contents of the file.
                    if( window.device.platform != pcBrowserPlatform )
                    {
                        u8FileBuff    = new Uint8Array(g_fileReadEvent.target.result);
                    
                        actualFileLen = u8FileBuff.length;
                        resumeFileLen = u8FileBuff.length;
                        PrintLog(1, "Length of array, i.e. file is: " + actualFileLen ); 
                    }
                
                    // Start the actual download process to Cel-Fi
                    DldState        = DLD_STATE_TO_CELFI_INIT;
                    DldTimeoutCount = 0;

                    // Make sure that we have the latest UART redirect status...                    
                    if( nxtyRxStatusIcd > V1_ICD )
                    {
                        GetBoardConfig();
                    }
                    
                }
                else
                {
//                    document.getElementById("s" + DldOrderArray[currentDldIndex]).innerHTML = "error";
                    guiSwStatus[DldOrderArray[currentDldIndex]] = "error";
                    guiSoftwareDirtyFlag = true;
    
                    // See if there are any more files to download...
                    Dld.startFileDownload();
                }
            }
                        
            if( DldTimeoutCount >= DLD_TIMEOUT_COUNT_MAX )
            {
                // after so many times exit stage left...
                DownloadError( "Timeout", "Unable to Read File from Phone's directory.", false );
            }
            
            break;
        }       


        //---------------------------------------------------------------------------------------
        // Phase 4: Download the file from the phone's directory to the Cel-Fi...
        case DLD_STATE_TO_CELFI_INIT:
        {
            DldState              = DLD_STATE_START_REQ;
            StartDownloadLoop(1000);
            DldTimeoutCount       = 0;
            fileIdx               = 0;
            completedFileIdx      = 0;
            bCelFiReset           = false;
            SubState_5_1_9        = 0;
            SubStateV2Start       = 0;
            
            // If the file type is NU or CU then add 4 to the length since we must first send out 0xFFFFFFFF.
            if( (DldOrderArray[currentDldIndex] == DLD_NU) || (DldOrderArray[currentDldIndex] == DLD_CU) )
            {
                actualFileLen += 4;
                resumeFileLen += 4;    
            }

            
            // Send an end request just to make sure that the PIC state machine has been reset... 
            u8Buff[0] = 0;  // No reset
            nxty.SendNxtyMsg(NXTY_DOWNLOAD_END_REQ, u8Buff, 1);
            break;            
        }

        case DLD_STATE_START_REQ:
        {
            if( nxtyRxStatusIcd <= V1_ICD )
            {
                // Send a message to the Cel-Fi unit to start downloading...
                u8Buff[0] = startType;   
                u8Buff[1] = (resumeAddr >> 24);        // Note that javascript converts var to INT32 for shift operations.
                u8Buff[2] = (resumeAddr >> 16);
                u8Buff[3] = (resumeAddr >> 8);
                u8Buff[4] = resumeAddr;
                u8Buff[5] = (resumeFileLen >> 24);     // Note that javascript converts var to INT32 for shift operations.
                u8Buff[6] = (resumeFileLen >> 16);
                u8Buff[7] = (resumeFileLen >> 8);
                u8Buff[8] = (resumeFileLen >> 0);
                
                nxty.SendNxtyMsg(NXTY_DOWNLOAD_START_REQ, u8Buff, 9);
                DldState        = DLD_STATE_START_RSP;
                DldTimeoutCount = 0;
                SubStateV2Reset = 0;
                SubStateV2Start = 0;
            }
            else
            {
                // V2 must redirect the UART manually if sending to remote unit...
                if( SubStateV2Start == 0)
                {
                    if( bCnxToCu )
                    {
                        // If connected to the CU and we need to download to the NU then send UART redirect....                    
                        if(  (DldOrderArray[currentDldIndex] == DLD_NU)      || 
                             (DldOrderArray[currentDldIndex] == DLD_NU_PIC)  ||    
                             (DldOrderArray[currentDldIndex] == DLD_NU_SCFG) ||    
                             (DldOrderArray[currentDldIndex] == DLD_NU_UCFG) ||    
                             (DldOrderArray[currentDldIndex] == DLD_NU_ART)  ||    
                             (DldOrderArray[currentDldIndex] == DLD_NU_EVM)  )
                        {
                            if( (IsUartRemote() == false) && (bCnxToOneBoxNu == false) )     
                            {
                                // Keep trying until we are connected remotely...
                                SetUartRemote();
                            }
                            else
                            {
                                SubStateV2Start = 1;
                                
                                if( DldOrderArray[currentDldIndex] == DLD_NU_EVM )
                                {
                                    PrintLog( 1, "NU EVM: First step: send 0xE5E5E5FF to download transfer buffer." );
                                    
                                    // Must write 0xE5E5E5FF to Xfer Buffer to kick off EVM, only for NU EVM.
                                    var tempVal = 0xE5E5E5FF;
                                    WriteAddrReq(nxtyNuXferBufferAddr, tempVal );
                                }
                                
                            }
                        }
                        else
                        {
                            SubStateV2Start = 1;
                        }
                        
                    }
                    else
                    {
                        // If connected to the NU and we need to download to the CU then send UART redirect....                    
                        if(  (DldOrderArray[currentDldIndex] == DLD_CU)         ||
                             (DldOrderArray[currentDldIndex] == DLD_CU_PIC)     ||
                             (DldOrderArray[currentDldIndex] == DLD_CU_ART)     ||    
                             (DldOrderArray[currentDldIndex] == DLD_CU_BT)      )
                        {
                            if( (IsUartRemote() == false) && (bCnxToOneBoxNu == false) )     
                            {
                                // Keep trying until we are connected remotely...
                                SetUartRemote();
                            }
                            else
                            {
                                SubStateV2Start = 1;
                            }
                        }
                        else
                        {
                            if( DldOrderArray[currentDldIndex] == DLD_NU_EVM )
                            {
                                PrintLog( 1, "NU EVM: First step: send 0xE5E5E5FF to download transfer buffer." );
                                    
                                // Must write 0xE5E5E5FF to Xfer Buffer to kick off EVM, only for NU EVM.
                                var tempVal = 0xE5E5E5FF;
                                WriteAddrReq(nxtyNuXferBufferAddr, tempVal );
                            }
                        
                            SubStateV2Start = 1;
                        }
                    }
                }
                else if( SubStateV2Start == 1)
                {
                    // Send a message to the Cel-Fi unit to start downloading...
                    if( window.device.platform == pcBrowserPlatform )
                    {
                        if(true == ProgramSouthBoundFile( DldOrderArray[currentDldIndex], myDownloadFileName, resumeAddr ))
                        {
                            window.msgRxLastCmd = NXTY_DOWNLOAD_START_RSP;
                            nxtySwDldStartRspAddr = resumeAddr;
                        }
                        else
                        {
                            window.msgRxLastCmd = NXTY_NAK_RSP;
                            nxtyLastNakType = NXTY_NAK_TYPE_TIMEOUT;
                        }
                        DldState = DLD_STATE_START_RSP;
                    }
                    else
                    {
                        u8Buff[0] = startType;   
                        u8Buff[1] = (resumeAddr >> 24);        // Note that javascript converts var to INT32 for shift operations.
                        u8Buff[2] = (resumeAddr >> 16);
                        u8Buff[3] = (resumeAddr >> 8);
                        u8Buff[4] = resumeAddr;
                        u8Buff[5] = (resumeFileLen >> 24);     // Note that javascript converts var to INT32 for shift operations.
                        u8Buff[6] = (resumeFileLen >> 16);
                        u8Buff[7] = (resumeFileLen >> 8);
                        u8Buff[8] = (resumeFileLen >> 0);
                        nxty.SendNxtyMsg(NXTY_DOWNLOAD_START_REQ, u8Buff, 9);
                        DldState        = DLD_STATE_START_RSP;
                    }
                    
                    DldTimeoutCount = 0;
                    SubStateV2Reset = 0;
                    SubStateV2Start = 0;
                }
            }

            if( DldTimeoutCount >= DLD_TIMEOUT_COUNT_MAX )
            {
                // after so many times exit stage left...
                DownloadError( "Timeout", "Unable to redirect UART to remote unit.", false );
            }

                        
            // Slow down just in case we get here by re-negotiating...
            StartDownloadLoop(1000);            
            break;
        }
            

            
        case DLD_STATE_START_RSP:
        {
            // Wait in this state until the Cel-Fi unit responds...
            if( window.msgRxLastCmd == NXTY_DOWNLOAD_START_RSP )
            {
                if( nxtySwDldStartRspAddr != resumeAddr )
                {
                    var myOut = "New resume addr from Ares: 0x" + nxtySwDldStartRspAddr.toString(16) + "  Wave resume addr: 0x" + resumeAddr.toString(16);
                                        
                    resumeAddr       = nxtySwDldStartRspAddr;
                    resumeFileLen    = actualFileLen - (resumeAddr - startAddr);
                    completedFileIdx = actualFileLen - resumeFileLen;

                    PrintLog(1, myOut + "  File Len: " + actualFileLen + " resumeFileLen: " + resumeFileLen + " completedFileIdx:" + completedFileIdx );
                    
                    
                    // Back to try again...
                    startType   = NXTY_SW_NONE_TYPE;
                    DldState    = DLD_STATE_START_REQ;
                    
                    // Make sure that we have the latest info on uart redirect....
                    if( nxtyRxStatusIcd > V1_ICD )
                    {
                        GetBoardConfig();                    
                    }
                    
                }
                else
                {
                    // Move on to next state...
                    DldState        = DLD_STATE_TRANSFER_REQ;
                    DldNakCount     = 0;
                    DldTimeoutCount = 0;   
                    
                    // Crank it up so that we can respond as fast as possible.
                    if( window.device.platform != pcBrowserPlatform )
                    {
                        StartDownloadLoop(DLD_TRANSFER_LOOP_MS);
                    }
                    else
                    {
                        // If PC platform and ICD1, start the downloading thread (for ICD2 this happens after manual redirect of Uart)...
                        if( (nxtyRxStatusIcd <= V1_ICD) && (window.device.platform == pcBrowserPlatform) )
                        {
                            ProgramSouthBoundFile( DldOrderArray[currentDldIndex], myDownloadFileName, resumeAddr );
                        }

                        StartDownloadLoop(1000);
                    }
                }
            }
            else if( window.msgRxLastCmd == NXTY_NAK_RSP )
            {
                // Try again...   
                if( nxtyLastNakType == NXTY_NAK_TYPE_TIMEOUT )
                {
                    // If we were in the middle of downloading an NU, then the UART rediret timed out with the NAK timeout.
                    // Restart the download from the current location so the UART redirect will be thrown.
                    if( nxtyRxStatusIcd <= V1_ICD )
                    {
                        // Check NU and NU_PIC.   No other NU image for V1_ICD required.
                        if( DldOrderArray[currentDldIndex] == DLD_NU )
                        {
                            startType = NXTY_SW_CF_NU_TYPE;
                        }
                        else if( DldOrderArray[currentDldIndex] == DLD_NU_PIC )
                        {
                            startType = NXTY_SW_NU_PIC_TYPE;
                        }
                    }
                    else
                    {
                        if( DldOrderArray[currentDldIndex] == DLD_NU )
                        {
                            startType = NXTY_SW_NONE_TYPE;
                        }
                        else if( DldOrderArray[currentDldIndex] == DLD_NU_PIC )
                        {
                            startType = NXTY_SW_NONE_TYPE;
                        }
    
                        // Go local and get UNII link status while waiting...
                        SetUartLocal();
                        setTimeout(GetNxtySuperMsgLinkStatus, 1000);
                    }
                }
                
                DldState = DLD_STATE_START_REQ;
                
                // Clear the Tx block...
                msgRxLastCmd = NXTY_INIT;
                
                // Give the UART redirect some time to timeout, 5 sec, before retrying...            
                StartDownloadLoop(6000);  
                
                
                if( DldNakCount++ >= DLD_NAK_COUNT_MAX )
                {
                    var eText = "Failed to receive SW Download Start Rsp Msg from Cel-Fi device.";
                    
                    if( bUniiUp == false )
                    {
                        eText += szNoUnii;
                    }
                    DownloadError( "Msg NAK Max.", eText, false );
                }
            }
            
            if( DldTimeoutCount >= DLD_TIMEOUT_COUNT_MAX )
            {
                // after so many times exit stage left...
                DownloadError( "Timeout.", "No SW Download Start Response Msg from Cel-Fi device.", false );
            }
            break;
        }

                    
        case DLD_STATE_TRANSFER_REQ:
        {
            DldTransferReq();
            break;
        }
            
        case DLD_STATE_TRANSFER_RSP:
        {
            // Wait in this state until the Cel-Fi unit responds...
            if( window.msgRxLastCmd == NXTY_DOWNLOAD_TRANSFER_RSP )
            {
            	/*if(!progressBarLoader){
            		$('#versionWrapper').html("");
            		StopWaitPopUpMsg();
            		util.showSWProgressPopup();
            		progressBarLoader = true;
            		//$('#progressBarContainer').html('Installing update ' + swDriverCurrentNum + ' of ' + swDriverUpdateCnt);
            	}*/
                // Calculate the completed file index regardless of whether or not a continue, i.e. 1, was sent back.
                completedFileIdx = fileIdx;
                            
                // See if the Continue flag was set to 1, if so then continue...
                if( nxtySwDldXferRspCont == 1 )
                {
//                    completedFileIdx = fileIdx;

                    var percentComplete = Math.floor(fileIdx/actualFileLen * 100);
//                    PrintLog(1, "Download loop...DldState=" + DldStateNames[DldState] + "  " + percentComplete + "%" );
                    UpdateStatusLine(myDownloadFileName + "..." + percentComplete + "%" ); 
                    /*$('#progressBarBG').css('width', percentComplete + '%');
                    $('#progressHeader').html('Installing update ' + swDriverCurrentNum + ' of ' + swDriverUpdateCnt);
                	$('#progressInfo').html('Updating '+ DldNames[currentDldIndex] + ' to version ' + myDownloadFileVer);
                	$('#progressBarText').html(percentComplete + "%");*/
                    // Update in the table...
//                    document.getElementById("s" + DldOrderArray[currentDldIndex]).innerHTML = percentComplete + "%";
                	var progressTitleText = 'Installing update ' + swDriverCurrentNum + ' of ' + swDriverUpdateCnt;
                	var progressBodyText = 'Updating '+ DldNames[currentDldIndex] + ' to version ' + myDownloadFileVer;
                	var progressUnit = '%';
                	
                	UpdateProgressBar(true, 
                						progressTitleText, 
                						progressBodyText,
                                        "",                                 // Bottom text 
                						percentComplete, 
                						progressUnit
                						);
                    guiSwStatus[DldOrderArray[currentDldIndex]] = percentComplete + "%";
                    guiSoftwareDirtyFlag = true;
                    
                    
                    if( completedFileIdx >= actualFileLen )
                    { 
                        // end transfer
                        DldState = DLD_STATE_END_REQ;
                    }
                    else
                    {
                        // transfer some more...
                        DldTransferReq();
                    }
                    DldTimeoutCount = 0;
                    DldNakCount     = 0;
                    DldResyncCount  = 0;
                }
                else
                {
                    PrintLog(1, "Download transfer rsp: Continue was set to 0 which means to re-calculate the address.");
                
                    // Continue was set to 0 which means to re calculate the start...
                    startType       = NXTY_SW_NONE_TYPE;
                    resumeAddr      = startAddr + completedFileIdx;
                    resumeFileLen   = actualFileLen - (resumeAddr - startAddr);
                    DldTimeoutCount = 0;
                    DldResyncCount  = 0;
                    
                    DldState = DLD_STATE_START_REQ;
                    
                    if( nxtyRxStatusIcd > V1_ICD )
                    {
                        GetBoardConfig();
                        StartDownloadLoop(1000);                    
                    }
                    
                }     
            }


            // Logic to try to recover from any download error.
            // If no transfer response within 1 second
            //   Start sending status requests every 200 mS up to 11.
            //   If the PIC responds with a status response then we know that we have resynced so 
            //   we can resume transfering data.  Ignore NAKs during this process and
            //   consider only timeouts which should catch NAKs as well.

            if( DldTimeoutCount == (1000 / DLD_TRANSFER_LOOP_MS) )      // 1 second timeout...
            {
                PrintLog(1, "Download transfer 1 second timeout, try to resync with status messages.  Fileidx=" + completedFileIdx + " / " + actualFileLen);
                
                // Send a message every 200 mS until we resync.
                StartDownloadLoop(200);
                
                msgRxLastCmd = NXTY_INIT;
                u8Buff[0] = NXTY_PHONE_ICD_VER;
                nxty.SendNxtyMsg(NXTY_STATUS_REQ, u8Buff, 1);
            }  

            // Try up to 11 times to resync by sending a status message every 200 mS.
            // 11 12-byte status messages is 132 bytes, the size of one transfer message.
            if( DldTimeoutCount > (1000 / DLD_TRANSFER_LOOP_MS) )      
            {   
                if( DldTimeoutCount < ((1000 / DLD_TRANSFER_LOOP_MS) + 11) )      
                {   
                    if( (window.msgRxLastCmd == NXTY_STATUS_RSP)  ||                                    
                        ((nxtyRxStatusIcd <= V1_ICD) && (window.msgRxLastCmd == NXTY_NAK_RSP)) )    // If old PIC, allow a NAK to indicate resync
                    {
                        PrintLog(1, "Download transfer 1 second timeout has resynced, continue sending download data.");
                        
                        if( DldResyncCount < 5 )
                        {
                            // Allow a resync.
                            DldTimeoutCount = 0;
                            DldResyncCount++;
                        }
                        else
                        {
                            // Set the DldTimeoutCount so that we do not come back to this logic.
                            DldTimeoutCount = (1000 / DLD_TRANSFER_LOOP_MS) + 11;
                        }
                        
                        // The phone and PIC have resynced so lets try to send download data again starting where we left off.
                        // Try to send the download transfer data again...
                        DldState = DLD_STATE_TRANSFER_REQ;
                        StartDownloadLoop(DLD_TRANSFER_LOOP_MS);
                    }
                    else
                    {            
                        // Send another message and look for the rsp.
                        msgRxLastCmd = NXTY_INIT;
                        u8Buff[0] = NXTY_PHONE_ICD_VER;
                        nxty.SendNxtyMsg(NXTY_STATUS_REQ, u8Buff, 1);
                    }
                }
                else if( DldTimeoutCount == ((1000 / DLD_TRANSFER_LOOP_MS) + 11) )
                {
                    // Reset the loop timer so the final timeout is calculated correctly.
                    StartDownloadLoop(DLD_TRANSFER_LOOP_MS);
                }                
            }  

            if( DldTimeoutCount >= ((10000 / DLD_TRANSFER_LOOP_MS)) )   // 10 second timeout
            {
                // after so many times exit stage left...
                var eText = "Failed to receive SW Download Transfer Response Msg from Cel-Fi device.";
                
                if( bUniiUp == false )
                {
                    eText += szNoUnii;
                }
                DownloadError( "Timeout.", eText, true );
            }
            
            break;
        }            
            
            
        case DLD_STATE_END_REQ:
        {

            if( (DldOrderArray[currentDldIndex] == DLD_NU) || 
                (DldOrderArray[currentDldIndex] == DLD_CU) ||
                ((DldOrderArray[currentDldIndex] == DLD_NU_PIC)  && (bNuPicReset))   ||
                ((DldOrderArray[currentDldIndex] == DLD_NU_SCFG) && (bNuSCfgReset))  ||
                ((DldOrderArray[currentDldIndex] == DLD_NU_UCFG) && (bNuUCfgReset))  ||
                ((DldOrderArray[currentDldIndex] == DLD_NU_ART)  && (bNuArtReset))   ||
                ((DldOrderArray[currentDldIndex] == DLD_NU_EVM)  && (bNuEvmReset))   ||
                ((DldOrderArray[currentDldIndex] == DLD_CU_ART)  && (bCuArtReset))   ||
                ((DldOrderArray[currentDldIndex] == DLD_CU_PIC)  && (bCuPicReset))   ||
                ((DldOrderArray[currentDldIndex] == DLD_CU_BT)   && (bBtReset))      )
            {
                bCelFiReset = true;
            }
            
            // If we just downloaded to any NU image send the just downloaded version to the cloud in case UNII goes down...
            if( DldOrderArray[currentDldIndex] == DLD_NU      ) SendCloudData( "'SwVerNU_CF':'"   + SwPnNuCu   + nxtySwVerNuCfCld   + "'" );
            if( DldOrderArray[currentDldIndex] == DLD_NU_PIC  ) SendCloudData( "'SwVerNU_PIC':'"  + SwPnPic    + nxtySwVerNuPicCld  + "'" );
            if( DldOrderArray[currentDldIndex] == DLD_NU_SCFG ) SendCloudData( "'SwVerNU_SCFG':'" + SwPnNuCfg  + nxtySwVerNuSCfgCld + "'" );
            if( DldOrderArray[currentDldIndex] == DLD_NU_UCFG ) SendCloudData( "'SwVerNU_UCFG':'" + SwPnNuCfg  + nxtySwVerNuUCfgCld + "'" );
            if( DldOrderArray[currentDldIndex] == DLD_NU_ART  ) SendCloudData( "'SwVerNU_ART':'"  + SwPnArt    + nxtySwVerNuArtCld  + "'" );
            if( DldOrderArray[currentDldIndex] == DLD_NU_EVM  ) SendCloudData( "'SwVerNU_EVM':'"  + SwPnNuEvm  + nxtySwVerNuEvmCld  + "'" );
            
            
            // If using the V1 protocol as determined by the CU PIC, then the only images
            // to be downloaded and reset should be the NU PIC or CU PIC.  
            // Included all here as a safty feature in case a PIC has problems. 
            if( nxtyRxStatusIcd <= V1_ICD )
            {
                PrintLog(1, "V1 ICD Download End Req Processing.");
                if( bCelFiReset ) 
                {
                    u8Buff[0]   = 1;  // RESET
                    ShowWaitPopUpMsg( "Please wait", "Resetting system..." );                
                }
                else
                {
                    u8Buff[0] = 0;  // No reset
                } 
                nxty.SendNxtyMsg(NXTY_DOWNLOAD_END_REQ, u8Buff, 1);
                DldState = DLD_STATE_END_RSP;
                
                // Slow it down again...
                StartDownloadLoop(1000); 
                 
            }
            else
            {
                // V2 ICD and beyond processing..............................
                if( SubStateV2Reset == 0)
                {
                    PrintLog(1, "V2 ICD Download End Req Processing, step 1, send Download End Request.");
                    
                    // End the download without a reset and then determine if a reset is necessary....
                    u8Buff[0] = 0;  // No reset
                    nxty.SendNxtyMsg(NXTY_DOWNLOAD_END_REQ, u8Buff, 1);
                    
                    if( bCelFiReset || (DldOrderArray[currentDldIndex] == DLD_NU_UCFG) )
                    {
                        if( DldOrderArray[currentDldIndex] == DLD_NU_UCFG )
                        {
                            SubStateV2Reset = 1;
                        }
                        else
                        {
                            // Go to the next step and figure out how to reset or further processing....
                            SubStateV2Reset = 2;
                         }
                    }
                    else
                    {
                        // We're done, no need to reset anything...
                        DldState = DLD_STATE_END_RSP; 
                    }
                    
                    // Slow it down again...
                    StartDownloadLoop(1000); 
                }
                else if( SubStateV2Reset == 1)
                {
                    if( DldOrderArray[currentDldIndex] == DLD_NU_UCFG )
                    {
                        // Write 4 to PcCgtrl/Flash to copy to flash.
                        var tempVal = 0x04;
                        WriteAddrReq(NXTY_PCCTRL_FLASH_REG, tempVal );
                    }
                    SubStateV2Reset = 2;
                }
                else if( SubStateV2Reset == 2)
                {
                
                    PrintLog(1, "V2 ICD Download End Req Processing, step 2, send a reset to " + DldNames[ DldOrderArray[currentDldIndex] ] );


                    if( (DldOrderArray[currentDldIndex] == DLD_NU) || (DldOrderArray[currentDldIndex] == DLD_CU) )
                    {
                        // Send 0xBEDA221E to 0xF0000040 and read from 0xF8100000.
                        SetNxtySuperMsgResetAresAfterDownload();
                    }
                    else if( ((DldOrderArray[currentDldIndex] == DLD_NU_PIC)  && (bNuPicReset))  || 
                             ((DldOrderArray[currentDldIndex] == DLD_NU_ART)  && (bNuArtReset))  ||
                             ((DldOrderArray[currentDldIndex] == DLD_NU_UCFG) && (bNuUCfgReset)) ||
                             ((DldOrderArray[currentDldIndex] == DLD_NU_EVM)  && (bNuEvmReset))  )
                    {
                        if( bCnxToCu )
                        {
                            WriteAddrReq(NXTY_RESET_REMOTE_ADDR, NXTY_RESET_VALUE );
                        }
                        else
                        {
                            WriteAddrReq(NXTY_RESET_LOCAL_ADDR, NXTY_RESET_VALUE );
                        }
                    }
                    else if( DldOrderArray[currentDldIndex] == DLD_NU_SCFG )
                    {
                        // Must write bit inverse of first DWORD to Xfer Buffer.
                        // This causes a copy and NU reset.
                        var tempVal = ~0x0CfCe1F1;
                        WriteAddrReq(nxtyNuXferBufferAddr, tempVal );
                    }
                    
                    else if( ((DldOrderArray[currentDldIndex] == DLD_CU_PIC) && (bCuPicReset)) ||
                             ((DldOrderArray[currentDldIndex] == DLD_CU_ART) && (bCuArtReset)) ||
                             ((DldOrderArray[currentDldIndex] == DLD_CU_BT)  && (bBtReset))    )
                    {
                        if( bCnxToCu )
                        {
                            WriteAddrReq(NXTY_RESET_LOCAL_ADDR, NXTY_RESET_VALUE );    
                        }
                        else
                        {
                            WriteAddrReq(NXTY_RESET_REMOTE_ADDR, NXTY_RESET_VALUE );    
                        }
                    }
                    
                    // Go to the next substate which will cancel any UART redirect if needed.
                    SubStateV2Reset = 3;
                
                }
                else if( SubStateV2Reset >= 3 )
                {

                    if( bCnxToCu )
                    {
                        // If connected to the CU and we just downloaded to the NU then cancel UART redirect....                    
                        if(  (DldOrderArray[currentDldIndex] == DLD_NU) || 
                            ((DldOrderArray[currentDldIndex] == DLD_NU_ART)  && (bNuArtReset))  ||
                            ((DldOrderArray[currentDldIndex] == DLD_NU_EVM)  && (bNuEvmReset))  ||
                            ((DldOrderArray[currentDldIndex] == DLD_NU_SCFG) && (bNuSCfgReset)) ||
                            ((DldOrderArray[currentDldIndex] == DLD_NU_UCFG) && (bNuUCfgReset)) ||
                            ((DldOrderArray[currentDldIndex] == DLD_NU_PIC)  && (bNuPicReset))   )
                        {
                            // Wait on a NAK from the reset and then go local...
                            PrintLog(1, "V2 ICD Download End Req Processing, step 3, wait on NAK from reset and then cancel UART redirect.");
                            if( (window.msgRxLastCmd == NXTY_NAK_RSP) || (SubStateV2Reset >= 7) )
                            {
                                msgRxLastCmd = NXTY_INIT;
                                SetUartLocal();
                                DldState = DLD_STATE_END_RSP;  
                            }
                            SubStateV2Reset++;
                        }
                        else
                        {
                            // Move on to the next state...
                            DldState = DLD_STATE_END_RSP;                
                        }
                    }
                    else
                    {
                        // If connected to the NU and we just downloaded to the CU then cancel UART redirect....                    
                        if(  (DldOrderArray[currentDldIndex] == DLD_CU)                         ||
                            ((DldOrderArray[currentDldIndex] == DLD_CU_PIC) && (bCuPicReset))   ||
                            ((DldOrderArray[currentDldIndex] == DLD_CU_ART) && (bCuArtReset))   ||
                            ((DldOrderArray[currentDldIndex] == DLD_CU_BT)  && (bBtReset))      )
                        {
                            // Wait on a NAK from the reset and then go local...
                            PrintLog(1, "V2 ICD Download End Req Processing, step 3, wait on NAK from reset and then cancel UART redirect.");
                            if( (window.msgRxLastCmd == NXTY_NAK_RSP) || (SubStateV2Reset >= 7) )
                            {
                                msgRxLastCmd = NXTY_INIT;
                                SetUartLocal();
                                DldState = DLD_STATE_END_RSP;  
                            }
                            SubStateV2Reset++;
                        }
                        else
                        {
                            // Move on to the next state...
                            DldState = DLD_STATE_END_RSP;                
                        }
                    }
                }
                
                
            }
            
            break;
        }

        case DLD_STATE_END_RSP:
        {
            // Wait in this state until the Cel-Fi unit responds...
            if( window.msgRxLastCmd == NXTY_DOWNLOAD_END_RSP )
            {
                // Catch all V1 or V2 non resets.
                PrintLog(1, "Update Complete...End Rsp");
                UpdateStatusLine("Update Complete... " ); 

                
                // Get the next download...
                Dld.startFileDownload();
            }
            else if( SubStateV2Reset >= 2 )
            {
                // Catch the V2 reset here...SetUartLocal() may have been called above. 
                PrintLog(1, "Update Complete...SubStateV2Reset >= 2");
//                UpdateStatusLine("Update Complete... " ); 
                
                // Get the next download...
                if( bCelFiReset == false )
                {
                    Dld.startFileDownload();
                }
            }
            else if( window.msgRxLastCmd == NXTY_NAK_RSP )
            {
                if( (bCelFiReset) && (nxtyLastNakType == NXTY_NAK_TYPE_TIMEOUT) )
                {
                    // If the NU or CU was just reset then the PIC may not be able to communicate and we
                    // either timeout here or timeout below.  Either way we will call it done. 
                    PrintLog(1, "Update Complete...NAK Timeout");
                    UpdateStatusLine("Update Complete... " ); 
                
                    // Get the next download...
                    Dld.startFileDownload();
 
                }
                else
                {
                    // Try again...
                    DldState = DLD_STATE_END_REQ;
    
                    // Clear the Tx block...
                    msgRxLastCmd = NXTY_INIT;
                }
                
                
                if( DldNakCount++ >= DLD_NAK_COUNT_MAX )
                {
                    var eText = "Failed to receive SW Download End Response Msg from Cel-Fi device.";
                    
                    if( bUniiUp == false )
                    {
                        eText += szNoUnii;
                    }
                    DownloadError( "Msg NAK Max.", eText, false );
                }
            }
               
            if( bCelFiReset )
            {                
                UpdateStatusLine("Waiting for reset... " + (DLD_RESET_TIMEOUT - DldTimeoutCount) );
            }
                                     
            if( DldTimeoutCount >= (DLD_TIMEOUT_COUNT_MAX * 2) )
            {
                if( bCelFiReset )
                {
                    // If the NU or CU was just reset then the PIC may not be able to communicate and we
                    // either timeout here or timeout below.  Either way we will call it done. 
                
                    // Get the next download...
                    Dld.startFileDownload();
                }
                else
                {
                    // after x times exit stage left...
                    var eText = "Failed to receive SW Download End Response Msg from Cel-Fi device.";
                    
                    if( bUniiUp == false )
                    {
                        eText += szNoUnii;
                    }
                    
                    DownloadError( "Timeout.", eText, false );
                }
            }
            break;
        }

        case DLD_STATE_RESET:
        {
            UpdateStatusLine("Waiting for reset... " + (DLD_RESET_TIMEOUT - DldTimeoutCount) );
            
            if( DldTimeoutCount >= DLD_RESET_TIMEOUT )
            {
                // Move on to the next state...
                if( bNuCfUpdate || bNuPicUpdate || bNuSCfgUpdate || bNuUCfgUpdate || bNuArtUpdate || bNuEvmUpdate )
                {
                    // If any NU image was updated then wait on the UNII to be up before going on...
                    DldState        = DLD_STATE_UNII_UP;
                    bUniiUp         = false;
                    ShowWaitPopUpMsg( "Please wait", "Waiting for Unit to Unit comm..." ); 
                }
                else
                {
                    // Do not wait on the UNII to be up...
                    DldState        = DLD_STATE_5_1_9_CHECK_VER;
                }
                DldTimeoutCount = 0;
                
                // Clear the Tx block...
                msgRxLastCmd = NXTY_INIT;
                
                // Get the ICD version again...
                u8Buff[0] = NXTY_PHONE_ICD_VER;
                nxty.SendNxtyMsg(NXTY_STATUS_REQ, u8Buff, 1);
            }
            break;
        }

        case DLD_STATE_UNII_UP:
        {
            if( bUniiUp )
            {
                DldState        = DLD_STATE_5_1_9_CHECK_VER;
                DldTimeoutCount = 0;
            }
            else
            {
                UpdateStatusLine("Waiting for Unit to Unit comm... " + (DLD_UNII_UP_TIMEOUT - DldTimeoutCount) );
            
                // Check to see if UNII is up...
                GetNxtySuperMsgLinkStatus();
            }            

            if( DldTimeoutCount >= DLD_UNII_UP_TIMEOUT )
            {
                // after x times exit stage left...
                DownloadError( "Timeout.", "Waiting for communications between Cel-Fi devices...", false );
            }            

            break;
        }





        // 5_1_9 states are due to a problem with download and reset for version 5.1.9 and previous.
        // Solution is to reset a 2nd time...
        case DLD_STATE_5_1_9_CHECK_VER:
        {
            // Check if the local CU or NU version is 5.1.9 or previous, if so then reset.
            // localeCompare will return -1 if nxtySwVerNuCf < "0x0501000A".
            var bNuSecondResetRequired = ((bNuCfUpdate) && (nxtySwBuildIdNu.localeCompare("0x0501000A") == -1))?true:false;
            var bCuSecondResetRequired = ((bCuCfUpdate) && (nxtySwBuildIdCu.localeCompare("0x0501000A") == -1))?true:false;
            
            if( bNuSecondResetRequired || bCuSecondResetRequired )
            {
                PrintLog( 1, "NU/CU 5.1.9 Check: NU 2nd Reset Req: " + bNuSecondResetRequired + "  CU 2nd Reset Req: " + bCuSecondResetRequired );            
                if( bNuSecondResetRequired )
                { 
                    if( SubState_5_1_9 == 0 )
                    {
                        PrintLog( 1, "NU 5.1.9 Check: SubState 5.1.9 = 0 - Redirect UART to NU" );
                     
                        // 1st: set UART redirect to the NU 
                        SetUartRemote();
                        SubState_5_1_9  = 1;
                        DldTimeoutCount = 0;
                    }
                    else if( SubState_5_1_9 == 1 )
                    {
                        PrintLog( 1, "NU 5.1.9 Check: SubState 5.1.9 = 1 - Issue Download END Req to force a reset." );
                        if( bNxtySuperMsgRsp == true )
                        {
                            if( iNxtySuperMsgRspStatus == NXTY_SUPER_MSG_STATUS_SUCCESS )
                            {
                                // 2nd:  Issue a download END REQ message
                                SetNxtySuperMsgResetAresAfterDownload(); 
                                SubState_5_1_9  = 2;
                                DldTimeoutCount = 0;
                                ShowWaitPopUpMsg( "Please wait", "Resetting system..." );
                            }
                            else
                            {
                                SubState_5_1_9 = 0;     // retry...
                            }
                             
                        }
                        else if( window.msgRxLastCmd == NXTY_NAK_RSP )
                        {
                            // retry...
                            SubState_5_1_9 = 0;
                        }
                    
                    }
                    else if( SubState_5_1_9 == 2 )
                    {
                        PrintLog( 1, "NU 5.1.9 Check: SubState 5.1.9 = 2 - Wait for Download END RSP or a timeout." );
                    
                        UpdateStatusLine("Waiting for reset... " + (DLD_RESET_TIMEOUT - DldTimeoutCount) );

                        if( bNxtySuperMsgRsp == true )
                        {
                            // Don't expect to get this since we just reset the NU...
                            // 3rd:  See if the CU version is 5.1.9 or prev and reset it as well.
                            if( bCuSecondResetRequired )
                            { 
                                SetNxtySuperMsgResetAresAfterDownload(); 
                            }

                            DldState        = DLD_STATE_5_1_9_RESET;
                            DldTimeoutCount = 0;
                        }
                        else if( window.msgRxLastCmd == NXTY_NAK_RSP )
                        {
                            // Most likely a timeout so blast ahead...
                            if( bCuSecondResetRequired )
                            { 
                                SetNxtySuperMsgResetAresAfterDownload(); 
                            }

                            DldState        = DLD_STATE_5_1_9_RESET;
                            DldTimeoutCount = 0;
                        }
                    
                    }
                }
                else
                {
                    PrintLog( 1, "CU 5.1.9 Check" );
                
                    // Not the NU so it must have been just the CU...Reset...
                    SetNxtySuperMsgResetAresAfterDownload(); 
                    DldState        = DLD_STATE_5_1_9_RESET;
                    DldTimeoutCount = 0;
                }
                
            }
            else
            {
                // No need for 2nd reset on the NU or CU so get latest versions...
                DldState         = DLD_STATE_UPDATE_LOCAL_VER;
                SubStateV2GetVer = 0;
                nxtyCurrentReq   = 0;
            }
            
            // Wait additional time for NAK timeout if needed...
            if( DldTimeoutCount >= (DLD_TIMEOUT_COUNT_MAX * 2) )
            {
                // If a 2nd reset was needed just move on to the reset state
                if( bNuSecondResetRequired || bCuSecondResetRequired )
                {
                    // See if we need to reset the CU as well but have not...
                    if( bCuSecondResetRequired && (DldState != DLD_STATE_5_1_9_RESET) )
                    { 
                        SetNxtySuperMsgResetAresAfterDownload(); 
                        DldTimeoutCount = 0;
                    }
                    DldState        = DLD_STATE_5_1_9_RESET;

                }
                else
                {
                    // after so many times exit stage left...
                    DownloadError( "Timeout.", "Failed to reset Cel-Fi device (5.1.9).", false );
                }
            }
            break;
        }

        case DLD_STATE_5_1_9_RESET:
        {
            UpdateStatusLine("Waiting for reset... " + (DLD_RESET_TIMEOUT - DldTimeoutCount) );
            
            if( DldTimeoutCount >= DLD_RESET_TIMEOUT )
            {
                // Move on to the next state...
                if( bNuCfUpdate || bNuPicUpdate )
                {
                    // If either NU image was updated then wait on the UNII to be up before going on...
                    DldState        = DLD_STATE_5_1_9_UNII_UP;
                    bUniiUp         = false;
                    DldTimeoutCount = 0;
                    ShowWaitPopUpMsg( "Please wait", "Waiting for Unit to Unit comm..." ); 
                }
                else
                {
                    // Do not wait on the UNII to be up...
                    DldState         = DLD_STATE_UPDATE_LOCAL_VER;
                    SubStateV2GetVer = 0;
                    nxtyCurrentReq   = 0;
                }
                DldTimeoutCount = 0;
                
                                
                // Clear the Tx block...
                msgRxLastCmd = NXTY_INIT;
            }
            break;
        }

        case DLD_STATE_5_1_9_UNII_UP:
        {
            if( bUniiUp )
            {
                DldState         = DLD_STATE_UPDATE_LOCAL_VER;
                SubStateV2GetVer = 0;
                nxtyCurrentReq   = 0;
            }
            else
            {
                UpdateStatusLine("Waiting for Unit to Unit comm... " + (DLD_UNII_UP_TIMEOUT - DldTimeoutCount) );
            
                // Check to see if UNII is up...
                GetNxtySuperMsgLinkStatus();
            }            

            if( DldTimeoutCount >= DLD_UNII_UP_TIMEOUT )
            {
                // after x times exit stage left...
                DownloadError( "Timeout.", "Waiting for communications between Cel-Fi devices...", false );
            }            

            break;
        }


            
        case DLD_STATE_UPDATE_LOCAL_VER:
        {
            if( nxtyRxStatusIcd <= V1_ICD )
            {
                PrintLog( 1, "V1: No need to get version info since we do not display. Go to DONE." );
                
                // Don't bother getting the versions since we do not display...
                DldState = DLD_STATE_DONE;
            }
            else if( SubStateV2GetVer == 0 )
            {
                StopWaitPopUpMsg();
                UpdateStatusLine("Updating Local SW Version Info... " );
                StartDownloadLoop(1500); 
            
                msgRxLastCmd = NXTY_INIT;            
                GetNxtySuperMsgInfo();
                SubStateV2GetVer = 1;
            }
            else if( SubStateV2GetVer == 1 )
            {
                if( iNxtySuperMsgRspStatus == NXTY_SUPER_MSG_STATUS_PENDING )
                {
                    // Should have received by now, try to clear and then redo...
                    msgRxLastCmd = NXTY_INIT;
                    u8Buff[0] = NXTY_PHONE_ICD_VER;
                    nxty.SendNxtyMsg(NXTY_STATUS_REQ, u8Buff, 1);
                    SubStateV2GetVer = 0;
                }
                else if( iNxtySuperMsgRspStatus == NXTY_SUPER_MSG_STATUS_SUCCESS )
                {
                    UpdateStatusLine("Updating Local SW Version Info 2... " );
                    GetNxtySuperMsgInfo2();
                    SubStateV2GetVer = 2;
                }
                else
                {
                    // Must be a NAK or Write error, try again...
                    SubStateV2GetVer = 0;
                    RefreshSouthBoundIf();                
                    
                    if( DldNakCount++ >= DLD_NAK_COUNT_MAX )
                    {
                        var eText = "Failed to receive SW Ver Rsp Msg from Cel-Fi device.";
                        
                        if( bUniiUp == false )
                        {
                            eText += szNoUnii;
                        }
                        DownloadError( "Msg NAK Max.", eText, false );
                    }
                }
            }
            else if( SubStateV2GetVer == 2 )
            {
                if( iNxtySuperMsgRspStatus == NXTY_SUPER_MSG_STATUS_PENDING )
                {
                    // Try again...
                    msgRxLastCmd = NXTY_INIT;
                    GetNxtySuperMsgInfo2();
                }
                else if( iNxtySuperMsgRspStatus == NXTY_SUPER_MSG_STATUS_SUCCESS )
                {
                    // Good response, fill in the versions...
                    FillSwCelFiVers();
                    guiSoftwareDirtyFlag = true;                   
                    SubStateV2GetVer = 3;
                }
                else
                {
                    // Must be a NAK or Write error, try again...
                    SubStateV2GetVer = 1;
                    RefreshSouthBoundIf();                
                    
                    if( DldNakCount++ >= DLD_NAK_COUNT_MAX )
                    {
                        var eText = "Failed to receive SW Ver Rsp Msg from Cel-Fi device.";
                        
                        if( bUniiUp == false )
                        {
                            eText += szNoUnii;
                        }
                        DownloadError( "Msg NAK Max.", eText, false );
                    }
                }
            }

            
            
            else if( SubStateV2GetVer == 3 )
            {
                // Only update the NU versions if any were downloaded...
                if( (bNuCfUpdate || bNuPicUpdate || bNuSCfgUpdate || bNuUCfgUpdate || bNuArtUpdate || bNuEvmUpdate) && bUniiUp )
                {
                    UpdateStatusLine("Updating Remote SW Version Info... " );
                    SetUartRemote();
                    SubStateV2GetVer = 4;
                }
                else
                {
                    DldState = DLD_STATE_DONE;
                }
            }
            else if( SubStateV2GetVer == 4 )
            {
                msgRxLastCmd = NXTY_INIT;            
                GetNxtySuperMsgInfo();
                SubStateV2GetVer = 5;
            }
            else if( SubStateV2GetVer == 5 )
            {
                if( iNxtySuperMsgRspStatus == NXTY_SUPER_MSG_STATUS_PENDING )
                {
                    // Should have received by now, try to clear and then redo...
                    msgRxLastCmd = NXTY_INIT;
                    u8Buff[0] = NXTY_PHONE_ICD_VER;
                    nxty.SendNxtyMsg(NXTY_STATUS_REQ, u8Buff, 1);
                    SubStateV2GetVer = 4;
                }
                else if( iNxtySuperMsgRspStatus == NXTY_SUPER_MSG_STATUS_SUCCESS )
                {
                    UpdateStatusLine("Updating Remote SW Version Info 2... " );
                    GetNxtySuperMsgInfo2();
                    SubStateV2GetVer = 6;
                }
                else
                {
                    // Must be a NAK or Write error, try again...
                    SubStateV2GetVer = 4;
                    RefreshSouthBoundIf();                
                    
                    if( DldNakCount++ >= DLD_NAK_COUNT_MAX )
                    {
                        var eText = "Failed to receive SW Ver Rsp Msg from Cel-Fi device.";
                        
                        if( bUniiUp == false )
                        {
                            eText += szNoUnii;
                        }
                    
                        DownloadError( "Msg NAK Max.", eText, false );
                    }
                }
            }

            else if( SubStateV2GetVer == 6 )
            {
                if( iNxtySuperMsgRspStatus == NXTY_SUPER_MSG_STATUS_PENDING )
                {
                    // retry...
                    msgRxLastCmd = NXTY_INIT;
                    GetNxtySuperMsgInfo2();
                }
                else if( iNxtySuperMsgRspStatus == NXTY_SUPER_MSG_STATUS_SUCCESS )
                {
                    // Good response, fill in the versions...
                    FillSwCelFiVers();
                    guiSoftwareDirtyFlag = true;                   
                    SubStateV2GetVer = 7;
                }
                else
                {
                    // Must be a NAK or Write error, try again...
                    SubStateV2GetVer = 5;
                    RefreshSouthBoundIf();                
                    
                    if( DldNakCount++ >= DLD_NAK_COUNT_MAX )
                    {
                        var eText = "Failed to receive SW Ver Rsp Msg from Cel-Fi device.";
                        
                        if( bUniiUp == false )
                        {
                            eText += szNoUnii;
                        }
                    
                        DownloadError( "Msg NAK Max.", eText, false );
                    }
                }
                
            }
            else if( SubStateV2GetVer == 7 )
            {
                SetUartLocal();
                DldState = DLD_STATE_DONE;
            }
            
        
        
        
        


                         
            if( DldTimeoutCount >= (DLD_TIMEOUT_COUNT_MAX * 2) )
            {
                // after x times exit stage left...
                var eText = "Failed to receive SW Ver Rsp Msg from Cel-Fi device.";
                
                if( bUniiUp == false )
                {
                    eText += szNoUnii;
                }
            
                DownloadError( "Timeout.", eText, false );
            }            
            

            break;
        }


        case DLD_STATE_DONE:
        {
            UpdateStatusLine("Update complete... " );
            util.removeSWProgressPopup();
            StopDownloadLoop();
            StopWaitPopUpMsg();
            
            guiSoftwareStatus           = SW_STATUS_UP_TO_DATE;
            guiSoftwareDirtyFlag        = true;
            bDldAutoMode                = false;
            
            // If anyone was downloaded then put a big happy button up...
            if( bNuSCfgUpdate || bNuUCfgUpdate )
            {
                ShowAlertPopUpMsg("Update Complete!",  "New Operator Software has been updated." );
            }
            else if( bNuCfUpdate || bCuCfUpdate || bNuPicUpdate || bCuPicUpdate || bBtUpdate || bNuArtUpdate || bCuArtUpdate || bNuEvmUpdate )
            {
                ShowAlertPopUpMsg("Update Complete!",  "Software has been updated." );
            }            

            if( window.device.platform != pcBrowserPlatform ) 
            { 
                window.plugins.powerManagement.release( successReleasePowerManagement, failReleasePowerManagement ); 
            }    
            
            if( bForceSwUpdate )
            {
                bForceSwUpdate = false;
                
                PrintLog(1, "Forced update complete so restart main loop.");
                // Restart the main loop since we halted for forced download.
                // V1_ICD or build ID < SW5_1_45
                StartMainLoop(1000);
            }      
            break;
        }
        
        
        case DLD_STATE_WAIT_USER:
        {
            UpdateStatusLine("Select Update to continue... " );
//            StopDownloadLoop();
            StopWaitPopUpMsg();
            
            // Send out a message every second just in case the PIC and BT need to get re-aligned...
            // Clear any Tx block first...
            msgRxLastCmd = NXTY_INIT;
            u8Buff[0] = NXTY_PHONE_ICD_VER;
            nxty.SendNxtyMsg(NXTY_STATUS_REQ, u8Buff, 1);
            
            break;
        }
        
        
        default:
        {
            StopDownloadLoop();
            UpdateStatusLine("Invalid Update State.");
            break;
        }
        
    }   // end switch
}
    
    
function DldTransferReq() 
{
  if( window.device.platform != pcBrowserPlatform )
  {
    var chunkSize;
    var u8Buff  = new Uint8Array(NXTY_MED_MSG_SIZE);
    
    chunkSize = NXTY_DOWNLOAD_MAX_SIZE;
    fileIdx   = completedFileIdx;

    // See if we can push out a full load...        
    if( (fileIdx + NXTY_DOWNLOAD_MAX_SIZE) > actualFileLen )
    {
        chunkSize = actualFileLen - fileIdx;
    }
    u8Buff[0] = chunkSize;

    
    if( (DldOrderArray[currentDldIndex] == DLD_NU) || (DldOrderArray[currentDldIndex] == DLD_CU) )
    {
        // Start with 1 to account for u8Buff[0] set to chunkSize
        i = 1;
        
        // For NU and CU the 1st 4 bytes must be 0xFFFFFFFF and the size must be decreased by 4.
        if( fileIdx == 0 )
        {   
            var size;
                 
            u8Buff[i++] = 0xFF;                     // dword[0]
            u8Buff[i++] = 0xFF;
            u8Buff[i++] = 0xFF;
            u8Buff[i++] = 0xFF;
            u8Buff[i++] = u8FileBuff[fileIdx++];    // dword[1]
            u8Buff[i++] = u8FileBuff[fileIdx++];
            u8Buff[i++] = u8FileBuff[fileIdx++];
            u8Buff[i++] = u8FileBuff[fileIdx++];
            
            // Treat the size as little endian...
            size =  u8FileBuff[fileIdx++];
            size |= (u8FileBuff[fileIdx++] << 8);
            size |= (u8FileBuff[fileIdx++] << 16);
            size |= (u8FileBuff[fileIdx++] << 24);
            
            // Use the triple right shift operator to convert from signed to unsigned.                           
            size >>>= 0;
            
            // Subtract 4...
            size    -= 4; 

            // Load it back into the buffer...
            u8Buff[i++] = (size)       & 0xFF;
            u8Buff[i++] = (size >> 8)  & 0xFF;
            u8Buff[i++] = (size >> 16) & 0xFF;
            u8Buff[i++] = (size >> 24) & 0xFF;

            // Finish the chunk...
            for( ; i <= chunkSize; i++ )
            {
                u8Buff[i] = u8FileBuff[fileIdx++];
            }
            
            // Compensate for the additional 4 bytes...
            fileIdx += 4;
        }
        else
        {
            for( i = 1; i <= chunkSize; i++ )
            {
                u8Buff[i] = u8FileBuff[fileIdx - 4];
                fileIdx++;
            }
        }
    }
    else
    {
        
        // Start with 1 to account for u8Buff[0] set to chunkSize
        for( i = 1; i <= chunkSize; i++ )
        {
            u8Buff[i] = u8FileBuff[fileIdx++];
        }
    }
    
    
    // Send a message to the Cel-Fi unit with data...
    nxty.SendNxtyMsg(NXTY_DOWNLOAD_TRANSFER_REQ, u8Buff, (chunkSize + 1));
    DldState = DLD_STATE_TRANSFER_RSP;
  }
  else
  {
    /*if(!progressBarLoader){
        $('#versionWrapper').html("");
        StopWaitPopUpMsg();
        util.showSWProgressPopup();
        progressBarLoader = true;
    }*/

    // get progress from SouthBound interface
    var percentComplete = ProgramSouthBoundFileProgress();
    if (percentComplete < 0) //Error
    {
        percentComplete = 0; //but don't display the negative number
        DldState = DLD_STATE_START_RSP;
        window.msgRxLastCmd = NXTY_NAK_RSP;
        nxtyLastNakType = NXTY_NAK_TYPE_TIMEOUT;
    }
    else if(percentComplete >= 100) //Done!
    {
        DldState = DLD_STATE_END_REQ;
    }
    percentComplete = Math.floor( percentComplete );

    UpdateStatusLine(myDownloadFileName + "..." + percentComplete + "%" ); 
    /*$('#progressBarBG').css('width', percentComplete + '%');
    $('#progressHeader').html('Installing update ' + swDriverCurrentNum + ' of ' + swDriverUpdateCnt);
    $('#progressInfo').html('Updating '+ DldNames[currentDldIndex] + ' to version ' + myDownloadFileVer);
    $('#progressBarText').html(percentComplete + "%");*/
    
    var progressTitleText = 'Installing update ' + swDriverCurrentNum + ' of ' + swDriverUpdateCnt;
	var progressBodyText = 'Updating '+ DldNames[currentDldIndex] + ' to version ' + myDownloadFileVer;
	var progressUnit = '%';

	UpdateProgressBar(true, 
						progressTitleText, 
						progressBodyText,
                        "",                                 // Bottom text 
						percentComplete, 
						progressUnit
						);
    
    // Update in the table...
    guiSwStatus[DldOrderArray[currentDldIndex]] = percentComplete + "%";
    guiSoftwareDirtyFlag = true;
  }
}

// CheckForSoftwareUpdates() --------------------------------------------------------------------------------
//   - Called at startup when all Cel-Fi versions on known.   
//   - Starts a poll to poll the cloud until it gets a rsponse from the cloud or user goes to download state.
//
function CheckForSoftwareUpdates() 
{
    
    // Copied from renderDldView............................................................................. 
    SendCloudData(  "'isUpdateAvailable':'false'" );
                
    // Make sure that we are at full download speed.
//    SetMaxTxPhoneBuffers(7);

    // Version info from the hardware... 
    FillSwCelFiVers();

    // Call DLD_STATE_INIT 
    DldState = DLD_STATE_INIT;
    DldLoop();

    // Start the polling loop...
    PollForSoftwareUpdates();
}

// PollForSoftwareUpdates....................................................................................
function PollForSoftwareUpdates()
{
    if( (guiSoftwareStatus == SW_STATUS_CHECKING)  && (guiCurrentMode != PROG_MODE_DOWNLOAD) )
    {
        // Call DLD_STATE_CHECK_FOR_UPDATES 
        DldState = DLD_STATE_CHECK_FOR_UPDATES;
        DldLoop();
        
        // Return here in 1 second....
        setTimeout(PollForSoftwareUpdates, 1000);        
    }
}


// End of operational code...
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


