//=================================================================================================
//
//  File: v1_icd.js
//
//  Description:  This file contains the functions necessary to gather the necessary information
//                using version 1 protocol to match that of version 2 protocol.
//
//      -------- V2 -----------------------      ----------- V1 --------------------
//      SuperMsgInfo() (CU)
//       - SN                                     - SYS_INFO_REQ (Get Param 9,8)
//       - Unique ID                              - SYS_INFO_REQ (Get Param 2,1)
//       - Ares SW Version                        - SW_VERSION_REQ  
//       - Build ID
//       - PIC SW Version                         - SW_VERSION_REQ
//       - BT SW Version                          - SW_VERSION_REQ
//       - Antenna Info
//       - Board Config                           - Retrieved with Status msg
//       - Cloud Buffer addr
//       - Cloud Info
//       - Secured Setup P/N (Wave ID)
//
//      SuperMsgInfo2() (CU then NU)
//       - Art P/N (Wave ID)
//       - EVM P/N (Wave ID)
//       - Unsecured Setup P/N (Wave ID)
//
//
//      SuperMsgInfo() (NU)
//       - SN                                     
//       - Unique ID
//       - Ares SW Version                        - SW_VERSION_REQ  
//       - Build ID
//       - PIC SW Version                         - SW_VERSION_REQ
//       - BT SW Version
//       - Antenna Info
//       - Board Config
//       - Cloud Buffer addr
//       - Cloud Info
//       - Secured Setup P/N (Wave ID)
//
//      SuperMsgInfo2() (CU then NU)
//       - Art P/N (Wave ID)
//       - EVM P/N (Wave ID)
//       - Unsecured Setup P/N (Wave ID)
//
//
//
//
//
//
//=================================================================================================


const   V1_MAIN_LOOP_COUNTER_MAX    = 30;
var     uV1MainLoopCounter          = 0;
var     uV1StateCounter             = 0;
var     V1MainLoopIntervalHandle    = null;
var     bV1GotNuVer                 = false;

//.................................................................................................
function StartV1MainLoop( loopTime )
{
    if( V1MainLoopIntervalHandle != null )
    {
        StopV1MainLoop();
    }
    
    PrintLog(1, "StartV1MainLoop(" + loopTime + ")." );         

    V1MainLoopIntervalHandle = setInterval(V1MainLoop, loopTime);
}


//.................................................................................................
function StopV1MainLoop()
{
    clearInterval(V1MainLoopIntervalHandle)
    V1MainLoopIntervalHandle = null;
}


// V1MainLoop.......................................................................................
// Used for V0.07 PIC ICD.
// Should only be applicable to old PRO and DUO hardware.
// Not applicable to one-box hardware.
function V1MainLoop() 
{
    var u8TempBuff = new Uint8Array(20);  
    PrintLog(1, "V1: Main loop..." );
    
    // ------------------------------------------------------------------------------------------
    if( isSouthBoundIfCnx )
    {
        if( isNxtySnCurrent == false )
        {
            PrintLog(1, "V1: Retrieving serial number...");
            bUniiUp = true;
            uV1StateCounter = 0;
            
            // Get the CU serial number...used by the platform 
            nxtyCurrentReq  = NXTY_SEL_PARAM_REG_SN_TYPE;
            u8TempBuff[0]   = NXTY_SW_CF_CU_TYPE;     // Select CU
            u8TempBuff[1]   = 9;                      // System SN MSD
            u8TempBuff[2]   = 8;                      // System SN LSD  
            nxty.SendNxtyMsg(NXTY_SYS_INFO_REQ, u8TempBuff, 3);
        }
        else if( bV1GotNuVer == false )
        {
            PrintLog(1, "V1: Retrieving NU SW version...");
            
            if( uV1StateCounter == 0 )
            {
               GetNxtySuperMsgLinkStatus();
               uV1StateCounter = 1;
            }
            else
            {
                if( bUniiUp )  // up?
                {
                    if( (msgRxLastCmd == NXTY_NAK_RSP) && (nxtyLastNakType == NXTY_NAK_TYPE_UNIT_REDIRECT) )
                    {
                        // Bypass getting NU Sw Ver which we need for the reg info.
                        bV1GotNuVer = true;
                        
                        // Cancel and wait at least 5 seconds.
                        cancelUartRedirect();
                    }
                    else if( (msgRxLastCmd == NXTY_NAK_RSP) && (nxtyLastNakType == NXTY_NAK_TYPE_TIMEOUT) )
                    {
                        // Since this message is going to the NU and we did not recieve it last time, allow 6 seconds
                        // after the NAK before sending again to allow the NU redirect to time out in 5..
                        clearInterval(MainLoopIntervalHandle);
                        MainLoopIntervalHandle = setInterval(app.mainLoop, 6000 ); 
                        
                        // Make sure we do not come back here in 6 seconds...
                        msgRxLastCmd = NXTY_INIT;
                    }
                    else if( nxtySwVerNuCf != null )
                    {
                        bV1GotNuVer = true;
                    }
                    else
                    {
                        // Get the Cell Fi software version from the NU...
                        nxtyCurrentReq    = NXTY_SW_CF_NU_TYPE;
                        u8TempBuff[0]     = nxtyCurrentReq;
                        nxty.SendNxtyMsg(NXTY_SW_VERSION_REQ, u8TempBuff, 1);
    
                        // Since this message is going to the NU, allow 4 seconds to receive the response..
                        StartV1MainLoop( 4000 );
                    }
                }
                else
                {
                    // Bypass getting NU Sw Ver which we need for the reg info.
                    bV1GotNuVer = true;
                }
            }
        }
        else if( nxtySwVerCuCf == null )
        {
            PrintLog(1, "V1: Retrieving CU SW version...");

            // Crank it up just a little since we are no longer talking to the NU...
            StartV1MainLoop( 2000 );
        
            // Get the CU software version...
            nxtyCurrentReq    = NXTY_SW_CF_CU_TYPE;
            u8TempBuff[0]     = nxtyCurrentReq;
            nxty.SendNxtyMsg(NXTY_SW_VERSION_REQ, u8TempBuff, 1);                
        }            
        else if( nxtySwVerCuPic == null )
        {
            PrintLog(1, "V1: Retrieving CU PIC SW version...");
        
                                
            // Get the CU PIC software version...
            nxtyCurrentReq    = NXTY_SW_CU_PIC_TYPE;
            u8TempBuff[0]     = nxtyCurrentReq;
            nxty.SendNxtyMsg(NXTY_SW_VERSION_REQ, u8TempBuff, 1);                
        }
        else if( nxtySwVerNuPic == null )
        {
            PrintLog(1, "V1: Retrieving NU PIC SW version...");                             

            // Get the NU PIC software version...
            nxtyCurrentReq    = NXTY_SW_NU_PIC_TYPE;
            u8TempBuff[0]     = nxtyCurrentReq;
            nxty.SendNxtyMsg(NXTY_SW_VERSION_REQ, u8TempBuff, 1);   
        }
        else if( nxtySwVerCuBt == null )
        {
            PrintLog(1, "V1: Retrieving Bluetooth SW version...");                             
                        
            // Get the BT software version...
            nxtyCurrentReq    = NXTY_SW_BT_TYPE;
            u8TempBuff[0]     = nxtyCurrentReq;
            nxty.SendNxtyMsg(NXTY_SW_VERSION_REQ, u8TempBuff, 1);                
        }
        
/*        
        else if( (bExtAntCheckComplete == false) && (bUniiUp == true) )
        {
            // If UNII is not up, fall through and allow user to select retry below...
            PrintLog(1, "Retrieving External Antenna Status...");

            if( iExtAntCheckSubState == 0 )
            {
                // The link should be closed...
                nxtyCurrentReq  = NXTY_SEL_PARAM_ANT_STATUS;
                u8TempBuff[0]   = NXTY_SW_CF_NU_TYPE;               // Indicate NU redirect and get it from the NU...   
                u8TempBuff[1]   = NXTY_SEL_PARAM_ANT_STATUS;        // SelParamReg 1: AntennaStatus
                u8TempBuff[2]   = NXTY_SEL_PARAM_ANT_STATUS;        // SelParamReg 2: AntennaStatus
                nxty.SendNxtyMsg(NXTY_SYS_INFO_REQ, u8TempBuff, 3);
            
                iExtAntCheckSubState++;
            }
            else if( iExtAntCheckSubState == 1 )
            {
                // Wait on the response from the SYS_INFO request above...
                if( window.msgRxLastCmd == NXTY_SYS_INFO_RSP )
                {
                    bExtAntCheckComplete = true;
                }
                else if( window.msgRxLastCmd == NXTY_NAK_RSP )
                {
                    // Try again...   
                    {
                        iExtAntCheckSubState = 0;                        
            
                        // Since this message is going to the NU and we did not recieve it last time, allow 6 seconds
                        // after the NAK before sending again to allow the NU redirect to time out in 5..
                        clearInterval(MainLoopIntervalHandle);
                        MainLoopIntervalHandle = setInterval(app.mainLoop, 6000 ); 
                    }
                }
            }                

        }
*/     

/*
jdo: no longer need the NU unique ID for SCFG since no plans to download SCFG using V1.
        else if( nxtyNuUniqueId == null )
        {
            PrintLog(1, "V1: Retrieving NU Unique ID...");
        
            // Slow it down for the NU...
            StartV1MainLoop( 4000 );
            
            // Get the Unique ID...
            nxtyCurrentReq  = NXTY_SEL_PARAM_REG_NU_UID_TYPE;
            u8TempBuff[0]   = NXTY_SW_CF_NU_TYPE;
            u8TempBuff[1]   = 2;                      // Unique ID MSD
            u8TempBuff[2]   = 1;                      // Unique ID LSD  
            nxty.SendNxtyMsg(NXTY_SYS_INFO_REQ, u8TempBuff, 3);

            uV1MainLoopCounter = 0;
            
        }
*/
        
        else if( nxtyCuUniqueId == null )
        {
            PrintLog(1, "V1: Retrieving CU Unique ID...");
        
            // Crank it up since we are no longer talking to the NU...
            StartV1MainLoop( 1000 );
            
            // Get the Unique ID...
            nxtyCurrentReq  = NXTY_SEL_PARAM_REG_CU_UID_TYPE;
            u8TempBuff[0]   = NXTY_SW_CF_CU_TYPE;
            u8TempBuff[1]   = 2;                      // Unique ID MSD
            u8TempBuff[2]   = 1;                      // Unique ID LSD  
            nxty.SendNxtyMsg(NXTY_SYS_INFO_REQ, u8TempBuff, 3);

            uV1MainLoopCounter = 0;
            
        }
        else if( nxtyRegSupportData == null )
        {
            PrintLog(1, "V1: Get RegSupportData...");

            GetRegSupportData();

            uV1MainLoopCounter = 0;
        }
        else 
        {
            if( msgRxLastCmd == NXTY_SYS_INFO_RSP )
            {
                // We just received the Unique ID send the data to the cloud
            }
            

            // Clear the loop timer to stop the loop...
            StopV1MainLoop( 1000 );
            
            // Allow the main loop to continue....
            bNxtySuperMsgRsp = true;
            
        }  // End of else
        


        
      
        uV1MainLoopCounter++;
        
        if( uV1MainLoopCounter > MAIN_LOOP_COUNTER_MAX )
        {
            // Clear the loop timer to stop the loop...
            StopV1MainLoop();
            
            var     eTxt                                     = "Unable to sync data...";
            if( isNxtyStatusCurrent == false )          eTxt = "Unable to get Model Number from Cel-Fi";
            else if( isNxtySnCurrent == false )         eTxt = "Unable to get Serial Number from Cel-Fi";
            else if( nxtySwVerNuCf   == null )          eTxt = "Unable to get NU SW Ver from Cel-Fi";
            else if( nxtySwVerCuCf == null )            eTxt = "Unable to get CU SW Ver from Cel-Fi";
            else if( nxtySwVerCuPic == null )           eTxt = "Unable to get CU PIC SW Ver from Cel-Fi";
            else if( nxtySwVerNuPic == null )           eTxt = "Unable to get NU PIC SW Ver from Cel-Fi";
            else if( nxtySwVerCuBt == null )            eTxt = "Unable to get BT SW Ver from Cel-Fi";
//            else if( bExtAntCheckComplete == false )    eTxt = "Unable to get Ext Ant status from Cel-Fi";
            else if( nxtyCuUniqueId == null )           eTxt = "Unable to get Unique ID from Cel-Fi";
            
            
            ShowConfirmPopUpMsg(
                    eTxt,    // message
                    util.showSearchAnimation,      // callback to invoke with index of button pressed
                    'Timeout',               // title
                    ['Ok'] );  
            
            UpdateStatusLine( "Timeout: " + eTxt );
        }

    }   // End if( isSouthBoundIfCnx )

    
} // End of V1MainLoop()



// ----------------------------------------------------------------------------------------------------------
function cancelUartRedirect() 
{
    // Send a message to cancel UART redirect...should wait at least 5 seconds before trying to redirect again.
    var u8Buff  = new Uint8Array(10);
    u8Buff[0] = 0x00;                               // Cancel: .   
    u8Buff[1] = (NXTY_PCCTRL_UART_REDIRECT >> 24);  // Note that javascript converts var to INT32 for shift operations.
    u8Buff[2] = (NXTY_PCCTRL_UART_REDIRECT >> 16);
    u8Buff[3] = (NXTY_PCCTRL_UART_REDIRECT >> 8);
    u8Buff[4] = NXTY_PCCTRL_UART_REDIRECT;
    u8Buff[5] = 0x00;                               
    u8Buff[6] = 0x00;
    u8Buff[7] = 0x00;
    u8Buff[8] = 0x00;
    nxty.SendNxtyMsg(NXTY_CONTROL_WRITE_REQ, u8Buff, 9);   
}
























