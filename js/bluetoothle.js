//=================================================================================================
//
//  File: bluetoothle.js
//
//  Description:  This file contains all functionality to connect and maintain a connection
//                to a Nextivity bluetoothle device.  Use with plugin 1.0.6.
//
//
//                External functionality that must be maintained to support the SouthBound IF concept:
//
//                - OpenSouthBoundIf()
//                - ConnectSouthBoundIf()
//                - WriteSouthBoundData()
//                - Response data must call function nxty.ProcessNxtyRxMsg().
//                - CnxAndIdentifySouthBoundDevice()
//                - RefreshSouthBoundIf()
//
//                - Flags
//                  - isSouthBoundIfStarted:    Check is isSouthBoundIfEnabled after isShouthBoundIfStarted is true...
//                  - isSouthBoundIfEnabled:
//                  - isSouthBoundIfListDone:
//                  - isSouthBoundIfCnx:        Set "true" or "false" accordingly.
//                  - bSouthBoundWriteError;    true if write error.
//
//                - Messages
//                  - szSouthBoundIfEnableMsg
//                  - szSouthBoundIfNotCnxMsg
//                  - szSouthBoundIfInfoMsg
//
//=================================================================================================
//
//
//
//  bluetooth LE functions for the Rand Dusing Phonegap Plugin
//
//  Flow:
//
//    OpenSouthBoundIf()     (Called from main...)
//      bluetoothle.initialize(initializeSuccess, initializeError, paramsObj)
//        initializeSuccess()
//          BluetoothLoop()
//
//    BluetoothLoop()         (Called every 5 sec if not cnx, 15 sec if cnx)
//      bluetoothle.isConnected( isConnectedCallback )
//        isConnectedCallback()
//          if connected
//            UpdateBluetoothIcon(true)
//            setTimeout(BluetoothLoop, 15000)
//            if not subscribed
//              DiscoverBluetoothdevice()
//          else
//            UpdateBluetothIcon(false)
//            setTimeout(BluetoothLoop, 5000)
//            StartBluetoothScan()
//          end
//
//    StartBluetoothScan()
//      bluetoothle.startScan(startScanSuccess, startScanError, paramsObj)  
//        startScanSuccess()
//          bluetoothle.stopScan(stopScanSuccess, stopScanError)
//          ConnectBluetoothDevice(obj.address)
//
//    ConnectBluetoothDevice(address)
//      bluetoothle.connect(connectSuccess, connectError, paramsObj)
//        connectSuccess()
//          UpdateBluetoothIcon(true)
//          DiscoverBluetoothDevice()      
//
//
//    DiscoverBluetoothDevice()
//      if IOS
//        bluetoothle.services(servicesIosSuccess, servicesIosError, paramsObj);
//          servicesIosSuccess()
//            bluetoothle.characteristics(characteristicsIosSuccess, characteristicsIosError, paramsObj);
//              characteristicsIosSuccess()
//                if Tx Characteristic
//                  bluetoothle.descriptors(descriptorsIosTxSuccess, descriptorsIosTxError, paramsObj);
//                else if Rx Characteristic
//                  bluetoothle.descriptors(descriptorsIosRxSuccess, descriptorsIosRxError, paramsObj);
//        
//        descriptorsIosTxSuccess()
//          SubscribeBluetoothDevice()
//
//        descriptorsIosRxSuccess()
//          do nothing
//
//      else if Android
//        bluetoothle.discover(discoverSuccess, discoverError)  
//          discoverSuccess()
//            SubscribeBluetoothDevice()
//      end
//
//
//    SubscribeBluetoothDevice()
//      bluetoothle.subscribe(subscribeSuccess, subscribeError, paramsObj)
//
//
//    Rx processing............................................
//    subscribeSuccess()  
//      ProcessNxtyRxMsg()
//
//      
//


// Use the following global variables to determine South Bound IF status.
var isSouthBoundIfStarted   = false;    // Check if isSouthBoundIfEnabled after isShouthBoundIfStarted is true...
var isSouthBoundIfEnabled   = false;
var isSouthBoundIfCnx       = false;
var bSouthBoundWriteError   = false;
var isSouthBoundIfListDone  = false;
var szSouthBoundIfEnableMsg = "Bluetooth Required: Please Enable...";
var szSouthBoundIfNotCnxMsg = "Bluetooth connection lost.";
var szSouthBoundIfInfoMsg   = "Indicates if connected to Cel-Fi device via Bluetooth.\nBlue means connected.\nGray means not connected.\nCurrent status: ";


var addressKey      = "address";
var myLastBtAddress = null;

// const   TX_MAX_BYTES_PER_CONN           = 20;       
const   TX_MAX_BYTES_PER_BUFFER         = 20;       // Android has 4 Tx buffers, IOS has 6 Tx buffers.
const   BT_CONNECTION_INTERVAL_DEFAULT  = 40;       // Android should agree to 20 mS and IOS should agree to 30 mS
var     btCnxInterval                   = BT_CONNECTION_INTERVAL_DEFAULT;
var     maxPhoneBuffer                  = 7;        // Download message is 132 bytes which takes 7 20-byte buffers or 6 22-byte buffers.

//var bridgeServiceUuid           = "6734";

// 128-bit UUID must include the dashes.
// Power cycle phone when changing from 16-bit to 128-bit UUID to remove any local phone storage.
var bridgeServiceUuid           = "48d60a60-f000-11e3-b42d-0002a5d5c51b";


var bridgeTxCharacteristicUuid  = "6711";       // Tx from the bluetooth device profile, Rx for the phone app.
var bridgeRxCharacteristicUuid  = "6722";       // Rx from our bluetooth device profile, Tx for the phone app.



var scanTimer          = null;
var connectTimer       = null;
var reconnectTimer     = null;
var subscribeTimer     = null;
var bMaxRssiScanning   = false;
var maxRssi            = -200;
var maxRssiAddr        = null;
var bRefreshActive     = false;


var BluetoothCnxTimer = null;

var SCAN_RESULTS_SIZE = 62;     // advertisement data can be up to 31 bytes and scan results data can be up to 31 bytes.
var u8ScanResults     = new Uint8Array(SCAN_RESULTS_SIZE);


var isBluetoothSubscribed   = false;

var u8TxBuff            = new Uint8Array(260);    
var uTxBuffIdx          = 0;
var uTxMsgLen           = 0;


var getSnIdx            = 0;
var getSnState          = 0;
var firstFoundIdx       = 0;

// OpenSouthBoundIf...................................................................................
function OpenSouthBoundIf()
{
    PrintLog(10, "BT: Starting bluetooth");
    
        
    var paramsObj = { "request": false,  "statusReceiver": true };
    bluetoothle.initialize(initializeSuccess, initializeError, paramsObj);
}


function initializeSuccess(obj)
{
  if (obj.status == "enabled")
  {
      // If we initialize successfully, start a loop to maintain a connection...
      PrintLog(10, "BT: Initialization successful, starting periodic bluetooth maintenance loop...");
      isSouthBoundIfEnabled = true;
      searchAnimationFlag = false;
      BluetoothLoop();
  }
  else
  {
      PrintLog(99, "BT: Unexpected initialize status: " + obj.status);
  }
  
  isSouthBoundIfStarted = true;
}

function initializeError(obj)
{
  PrintLog(99, "BT: Initialize error: " + obj.error + " - " + obj.message);
  isSouthBoundIfEnabled = false;
  isSouthBoundIfStarted = true;
  ShowConfirmPopUpMsg(
          "This app requires Bluetooth to be enabled.<br>Please activate Bluetooth from your system settings.",    // message
          HandlePrivacyConfirmation,      // callback to invoke with index of button pressed
          'Bluetooth Required',               // title
          ['Ok'] );  
}



// BluetoothLoop...................................................................................
// Check every 5 seconds if not connected and subscribed and every 15 seconds if already connected...
function BluetoothLoop()
{
    bluetoothle.isConnected( isConnectedCallback );

}

function isConnectedCallback(obj)
{
    if(obj.isConnected)
    {
        PrintLog(10, "BT: bluetooth cnx callback: Cnx" );
        UpdateBluetoothIcon( true );
        
        // Check again in 15 seconds since we are connected...
        BluetoothCnxTimer = setTimeout(BluetoothLoop, 15000);
        
        if( isBluetoothSubscribed == false )
        {
          // Run Discover and if successful then subscribe to the Tx of our device
          DiscoverBluetoothDevice();    
        }
    }
    else
    {
        PrintLog(10, "BT: bluetooth cnx callback: Not Cnx" );
        UpdateBluetoothIcon( false );
          
        // Check again in 5 seconds...
        BluetoothCnxTimer = setTimeout(BluetoothLoop, 5000);
    
        StartBluetoothScan();
    }
}



// StartScan.....................................................................................
function StartBluetoothScan()
{
    PrintLog(10, "BT: Starting scan for Cel-Fi devices.");
    var paramsObj = {"serviceAssignedNumbers":[bridgeServiceUuid]};
    bMaxRssiScanning = true;
    connectTimer     = null;
    setTimeout(scanMaxRssiTimeout, 1000 );
    bluetoothle.startScan(startScanSuccess, startScanError, paramsObj);
}

function scanMaxRssiTimeout()
{
    bMaxRssiScanning = false;
    PrintLog(10, "BT: Set bMaxRssiScanning to false.  bMaxRssiScanning="  + bMaxRssiScanning );
}


function startScanSuccess(obj)
{
  var i;
  if (obj.status == "scanResult")
  {
    var scanStr = JSON.stringify(obj);  
    PrintLog(10, "BT: Scan result: " + scanStr );
  

    if( scanStr.search("advertisement") != -1 )
    {
        var bytes = bluetoothle.encodedStringToBytes(obj.advertisement);
        var bDeviceFound = false;
                    
        // Save the Scan Results data...
        if( bytes.length != 0 )
        {
            for( i = 0; i < SCAN_RESULTS_SIZE; i++ )
            {
                if( i < bytes.length )
                {
                    u8ScanResults[i] = bytes[i];
                }
            }
        }
    
        var outText = u8ScanResults[0].toString(16);    // Convert to hex output...
        for( i = 1; i < u8ScanResults.length; i++ )
        {
            outText = outText + " " + u8ScanResults[i].toString(16);
        }
        PrintLog(10,  "BT: Msg Advertise: " + outText );
    
        
        // Neither Android nor IOS filters based on the 128-bit UUID so we have to determine if
        // this device is ours.  
        // Android:  Compare 128-bit UUID.
        // IOS:      Compare name since 128-bit UUID not provided to app.
        if( window.device.platform == iOSPlatform )
        {
               
            // The returned bytes for IOS are...                                IOS returns only manufacturer specific data...    
            //                                                                  [0]
            // "2 1 6 11 6 1b c5 d5 a5 02 00 2d b4 e3 11 00 F0 60 0A D6 48 07 ff 0 1 xx yy 25 29 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
            //  |    advertise data                                                            | |             scan results                    |
            //                                                                     ^ ^  ^  ^  ^                                  
            //                                                                     | SW Ver|  Rx Handle                          
            //                                                                     |       Tx Handle                             
            //                                                                    ICD                                            
    
            if( obj.name == "Nextivity Bridge" )
            {
                PrintLog(10, "BT: IOS: Cel-Fi device found based on name: Nextivity Bridge" );
                bDeviceFound = true;
            }
            else
            {
                // The phone has not pulled the name so match as much data as possible.
                if( (u8ScanResults[0] == 0x00) && (u8ScanResults[4] == 0x25) && (u8ScanResults[5] == 0x29) )
                {
                    PrintLog(10, "BT: IOS: Cel-Fi device found based on advertised data: [4]=0x25 and [5]=0x29" );
                    bDeviceFound = true;
                }           
            }
        }
        else
        {
            // Non IOS: Android and Win.
            var nxty128Uuid = new Uint8Array([0x02, 0x01, 0x06, 0x11, 0x06, 0x1b, 0xc5, 0xd5, 0xa5, 0x02, 0x00, 0x2d, 0xb4, 0xe3, 0x11, 0x00, 0xF0, 0x60, 0x0A, 0xD6, 0x48]);
    
            // The returned bytes are...
            // [0]         [5]                                                    [24]                       [28]
            // "2 1 6 11 6 1b c5 d5 a5 02 00 2d b4 e3 11 00 F0 60 0A D6 48 07 ff 0 1 xx yy 25 29 7 9 43 65 6c 2d 46 69 3 2 34 67 5 ff 0 1 xx yy
            //  |    advertise data                                                            | |             scan results                   |
            //                                                                     ^ ^  ^  ^  ^                                         ^ ^  ^
            //                                                                     | SW Ver|  Rx Handle                                 | |  |
            //                                                                     |       Tx Handle                                    | SW Version
            //                                                                    ICD                                                  ICD
    
            // See if we can match the 128-bit, 16 byte, UUID.  128-bit UUID starts at offset [5].
            for( i = 5; i < nxty128Uuid.length; i++ )
            {
                if( u8ScanResults[i] != nxty128Uuid[i] )
                {
                    break;
                }
            }
                
            
            if( i == nxty128Uuid.length )
            {
                PrintLog(10, "BT: Android: Cel-Fi device found based on 128-bit UUID" );
                bDeviceFound = true;
            }        
            else if( obj.name == "Nextivity Bridge" )
            {
                PrintLog(10, "BT: Android: Cel-Fi device found based on name: Nextivity Bridge" );
                bDeviceFound = true;
            } 
        }   
 
        //Clearing the device search timeout, based on bDeviceFound flag
        if(bDeviceFound){
        	deviceFoundUIFlag = true;
        }
        
        // See if we need to continue scanning to look for max RSSI, only if we have not connected before...
        if( bDeviceFound && (myLastBtAddress == null) )
        {
            if( bMaxRssiScanning )
            {
                PrintLog(10, "BT: Max RSSI scanning, addr: " + obj.address + " RSSI: " + obj.rssi + " max RSSI so far:" + maxRssi );
                
                if( obj.rssi > maxRssi )
                {
                    maxRssi      = obj.rssi;
                    maxRssiAddr  = obj.address
                    PrintLog(10, "BT: This Cel-Fi address: " + maxRssiAddr + " has max RSSI so far: " + maxRssi );
                    
                    if( window.device.platform == iOSPlatform )
                    {
                        uIcd         = u8ScanResults[1];
                        swVerBtScan  = U8ToHexText(u8ScanResults[2]) + "." + U8ToHexText(u8ScanResults[3]);            
                    }
                    else
                    {
                        uIcd        = u8ScanResults[24];
                        swVerBtScan = U8ToHexText(u8ScanResults[25]) + "." + U8ToHexText(u8ScanResults[26]);
                    }
                }
                
               
                // Fill the BT address list...          
                for( i = 0; i < (guiDeviceAddrList.length + 1); i++ )
                {
                    if(typeof guiDeviceAddrList[i] === 'undefined')
                    {
                        guiDeviceAddrList.push(obj.address);
                        guiDeviceRssiList.push(obj.rssi);
                        PrintLog(10, "BT: Add to list: " + obj.address);
                        break;
                    }
                    else if( guiDeviceAddrList[i] == obj.address )
                    {
                        guiDeviceRssiList[i] = obj.rssi;
                        break;
                    }
                }    
                
                
                // If we are still scanning for the max then do not proceed below...
                bDeviceFound = false;
            }
        }


        if( bDeviceFound )
        {
        	// If we have connected before then we must match last address...
            if( myLastBtAddress != null )
            {
                if( myLastBtAddress != obj.address )
                {
                    PrintLog(1, "BT: This Cel-Fi address: " + obj.address + " does not match the last connected Cel-Fi address: " + myLastBtAddress + ".  Restart app to reconnect to a different Cel-Fi." );
                    bDeviceFound = false;
                }
                else
                {
                    PrintLog(1, "BT: This Cel-Fi address: " + obj.address + " matches the last connected Cel-Fi address: " + myLastBtAddress + ".  Reconnecting..." );
                    bluetoothle.stopScan(stopScanSuccess, stopScanError);
                    clearScanTimeout();
                    ConnectBluetoothDevice(myLastBtAddress);
                }
            }
        }
 
        if( bDeviceFound && (scanTimer != null) && (connectTimer == null) && (guiDeviceFlag == false) )
        {
            clearScanTimeout();
            bluetoothle.stopScan(stopScanSuccess, stopScanError);
    
            // Store the address on the phone...not used
//            window.localStorage.setItem(addressKey, obj.address);
            
            tryConnect();  
        }
        
    }  // if we have found "advertisement"
    
    
  }
  else if (obj.status == "scanStarted")
  {
    PrintLog(10, "BT: Scan was started successfully, stopping in 2 sec.");
    scanTimer = setTimeout(scanTimeout, 2000);
  }
  else
  {
    PrintLog(99, "BT: Unexpected start scan status: " + obj.status);
  }
}



function startScanError(obj)
{
  PrintLog(99, "BT: Start scan error: " + obj.error + " - " + obj.message);
}

function scanTimeout()
{
  PrintLog(10, "BT: Scanning time out, stopping");
  bluetoothle.stopScan(stopScanSuccess, stopScanError);

  if( (connectTimer == null) && (guiDeviceFlag == false) && (guiDeviceAddrList.length != 0) )
  {
    tryConnect();
  }
  
}

function clearScanTimeout()
{ 
  PrintLog(10, "BT: Clearing scanning timeout");
  if (scanTimer != null)
  {
    clearTimeout(scanTimer);
    scanTimer = null;
  }
}

function stopScanSuccess(obj)
{
  if (obj.status == "scanStopped")
  {
    PrintLog(10, "BT: Scan was stopped successfully");
  }
  else
  {
    PrintLog(10, "BT: Unexpected stop scan status: " + obj.status);
  }
}

function stopScanError(obj)
{
  PrintLog(99, "BT: Stop scan error: " + obj.error + " - " + obj.message);
}



// UpdateBluetoothIcon....................................................................................
function UpdateBluetoothIcon(cnx)
{
    if(cnx)
    {
    	//util.deviceIdentified();
        guiIconSbIfHtml       = szSbIfIconOn;
        isSouthBoundIfCnx     = true;
    }
    else
    {
        guiIconSbIfHtml       = szSbIfIconOff;
        isSouthBoundIfCnx     = false;
        isBluetoothSubscribed = false;
        u8ScanResults[0]      = 0;
    }
}



// ConnectBluetoothDevice...................................................................................
// Per plugin: Connect to a Bluetooth LE device. The Phonegap app should use a timer to limit the 
// connecting time in case connecting is never successful. Once a device is connected, it may 
// disconnect without user intervention. The original connection callback will be called again 
// and receive an object with status => disconnected. To reconnect to the device, use the reconnect method. 
// Before connecting to a new device, the current device must be disconnected and closed. 
// If a timeout occurs, the connection attempt should be canceled using disconnect().
function ConnectBluetoothDevice(address)
{
  PrintLog(1, "BT: ConnectBluetoothDevice(" + address + ")" );
  
  var paramsObj = {"address":address};
  bluetoothle.connect(connectSuccess, connectError, paramsObj);
  connectTimer = setTimeout(connectTimeout, 5000);
}

function connectSuccess(obj)
{
  if (obj.status == "connected")
  {
    PrintLog(10, "BT: Connected to : " + obj.name + " - " + obj.address);

    // Save the address...
    myLastBtAddress = obj.address;

    // Update the bluetooth icon...
//    UpdateBluetoothIcon( true );

    clearConnectTimeout();
    
    // Must run Discover before subscribing...
    DiscoverBluetoothDevice();
   
  }
  else if (obj.status == "connecting")
  {
    PrintLog(10, "BT: Connecting to : " + obj.name + " - " + obj.address);
  }
  else
  {
    PrintLog(99, "BT: Unexpected connect status: " + obj.status);
    
    if( obj.status == "disconnected" )
    {
        CloseBluetoothDevice();
        maxRssiAddr = null;
//        DisconnectBluetoothDevice();        // Disconnect and close
    }
    clearConnectTimeout();
  }
}

function connectError(obj)
{
  PrintLog(99, "BT: Connect error: " + obj.error + " - " + obj.message);
  clearConnectTimeout();
  CloseBluetoothDevice();
}

function connectTimeout()
{
  PrintLog(1, "BT: Connection timed out");
  DisconnectBluetoothDevice();
}

function clearConnectTimeout()
{ 
  PrintLog(10, "BT: Clearing connect timeout");
  if (connectTimer != null)
  {
    clearTimeout(connectTimer);
  }
}



// DisconnectBluetoothDevice...................................................................................
function DisconnectBluetoothDevice()
{
  bluetoothle.disconnect(disconnectSuccess, disconnectError);
}

function disconnectSuccess(obj)
{
    if (obj.status == "disconnected")
    {
        PrintLog(1, "BT: Disconnect device success");
        
        // Update the bluetooth icon...
        UpdateBluetoothIcon( false );

        CloseBluetoothDevice();
    }
    else if (obj.status == "disconnecting")
    {
        PrintLog(1, "BT: Disconnecting device");
    }
    else
      {
        PrintLog(99, "BT: Unexpected disconnect status: " + obj.status);
      }
}

function disconnectError(obj)
{
  PrintLog(99, "BT: Disconnect error: " + obj.error + " - " + obj.message);
}


// CloseBluetoothDevice...................................................................................
function CloseBluetoothDevice()
{

    PrintLog(1, "BT: CloseBluetoothDevice()");

    // First check to see if disconnected before closing...
    bluetoothle.isConnected(isConnectedSuccess);
}

function isConnectedSuccess(obj)
{
    if (obj.isConnected)
    {
        DisconnectBluetoothDevice();    // Disconnect and close
    }
    else
    {
        bluetoothle.close(closeSuccess, closeError);
    }

}

function closeSuccess(obj)
{
    if (obj.status == "closed")
    {
        PrintLog(1, "BT Closed device");

        if( bRefreshActive )
        {
            ConnectBluetoothDevice(myLastBtAddress);
            bRefreshActive = false;
        }
        
        UpdateBluetoothIcon( false );
    }
    else
    {
        PrintLog(99, "BT: Unexpected close status: " + obj.status);
    }
}

function closeError(obj)
{
    PrintLog(99, "BT: Close error: " + obj.error + " - " + obj.message);
    bRefreshActive = false;
}




// DiscoverBluetoothDevice........................................................................
function DiscoverBluetoothDevice()
{
    if( window.device.platform == iOSPlatform )
    {
        PrintLog(10, "BT:  IOS platform.  Begin search for bridge service");
        var paramsObj = {"serviceUuids":[bridgeServiceUuid]};
        bluetoothle.services(servicesIosSuccess, servicesIosError, paramsObj);
    }
    else if( window.device.platform == androidPlatform )
    {
        PrintLog(10, "BT:  Android platform.  Beginning discovery");
        bluetoothle.discover(discoverSuccess, discoverError);
    }
}



// IOS only ...................................................................................................
function servicesIosSuccess(obj)
{
    if( obj.status == "discoveredServices" )
    {
        PrintLog(10, "BT: IOS Service discovered: " + JSON.stringify(obj));
        var serviceUuids = obj.serviceUuids;
        for( var i = 0; i < serviceUuids.length; i++ )
        {
            var serviceUuid = serviceUuids[i];
        
            if( serviceUuid == bridgeServiceUuid )
            {
              PrintLog(10, "BT:  IOS platform.  Finding bridge characteristics...");
              var paramsObj = {"serviceUuid":bridgeServiceUuid, "characteristicUuids":[bridgeTxCharacteristicUuid, bridgeRxCharacteristicUuid]};
              bluetoothle.characteristics(characteristicsIosSuccess, characteristicsIosError, paramsObj);
              return;
            }
        }
            
        PrintLog(99, "Bridge service not found");
    }
    else
    {
        PrintLog(99, "Unexpected services bridge status: " + JSON.stringify(obj));
    }
      
    DisconnectBluetoothDevice();
}

function servicesIosError(obj)
{
    PrintLog(99, "Services bridge error: " + obj.error + " - " + obj.message);
    DisconnectBluetoothDevice();
}



function characteristicsIosSuccess(obj)
{
  
    if( obj.status == "discoveredCharacteristics" )
    {
        PrintLog(10, "BT: IOS Characteristics discovered: " + JSON.stringify(obj));
        var characteristics = obj.characteristics;
        for( var i = 0; i < characteristics.length; i++ )
        {
            var characteristicUuid = characteristics[i].characteristicUuid;

            if( characteristicUuid == bridgeRxCharacteristicUuid )
            {
                var paramsObj = {"serviceUuid":bridgeServiceUuid, "characteristicUuid":bridgeRxCharacteristicUuid};
                bluetoothle.descriptors(descriptorsIosRxSuccess, descriptorsIosRxError, paramsObj);
                return;
            }
            
        }
    }
    else
    {
        PrintLog(99, "Unexpected characteristics bridge status: " + obj.status);
    }

    PrintLog(99, "BT: IOS No Rx Characteristic found: " + JSON.stringify(obj));
    DisconnectBluetoothDevice();
}

function characteristicsIosError(obj)
{
    PrintLog(99, "Characteristics bridge error: " + obj.error + " - " + obj.message);
    DisconnectBluetoothDevice();
}


function descriptorsIosRxSuccess(obj)
{
    if (obj.status == "discoveredDescriptors")
    {
        PrintLog(10, "BT: Rx Discovery completed.  Name: " + obj.name + " add: " + obj.address + "stringify: " + JSON.stringify(obj));
        var paramsObj = {"serviceUuid":bridgeServiceUuid, "characteristicUuid":bridgeTxCharacteristicUuid};
        bluetoothle.descriptors(descriptorsIosTxSuccess, descriptorsIosTxError, paramsObj);        
    }
    else
    {
        PrintLog(99, "Unexpected Rx descriptors bridge status: " + obj.status);
        DisconnectBluetoothDevice();
    }
}


function descriptorsIosRxError(obj)
{
    PrintLog(99, "Descriptors Rx Bridge error: " + obj.error + " - " + obj.message);
    DisconnectBluetoothDevice();
}



function descriptorsIosTxSuccess(obj)
{
    if (obj.status == "discoveredDescriptors")
    {
        PrintLog(10, "BT: Tx Discovery completed, now subscribe.  Name: " + obj.name + " add: " + obj.address + "stringify: " + JSON.stringify(obj));

        // Now subscribe to the bluetooth tx characteristic...
        SubscribeBluetoothDevice();
    }
    else
    {
        PrintLog(99, "Unexpected Tx descriptors bridge status: " + obj.status);
        DisconnectBluetoothDevice();
    }
}


function descriptorsIosTxError(obj)
{
    PrintLog(99, "Descriptors Tx Bridge error: " + obj.error + " - " + obj.message);
    DisconnectBluetoothDevice();
}
// End IOS only ...............................................................................................


// Android only ...............................................................................................
function discoverSuccess(obj)
{
    if (obj.status == "discovered")
    {
        PrintLog(10, "BT: Discovery completed.  Name: " + obj.name + " add: " + obj.address + "stringify: " + JSON.stringify(obj));

        // Now subscribe to the bluetooth tx characteristic...
        SubscribeBluetoothDevice();

        // Start subscribing for the notifications in 1 second to allow any connection changes
        // to take place.
//        subscribeTimer = setTimeout(SubscribeBluetoothDevice, 1000);
    }
      else
      {
        PrintLog(99, "BT: Unexpected discover status: " + obj.status);
        DisconnectBluetoothDevice();
      }
}

function discoverError(obj)
{
  PrintLog(99, "Discover error: " + obj.error + " - " + obj.message);
  DisconnectBluetoothDevice();
}
// End Android only ...............................................................................................





// SubscribeBluetoothDevice........................................................................
//  Subscribe means to listen on this UUID, i.e. channel, from the BLE device.
function SubscribeBluetoothDevice()
{
    // Version 1.0.2 of the plugin
    var paramsObj = {"serviceUuid":bridgeServiceUuid, "characteristicUuid":bridgeTxCharacteristicUuid, "isNotification":true};
    
    bluetoothle.subscribe(subscribeSuccess, subscribeError, paramsObj);
}


function subscribeSuccess(obj)
{   
    if (obj.status == "subscribedResult")
    {
        PrintLog(10, "BT: Subscription data received");

        var bytes = bluetoothle.encodedStringToBytes(obj.value);
 
        nxty.ProcessNxtyRxMsg( bytes, bytes.length );
        
    }
    else if (obj.status == "subscribed")
    {
        PrintLog(10, "BT: Subscription started");
        ClearNxtyMsgPending();              // Make sure not stuck waiting for a response...
        isBluetoothSubscribed = true;
        UpdateBluetoothIcon( true );        // Wait until here before saying isSouthBoundIfCnx
    }
    else
    {
        PrintLog(99, "BT: Unexpected subscribe status: " + obj.status);
        DisconnectBluetoothDevice();
    }
}

function subscribeError(msg)
{
    PrintLog(99, "BT: Subscribe error: " + msg.error + " - " + msg.message);
}

function unsubscribeDevice()
{
  PrintLog(10, "BT: Unsubscribing bridge service");
  var paramsObj = {"serviceAssignedNumber":bridgeServiceUuid, "characteristicAssignedNumber":bridgeTxCharacteristicUuid};
  bluetoothle.unsubscribe(unsubscribeSuccess, unsubscribeError, paramsObj);
}

function unsubscribeSuccess(obj)
{
    if (obj.status == "unsubscribed")
    {
        PrintLog(10, "BT: Unsubscribed device");
        isBluetoothSubscribed = false;
    }
    else
    {
      PrintLog(99, "BT: Unexpected unsubscribe status: " + obj.status);
      DisconnectBluetoothDevice();
    }
}

function unsubscribeError(obj)
{
  PrintLog(99, "BT: Unsubscribe error: " + obj.error + " - " + obj.message);
  DisconnectBluetoothDevice();
}








// WriteSouthBoundData........................................................................
function WriteSouthBoundData( u8 )
{
    var i;
    
    // Check msg length...
    if( u8.length > u8TxBuff.length )
    {
        PrintLog(99, "BT: WriteSouthBoundData(len=" + u8.length + "): More than " + NXTY_BIG_MSG_SIZE + " bytes." );
        return;
    }

    uTxMsgLen  = u8.length;
    uTxBuffIdx = 0;

    // Transfer the complete message to our working buffer...
    for( i = 0; i < uTxMsgLen; i++ )
    {
        u8TxBuff[i] = u8[i];
    }

    if( (window.device.platform == iOSPlatform) &&  (swVerBtScan.localeCompare("01.00") == 0) )
    {
        // For version 1.00 on the BT board for IOS we have to slow it way down and use one buffer.
        maxPhoneBuffer = 1;
    }


    // Do it....
    WriteBluetoothDeviceEx();
}


// This is the actual work horse that gets called repeatedly to send the data out ..........................................
function WriteBluetoothDeviceEx()
{   
    var i;
    var j;
    var paramsObj = [];
    var myRtnTimer;
    var numBuffersOut = 0;
    
    // Come back next BT connection interval if more to output...
    myRtnTimer = setTimeout( function(){ WriteBluetoothDeviceEx(); }, btCnxInterval );  // Call myself...
    
    var ds  = new Date();
    var sMs = ds.getMilliseconds();
    
    
    for( j = 0; j < maxPhoneBuffer; j++ )
    {
        // See if we have more to output...
        if( uTxBuffIdx < uTxMsgLen )
        {
       
            var uTxBuffIdxEnd = uTxBuffIdx + TX_MAX_BYTES_PER_BUFFER;
            if( uTxBuffIdxEnd > uTxMsgLen )
            {
                uTxBuffIdxEnd = uTxMsgLen;
            }
            
            var u8Sub  = u8TxBuff.subarray(uTxBuffIdx, uTxBuffIdxEnd);  
            var u64    = bluetoothle.bytesToEncodedString(u8Sub); 

            if( PrintLogLevel >= 2 )
            {
                var outText = u8Sub[0].toString(16);    // Convert to hex output...
                for( i = 1; i < (uTxBuffIdxEnd - uTxBuffIdx); i++ )
                {
                    outText = outText + " " + u8Sub[i].toString(16);
                }
                PrintLog(2,  "Msg Tx: " + outText );
            }    
            
            if( (window.device.platform == iOSPlatform) &&  (swVerBtScan.localeCompare("01.00") == 0) )
            {
                // If bluetooth version is 01.00 then use Response, otherwise we can use the faster no response.
                // Problem is that in version 01.00 of the bluetooth code I did not set the WRITE-NO-RESPONSE bit.
                // Version 01.00: Use WRITE with response, slower
                paramsObj[j] = {"value":u64, "serviceUuid":bridgeServiceUuid, "characteristicUuid":bridgeRxCharacteristicUuid};
                
                // Don't use the timer to come back, use the Succes function.
                clearTimeout(myRtnTimer);
            }
            else
            {
                // Normal operation for android.
                // Normal operation for IOS when BT version > 1.00.
                paramsObj[j] = {"value":u64, "serviceUuid":bridgeServiceUuid, "characteristicUuid":bridgeRxCharacteristicUuid, "type":"noResponse"};
            }

            // Each call to the write takes 5 to 10 mS on my Android phone.    
            bluetoothle.write(writeSuccess, writeError, paramsObj[j]);
            numBuffersOut++;

            uTxBuffIdx = uTxBuffIdxEnd;
            
            if( window.device.platform == iOSPlatform )
            {
                // Exit the loop if 6 buffers have been written in under 30 mS.
                // IOS has a max of 6 buffers and our connection interval should be 30 mS.
//                if( j == 5 )
                if( j == 3 )                            // Since we need 7 buffers total for the 132 bytes, just exit at 4 to be same as Android.
                {
                    var de  = new Date();
                    var eMs = de.getMilliseconds();
                    var deltsMs;
                    
                    if( eMs > sMs )
                    {
                        deltaMs = eMs - sMs;    
                    }
                    else
                    {
                        deltaMs = 1000 - sMs + eMs;    
                    }
                    
                    // Less than 30 mS?
                    if( deltaMs < 30 )
                    {
//                        PrintLog(1, "Msg Tx loop exit after 6 buffers.  Time: " + deltaMs + " < 30 mS");
                        break;
                    }
                }
                
            }
            else
            {
                // Exit the loop if 4 buffers have been written in under 20 mS.
                // Android has a max of 4 buffers and our connection interval should be 20 mS.
                if( j == 3 )
                {
                    var de  = new Date();
                    var eMs = de.getMilliseconds();
                    var deltsMs;
                    
                    if( eMs > sMs )
                    {
                        deltaMs = eMs - sMs;    
                    }
                    else
                    {
                        deltaMs = 1000 - sMs + eMs;    
                    }
                    
                    // Less than 20 mS?
                    if( deltaMs < 20 )
                    {
//                        PrintLog(1, "Msg Tx loop exit after 4 buffers.  Time: " + deltaMs + " < 20 mS");
                        break;
                    }
                }
            }            

        }
        else
        {
            break;
        }
    }
    
    if( uTxBuffIdx >= uTxMsgLen )
    {
        // Kill the come back timer if no more data...
        clearTimeout(myRtnTimer);
    }

    PrintLog(2,  "BT Tx: buffersLoaded=" + numBuffersOut + " msgBytes=" + uTxBuffIdx );
}


function writeSuccess(obj)
{   
    // {"status":"written","serviceUuid":"180F","characteristicUuid":"2A19","value":""};
    if( obj.status == "written" )
    {
        if( (window.device.platform == iOSPlatform) &&  (swVerBtScan.localeCompare("01.00") == 0) )
        {    
            setTimeout( function(){ WriteBluetoothDeviceEx(); }, 5 );  // Write some more in 5 mS.
        }
    }
    else
    {
        PrintLog(99, "BT: Unexpected write status: " + obj.status);
    }
}




function writeError(msg)
{
    PrintLog(99, "BT: Write error: " + msg.error + " - " + msg.message);
    
    bSouthBoundWriteError = true;
    
    if( window.device.platform == androidPlatform )
    {
        // Drop the number of buffers down to a min of 2...starts at 7
        if( maxPhoneBuffer > 4 )
        {
            SetBluetoothTxTimer(BT_CONNECTION_INTERVAL_DEFAULT);
            SetMaxTxPhoneBuffers(4);
        }
        else if( maxPhoneBuffer == 4 )
        {
            SetMaxTxPhoneBuffers(3);
        }
        else if( maxPhoneBuffer == 3 )
        {
            SetMaxTxPhoneBuffers(2);
        }
        else if( maxPhoneBuffer == 2 )
        {
            SetBluetoothTxTimer(BT_CONNECTION_INTERVAL_DEFAULT/2);
            SetMaxTxPhoneBuffers(1);
        }
    }
    else
    {
        // Set the connection interval timer back to 40 mS.
        SetBluetoothTxTimer(BT_CONNECTION_INTERVAL_DEFAULT);
    }
    
}

// SetBluetoothTxTimer...................................................................................
function SetBluetoothTxTimer(cnxTimeMs)
{
    btCnxInterval = cnxTimeMs;
    PrintLog(1, "BT: Setting Tx timer to " + btCnxInterval + " mS" ); 
}


// SetMaxTxPhoneBuffers...................................................................................
function SetMaxTxPhoneBuffers(numBuffers)
{
    maxPhoneBuffer = numBuffers;
    PrintLog(1, "BT: SetMaxTxPhoneBuffers: " + maxPhoneBuffer );
}

    

// ConnectSouthBoundIf........................................................................
function ConnectSouthBoundIf(myIdx)
{
    PrintLog(1, "BT: ConnectSouthBoundIf(" + myIdx + ") addr: " + guiDeviceAddrList[myIdx] );
    ConnectBluetoothDevice( guiDeviceAddrList[myIdx] );
    
    // Start the saftey check...
    BluetoothCnxTimer = setTimeout(BluetoothLoop, 5000);
}


// RefreshSouthBoundIf........................................................................
function RefreshSouthBoundIf()
{
    PrintLog(1, "BT: RefreshSouthBoundIf() i.e. disconnect and reconnect" );
    bRefreshActive = true;
    DisconnectBluetoothDevice();

}

/*

// GetBluetoothRssi........................................................................
function GetBluetoothRssi()
{
    var paramsObj = {"address":myLastBtAddress};
    
    bluetoothle.rssi(rssiSuccess, rssiError, paramsObj);
}


function rssiSuccess(obj)
{   
    if (obj.status == "rssi")
    {
//        PrintLog(10, "BT: RSSI data received" + obj.rssi );
        UpdateRssiLine( obj.rssi );  
    }
}

function rssiError(msg)
{
    PrintLog(99, "BT: GetRssi error: " + msg.error + " - " + msg.message);
}

*/





//----------------------------------------------------------------------------------------
var numDevFound      = 0;
function tryConnect()
{
    // Use guiDeviceList.length as a flag to indicate that we have already been this way just in case 
    // called multile times while searching for guiDeviceAddrList[].
    if( guiDeviceList.length == 0 )
    {
        PrintLog(1, "BT: List of BT devices complete.  Number of BT MAC Addresses found = " + guiDeviceAddrList.length );
      
        // Automatically connect if only 1 BT in the area...
        if( guiDeviceAddrList.length == 1 )
        {      
            if( maxRssiAddr == null )
            {
                ConnectBluetoothDevice(guiDeviceAddrList[0]);
            }
            else
            {
                ConnectBluetoothDevice(maxRssiAddr);
            }
            
            isSouthBoundIfListDone = true;      // Main app loop must be placed on hold until true.
        }
        else if(guiDeviceAddrList.length > 1)
        {
        
            // Sort the list based on RSSI power...
            var tempAddr;
            var tempRssi;
            for( var i = 0; i < guiDeviceAddrList.length; i++ )
            {
                for( var j = 1; j < guiDeviceAddrList.length; j++ )
                {
                    if( guiDeviceRssiList[j] > guiDeviceRssiList[j-1] )
                    {
                        // Reverse...
                        tempAddr = guiDeviceAddrList[j-1];
                        tempRssi = guiDeviceRssiList[j-1];
                        guiDeviceAddrList[j-1] = guiDeviceAddrList[j];
                        guiDeviceRssiList[j-1] = guiDeviceRssiList[j];
                        guiDeviceAddrList[j]   = tempAddr;
                        guiDeviceRssiList[j]   = tempRssi;
                    }
                }
            }
            
            // As a default throw the text "None" in the device list which will eventually contain SNs...
            for( var i = 0; i < guiDeviceAddrList.length; i++ )
            {
                guiDeviceList.push("None");
            }
            
        
    //        guiDeviceFlag = true;
            clearTimeout(BluetoothCnxTimer);
            BluetoothCnxTimer = null;
            
            PrintLog(1, "guiDeviceAddrList      = " + JSON.stringify(guiDeviceAddrList) ); // An array of device BT addresses to select.
            PrintLog(1, "guiDeviceRssiList      = " + JSON.stringify(guiDeviceRssiList) ); // An array of RSSI values.
            PrintLog(1, "guiDeviceList          = " + JSON.stringify(guiDeviceList) );     // An array of Serial Numbers.
            
            // Get the Serial Numbers for all detected BT devices...
            getSnIdx    = 0;
            getSnState  = 0;
            numDevFound = 0;
            setTimeout( GetDeviceSerialNumbersLoop, 100 );
        }
    }
}


// GetDeviceSerialNumbersLoop........................................................................
var getSnLoopCounter = 0;
function GetDeviceSerialNumbersLoop()
{
    
    PrintLog(10, "BT: GetDeviceSerialNumbersLoop()... idx=" + getSnIdx + " state=" + getSnState + " Counter=" + getSnLoopCounter + " len=" + guiDeviceList.length );

    // Find the SNs and place in guiDeviceAddrList[] up to a max of 5.
    if( (getSnIdx < guiDeviceAddrList.length) && (numDevFound < 5)  )
    {
        if( guiDeviceRssiList[getSnIdx] < -95 )
        {
            PrintLog(1, "BT: Skip BT device " +  guiDeviceAddrList[getSnIdx] + "  RSSI below -95.  RSSI = " + guiDeviceRssiList[getSnIdx] );
            getSnIdx++;
        }
        else
        {
            switch(getSnState)
            {
                // Connect to BT device
                case 0:
                {
                    if( isSouthBoundIfCnx == false )
                    {
                        getSnLoopCounter = 0;
                        ConnectBluetoothDevice(guiDeviceAddrList[getSnIdx]);
                        getSnState = 1;
                    }   
                    break;
                }
    
                // Wait until device connected then try to get ICD version...
                case 1:
                {
                    if( isSouthBoundIfCnx )
                    {
                        isNxtyStatusCurrent = false;
                        
                        // Get the ICD version by getting the status message...
                        var u8TempBuff  = new Uint8Array(2);
                        u8TempBuff[0] = NXTY_PHONE_ICD_VER;
                        nxty.SendNxtyMsg(NXTY_STATUS_REQ, u8TempBuff, 1);
                        getSnState = 2;   
                    }
                    break;
                }
                
                // Wait until ICD version known and then get Serial Number...
                case 2:
                {
                    if( isNxtyStatusCurrent )
                    {
                        if( nxtyRxStatusIcd <= V1_ICD )
                        {
                            // Old ICD...do not update automatically...
                            guiDeviceList[getSnIdx] = "Connect to Update";
                            numDevFound++;

                            if( numDevFound == 1 )
                            {
                                // Save the index just in case this is the only one found...
                                firstFoundIdx = getSnIdx;
                            }
                            
                            if( bPrivacyViewed == true )
                            {
                                if( numDevFound == 1 )
                                {
                                    var outText = "Found " + numDevFound + " Cel-Fi device...";
                                }
                                else
                                {
                                    var outText = "Found " + numDevFound + " Cel-Fi devices...";
                                }
                                //ShowWaitPopUpMsg( "Please wait", outText );
                                document.getElementById("searchMessageBox").innerHTML = outText;
                                UpdateStatusLine( outText );
                            }
                                
                            // Disconnect from BT...
                            DisconnectBluetoothDevice();
                            getSnState = 0;
                            getSnIdx++;                        
                        }
                        else
                        {
                            GetNxtySuperMsgParamSelect( NXTY_SEL_PARAM_REG_SN_MSD_TYPE, NXTY_SEL_PARAM_REG_SN_LSD_TYPE ); 
                            getSnState = 3;
                        }
                    }
                    else
                    {
                        if( getSnLoopCounter == 10 )
                        {
                            // Try sending again...
                            getSnState = 1; 
                        }
                    }
                    break;
                }
                
                // Wait until SN has been returned and then disconnect...
                case 3:
                {
                    if( bNxtySuperMsgRsp == true )
                    {
                        var tempSn = "";
                        for( i = 0; i < 6; i++ )
                        {
                            if( i < 2 )
                            {
                                tempSn += U8ToHexText(u8RxBuff[9+i]);
                            }
                            else
                            {
                                tempSn += U8ToHexText(u8RxBuff[12+i]);    // [14] but i is already 2 so 14-2=12
                            }
                        }
                
                        guiDeviceList[getSnIdx] = "SN:" + tempSn;
                        numDevFound++;
    
                        if( numDevFound == 1 )
                        {
                            // Save the index just in case this is the only one found...
                            firstFoundIdx = getSnIdx;
                        }
                                
                        if( bPrivacyViewed == true )
                        {
                            if( numDevFound == 1 )
                            {
                                var outText = "Found " + numDevFound + " Cel-Fi device...";
                            }
                            else
                            {
                                var outText = "Found " + numDevFound + " Cel-Fi devices...";
                            }
                            //ShowWaitPopUpMsg( "Please wait", outText );
                            document.getElementById("searchMessageBox").innerHTML = outText;
                            UpdateStatusLine( outText );
                        }
                        
                        
                        
                        // Disconnect from BT...
                        DisconnectBluetoothDevice();
                        getSnState = 0;
                        getSnIdx++;
                    }            
    
                    break;            
                }
            }
        }

        getSnLoopCounter++;
        
        // Safety exit...
        if( getSnLoopCounter > 20 )
        {
            if( isSouthBoundIfCnx )
            {
                DisconnectBluetoothDevice();
            }
    
            getSnState = 0;
            getSnIdx++;
        }

        
        // Come back in 150 mS
        setTimeout( GetDeviceSerialNumbersLoop, 150 );
    }
    else
    {
        StopWaitPopUpMsg();
        
        PrintLog(1, "guiDeviceAddrList      = " + JSON.stringify(guiDeviceAddrList) ); // An array of device BT addresses to select.
        PrintLog(1, "guiDeviceRssiList      = " + JSON.stringify(guiDeviceRssiList) ); // An array of RSSI values.
        PrintLog(1, "guiDeviceList          = " + JSON.stringify(guiDeviceList) );     // An array of Serial Numbers.

        if( isSouthBoundIfCnx )
        {
            DisconnectBluetoothDevice();
        }
    
        // Indicate that we are done...
        isSouthBoundIfCnx      = false;
        
        // Bug 1518.   If not able to get SN from list of MAC addresses then show error...
        if( numDevFound == 1 )
        {
            guiDeviceFlag = false;
            ConnectBluetoothDevice(guiDeviceAddrList[firstFoundIdx]);
            isSouthBoundIfListDone = true;      // Main app loop must be placed on hold until true.
        }
        else if( numDevFound > 1 )
        {
            guiDeviceFlag = true;
        }
        else
        {
            //ShowAlertPopUpMsg( "Bluetooth range issue", "Unable to retrieve data from any of the boosters.  Please exit app and move closer to a booster then retry.");
        	ShowAlertPopUpMsg( "Bluetooth range issue", "Unable to retrieve data from the booster. Please move closer to your booster and retry.");
        	
            guiDeviceFlag = false;
        }
        
        // Clean up...
        isNxtyStatusCurrent = false;
    }
}



// CnxAndIdentifySouthBoundDevice........................................................................
var cnxIdState       = 0;
var cnxIdIdx         = -1;
var cnxIdLoopCounter = 0;
function CnxAndIdentifySouthBoundDevice(devIdx)
{
    PrintLog(1, "BT: CnxAndIdentifySouthBoundDevice("+ devIdx + ") = " + guiDeviceList[devIdx] );
    
    if( devIdx == cnxIdIdx )
    {
        // If we are already connected to the correct device then flash...
        FindMyCelfi();   
    }
    else
    {
        // Start the disconnect and reconnect loop...
        cnxIdState       = 0;
        cnxIdIdx         = devIdx;
        cnxIdLoopCounter = 0;
        setTimeout( CnxId, 100 );
        
        if( BluetoothCnxTimer != null )
        {
            clearTimeout(BluetoothCnxTimer);
            BluetoothCnxTimer = null;
        } 

    }
}


// CnxId........................................................................
function CnxId()
{
    PrintLog(10, "BT: CnxId()... idx=" + cnxIdIdx + " state=" + cnxIdState + " Counter=" + cnxIdLoopCounter );

    switch(cnxIdState)
    {
        // Disconnect if connected
        case 0:
        {
            if( isSouthBoundIfCnx == true )
            {
                DisconnectBluetoothDevice();
            }   

            cnxIdState = 1;
            break;
        }


        // Connect to BT device
        case 1:
        {
            if( isSouthBoundIfCnx == false )
            {
                nxtyRxBtCnx = 0;
                ConnectBluetoothDevice(guiDeviceAddrList[cnxIdIdx]);
                BluetoothCnxTimer = setTimeout(BluetoothLoop, 5000);
                cnxIdState = 2;
            }   
            break;
        }


        // Bug 1581: Delay FindMyCelfi().  
        // Tx cnx msg is sent by BT chip to PIC when connected so PIC will toss any messages sent immediately from the Wave App.
        case 2:
        case 3:
        case 4:
        {
            if( isSouthBoundIfCnx )
            {
                cnxIdState++;
                
                if( nxtyRxBtCnx == 1 )
                {
                    // Jump immediately...
                    cnxIdState = 5;
                }
            }
            break;
        }
        
        
        // Wait until device connected then send flash command...
        case 5:
        {
            FindMyCelfi();
            return;             // Exit stage left
            break;
        }
        
    }
    

    cnxIdLoopCounter++;
    
    // Safety exit...
    if( cnxIdLoopCounter < 40 )
    {
        // Come back in 250 mS
        setTimeout( CnxId, 250 );
    }
}





