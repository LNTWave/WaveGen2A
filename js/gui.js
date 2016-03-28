//=================================================================================================
//
//  File: gui.js
//
//  Description:  This file contains all functionality for user input and output.
//
//=================================================================================================

//
// The following variables are for internal GUI use and should not be written outside of GUI processing.
//
var displayLoopTimer            = null;
var lastGuiCurrentMode          = null;
var lastGuiButtonSwDisabled     = null;
var lastGuiButtonTkDisabled     = null;
var lastGuiButtonRegDisabled    = null;
var lastGuiIconRegDisabled      = null;
var lastGuiIconUniiDisabled     = null;
var lastGuiIconSbIfDisabled     = null;
var lastGuiButtonStDisplay      = false;
var bDisplayDeviceListActive    = false;
var bDisplayOperatorListActive  = false;
var deviceType                  = null;

var szSwButtonImg               = "<img src='img/button_SwUpdate.png' />";
var szTkButtonImg               = "<img src='img/button_TechMode.png' />";
var szRegButtonImg              = "<img src='img/button_Register.png' />";

var szSbIfIconOn                = "<img src='img/southboundif_on.png' />";
var szSbIfIconOff               = "<img src='img/southboundif_off.png' />";
var szRegIconReg                = "<img src='img/reg_yes.png' />";
var szRegIconNotReg             = "<img src='img/reg_no.png' />";                       // With bar
var szUniiIconUp                = "<img src='img/unii_yes.png' />";
var szUniiIconDown              = "<img src='img/unii_no.png' />";
var szMyStatusLine              = "<p id='status_line_id' class='status_line'></p>";
var szSbIfIconButton            = "<button type='button' id='sb_icon_id'   class='bt_icon'   onclick=handleBtInfo()>";
var szRegIconButton             = "<button type='button' id='reg_icon_id'  class='reg_icon'  onclick=handleRegInfo()>";
var szUniiIconButton            = "<button type='button' id='unii_icon_id' class='unii_icon' onclick=handleUniiInfo()>";


// Registeration variables.....................................................................................
var szRegFirstName              = "";
var szRegLastName               = "";
var szRegAddr1                  = "";
var szRegAddr2                  = "";
var szRegCity                   = "";
var szRegState                  = "";
var szRegZip                    = "";
var szRegCountry                = "";
var szRegPhone                  = "";
var szUserValidation            = "Mandatory Input: Please enter";
var bProgBarDisplayed           = false;
var dashboardPanelContent		= "<div class='dashboardPanel1'><div class='col-xs-12 col-sm-12 userGreets'>Welcome<span id='userDpName'></span></div><div class='col-xs-12 col-sm-12'><div class='fl userGreets deviceStatusCtnr'><span id='userDeviceStatusLine'></span><span id='deviceStatus' class='good'></span></div><div class='fr' id='fixIt'><div class='fr' id='fixItArrow'></div><div class='fr' id='fixItContent'></div><div class='cb'></div></div></div><div class='col-xs-12 col-sm-12' id='deviceTypeBG'></div><div class='col-xs-12 col-sm-12 deviceSerialNumber'></div></div><div class='dashboardPanel2 col-sm-12 col-xs-12'><div class='col-xs-6 col-sm-3 dashboardContent'><div id='signalStrengthContainer' class='graphicalRep'><div class='signalContainer'><div id='networkSignal1' class='networkSignalIndi deactiveStatus'></div><div id='networkSignal2' class='networkSignalIndi deactiveStatus'></div><div id='networkSignal3' class='networkSignalIndi deactiveStatus'></div><div id='networkSignal4' class='networkSignalIndi deactiveStatus'></div><div id='networkSignal5' class='networkSignalIndi deactiveStatus'></div></div></div><div class='dataTypeTitle'>NETWORK STRENGTH</div></div><div class='col-xs-6 col-sm-3 dashboardContent'><div id='gaugeContainer' class='graphicalRep'><canvas id='boostGauge'></canvas><div id='boosterLevel'></div></div><div class='dataTypeTitle'>BOOST</div></div><div class='col-xs-6 col-sm-3 dashboardContent'><div id='operatorContainer' class='graphicalRep'> <span></span> </div><div class='dataTypeTitle'>OPERATOR</div></div><div class='col-xs-6 col-sm-3 dashboardContent'><div id='coverageNamecontainer' class='graphicalRep'> <span>LTE</span> </div><div class='dataTypeTitle'>COVERAGE</div></div></div>";
var topHorizontalMenu			= "<div class='headerContainer' id='headerContainer'> <div class='titlebarWrapper'> <div class='sliderMenuWrapper col-xs-2 col-sm-2'> <a href='#menu' class='menu-link'> <div class='sliderMenuIcn'></div></a> </div><div class='logoWrapper col-xs-8 col-sm-8'> <div class='logoImg'></div></div><div class='faqIcnWrapper col-xs-2 col-sm-2'> <div class='faqIcn'></div></div></div><div class='menuWrapper'> <div class='col-xs-4 col-sm-2 selectedTab' id='dashboardMenu'> <div>DASHBOARD</div></div><div class='col-xs-4 col-sm-2' id='settingsMenu'> <div>SETTINGS</div></div><div class='col-xs-4 col-sm-2' id='advancedMenu'> <div>ADVANCED</div></div></div></div><div class='cb'></div><div id='bodyContainer'></div>";
var mainContainerWithMenu       = "<div id='menu' class='panelMenu' role='navigation'> <div class='panelLogoWrapper'> <div class='panelLogo'></div></div><div class='panelMenuList'> <ul><li> <a id='' href='javascript:void(0)'> <div class='menuIcns' id='aboutIcn'></div><span onclick='util.showAboutUs()'>About</span><div class='cb'></div></a> </li><li> <a id='' href='javascript:void(0)'> <div class='menuIcns' id='feedBackIcn'></div><span onclick='util.showSendFeedback()'>Contact Us</span><div class='cb'></div></a> </li><li> <a id='' href='javascript:void(0)'> <div class='menuIcns' id='policyIcn'></div><span onclick='util.showPrivacyPolicy()'>Privacy Policy</span><div class='cb'></div></a> </li><li onclick='RequestModeChange(PROG_MODE_REGISTRATION)'> <a id='' href='javascript:void(0)'> <div class='menuIcns' id='registerIcn'></div><span>Register Booster</span><div class='cb'></div></a> </li></ul> </div><div class='socialLinkWrapper'> <div class='socialLinkTitle'>Follow us:</div><div class='socialLinkIcnWrapper'> <div class='socialIcns' id='facebookIcn' onclick='window.open(\"https://www.facebook.com/5bars\", \"_system\")'></div><div class='socialIcns' id='twitterIcn' onclick='window.open(\"http://twitter.com/5bars\", \"_system\")'></div><div class='socialIcns' id='linkedinIcn' onclick='window.open(\"https://www.linkedin.com/company/nextivity-inc-\", \"_system\")'></div><div class='socialIcns' id='googleIcn' onclick='window.open(\"https://plus.google.com/+Cel-fi/posts\", \"_system\")'></div></div></div></div><div id='mainContainer' class='push'></div>";
var mainContainerWithoutMenu	= "<div id='mainContainer'></div>";
var mainContainer               = null;
var mainContainerDisplayFlag	= 0;
var mainLoopCounter				= 0;
var mainScreenSelectedTab		= "";
var helpMenuDeviceType			= "";
var helpMenuSelectedDevice		= "";
var indicatorTimer 				= null;
var selectDeviceTimer 			= null;
var checkUpdateLoader			= false;
var progressBarLoader			= false;
var swDriverUpdateCnt			= 0;
var swDriverCurrentNum			= 0;
var techModeEmail				= "TechMode@nextivityinc.com";
var celfiSupportEmail			= "support@cel-fi.com";
var deviceFoundUIFlag			= false;
var searchAnimationFlag			= false;
var deviceListErrorFlag			= false;
var swUpdateFlagPreStatus		= 0;
var softwarePromptFlag			= false;
var setAntennaCallFlag 			= false;
var boosterSignalPreVal 		= -1;
var cellSearchProgressFlag		= false;
// Super User Settings variables...............................................................................
var SuperUserPassword          = "?";
var bShowSuperUserTable        = false;

// Global functions called from code...........................................................................

// StartGuiInterface............................................................................................
function StartGuiInterface()
{
    PrintLog(1, "StartGuiInterface()" );
    InitGuiData();
    // Start a timer to process user input and output
    displayLoopTimer = setInterval( DisplayLoop, 500);
    // Call one time directly to throw up the main page...
    DisplayLoop();
}




// ShowConfirmPopUpMsg....................................................................................
function ShowConfirmPopUpMsg( msg, handler, title, buttonList )
{
    decisionPopUpObj.post( msg, handler, title, buttonList );
}


// ShowWaitPopUpMsg....................................................................................
function ShowWaitPopUpMsg( title, msg )
{
    waitPopUpObj.post( title, msg );
}    
    
// StopWaitPopUpMsg....................................................................................
function StopWaitPopUpMsg()
{
    waitPopUpObj.stop();
}    


// ShowAlertPopUpMsg....................................................................................
function ShowAlertPopUpMsg( title, msg )
{
    alertPopUpObj.post( title, msg );
}    



// UpdateStatusLine....................................................................................
function UpdateStatusLine(statusText)
{
    statusObj.post(statusText);
}







/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  Internal functions called from GUI code
//
//

// DisplayLoop............................................................................................
function DisplayLoop()
{

    if( guiCurrentMode == PROG_MODE_MAIN )
    {
        ProcessMainView();
    }
    else if( guiCurrentMode == PROG_MODE_REGISTRATION )
    {
        ProcessRegistrationView();
    }
    else if( guiCurrentMode == PROG_MODE_TECH )
    {
// jdo: moved to renderTechView so it is not called every 500 mS        StopSettingsLoop();
        ProcessTechView();
    }
    else if( guiCurrentMode == PROG_MODE_SETTINGS )
    {
        ProcessSettingsView();
    }
    else if( guiCurrentMode == PROG_MODE_DOWNLOAD )
    {
    }
    else if( guiCurrentMode == PROG_MODE_ADVANCED )
    {
// jdo: moved to renderAdvancedView so it is not called every 500 mS        StopSettingsLoop();   
        ProcessAdvancedView();
    }
}







// ProcessMainView............................................................................................
function ProcessMainView()
{
	if( lastGuiCurrentMode != guiCurrentMode )
    {
        PrintLog(1, "GUI: ProcessMainView()");
        $('body').html(mainContainerWithoutMenu);
    		
    		mainContainer = document.getElementById("mainContainer");
        	if(window.localStorage.getItem("deviceType")=="phone"){
    	    	mainContainer.style.height = deviceHeight+"px";
    			mainContainer.style.width = deviceWidth+"px";
    	    }
        	var mainViewContent = null;
        	mainContainer.classList.add("connectionBG");
    	$('.faqIcnWrapper').bind("click",function() {			
			util.showHelpMenu();
    	});
        lastGuiCurrentMode = guiCurrentMode;   
    }
	
    if(!isSouthBoundIfEnabled && !searchAnimationFlag){
    	util.showSearchAnimation();
    	searchAnimationFlag = true;
    }
    
    if(deviceFoundUIFlag){
    	if (typeof searchTimeOut != "undefined") {
	        clearTimeout(searchTimeOut);
	    }
    }
    
	if( (guiDeviceFlag == true) && (bDisplayDeviceListActive == false) && bPrivacyViewed == true && deviceListErrorFlag == false)
    {
		util.showDeviceSelectionPopup();
      	bDisplayDeviceListActive = true;
    }
	
}

// ConnectBluetooth() ..............................................................................................................
function ConnectBluetooth()
{
	util.hideCommonPopup();
    if( isSouthBoundIfCnx )
    {
    	ConnectDevice();
    }
    else
    {
    	bDisplayDeviceListActive = false;
    	connectBntStatus = false;
    	deviceRadioActiveStatus = false;
    	ShowAlertPopUpMsg("Select Device.", "Please select a device first.");
    }
}

// SelectOperator() ..............................................................................................................
function SelectOperator(myIdx)
{
    // Subtract 1 since the text "No Operator Selected" has been placed in index 0.
    // option[0] = No Operator Selected
    // option[1] = 1st Operator Name
    // option[2] = 2nd Operator Namee etc..
    //var myIdx = document.getElementById('op_select_id').selectedIndex - 1;
    
    if( (myIdx >= 0) && (myIdx < guiOperatorList.length) )
    {
        SetNewOperatorSku( myIdx );
    }
    else
    {
        PrintLog(99, "GUI: SelectOperator() bad index: " + myIdx );
    }
    
    // Hide the list...
    //document.getElementById("op_list_id").innerHTML = "";
}

// End of Main processing...........................................................................................


//Draw Advacned view Start
function ProcessAdvancedView(){
	if( lastGuiCurrentMode != guiCurrentMode )
    {
        PrintLog(1, "GUI: ProcessAdvancedView()");
		$(".menuWrapper").find(".selectedTab").removeClass("selectedTab");
        $('#advancedMenu').addClass("selectedTab");
		util.loadBodyContainer('advanced');
		lastGuiCurrentMode  = guiCurrentMode;
    } else{
    	util.updateAdvancedData();
    	if(guiSoftwareStatus == SW_STATUS_PLEASE_UPDATE){
    		if(softwarePromptFlag == false){
    			softwarePromptFlag = true;
    			util.promptSoftwareUpdate();
    		}
    	}
    }
}

//Advacned View End



// ProcessRegistrationView............................................................................................
function ProcessRegistrationView()
{
    if( lastGuiCurrentMode != guiCurrentMode )
    {
        PrintLog(1, "ProcessRegistrationView()");
        var whyDoIRegTitle = "Why Register";
        var whyDoIRegBody = "In some cases, regulatory bodies and or mobile network operators may require users to register the signal booster.<br><br>The information collected during registration includes user contact information, the address where the booster is used, booster make, model and serial number. This information will enable the carrier to contact users or locate the booster in the event of network issues. Any information collected through this program will be used as described above and is subject the Cel-Fi's Privacy Policy (<a onclick=\"window.open('http://www.cel-fi.com/privacypolicy', '_system');\">www.cel-fi.com/privacypolicy</a>)";

        // Draw the view...
		$('#menu').remove();
		$('#mainContainer').css('left', '0');
		
		document.getElementById("mainContainer").className = "";
        var myHtml = "<div id='appHeaderDashboard' class='page-header'><div id='headerContainer'><div class='col-xs-2 col-sm-1' align='left'></div><div class='col-xs-8 col-sm-10' align='center'><img src='img/assets/logos/WaveLogoSMWhite.svg'/></div><div class='col-xs-2 col-sm-1 headerIcon registerHelp' align='center'><img src='img/assets/icons/HelpOutline.svg'/></div></div></div><div id='registrationFormContainer' class='container'><div class='pageTitleContainer'>Please register your device</div><div id='whyDoIRegister' class='registerFaq'>Why do I need to register?</div><form role='form' name='inputUser'><div class='col-sm-12'><div class='col-sm-6'><div class='form-group'><label for='text'>First name</label><input type='text' class='form-control' name='fName' id='fName'></div><div class='errorContainer' id='errFn'>Please enter your First name</div></div><div class='col-sm-6'><div class='form-group'><label for='text'>Last name</label><input type='text' class='form-control' name='lName' id='lName'></div><div class='errorContainer' id='errLn'>Please enter your Last name</div></div></div><div class='col-sm-12'><div class='col-sm-6'><div class='form-group'><label for='text'>Address line 1</label><input type='text' class='form-control' name='addr1' id='addr1'></div><div class='errorContainer' id='errAddr'>Please enter Address Line 1</div></div><div class='col-sm-6'><div class='form-group'><label for='text'>Address line 2</label><input type='text' class='form-control' name='addr2' id='addr2'></div></div></div><div class='col-sm-12'><div class='col-sm-6'><div class='form-group'><label for='text'>City </label><input type='text' class='form-control' name='city' id='city'></div><div class='errorContainer' id='errCity'>Please enter your City</div></div><div class='col-sm-6'><div class='form-group'><label for='text'>State/Province/Region</label><input type='text' class='form-control' name='state' id='state'></div><div class='errorContainer' id='errState'>Please enter your State/Province/Region</div></div></div><div class='col-sm-12'><div class='col-sm-6'><div class='form-group'><label for='text'>ZIP/Postal Code</label><input type='text' class='form-control' name='zip' id='zip'></div><div class='errorContainer' id='errZip'>Please enter your ZIP/Postal Code</div></div><div class='col-sm-6'><div class='form-group'><label for='text'>Country</label>"
        			+"<select class='form-control' name='country' id='country'><option value=''>Select a country</option>";
        
        for(var x=0; x<countryList.length;x++){
        	myHtml = myHtml + "<option value='"+countryList[x]+"'>"+countryList[x]+"</option>";
        }
        
        myHtml = myHtml +"</select>"
        		 +"</div><div class='errorContainer' id='errCtry'>Please select your Country</div></div></div><div class='col-sm-12'><div class='col-sm-6'><div class='form-group'><label for='text'>Phone Number</label><input type='tel' class='form-control' name='phone' id='phone'></div><div class='errorContainer' id='errPN'>Please enter your Phone Number</div></div><div class='col-sm-6'></div></div><div class='col-sm-12 regBtnContainer'><div class='col-sm-6'></div><div class='col-sm-6'><div class='form-group buttonContainer' align='right'><input type='button' value='Skip' class='defaultButton skipButton' id='skipRegistration' onclick='RequestModeChange(PROG_MODE_TECH)' ><button type='button' class='defaultButton' id='regButton' onclick='javascript:return ValidateUserData();'>Register</button></div></div></div></form></div>";
        $('#mainContainer').html(myHtml);  
        
		if(guiRegistrationLockBits == 0x04 || guiRegistrationLockBits == 0x05 || guiRegistrationLockBits == 0x07){
			$('#skipRegistration').hide();
		}
		
        $('.registerHelp').bind("click",function() {			
			util.showRegisterHelp();
    	});
        
        //createPopupWithCloseBtn
        $('#whyDoIRegister').bind("click",function() {			
			util.createPopupWithCloseBtn(whyDoIRegTitle, whyDoIRegBody);
    	});
        
        // Fill in any defaults...
        document.inputUser.fName.value   = szRegFirstName;
        document.inputUser.lName.value   = szRegLastName;
        document.inputUser.addr1.value   = szRegAddr1;
        document.inputUser.addr2.value   = szRegAddr2;
        document.inputUser.city.value    = szRegCity;
        document.inputUser.state.value   = szRegState;
        document.inputUser.zip.value     = szRegZip;
        document.inputUser.country.value = szRegCountry;
        document.inputUser.phone.value   = szRegPhone;        
        bProgBarDisplayed = false;  
        lastGuiCurrentMode = guiCurrentMode;    
    } 
}


function SaveRegFormData()
{
    szRegFirstName  = document.inputUser.fName.value;
    szRegLastName   = document.inputUser.lName.value;
    szRegAddr1      = document.inputUser.addr1.value;
    szRegAddr2      = document.inputUser.addr2.value;
    szRegCity       = document.inputUser.city.value;
    szRegState      = document.inputUser.state.value;
    szRegZip        = document.inputUser.zip.value;
    szRegCountry    = document.inputUser.country.value;
    szRegPhone      = document.inputUser.phone.value;
}

function ValidateUserData()
{
    PrintLog(1, "Reg: Reg key pressed, validating user data.");

                            
    if( document.inputUser.fName.value == "" )
    {
        //ShowAlertPopUpMsg( szUserValidation, "First Name" );
    	errorHandler.addErrorClass("fName", "errFn");
    	//document.inputUser.fName.focus();
		setTimeout(function(){$('#fName').focus();},100);
    }
    else if( document.inputUser.lName.value == "" )
    {
        //ShowAlertPopUpMsg( szUserValidation, "Last Name" );
    	errorHandler.addErrorClass("lName", "errLn");
    	//document.inputUser.lName.focus();
		setTimeout(function(){$('#lName').focus();},100);
    }
    else if( document.inputUser.addr1.value == "" )
    {
        //ShowAlertPopUpMsg(szUserValidation,  "Address Line 1" );
    	errorHandler.addErrorClass("addr1", "errAddr");
    	//document.inputUser.addr1.focus();
		setTimeout(function(){$('#addr1').focus();},100);
    }
    else if( document.inputUser.city.value == "" )
    {
        //ShowAlertPopUpMsg(szUserValidation,  "City" );
    	errorHandler.addErrorClass("city", "errCity");
    	//document.inputUser.city.focus();
		setTimeout(function(){$('#city').focus();},100);
    }
    else if( document.inputUser.state.value == "" )
    {
        //ShowAlertPopUpMsg(szUserValidation,  "State/Province/Region" );
    	errorHandler.addErrorClass("state", "errState");
    	//document.inputUser.state.focus();
		setTimeout(function(){$('#state').focus();},100);
    }
    else if( document.inputUser.zip.value == "" )
    {
        //ShowAlertPopUpMsg(szUserValidation,  "ZIP/Postal Code" );
    	errorHandler.addErrorClass("zip", "errZip");
    	//document.inputUser.zip.focus();
		setTimeout(function(){$('#zip').focus();},100);
    }
    else if( document.inputUser.country.value == "" )
    {
        //howAlertPopUpMsg(szUserValidation,  "Country" );
    	errorHandler.addErrorClass("country", "errCtry");
    	//document.inputUser.country.focus();
		setTimeout(function(){$('#country').focus();},100);
    }
    else if( document.inputUser.phone.value == "" )
    {
        //ShowAlertPopUpMsg(szUserValidation,  "Phone" );
    	errorHandler.addErrorClass("phone", "errPN");
    	//document.inputUser.phone.focus();
		setTimeout(function(){$('#phone').focus();},100);
    }
    else
    {  
		var regFormElements = ["fName", "lName", "addr1", "city", "state", "zip", "country", "phone"];
		var regFormErr = ["errFn", "errLn", "errAddr", "errCity", "errState", "errZip", "errCtry", "errPN"];
		for (var i = 0; i < regFormElements.length; i++) {
			document.getElementById(regFormElements[i]).className = "form-control";
			document.getElementById(regFormErr[i]).style.display = "none";
		}
        // Save the good data...
        SaveRegFormData();
        window.localStorage.setItem("firstName", szRegFirstName);
        ProcessRegistration(
                szRegFirstName,
                szRegLastName,
                szRegAddr1,
                szRegAddr2,
                szRegCity,
                szRegState,
                szRegZip,
                szRegCountry,
                szRegPhone );
    }

    return false;
}
// End of Registration processing...........................................................................................







// ProcessTechView............................................................................................
const UNII_CHANNEL                  = 4;

// The following text will be used for labels and search fields...
var CellInfoLabels   = ["Bandwidth", "DL Center Freq", "UL Center Freq", "DL RSSI", "UL RSSI", "Max DL RSCP", "Max DL ECIO", "Remote Shutdown", "Narrow Filter In Use", "Ext Ant In Use"];
var SysInfoLabels    = ["UL Safe Mode Gain", "CU Antenna", "DL System Gain", "UL System Gain", "Relaying", "DL Echo Gain", "UL Echo Gain", "NU Temp", "CU Temp", "DL Tx Power", "UL Tx Power"];   
var UniiLabels       = ["CU 5G DL", "CU 5G UL", "CU UNII State", "NU RSSI", "CU RSSI", "NU Tx Pwr", "CU Tx Pwr", "CU BER", "CU Metric", "NU Dist Metric", "CU Build ID"];   
var CellDetailLabels = ["ID", "DL Freq", "RSCP", "ECIO"];   
var LteDetailLabels  = ["Lte ID", "Lte Freq", "RSRP", "RSRQ", "SINR", "Lte Ant", "Freq Err Res", "Freq Err Tot", "MP Early", "CFI BER", "HARQ Comb", "SIB 1 Cnt"];   

var uCheckSoftwareUpdateTimeMs = 0;
    
function ProcessTechView()
{
    var d = new Date();
    if( lastGuiCurrentMode != guiCurrentMode )
    {
		boosterSignalPreVal = -1;
        PrintLog(1, "GUI: ProcessTechView()");
		$(".menuWrapper").find(".selectedTab").removeClass("selectedTab");
        $('#dashboardMenu').addClass("selectedTab");
        if(mainScreenSelectedTab==""){
			$('body').html(mainContainerWithMenu);
			
			mainContainer = document.getElementById("mainContainer");
	    	if(window.localStorage.getItem("deviceType")=="phone"){
		    	mainContainer.style.height = deviceHeight+"px";
				mainContainer.style.width = deviceWidth+"px";
		    }
	    	$('#mainContainer').html(topHorizontalMenu);
	    	$('#bodyContainer').html(dashboardPanelContent).addClass('bodyPadding');
	    	
	    	this.$menu = $('#menu');
		    this.$push = $('.push');
		    bigSlideAPI = ($('.menu-link').bigSlide()).bigSlideAPI;
	    	util.topMenuEvents();
	    	mainScreenSelectedTab = "dashboard";
	    	
	    	if(isRegistered){
	    		$("li:has('a'):has('span'):contains('Register Booster')").remove();	    		
	    	}
	    	
	    	util.loadBodyContainer(mainScreenSelectedTab);
		}else{
			mainScreenSelectedTab = "dashboard";
			util.loadBodyContainer(mainScreenSelectedTab);
		}
    	$('.faqIcnWrapper').bind("click",function() {			
			util.showHelpMenu();
    	});
        
        uCheckSoftwareUpdateTimeMs = d.getTime();
    	lastGuiCurrentMode  = guiCurrentMode;
    }else{
    	util.loadDashboardContainer("dashboard");
        
        // Display a progress bar for V1 ICD customers while checking on SW...
    	if( nxtyRxStatusIcd <= V1_ICD )
        {
            // Display the progress bar while checking for up to 6 minutes...
            if( guiSoftwareStatus == SW_STATUS_CHECKING )
            {
                // Give the user some indication with regard to time based on 6 minutes.   Only allow incresing...
                var tempPercentComplete = 100 * (d.getTime() - uCheckSoftwareUpdateTimeMs) / (6 * 60 * 1000);

                if( (tempPercentComplete > guiSoftwareCheckPercentComplete) && (tempPercentComplete < 100) )
                {
                    guiSoftwareCheckPercentComplete = tempPercentComplete;
                }    
                
                UpdateProgressBar( true,                                // Show the progress bar 
                                    "Checking for Updates...",          // Title text
                                    "",                                 // Body text 
                                    "",                                 // bottom text
                                    guiSoftwareCheckPercentComplete,    // Drives the bar...
                                    "%"                                 // Units
                                );
            }
            else
            {
                UpdateProgressBar( false,                               // Remove the progress bar 
                                    "Checking for Updates...",          // Title text
                                    "",                                 // Body text 
                                    "",                                 // bottom text
                                    guiSoftwareCheckPercentComplete,    // Drives the bar...
                                    "%"                                 // Units
                                );
            }
        }
        
    	if(guiSoftwareStatus == SW_STATUS_PLEASE_UPDATE){
    		//ShowAlertPopUpMsg( "Booster software update available", "Your boosters software is out of date. Please install the latest version to make sure your Cel-Fi system is working correctly." );
    		if(softwarePromptFlag == false){
    			softwarePromptFlag = true;
    			util.promptSoftwareUpdate();
    		}
    	}
    }
}

// End of Tech View ............................................................................................




// ProcessSettingsView............................................................................................
function ProcessSettingsView()
{
	if( lastGuiCurrentMode != guiCurrentMode )
    {
        PrintLog(1, "GUI: ProcessSettingsView()");
        
		$(".menuWrapper").find(".selectedTab").removeClass("selectedTab");
        $('#settingsMenu').addClass("selectedTab");
		util.loadBodyContainer('settings');
		lastGuiCurrentMode  = guiCurrentMode;
    }else{
    	util.dynamicSettingsPanelData();
    }
}

function UpdateProgressBar(showFlag, textTitle, textBody, textBottom, progressInPercent, textUnits)
{
    if( showFlag )
    {   
        // Make sure an integer...
        progressInPercent = Math.round(progressInPercent);
        
        // Show the progress bar...
        if(progressBarLoader == false)
        {
            // Show the progress bar for the first time...
            $('#versionWrapper').html("");
            StopWaitPopUpMsg();
            util.showSWProgressPopup(textTitle, textBody, textBottom, textUnits);
        }
        else
        {
            $('#progressBarBG').css('width', progressInPercent + '%');
            $('#progressHeader').html(textTitle);
            $('#progressInfo').html(textBody);
            $('#progressBarText').html(progressInPercent + textUnits);
        }
    }
    else
    {
        // Kill the progress bar...
        util.removeSWProgressPopup();
    }
}

function disableAntButtons()
{
	//alert("inside disable ant btns");
    /*var i;

    // Disable all radio buttons to keep user from changing while 
    // we are trying to set the hardware...
    document.getElementById("ba_id").disabled = true;    
    document.getElementById("bm_id").disabled = true;    
    
    for( i = 0; i < 4; i++ )
    {
        document.getElementById("bi_id"+i).disabled = true;
        document.getElementById("be_id"+i).disabled = true;
    }*/
}

// End of Settings View ............................................................................................




// End of Download View ............................................................................................








// DisplayGuiPopUps............................................................................................
function DisplayGuiPopUps()
{
    // See if any popups need to be displayed...
    // Give priority to the alert...
    if( alertPopUpObj.bDirty )
    {
        alertPopUpObj.onDirty();
    }
    else if( decisionPopUpObj.bDirty )
    {
        decisionPopUpObj.onDirty();
    }
    else if( waitPopUpObj.bDirty )
    {
        waitPopUpObj.onDirty();
    }


    if( statusObj.bDirty )
    {
        statusObj.onDirty();
    }

}



// decisionPopUpObj..................................................................................
var decisionPopUpObj = 
{
    bDirty      : false,
    szTitle     : null,
    szMsg       : null,
    fHandler    : null,
    buttonArray : null,
     

    // Save the data for display...
    post: function( msg, handler, title, buttonList )
    {
        if( this.bDirty == false )
        {
            this.szMsg       = msg;
            this.fHandler    = handler;
            this.szTitle     = title;
            this.buttonArray = buttonList;
            
            this.bDirty = true;
            setTimeout( DisplayGuiPopUps, 10 );     // Kick the display loop...
        }        
    }, 
         
    // Call this handler if the bDirty flag is set by the system...
    onDirty: function() 
    {
        if( this.bDirty )
        {
            PrintLog(1, "ShowConfirmPopUpMsg: " + this.szTitle + " : " + this.szMsg );
            //if(ImRunningOnPhone)
            //{
                /*navigator.notification.confirm(
                    this.szMsg,                              // message
                    this.fHandler,                           // callback to invoke with index of button pressed
                    this.szTitle,                            // title
                    this.buttonArray );                      // buttonLabels
                */
            	//alert(this.szTitle);
            	switch (this.szTitle){
            	case "Privacy Policy":
            		util.showErrorPopup();
            		document.getElementById("commonPopup").classList.add("privacyPolicy");
            		privacyPolicyBodyContent1 = "Your privacy is important to us. Please refer to <a href='#' onclick='window.open(\"http://www.cel-fi.com/privacypolicy\", \"_system\");'>www.cel-fi.com/privacypolicy</a> for our detailed privacy policy.";
            		privacyPolicyBodyContent2 = "I have read and agree to the privacy policy";
            		var privacyHeader = document.getElementById("popupHeader");
                	var privacyBody = document.getElementById("popupBody");
                	var privacyFooter = document.getElementById("popupFooter");
                	privacyHeader.className = "privacyHeader";
                	privacyBody.className = "privacyBody";
                	privacyFooter.className = "privacyFooter";
                	privacyFooter.align = "center";
                	
                	privacyHeader.innerHTML = this.szTitle;
                	privacyBody.innerHTML = this.szMsg;
                	
                	var privacyAcceptanceContainer = util.createAppendElem("div", "privacyAcceptanceContainer", "privacyAcceptanceContainer", privacyBody);
                	//var privacyAcceptanceTextContainer = util.createAppendElem("div", "privacyAcceptanceTextContainer", "privacyAcceptanceTextContainer", privacyAcceptanceContainer);
                	//privacyAcceptanceTextContainer.innerHTML = privacyPolicyBodyContent2;
                	var privacyCheckboxContainer = util.createAppendElem("div", "privacyCheckboxContainer", "privacyCheckboxContainer", privacyAcceptanceContainer);
                	var privacyCheckbox = util.createAppendElem("input", "privacyCheckbox", "privacyCheckbox", privacyCheckboxContainer);
                	privacyCheckbox.type = "checkbox";
                	privacyCheckbox.addEventListener("click", privacyPolicy.checkboxPrivacyStatus, false);
                	var checkboxLabel = util.createAppendElem("label", "checkboxLabel", "", privacyCheckboxContainer);
                	checkboxLabel.setAttribute("for", "privacyCheckbox");
                	var privacyAcceptanceTextContainer = util.createAppendElem("div", "privacyAcceptanceTextContainer", "privacyAcceptanceTextContainer", privacyAcceptanceContainer);
                	privacyAcceptanceTextContainer.innerHTML = privacyPolicyBodyContent2;
                	var privacyAcceptanceContainer = util.createAppendElem("div", "", "cb", privacyBody);
                	var acceptBtn = util.createAppendElem("button", "privacyAcceptBtn", "defaultButtonDisabled", privacyFooter);
            		acceptBtn.innerHTML = "Accept";
            		util.alignCommonPopupToHeader(privacyHeader);
            		break;
            		
            	case "Location Acquired":
            		util.showErrorPopup();
            		var locationHeader = document.getElementById("popupHeader");
                	var locationBody = document.getElementById("popupBody");
                	var locationFooter = document.getElementById("popupFooter");
                	locationHeader.className = "locationHeader";
                	locationBody.className = "locationBody";
                	locationFooter.className = "locationFooter";
                	locationFooter.align = "center";
                	
                	locationHeader.innerHTML = this.szTitle;
                	locationBody.innerHTML = this.szMsg;
                	
                	var locBtn = util.createAppendElem("button", "locationAcquiredBtn", "defaultButton", locationFooter);
    		        locBtn.innerHTML = errorHandler.locationAcquiredBtnContent;
    		        locBtn.addEventListener("click", function(){
    		        	util.removeElement("blackOverlay");
    			    	util.removeElement("commonPopup");
    		        	HandleLocationBack(1);
    		        }, false);
                	util.alignCommonPopupToHeader(locationHeader);
            		break;
            		
            	case "Bluetooth Required":
            		if(softwareVersionFlag){
            			errorHandler.showErrorPopup('bluetoothError');
            		}
            		break;
            		
            		
            	case "Update Phone Software":
            		errorHandler.showErrorPopup('OSUpdateError');
            		break;
            		
            	case "Wireless Link Down":
            		errorHandler.showErrorPopup('linkDown');
            		break;
            		
            	case "Update PIC Software":
            		errorHandler.showErrorPopup('updatePIC');
            		break;
					
				case "Cel-Fi Software Update Required":
					errorHandler.showErrorPopup('updateCelFi');
            		break;
				
            	case "No WiFi or Cell":
            		errorHandler.showErrorPopup('noWifiORCell');
            		break;
            		
            	case "HW Commanded from USB?":
            		errorHandler.showErrorPopup('USBCommand');
            		break;
            		
            	case "Unable to acquire GPS.":
            		errorHandler.showErrorPopup('unableGPS');
            		break;
            		
            	case "Location":
            		util.getCurrentLocationPrompt(this.szMsg);
            		break;
            		
            	case "Unable to sync":
            		util.showErrorPopup();
            		var timeoutHeader = document.getElementById("popupHeader");
                	var timeoutBody = document.getElementById("popupBody");
                	var timeoutFooter = document.getElementById("popupFooter");
                	timeoutFooter.align = "center";
                	
                	timeoutHeader.innerHTML = this.szTitle;
                	timeoutBody.innerHTML = this.szMsg;
                	
                	var locBtn = util.createAppendElem("button", "timeoutErrBtn", "defaultButton", timeoutFooter);
    		        locBtn.innerHTML = "Retry";
    		        locBtn.addEventListener("click", function(){
    		        	util.hideCommonPopup();
    			        //util.showSearchAnimation();
    		        }, false);
					util.alignCommonPopupToHeader(timeoutHeader);
            		break;
            	}
            //}
            //else
            //{
            //    alert(this.szTitle ? (this.szTitle + ": " + this.szMsg) : this.szMsg);
            //    this.fHandler(1);
            //}
                
            this.bDirty = false;
        }        
    }
}

// waitPopUpObj..................................................................................
var waitPopUpObj = 
{
    bDirty      : false,
    bActive     : false,
    szTitle     : null,
    szMsg       : null,
     

    // Save the data for display...
    post: function( title, msg )
    {
        if( this.bDirty == false )
        {
            this.szTitle     = title;
            this.szMsg       = msg;
            
            this.bDirty = true;
            setTimeout( DisplayGuiPopUps, 10 );     // Kick the display loop...
        }        
    }, 
         
    // Call this handler if the bDirty flag is set by the system...
    onDirty: function() 
    {
        if( this.bDirty )
        {
            PrintLog(1, "ShowWaitPopUpMsg: " + this.szTitle + " : " + this.szMsg );

            // Had to add a plugin for Spinners since IOS does not support navigator.notification.activityStart()
            this.stop();
            
            //if(ImRunningOnPhone)
            //{
                // Note: spinner dialog is cancelable by default on Android and iOS. On WP8, it's fixed by default
                // so make fixed on all platforms.
                // Title is only allowed on Android so never show the title.
                // window.plugins.spinnerDialog.show(null, this.szMsg, true);
            	util.createCommonSpinnerDialog(this.szMsg);
            //}
            //else
            //{
            //    $('button:first').append('<div id="wave_spinner_image"><img id="spinner_img" src="img/wavespinnerimage.gif" alt="Busy..." /></div>');
            //    $('#wave_spinner_image').show();
            //    //document.getElementById('wave_spinner_image').scrollIntoView(true);
            //    var el = document.getElementById('wave_spinner_image');
            //    var elOffset = el.offsetTop;
            //    var elHeight = el.offsetHeight;
            //    var windowHeight = $(window).height();
            //    var offset;
            //
            //    if (elHeight < windowHeight) {
            //        offset = elOffset - ((windowHeight / 2) - (elHeight / 2));
            //    }
            //    else {
            //        offset = elOffset;
            //    }
            //
            //    $('html, body').animate({scrollTop:offset}, 700);
            //}
            
                
            this.bActive = true;
            this.bDirty  = false;
        }        
    },
    
    stop: function()
    {
        if( this.bActive )
        {
            PrintLog(1, "Stop: ShowWaitPopUpMsg: " );
            //if(ImRunningOnPhone)
            //{
                //window.plugins.spinnerDialog.hide();
            	util.hideCommonSpinnerDialog();
            //}
            //else
            //{
            //    $('#wave_spinner_image').hide();
            //    $('#wave_spinner_image').remove();
            //}
            this.bActive = false;
        }
    }
}


// alertPopUpObj..................................................................................
var alertPopUpObj = 
{
    bDirty      : false,
    szTitle     : null,
    szMsg       : null,
     

    // Save the data for display...
    post: function( title, msg )
    {
        if( this.bDirty == false )
        {
            this.szTitle     = title;
            this.szMsg       = msg;
            
            this.bDirty = true;
            setTimeout( DisplayGuiPopUps, 10 );     // Kick the display loop...
        }        
    }, 
         
    // Call this handler if the bDirty flag is set by the system...
    onDirty: function() 
    {
        if( this.bDirty )
        {
            PrintLog(1, "ShowAlertPopUpMsg: " + this.szTitle + " : " + this.szMsg );

            //if(ImRunningOnPhone) 
            //{
                //navigator.notification.alert(this.szMsg, null, this.szTitle, 'ok');
            		util.showErrorPopup();
            		//var popupTitle = this.szTitle;
            		var alertHeader = document.getElementById("popupHeader");
                	var alertBody = document.getElementById("popupBody");
                	var alertFooter = document.getElementById("popupFooter");
                	alertFooter.align = "center";
                	
                	alertHeader.innerHTML = this.szTitle;
                	alertBody.innerHTML = this.szMsg;
                	if(alertPopUpObj.szTitle == "Select Device."){
                		deviceListErrorFlag = true;
                	}
                	var locBtn = util.createAppendElem("button", "alertOKBtn", "defaultButton", alertFooter);
    		        locBtn.innerHTML = "OK";
					if(alertPopUpObj.szTitle == "Bluetooth range issue"){
						locBtn.innerHTML = "Retry";
					}
    		        locBtn.addEventListener("click", function(){
    		        	
    		        	if(alertPopUpObj.szTitle == "Registration Required."){
    		        		RequestModeChange(PROG_MODE_REGISTRATION);
    		        	}else if(alertPopUpObj.szTitle == "Select Device."){
    		        		util.hideCommonPopup();
    		        		deviceListErrorFlag = false;
    		        		util.showDeviceSelectionPopup();
    		        	}else if(alertPopUpObj.szTitle == "Bluetooth not connected."){
    		        		//$(".menuWrapper").find(".selectedTab").removeClass("selectedTab");
    		        		//$('#dashboardMenu').addClass("selectedTab");
    		    	        RequestModeChange(PROG_MODE_TECH);
    		    	        util.hideCommonPopup();
    		        	} else if(alertPopUpObj.szTitle == "Update Complete!"){
    		        		util.removeSWProgressPopup();
    		        		util.hideCommonPopup();
    		        	} else if(alertPopUpObj.szTitle == "Already Registered."){
    		        		util.hideCommonPopup();
							isRegistered = true;                       
							RequestModeChange(PROG_MODE_TECH);
    		        	} else if(alertPopUpObj.szTitle == "Update aborted"){
    		        		util.hideCommonPopup();
							util.removeSWProgressPopup();
    		        	} else if(alertPopUpObj.szTitle == "Update in progress..."){
							util.removeElement("commonPopup");
    		        	} else{
    		        		util.hideCommonPopup();
    		        	}
    		        }, false);
					
					util.alignCommonPopupToHeader(alertHeader);
            //} 
            //else 
            //{
            //    alert(this.szTitle ? (this.szTitle + ": " + this.szMsg) : this.szMsg);
            //}
            this.bDirty  = false;
        }        
    }
}


// statusObj..................................................................................
var statusObj = 
{
    bDirty      : false,
    szMsg       : null,
     
    // Save the data for display...
    post: function( msg )
    {
        if( this.bDirty == false )
        {
            this.szMsg  = msg;
            this.bDirty = true;
            setTimeout( DisplayGuiPopUps, 10 );     // Kick the display loop...
        }        
    }, 
         
    onDirty: function() 
    {
        if( this.bDirty )
        {
            if( document.getElementById("status_line_id") != null )
            {
                document.getElementById("status_line_id").innerHTML = this.szMsg;
            }
//            else
//            {
//                PrintLog(99, "No Status Line ID for: " + this.szMsg );
//            }

            PrintLog(1, "StatusLine: " + this.szMsg );

            this.bDirty  = false;
        }        
    }
}

var countryList = ["Abkhazia",
					"Afghanistan",
					"Albania",
					"Algeria",
					"American Samoa",
					"Andorra",
					"Angola",
					"Anguilla",
					"Antigua and Barbuda",
					"Argentina",
					"Armenia",
					"Aruba",
					"Ascension Island",
					"Australia",
					"Austria",
					"Azerbaijan",
					"Bahamas",
					"Bahrain",
					"Bangladesh",
					"Barbados",
					"Belarus",
					"Belgium",
					"Belize",
					"Benin",
					"Bermuda",
					"Bhutan",
					"Bolivia",
					"Bonaire, Saba, Sint Eustatius",
					"Bosnia and Herzegovina",
					"Botswana",
					"Brazil",
					"British Virgin Islands",
					"Brunei",
					"Bulgaria",
					"Burkina Faso",
					"Burundi",
					"Cambodia",
					"Cameroon",
					"Canada",
					"Cayman Islands",
					"Central African Republic",
					"Chad",
					"Chile",
					"China",
					"Colombia",
					"Comoros",
					"Congo",
					"Cook Islands",
					"Costa Rica",
					"Croatia",
					"Cuba",
					"Cyprus",
					"Czech Republic",
					"Democratic Republic of the Congo",
					"Denmark",
					"Djibouti",
					"Dominica",
					"Dominican Republic",
					"East Timor",
					"Ecuador",
					"Egypt",
					"El Salvador",
					"Equatorial Guinea",
					"Eritrea",
					"Estonia",
					"Ethiopia",
					"Falkland Islands",
					"Faroe Islands",
					"Federated States of Micronesia",
					"Fiji",
					"Finland",
					"France",
					"French Antilles",
					"French Guiana",
					"French Polynesia",
					"French Southern Territories",
					"Gabon",
					"Gambia",
					"Georgia",
					"Germany",
					"Ghana",
					"Gibraltar",
					"Greece",
					"Greenland",
					"Grenada",
					"Guadeloupe",
					"Guam",
					"Guatemala",
					"Guernsey",
					"Guinea",
					"Guinea-Bissau",
					"Guyana",
					"Haiti",
					"Honduras",
					"Hong Kong",
					"Hungary",
					"Iceland",
					"India",
					"Indonesia",
					"Iran",
					"Iraq",
					"Ireland",
					"Isle of Man",
					"Israel",
					"Italy",
					"Ivory Coast",
					"Jamaica",
					"Japan",
					"Jersey",
					"Jordan",
					"Kazakhstan",
					"Kenya",
					"Kiribati",
					"Kosovo",
					"Kuwait",
					"Kyrgyzstan",
					"Laos",
					"Latvia",
					"Lebanon",
					"Lesotho",
					"Liberia",
					"Libya",
					"Liechtenstein",
					"Lithuania",
					"Luxembourg",
					"Macau",
					"Macedonia",
					"Madagascar",
					"Malawi",
					"Malaysia",
					"Maldives",
					"Mali",
					"Malta",
					"Marshall Islands",
					"Martinique",
					"Mauritania",
					"Mauritius",
					"Mayotte",
					"Mexico",
					"Moldova",
					"Monaco",
					"Mongolia",
					"Montenegro",
					"Montserrat",
					"Morocco",
					"Mozambique",
					"Myanmar",
					"Namibia",
					"Nauru",
					"Nepal",
					"Netherlands",
					"New Caledonia",
					"New Zealand",
					"Nicaragua",
					"Niger",
					"Nigeria",
					"Niue",
					"Norfolk Island",
					"North Korea",
					"Northern Mariana Islands",
					"Norway",
					"Pakistan",
					"Palau",
					"Palestine",
					"Panama",
					"Papua New Guinea",
					"Paraguay",
					"Peru",
					"Philippines",
					"Pitcairn Islands",
					"Poland",
					"Portugal",
					"Puerto Rico",
					"Qatar",
					"Romania",
					"Russian Federation",
					"Rwanda",
					"Saint-Barthelemy",
					"Saint Helena, Ascension and Tristan da Cunha",
					"Saint Kitts and Nevis",
					"Saint Lucia",
					"Saint Martin",
					"Saint Pierre and Miquelon",
					"Saint Vincent and the Grenadines",
					"Samoa",
					"San Marino",
					"Sao Tome and Principe",
					"Saudi Arabia",
					"Senegal",
					"Serbia",
					"Seychelles",
					"Sierra Leone",
					"Singapore",
					"Sint Maarten",
					"Slovakia",
					"Slovenia",
					"Solomon Islands",
					"Somalia",
					"South Africa",
					"South Korea",
					"South Sudan",
					"Spain",
					"Sri Lanka",
					"Sudan",
					"Suriname",
					"Swaziland",
					"Sweden",
					"Switzerland",
					"Syria",
					"Taiwan",
					"Tajikistan",
					"Tanzania",
					"Thailand",
					"Togo",
					"Tonga",
					"Trinidad and Tobago",
					"Tristan da Cunha",
					"Tunisia",
					"Turkey",
					"Turkmenistan",
					"Turks and Caicos Islands",
					"Tuvalu",
					"Uganda",
					"Ukraine",
					"United Arab Emirates",
					"United Kingdom",
					"United States of America",
					"Uruguay",
					"Uzbekistan",
					"Vanuatu",
					"Vatican",
					"Venezuela",
					"Vietnam",
					"Wallis and Futuna",
					"Yemen",
					"Zambia",
					"Zimbabwe"
				];

var faqQuesAns = [{
	    "question": "What is Cel-Fi?",
	    "answer": "Cel-Fi is Nextivity's brand of self-configuring, environmentally aware, indoor coverage solutions. Each Cel-Fi system consists of two units. The Network Unit is placed in the area where the strongest native signal can be received from the carrier network (signal levels as low as -120 dBm are acceptable). The Network Unit comprises a transmitter and receiver which communicates with the cell tower. The Coverage Unit is placed in the center of the home, communicates wirelessly with the Network Unit and lights up the interior of the house with significantly enhanced signal levels, thus enabling better quality calls and greater data throughput."
	},
	
	{
	    "question": "What makes Cel-Fi so different from other signal boosters?",
	    "answer": "Cel-Fi is a smart signal booster. That means it relies on intelligent, self-organizing algorithms to ensure you benefit from the largest area of coverage without compromising or interfering with your mobile operator's networks or impeding other subscribers' signals. Cel-Fi does not require any new equipment, any configuring, or any changes to existing network infrastructure or mobile devices. It is also a plug and play device, which means that there is no need for professional installation, no drilling, and no cables. In addition, Cel-Fi has been recognized for its superior design and effectiveness and is the only consumer booster authorized for use by the communications commissions in Australia and the United Kingdom, and the only Smart Booster designed to meet the new FCC Safe Harbor 2 specifications that allow very high gain (very high signal gain is necessary to make low level signals useful in a large coverage area)."
	},
	
	{
	    "question": "Does the Cel-Fi require an internet or GPS connection?",
	    "answer": "No. The Cel-Fi system only needs to have at least 1 bar of native cellular signal, in at least one spot of your home to be able to cover your whole home or office space."
	},
	
	{
	    "question": "Will the Cel-Fi support voice and data or data only?",
	    "answer": "Yes, Cel-Fi smart signal boosters can support both voice and data simultaneously. Note that Cel-Fi RS1 and RS2 models do not support LTE."
	},
	
	{
	    "question": "How far apart can the Network (Window) Unit and the Coverage Unit be placed?",
	    "answer": "Every instillation is different. The differences depend on the 'path loss' between the two units. Every obstacle in the line of sight means that the Coverage Unit and the Network Unit will have to be closer together. The cleaner the line of sight the further apart they can be placed. The more walls, doors, or refrigerators (obstacles), in the direct line of sight, the closer they units will have to be. The average distance for a typical construction home is 60 feet, however the placement can be as little as 20 feet or much as 120 feet apart."
	},
	
	{
	    "question": "What coverage can I expect from a Cel-Fi system?",
	    "answer": "The radius (half the width) of the coverage bubble is approximately the distance between the Coverage Unit and Network (window) Unit. Here are some examples:</br></br>Radius = 20 meters (66 ft.) for wood framed walls</br></br>Radius is less for concrete interior walls</br></br>Radius can easily exceed 65 meters (200 ft.) for open commercial spaces."
	},
	
	{
	    "question": "Is it legal to use signal boosters?",
	    "answer": "Cel-Fi meets the newer regulatory requirements that allow a booster to be used (boosters that do not meet these requirements, which is the vast majority of them, are no longer legal).  For the FCC you can learn more by reading the new FCC Report and Order for signal boosters. According to these new regulations, consumers must receive permission from their carrier before using a booster. Consumer boosters sold after March 1, 2014, and some before that date will be marked with a label signifying it meets the FCC's new regulations."
	},
	
	{
	    "question": "Is it necessary to register my Cel-Fi?",
	    "answer": "If booster registration is required in your country, your system may arrive pre-registered or you may be asked to (it's very simple).  See your product insert for details.</br></br>The FCC is now requiring all boosters in the U.S. to be approved for use by the Operator, and that all consumers register their boosters.  To learn more please visit the FCC site: http://wireless.fcc.gov/signal-boosters/index.html"
	},
	
	{
	    "question": "How do I register my Cel-Fi system?",
	    "answer": "The process is very simple and just takes a minute by following the link below to your Operator's Registration site.  If your system was provided by your Operator it may be preregistered (see product box insert).</br></br>In the USA:</br></br>If your operator is T-Mobile, MetroPCS, TruPhone, or another T-Mobile network operator please register your booster at: www.T-Mobile.com/BoosterRegistration</br></br>If your operator is AT&T, Aio, or another AT&T network operator please register your booster at: www.attsignalbooster.com"
	},
	
	{
	    "question": "Why do I have to register my Cel-Fi?",
	    "answer": "Why is this being done?  Because cellular systems are protected assets of the Operators that own them.  Many boosters in the market cause problems for those networks (which means all of us using the networks too).  New FCC/Operator approved boosters are better and don't cause problems, and Cel-Fi is the only booster in a special class of boosters that allows 100 dB of signal gain (30 dB or 1000x the gain of all other boosters)."
	},
	
	{
	    "question": "Will Cel-Fi boost the signal for Verizon or Sprint?",
	    "answer": "At this time Verizon and Sprint will not work with any of the Cel-Fi products. We are always adding new technology to the Cel-Fi device line-up. Feel free to sign up for exclusive news and blog emails at the bottom of the page."
	},
	
	{
	    "question": "Can Cel-Fi boost the signal of multiple cellular networks at once?",
	    "answer": "Cel-Fi signal boosters are Operator specific, and will only boost one Operator's channels at a time. Being Operator specific is one of the main reasons that we are network safe and can provide 100 dB of signal gain, and why we are the only signal booster approved by a growing number of Operators."
	},
	
	{
	    "question": "Is Cel-Fi carrier/operator specific?",
	    "answer": "Yes, and for a good reason!  Cel-Fi is controlled by and operates as an extension of an operator's network.  This is what allows Cel-Fi (by regulatory authority) to boost signals about 1000x more than other solutions, and therefore cover very large areas even if the original network signal is weak.  And it works very well.</br></br>Broad-spectrum repeaters can cause interference and damage to networks, so operators have adopted a strict policy against the use of these legacy signal boosters on their own networks. However, Cel-Fi (the only smart signal booster of its kind), is authorized for use by each carrier and allowed to transmit on their licensed spectrum without ruining things for anyone else."
	},
	
	{
	    "question": "Why doesn't Cel-Fi work with different operators?",
	    "answer": "Not all cellular operators use the same technologies, and we do not boost the every technology available around the world. The Cel-Fi systems will support 3G(UMTS/WCMDA), 4G(HSPA & HAPS+), and LTE technology of operators that have approved the use of Cel-Fi on their network. You can reach out to your operator for more information on what specific technology they use."
	},
	
	{
	    "question": "What technologies does Cel-Fi support?",
	    "answer": "Cel-Fi system will support 3G(UMTS/WCDMA), 4G (HSPA/HSPA+) and LTE.</br></br>Each Cel-Fi system is different. Check your box for a Quick Start Guide, or visits the support section of our website for more specific information about your specific product."
	},
	
	{
	    "question": "I've installed Cel-Fi but I do not see more bars on my phone?",
	    "answer": "There could be several reasons for this: First you can try rebooting your phone near the Coverage Unit so it takes a fresh look at the available channels. Also verify that your phone is compatible with the channels that your Cel-Fi model is boosting (maybe your handset is 'unlocked' and actually does not fully support all your current Operator's channels). iPhones can also show fewer 'bars' of signal if the network is heavily loaded (click here to learn more).</br></br>Note that Cel-Fi RS1 and RS2 models do not support LTE. If your phone is LTE capable and therefore is not showing boosted service, if needed it is designed to switch over to non-LTE services when it needs to, such as in a call. This is true with or without Cel-Fi and what matters is that now you have reliable service where you need it!</br></br>If you would like the benefits of LTE service as well, you can always upgrade your Cel-Fi to a newer version that also supports LTE."
	},
	
	{
	    "question": "Once installed, will the Cel-Fi require maintenance, or adjustments if changes occur to the native cellular network?",
	    "answer": "No. Cel-fi does not require any maintenance. The Cel-Fi systems will self-adjust and reconfigure automatically to changing cellular networks situations."
	},
	
	{
	    "question": "What is IntelliBoost?",
	    "answer": "The Nextivity IntelliBoost Baseband Processor is the first core processor designed specifically to optimize the indoor transmission and reception of 3G and 4G/LTE wireless signals. With advanced filtering, equalization and echo cancellation techniques, Nextivity has developed an embedded architecture which delivers unprecedented in-building data rates and pervasive 3G and 4G/LTE connectivity. The IntelliBoost processor ensures that Cel-Fi products never negatively impact the macro network while providing maximum coverage."
	},
	
	{
	    "question": "What frequencies link the Network (Window) Unit and Coverage Unit?",
	    "answer": "Cel-Fi automatically selects clear, unused channels from the UNII bands (5.15-5.35 GHz, 5.47-5.725 GHz and 5725-5825 GHz) for communication between the Network (Window) Unit and the Coverage Unit. While in some cases these are the same frequencies as Wi-Fi, the Cel-Fi system uses a proprietary protocol for communication and is designed to work in harmony with existing wireless devices such as Wi-Fi routers, cordless telephones or baby monitors."
	}
];

var termsPrivacyContent = [{
	'privacyTitle': 'Terms/Policy',
	'privacyContent': 'It Nextivity, Inc., we adhere to industry-standard procedures to ensure your privacy. This privacy policy applies to data collection and usage on all Nextivity websites and related services (including, without limitation, any Nextivity mobile application) (collectively, the "Services"). Nextivity\'s websites are general audience websites.</br></br>Personal information of all users of the Services is collected, used and disclosed by us as described in this policy statement.  This policy statement does not cover the treatment, collection, use or disclosure of personal information by companies that we don\'t own or control, or people that we don\'t manage.'
	}, {
	'privacyTitle': 'Gathering/tracking personal information',
	'privacyContent': 'We do not collect personal information about you unless you voluntarily provide it to us. For example, some of the purposes for which we collect such information are: to register your Nextivity product; provide feedback in our online surveys; request product information; and/or request contact from a Nextivity representative. Nextivity collects and uses your personal information in connection with the Services, to deliver the products and services you have requested, and as explained in more detail below.  In certain cases, we may share some of your personal information with third parties, but only as described below.						</br></br>Please note that Nextivity may contact you about matters pertaining to your ownership of Nextivity products, or your interactive use of the company\'s website(s); for example, access to download new product software releases.  If you do not want to receive communications from us, please indicate your preference by sending an email to: support@cel-fi.com 						</br></br>The personal information that may be gathered includes your name, telephone number(s), fax number, street address, mailing address and e-mail address. You may also be asked to furnish other information about yourself such as your job category, industry type, company name and job title, and/or the number of people in your company.'
	}, {
	'privacyTitle': 'Sharing personal information',
	'privacyContent': 'Telecommunications operators such as AT&T or T-Mobile (an "Operator") may be required under applicable law (for example, 47 CFR 20.21(h) in the United States) to register users of a Nextivity Product.  If, through the Services, you choose to register your Nextivity Product with an Operator, then we may disclose your personal information to such Operator or its affiliates in connection with such registration.  We have no control over the policies and practices of Operators as to privacy, their use or disclosure of your personal information, or anything else.  So if you choose to register your Nextivity Product with an Operator, please review all of that Operator\'s relevant policies on privacy.  For your information, and without limiting what an Operator may do with your personal information, please recognize that Operators may be required to disclose your personal information in accordance with applicable law.  By submitting personal information to us in connection with the registration of a Nextivity Product, you agree to hold Nextivity harmless against any disclosure, use, or security of such personal information by an Operator or its agents. </br></br>We may anonymize your personal information so that you are not individually identified, and provide that information to our partners or other third parties. We may also use your personal information on an aggregated basis to improve our products, services, and offerings thereof. However, we never disclose aggregate information to a partner or third party in a manner that would identify you personally, as an individual.</br></br>Personal information collected on any or all Nextivity websites may be stored and processed in the United States or any other country in which Nextivity or its affiliates, subsidiaries or agents maintain facilities. By using this site, or our Services, you consent to any such transfer of information outside of your country.'
	}, {
	'privacyTitle': 'Agents',
	'privacyContent': 'We employ other companies and people to perform tasks on our behalf and need to share your information with them to provide products or services to you.  Unless we tell you differently, our agents do not have any right to use the personal information we share with them beyond what is necessary to assist us.'
	}, {
	'privacyTitle': 'Business Transfers',
	'privacyContent': 'We may choose to buy or sell assets, and may share and/or transfer customer information in connection with the evaluation of and entry into such transactions. Also, if we (or our assets) are acquired, or if we go out of business, enter bankruptcy, or go through some other change of control, personal information could be one of the assets transferred to or acquired by a third party.'
	}, {
	'privacyTitle': 'Protection of Company and Others',
	'privacyContent': 'We reserve the right to access, read, preserve, and disclose any information that we reasonably believe is necessary to comply with law or court order; enforce our agreements; or protect the rights, property, or safety of Company, our employees, our users, or others'
	}, {
	'privacyTitle': 'Managing personal information',
	'privacyContent': 'You may contact Nextivity via e-mail at info@nextivityinc.com and we will attempt to assist you to remove, review, or revise any or all personal information that you have previously provided to us.'
	}, {
	'privacyTitle': 'Additional information regarding privacy policy',
	'privacyContent': 'If at any time you believe that Nextivity has not adhered to this privacy policy, or if you have questions regarding the policy or our methods of collecting and/or use of your personal information, please contact us. You may contact Nextivity via e-mail at info@nextivityinc.com, using the word "privacy" in the subject line.</br></br>This policy does not apply to Operators or other online or offline partner or affiliated sites, products or services that may be electronically linked to our company website(s). Nextivity is not responsible for enforcing the privacy policies of such websites. Further, Nextivity is not responsible for the content included on such websites, including but not limited to special offers, text, copy, photos, images and advertising claims, names or</br></br>Under California Civil Code Sections 1798.83-1798.84, California residents are entitled to ask us for a notice identifying the categories of personal information which we share with our affiliates and/or third parties for marketing purposes, and providing contact information for such affiliates and/or third parties.  If you are a California resident and would like a copy of this notice, please submit a written request to: info@nextivityinc.com.</br></br>Your browser may offer you a "Do Not Track" option, which allows you to signal to operators of websites and web applications and services (including behavioral advertising services) that you do not wish such operators to track certain of your online activities over time and across different websites.  Our Services do not support Do Not Track requests at this time, which means that we collect information about your online activity both while you are using the Services and after you leave our Services.'
}];

var errorCodesPro = {
		"ES1"	: {
			"errTitle" : "Error 6: Network Unit Hardware Error",
			"errDesc" : "Your Network Unit may experiencing a hardware error that might be remedied by a reset. Try this... reset your Network Unit. Simply unplug your Network Unit for a few seconds and plug it back in. If the problem persist after a restart please contact your point-of-sale for further assistance.<br>If you recently updated the software of your device, try again. If the error persist please contact your point of sale for further assistance.",
		},
		"ES2"	: {
			"errTitle" : "Error 1: Not Receiving Signal from the cellular network",
			"errDesc" : "The cellular signal is too weak to boost. Try this...Walk around your home/office with your cellular device. Try to find a location indoors with at least one consistent bar of 3G/4G/LTE, more bars is always better! Once you have found a usable signal place your Network Unit in this location.<br>Note: If an External Donor Antenna is installed, check the connection",
		},
		"ES3"	: {
			"errTitle" : "Error 2: Coverage Unit Hardware Error",
			"errDesc" : "Your Coverage Unit may be experiencing a hardware error that might be remedied by a reset.<br>Try this...reset your Coverage Unit. Simply unplug your Coverage Unit for a few seconds and plug in back in. If the problem persist after a restart contact your point-of-sale for further assistance.",
		},
		"ES4"	: {
			"errTitle" : "Error 8: Input signal too strong",
			"errDesc" : "Your Network Unit is too close to a cellular tower. This may result in a reduced output power (smaller coverage bubble) to limit network interference.<br>Try this...move your Network Unit to another location. You might need to move your system to the other side of your home/office.",
		},
		"ES5"	: {
			"errTitle" : "Error 4: Network Unit is Overheating",
			"errDesc" : "Your Network Unit is overheating. Please ensure that your Network Unit vents are clear of any blockage, and that the location of the unit allows free flow of air. If you have your Network Unit in an exceptionally warm area you may need to relocate the device to insure that the system does not continue to overheat. Once your Network Unit has cooled down it will operate as normal.<br>Normal operating temperature of the Cel-Fi unit is 0-40 Celsius.",
		},
		"ES6"	: {
			"errTitle" : "Error 3: Coverage Unit is Overheating",
			"errDesc" : "Your Coverage Unit is overheating. Please ensure that your Coverage Unit vents are clear of any blockage, and that the location of the unit allows free flow of air. Once your Coverage Unit has cooled down it will operate as normal. Normal operating temperature of the Cel-Fi unit is 0-40 Celsius.<br>Note:  Your Network Unit will continue to search for the Coverage Unit.",
		},
		"ES7"	: {
			"errTitle" : "Too Close",
			"errDesc" : "Your Coverage Unit is \"Too Close\" to your Network Unit. Try moving the units much further apart, starting with the Coverage Unit. The more distance between the Network Unit and the Coverage Unit the large your coverage bubble will be.",
		},
		"ES8"	: {
			"errTitle" : "Too Far",
			"errDesc" : "Your Coverage Unit is \"Too Far\" from your Network Unit. Try moving the units slightly (5-10 feet) closer together, starting with the Coverage Unit.<br>Intermittent \"Too Far\" message? Frequent or intermittent issues can be related to heavy WiFi saturation in your home/office. Make sure that each unit is as far as possible from any access points or WiFi enabled devices.<br>Your Network Unit will continue to search for the Coverage Unit. Make sure that your Network Unit is operating normally, with a full color display reading the same Too Far message as your Coverage Unit. If you have a different message on your Network Unit please reach out to your point-of-sale for further assistance.",
		},
		"ES9"	: {
			"errTitle" : "Error 7: Disabled by operator",
			"errDesc" : "Your system has been disabled by the mobile network operator. Contact your point-of-sale for further assistance.",
		},
		"ES10"	: {
			"errTitle" : "Error 9: Location Lock - Registration Required",
			"errDesc" : "Your system has been moved from its original address. Please move the system back to its original location or try to register your new address with your wireless provider. Systems can be registered HERE.<br>Note: In some cases the Error 9 cannot be remedied with a registration - instead the remedy is to return the unit to its original location. Please reach out to your point-of-sale if registration did not unlock your error 9 message.",
		},
		"ES11"	: {
			"errTitle" : "Error 5: Registration Required",
			"errDesc" : "Before use, you must register this device and have your provider's consent. You must operate this device with approved cables as specified by the manufacturer. Systems can be registered HERE.",
		},
		"ES12"	: {
			"errTitle" : "",
			"errDesc" : "",
		}
};

var errorCodesDuo = {
		"ES1"	: {
			"errTitle" : "Error 6: Network/Window Unit Hardware Error",
			"errDesc" : "Your Network Unit may experiencing a hardware error that might be remedied by a reset. Try this... reset your Network Unit (also known as a Window Unit). Simply unplug your Network Unit for a few seconds and plug it back in. If the problem persist after a restart please contact your point-of-sale for further assistance. <br>If you recently updated the software of your device, try again. If the error persist please contact your point of sale for further assistance.",
		},
		"ES2"	: {
			"errTitle" : "Error 1: Not Receiving Signal from the cellular network",
			"errDesc" : "The cellular signal is too weak to boost.<br>Try this...Walk around your home/office with your cellular device. Try to find a location with at least one consistent bar of 3G/4G/LTE, more bars is always better! Once you have found a usable signal place your Network Unit (also known as Window Unit) in this location. Note: If an External Donor Antenna is installed, check the connection",
		},
		"ES3"	: {
			"errTitle" : "Error 2: Coverage Unit Hardware Error",
			"errDesc" : "Your Coverage Unit may be experiencing a hardware error that might be remedied by a reset.<br>Try this...reset your Coverage Unit. Simply unplug your Coverage Unit for a few seconds and plug in back in. If the problem persist after a restart contact your point-of-sale for further assistance.",
		},
		"ES4"	: {
			"errTitle" : "Error 8: Input signal too strong",
			"errDesc" : "Your Network Unit is too close to a cellular tower. This may result in a reduced output power (smaller coverage bubble) to limit network interference.<br>Try this...Move your Network Unit to another location. You might need to move your system to the other side of your home.",
		},
		"ES5"	: {
			"errTitle" : "Error 4: Network Unit is Overheating",
			"errDesc" : "Your Network Unit (also known as a Window Unit) is overheating. Please ensure that your Network Unit vents are clear of any blockage, and that the location of the unit allows free flow of air. If you have your Network Unit in an exceptionally warm area you may need to relocate the device to insure that the system does not continue to overheat. Once your Network Unit has cooled down it will operate as normal.<br>Normal operating temperature of the Cel-Fi unit is 0-40 Celsius.",
		},
		"ES6"	: {
			"errTitle" : "Error 3: Coverage Unit is Overheating",
			"errDesc" : "Your Coverage Unit is overheating. Please ensure that your Coverage Unit vents are clear of any blockage, and that the location of the unit allows free flow of air. Once your Coverage Unit has cooled down it will operate as normal. Normal operating temperature of the Cel-Fi unit is 0-40 Celsius.<br>Note:  Your Network Unit will continue to search for the Coverage Unit. Normal operating temperature of the Cel-Fi unit is 0-40 Celsius.",
		},
		"ES7"	: {
			"errTitle" : "Too Close",
			"errDesc" : "Your Coverage Unit is \"Too Close\" to your Network Unit. Try moving the units much further apart, starting with the Coverage Unit. The more distance between the Network Unit and the Coverage Unit the large your coverage bubble will be.",
		},
		"ES8"	: {
			"errTitle" : "Too Far",
			"errDesc" : "Your Coverage Unit is \"Too Far\" from your Network Unit. Try moving the units slightly (5-10 feet) closer together, starting with the Coverage Unit.<br>Intermittent \"Too Far\" message? Frequent or intermittent issues can be related to heavy WiFi saturation in your home/office. Make sure that each unit is as far as possible from any access points or WiFi enabled devices.<br>Your Network Unit will continue to search for the Coverage Unit, resulting in a flashing power indicator. Make sure that your Network Unit is operating normally, displaying a green (flashing or solid) power indicator and green signal strength bars. If you have a red power indicator (flashing or solid) on your Network Unit please reach out to your point-of-sale for further assistance.",
		},
		"ES9"	: {
			"errTitle" : "Error 7: Disabled by operator",
			"errDesc" : "Your system has been disabled by the mobile network operator. Contact your point-of-sale for further assistance.",
		},
		"ES10"	: {
			"errTitle" : "Error 9: Location Lock - Registration Required",
			"errDesc" : "Your system has been moved from its original address. Please move the system back to its original location or try to register your new address with your wireless provider. Systems can be registered HERE.<br>Note: In some cases the Error 9 cannot be remedied with a registration - instead the remedy is to return the unit to its original location. Please reach out to your point-of-sale if registration did not unlock your error 9 message.",
		},
		"ES11"	: {
			"errTitle" : "Error 5: Registration Required",
			"errDesc" : "Before use, you must register this device and have your provider's consent. You must operate this device with approved cables as specified by the manufacturer. Systems can be registered HERE.",
		},
		"ES12"	: {
			"errTitle" : "",
			"errDesc" : "",
		}
};

var errorCodesGo = {
		"ES1"	: {
			"errTitle" : "Error 6: Hardware Error",
			"errDesc" : "Your GO Unit is experiencing a hardware failure. **Try this...Reset your Unit. To do this simply unplug your GO from the power source for a few seconds and plug it back in. If the problem persist after a restart please contact your point-of-sale for further assistance.<br>If you recently updated the software of your device, try again. If the error persist please contact your point of sale for further assistance.",
		},
		"ES2"	: {
			"errTitle" : "Error 1: Not Receiving Signal from the cellular network",
			"errDesc" : "The cellular signal is too weak to boost.<br>Try this...check the connection between your Donor Antenna and GO. Confirm that your antenna is properly connected and working. You may need to try another Donor Antenna. Using your cellular device, try to find a location with at least one consistent bar of 3G, 4G or 4G LTE. More bars is always better! Once you have found a usable signal, place your Donor Antenna in this location.",
		},
		"ES3"	: {
			"errTitle" : "",
			"errDesc" : "",
		},
		"ES4"	: {
			"errTitle" : "Error 8: Input signal too strong",
			"errDesc" : "Your Donor Antenna is too close to a cellular tower. This may result in a reduced output power (smaller coverage bubble) to limit network interference.<br>Try this...move your Donor Antenna to another physical location.",
		},
		"ES5"	: {
			"errTitle" : "Error 4: Go is overheating",
			"errDesc" : "Your GO Unit is overheating. Please ensure that your GO Unit is clear of any blockage. If you have your GO in the exceptionally warm area you may need to relocate the device to ensure that this unit does not continue to overheat. Once GO has cooled it will operate as normal.<br>Normal operating temperature of the Cel-Fi unit is 0-40 Celsius.",
		},
		"ES6"	: {
			"errTitle" : "",
			"errDesc" : "",
		},
		"ES7"	: {
			"errTitle" : "Too Close",
			"errDesc" : "Your Service Antenna is Too Close to your Donor Antenna. Try moving the antennas further apart, starting with the Service Antenna.",
		},
		"ES8"	: {
			"errTitle" : "",
			"errDesc" : "",
		},
		"ES9"	: {
			"errTitle" : "Error 7: Disabled by operator",
			"errDesc" : "Your system has been disabled by the mobile network operator. Contact your point-of-sale for further assistance.",
		},
		"ES10"	: {
			"errTitle" : "Error 9: Location Lock - Registration Required",
			"errDesc" : "Your system has been moved from its original address. Please move the system back to its original location or register your new address with your wireless provider. Systems can be registered HERE.",
		},
		"ES11"	: {
			"errTitle" : "Error 5: Registration Required",
			"errDesc" : "Before use, you must register this device and have your provider's consent. You must operate this device with approved cables as specified by the manufacturer. Systems can be registered HERE.",
		},
		"ES12"	: {
			"errTitle" : "Error 12: Self-Test Failed",
			"errDesc" : "During a system check a part of your unit's configuration has reported less than optimal performance. The system could be displaying a non-critical error message. If you have a boost in cellular service at your service antenna you can ignore the E12 message. If you do not have boosted signal, check to confirm that both your service antenna and donor antenna are properly connected and functional.  If the antennas checkout, the boost number on the unit is high and you still don't have a boosted signal try restarting the unit.  If the problem persist after a restart please contact your point-of-sale for further assistance.<br>*If you recently updated the software of your device, try again. If the error persist please contact your point of sale for further assistance.",
		}
};

var errorCodesPrime = {
		"ES1"	: {
			"errTitle" : "Error 6: Hardware Error",
			"errDesc" : "Your GO Unit is experiencing a hardware failure. **Try this...Reset your Unit. To do this simply unplug your GO from the power source for a few seconds and plug it back in. If the problem persist after a restart please contact your point-of-sale for further assistance.<br>If you recently updated the software of your device, try again. If the error persist please contact your point of sale for further assistance.",
		},
		"ES2"	: {
			"errTitle" : "Error 1: Not Receiving Signal from the cellular network",
			"errDesc" : "The cellular signal is too weak to boost.<br>Try this...check the connection between your Donor Antenna and GO. Confirm that your antenna is properly connected and working. You may need to try another Donor Antenna. Using your cellular device, try to find a location with at least one consistent bar of 3G, 4G or 4G LTE. More bars is always better! Once you have found a usable signal, place your Donor Antenna in this location.",
		},
		"ES3"	: {
			"errTitle" : "",
			"errDesc" : "",
		},
		"ES4"	: {
			"errTitle" : "Error 8: Input signal too strong",
			"errDesc" : "Your Donor Antenna is too close to a cellular tower. This may result in a reduced output power (smaller coverage bubble) to limit network interference.<br>Try this...move your Donor Antenna to another physical location.",
		},
		"ES5"	: {
			"errTitle" : "Error 4: Go is overheating",
			"errDesc" : "Your GO Unit is overheating. Please ensure that your GO Unit is clear of any blockage. If you have your GO in the exceptionally warm area you may need to relocate the device to ensure that this unit does not continue to overheat. Once GO has cooled it will operate as normal.<br>Normal operating temperature of the Cel-Fi unit is 0-40 Celsius.",
		},
		"ES6"	: {
			"errTitle" : "",
			"errDesc" : "",
		},
		"ES7"	: {
			"errTitle" : "Too Close",
			"errDesc" : "Your Service Antenna is Too Close to your Donor Antenna. Try moving the antennas further apart, starting with the Service Antenna.",
		},
		"ES8"	: {
			"errTitle" : "",
			"errDesc" : "",
		},
		"ES9"	: {
			"errTitle" : "Error 7: Disabled by operator",
			"errDesc" : "Your system has been disabled by the mobile network operator. Contact your point-of-sale for further assistance.",
		},
		"ES10"	: {
			"errTitle" : "Error 9: Location Lock - Registration Required",
			"errDesc" : "Your system has been moved from its original address. Please move the system back to its original location or register your new address with your wireless provider. Systems can be registered HERE.",
		},
		"ES11"	: {
			"errTitle" : "Error 5: Registration Required",
			"errDesc" : "Before use, you must register this device and have your provider's consent. You must operate this device with approved cables as specified by the manufacturer. Systems can be registered HERE.",
		},
		"ES12"	: {
			"errTitle" : "Error 12: Self-Test Failed",
			"errDesc" : "During a system check a part of your unit's configuration has reported less than optimal performance. The system could be displaying a non-critical error message. If you have a boost in cellular service at your service antenna you can ignore the E12 message. If you do not have boosted signal, check to confirm that both your service antenna and donor antenna are properly connected and functional.  If the antennas checkout, the boost number on the unit is high and you still don't have a boosted signal try restarting the unit.  If the problem persist after a restart please contact your point-of-sale for further assistance.<br>*If you recently updated the software of your device, try again. If the error persist please contact your point of sale for further assistance.",
		}
};

var connectBntStatus = false;
var deviceRadioActiveStatus = false;
var circle1 = null, circle2 = null, circle3 = null, circle4 = null;


var util = {
	syncData: 'Syncing data...',
	searchMessage: 'Searching for Cel-Fi devices...',
	showErrorPopup: function(errorType) {
	    util.hideCommonPopup();
	    this.createBlackOverlay();
	    this.createCommonPopup();
	},
	
	createBlackOverlay: function() {
		if(typeof bigSlideAPI!= "undefined" && $('#menu').length){
			bigSlideAPI.view.toggleClose();
		}
	    util.removeElement('blackOverlay');
	    util.createAppendElem("div", "blackOverlay", "", mainContainer);
	},
	
	createCommonPopup: function() {
	    util.removeElement('commonPopup');
	    var popupContainer = util.createAppendElem("div", "commonPopup", "commonPopup", mainContainer);
	    var popElem = document.getElementById("commonPopup");
	    this.createAppendElem("div", "popupHeader", "", popElem);
	    this.createAppendElem("div", "popupBody", "", popElem);
	    this.createAppendElem("div", "popupFooter", "", popElem);
	},
	
	createPopupWithCloseBtn: function(popupTitle, popupContent) {
		this.hidePopupWithClose();
	    this.createBlackOverlay();
	    this.removeElement('popupWithCloseBtn');
	    var popupContainer = util.createAppendElem("div", "popupWithCloseBtn", "popupWithCloseBtn", mainContainer);
	    var popupCloseHeader = this.createAppendElem("div", "popup3Header", "", popupContainer);
	    var titleContainer = this.createAppendElem("div", "closePopupTitle", "closePopupTitle fl", popupCloseHeader);
	    titleContainer.innerHTML = popupTitle;
	    var popupCloseBtnEvent = this.createAppendElem("div", "closePopupBtn", "closePopupBtn fr", popupCloseHeader);
	    popupCloseBtnEvent.addEventListener("click", util.hidePopupWithClose);
	    this.createAppendElem("div", "popupCloseCB", "cb", popupContainer);
	    var contentContainer = this.createAppendElem("div", "popup3Body", "", popupContainer);
	    contentContainer.innerHTML = popupContent;
	},
	
	createCommonSpinnerDialog: function(sText) {
	    util.hideCommonSpinnerDialog();
	    util.createBlackOverlay();
	    var popupContainer = util.createAppendElem("div", "spinnerDialog", "spinnerDialog", mainContainer);
	    var popElem = document.getElementById("spinnerDialog");
	    this.createAppendElem("div", "spinnerImgContainer", "spinnerImgContainer waitLoader fl", popElem);
	    var spinnerTextContainer = this.createAppendElem("div", "spinnerTextContainer", "spinnerTextContainer fl", popElem);
	    spinnerTextContainer.innerHTML = "<span>" + sText + "</span>";
	},
	
	alignElementCenter: function(uiElem) {
	    var elemHeight = uiElem.clientHeight;
	    var elemWidth = uiElem.clientWidth;
	    var remHeight = parseInt((deviceHeight - elemHeight) / 2);
	    var remWidth = parseInt((deviceWidth - elemWidth) / 2);
	    uiElem.style.marginTop = remHeight + "px !important";
	    uiElem.style.marginLeft = remWidth + "px !important";
	},
	
	createAppendElem: function(elemType, elemId, elemClass, appendTo) {
	    var newElem = document.createElement(elemType);
	    if (elemId != "") {
	        newElem.id = elemId;
	    }
	    if (elemClass != "") {
	        newElem.className = elemClass;
	    }
	    appendTo.appendChild(newElem);
	    return document.getElementById(elemId);
	},
	
	removeElement: function(elmId) {
	    var uiElement = document.getElementById(elmId);
	    if (uiElement) {
	        uiElement.parentNode.removeChild(uiElement);
	    }
	},
	
	showSearchAnimation: function() {
		if(softwareVersionFlag){
			util.removeElement("menu");
			mainContainer.className = "connectionBG";
		    if (typeof searchTimeOut != "undefined") {
		        clearTimeout(searchTimeOut);
		    }
		    util.removeElement("searchBoxContainer");
		    util.removeElement("searchIconContainer");
		    util.removeElement("searchMessageBox");
		    mainContainer.innerHTML = "";
		    if (typeof searchAnimationLoop != "undefined") {
		        clearInterval(searchAnimationLoop);
		    }
		    var searchBoxContainer = util.createAppendElem("div", "searchBoxContainer", "", mainContainer);
		    if (window.localStorage.getItem("deviceType") == "phone") {
		        searchBoxContainer.innerHTML = '<svg width="500px" height="800px" xmlns="http://www.w3.org/2000/svg" version="1.1"><defs><radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" style="stop-color:white;stop-opacity:0" /><stop offset="100%" style="stop-color:white;stop-opacity:0.03" /></radialGradient><radialGradient id="grad2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" style="stop-color:white;stop-opacity:0" /><stop offset="100%" style="stop-color:white;stop-opacity:0.08" /></radialGradient><radialGradient id="grad3" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" style="stop-color:white;stop-opacity:0" /><stop offset="100%" style="stop-color:white;stop-opacity:0.13" /></radialGradient><radialGradient id="grad4" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" style="stop-color:white;stop-opacity:0" /><stop offset="100%" style="stop-color:white;stop-opacity:0.18" /></radialGradient></defs><circle id="circle1" cx="' + eval(deviceWidth / 2) + '" cy="' + eval(deviceHeight / 2) + '" r="200" fill="url(#grad1)" /><circle id="circle2" cx="' + eval(deviceWidth / 2) + '" cy="' + eval(deviceHeight / 2) + '" r="150" fill="url(#grad2)" /><circle id="circle3" cx="' + eval(deviceWidth / 2) + '" cy="' + eval(deviceHeight / 2) + '" r="100" fill="url(#grad3)" /><circle id="circle4" cx="' + eval(deviceWidth / 2) + '" cy="' + eval(deviceHeight / 2) + '" r="50" fill="url(#grad4)" /><circle id="mainCircle" cx="' + eval(deviceWidth / 2) + '" cy="' + eval(deviceHeight / 2) + '" r="50" fill="white" /></svg>';
		    } else {
		        searchBoxContainer.innerHTML = '<svg width="500px" height="500px" xmlns="http://www.w3.org/2000/svg" version="1.1"><defs><radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" style="stop-color:white;stop-opacity:0" /><stop offset="100%" style="stop-color:white;stop-opacity:0.03" /></radialGradient><radialGradient id="grad2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" style="stop-color:white;stop-opacity:0" /><stop offset="100%" style="stop-color:white;stop-opacity:0.08" /></radialGradient><radialGradient id="grad3" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" style="stop-color:white;stop-opacity:0" /><stop offset="100%" style="stop-color:white;stop-opacity:0.13" /></radialGradient><radialGradient id="grad4" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" style="stop-color:white;stop-opacity:0" /><stop offset="100%" style="stop-color:white;stop-opacity:0.18" /></radialGradient></defs><circle id="circle1" cx="250" cy="250" r="200" fill="url(#grad1)" /><circle id="circle2" cx="250" cy="250" r="150" fill="url(#grad2)" /><circle id="circle3" cx="250" cy="250" r="100" fill="url(#grad3)" /><circle id="circle4" cx="250" cy="250" r="50" fill="url(#grad4)" /><circle id="mainCircle" cx="250" cy="250" r="50" fill="white" /></svg>';
		    }
		    this.initiateSearchAnimation();
		    var searchMessageBox = util.createAppendElem("div", "searchMessageBox", "w100", mainContainer);
		    searchMessageBox.align = "center";
		    searchMessageBox.innerHTML = util.searchMessage;
		    var searchIconContainer = util.createAppendElem("div", "searchIconContainer", "searchIconContainer", mainContainer);
		    searchTimeOut = setTimeout(function(){ util.showNoDeviceFoundErrorPopup(); }, 120*1000);
		    //searchTimeOut = setTimeout(function(){ util.showNoDeviceFoundErrorPopup(); }, 10*1000);
		}
	},
	
	initiateSearchAnimation: function() {
	    circle1 = document.getElementById("circle1"), circle2 = document.getElementById("circle2"), circle3 = document.getElementById("circle3"), circle4 = document.getElementById("circle4");
	    var circle1_r = circle1.getAttribute("r"),
	        circle2_r = circle2.getAttribute("r"),
	        circle3_r = circle3.getAttribute("r"),
	        circle4_r = circle4.getAttribute("r");
	    var radiusStartLimit = 0;
	    var radiusEndLimit = 50;
	    var tempCircle1_r = parseInt(circle1_r) + 1,
	        tempCircle2_r = parseInt(circle2_r) + 1,
	        tempCircle3_r = parseInt(circle3_r) + 1,
	        tempCircle4_r = parseInt(circle4_r) + 1;
	    searchAnimationLoop = setInterval(function() {
	        if ((tempCircle1_r - circle1_r) > 49) {
	            tempCircle1_r = parseInt(circle1_r) + 1;
	            tempCircle2_r = parseInt(circle2_r) + 1;
	            tempCircle3_r = parseInt(circle3_r) + 1;
	            tempCircle4_r = parseInt(circle4_r) + 1;
	        }
	        circle1.setAttribute("r", tempCircle1_r++);
	        circle2.setAttribute("r", tempCircle2_r++);
	        circle3.setAttribute("r", tempCircle3_r++);
	        circle4.setAttribute("r", tempCircle4_r++);
	    }, 15);
	},
	
	deviceIdentified: function() {
	    mainContainerDisplayFlag = 1;
	    //util.stopSearchAnimation();
	    //clearInterval(searchAnimationLoop);
	    document.getElementById("searchIconContainer").style.background = "";
	    document.getElementById("searchIconContainer").style.background = "url('img/assets/icons/Done.svg') no-repeat";
	    document.getElementById("searchMessageBox").innerHTML = util.syncData;
	},
	
	gatheringDeviceData: function(){
		document.getElementById("searchMessageBox").innerHTML = "Gathering data...";
        document.getElementById("searchIconContainer").style.background = "";
	    document.getElementById("searchIconContainer").style.background = "url('img/assets/icons/Done.svg') no-repeat";
	},
	
	stopSearchAnimation: function() {
	    circle1.setAttribute("r", 200);
	    circle2.setAttribute("r", 150);
	    circle3.setAttribute("r", 100);
	    circle4.setAttribute("r", 50);
	},
	
	closeApplication: function() {
	    navigator.app.exitApp();
	},
	
	alignCommonPopupToHeader: function(headerObj){
		if(headerObj.offsetHeight > 30 && deviceType == "phone"){
			var elemCommonPopup = document.getElementById("commonPopup");
			elemCommonPopup.style.maxHeight = parseInt(elemCommonPopup.offsetHeight + 26) + "px";
		}
	},
	
	showNoDeviceFoundErrorPopup: function() {
	    util.removeElement("searchBoxContainer");
	    util.removeElement("searchIconContainer");
	    util.removeElement("searchMessageBox");
	    util.showErrorPopup();
	    var nodeviceHeader = document.getElementById("popupHeader");
	    var nodeviceBody = document.getElementById("popupBody");
	    var nodeviceFooter = document.getElementById("popupFooter");
	    nodeviceHeader.className = "nodeviceHeader";
	    nodeviceBody.className = "nodeviceBody";
	    nodeviceFooter.className = "nodeviceFooter";
	    nodeviceFooter.align = "center";
	
	    nodeviceHeader.innerHTML = "Sorry, couldn't find any boosters";
	    nodeviceBody.innerHTML = "There are many reasons why the connection could fail. Please refer to our Help pages for troubleshooting tips.";
	
	    var tryAgainBtn = util.createAppendElem("button", "noDeviceTryAgnBtn", "defaultButton fr", nodeviceFooter);
	    tryAgainBtn.innerHTML = "Try Again";
	    tryAgainBtn.addEventListener("click", function() {
	        util.hideCommonPopup();
	        util.showSearchAnimation();
	    }, false);
	
	    var trblShtBtn = util.createAppendElem("button", "trblShtBtn", "trblShtBtn defaultButton fl", nodeviceFooter);
	    trblShtBtn.innerHTML = "Troubleshooting";
	    trblShtBtn.addEventListener("click", function() {
	        util.showFixItPopup();
	    }, false);
		util.alignCommonPopupToHeader(nodeviceHeader);
	    //isSouthBoundIfCnx = false;
	    //StartBluetoothScan();
	},
	
	promptSoftwareUpdate: function(){
		util.showErrorPopup();
	    var swUpdateHeader = document.getElementById("popupHeader");
	    var swUpdateBody = document.getElementById("popupBody");
	    var swUpdateFooter = document.getElementById("popupFooter");
	    swUpdateHeader.className = "swUpdateHeader";
	    swUpdateBody.className = "swUpdateBody";
	    swUpdateFooter.className = "swUpdateFooter";
	    swUpdateFooter.align = "center";

	    swUpdateHeader.innerHTML = "Booster update available";
	
        var tempSwVer = 22;
        if( nxtySwVerCuCf != null )
        {
            tempSwVer = nxtySwVerCuCf.split(".");
            tempSwVer = parseInt(tempSwVer[1]);
        }
        else if( nxtySwVerNuCf != null )
        {
            tempSwVer = nxtySwVerNuCf.split(".");
            tempSwVer = parseInt(tempSwVer[1]);
        }
        
        if( (tempSwVer < 21) && (window.device.platform != pcBrowserPlatform) )
        {        
            // Must use PC to download...
            PrintLog(1, "User pressed Software Update but CU/NU version < 21 so PC only.  Ver=" + tempSwVer );
            swUpdateBody.innerHTML = "You must connect your booster to your computer to get the update.  For more instructions go to <a href='#' onclick='window.open(\"http://www.cel-fi.com/wave\", \"_system\");'>www.cel-fi.com/wave</a>";
            
            var updateBtn = util.createAppendElem("button", "updateBtn", "defaultButton fr", swUpdateFooter);
            updateBtn.innerHTML = "Ok";
            updateBtn.addEventListener("click", function() {
                util.hideCommonPopup();
            }, false);

        }
        else
        {        
            PrintLog(1, "User pressed Software Update and CU/NU version >= 21. Ver=" + tempSwVer);
            if( window.device.platform != pcBrowserPlatform )
            {
                swUpdateBody.innerHTML = "An update can take up to 20 minutes. During this time your handset must remain in close proximity to your booster. Do not close the application during the update.";
            }
            else
            {
                swUpdateBody.innerHTML = "An update can take up to 20 minutes. Do not close the application, remove the USB cable or unplug the booster during the update.";
            }
            
            var updateBtn = util.createAppendElem("button", "updateBtn", "defaultButton fr", swUpdateFooter);
            updateBtn.innerHTML = "Update";
            updateBtn.addEventListener("click", function() {
                util.hideCommonPopup();
                softwarePromptFlag = false;
                SetSoftwareUpdate();
            }, false);
        
            var skipUpdateBtn = util.createAppendElem("button", "skipUpdate", "skipUpdate defaultButton fl", swUpdateFooter);
            skipUpdateBtn.innerHTML = "Skip";
            skipUpdateBtn.addEventListener("click", function() {
                util.hideCommonPopup();
            }, false);
        }
		util.alignCommonPopupToHeader(swUpdateHeader);
	},
	
	getCurrentLocationPrompt: function(msg) {
	    if (deviceOS == "Android") {
	        util.showErrorPopup();
	        var locationHeader = document.getElementById("popupHeader");
	        var locationBody = document.getElementById("popupBody");
	        var locationFooter = document.getElementById("popupFooter");
	        locationHeader.className = "locationHeader";
	        locationBody.className = "locationBody";
	        locationFooter.className = "locationFooter";
	        locationFooter.align = "center";
	
	        locationHeader.innerHTML = "Location Access";
	        locationBody.innerHTML = "Allow Wave access to your current GPS location?";
	
	        var locBtn1 = util.createAppendElem("button", "locationDeny", "defaultButton BtnWBG fl w50", locationFooter);
	        var locBtn2 = util.createAppendElem("button", "locationAllow", "defaultButton fr w50", locationFooter);
	        util.createAppendElem("div", "locationCB", "cb", locationFooter);
	        locBtn1.innerHTML = "Don't Allow";
	        locBtn2.innerHTML = "Allow";
	        locBtn1.addEventListener("click", function() {
	            util.hideCommonPopup();
	            HandleConfirmLocation(2);
	        }, false);
	
	        locBtn2.addEventListener("click", function() {
	            util.hideCommonPopup();
	            HandleConfirmLocation(1);
	        }, false);
	    } else {
	        util.createBlackOverlay();
	        util.createPromptPopup();
	        var promptElem = document.getElementById("promptPopup");
	        util.modifyLocationAccessPrompt(msg);
	    }
	},
	
	modifyLocationAccessPrompt: function(msg) {
	    var promptBody = document.getElementById("promptBody");
	    var promptFooter = document.getElementById("promptFooter");
	    promptBody.innerHTML = msg;
	    var buttonDiv1 = util.createAppendElem("div", "buttonDiv1", "w50 h100", promptFooter);
	    var buttonDiv2 = util.createAppendElem("div", "buttonDiv2", "w50 h100", promptFooter);
	    var button1 = util.createAppendElem("div", "denyBtn", "w100 h100", buttonDiv1);
	    var button2 = util.createAppendElem("div", "allowBtn", "w100 h100", buttonDiv2);
	    button1.innerHTML = "Don't Allow";
	    button2.innerHTML = "OK";
	    button1.addEventListener("click", function() {
	        util.hidePromptBox();
	        HandleConfirmLocation(2);
	    }, false);
	    button2.addEventListener("click", function() {
	        util.hidePromptBox();
	        HandleConfirmLocation(1);
	    }, false);
	},
	
	createPromptPopup: function() {
	    this.removeElement("promptPopup");
	    var popupContainer = document.createElement("div");
	    popupContainer.id = "promptPopup";
	    popupContainer.className = "promptPopup";
	    mainContainer.appendChild(popupContainer);
	    var popElem = document.getElementById("promptPopup");
	    this.createAppendElem("div", "promptBody", "", popElem);
	    this.createAppendElem("div", "promptFooter", "", popElem);
	},
	
	hideCommonPopup: function() {
	    util.removeElement("commonPopup");
	    util.removeElement("blackOverlay");
	},
	
	hidePromptBox: function() {
	    util.removeElement("promptPopup");
	    util.removeElement("blackOverlay");
	},
	
	hideCommonSpinnerDialog: function() {
	    util.removeElement("spinnerDialog");
	    util.removeElement("blackOverlay");
	},
	
	hidePopupWithClose: function(){
		util.removeElement("popupWithCloseBtn");
	    util.removeElement("blackOverlay");
	},
	
	showGauge: function(gValue) {
	    var opts = {
	        lines: 12,
	        angle: 0.1,
	        lineWidth: 0.35,
	        pointer: {
	            length: 0,
	            strokeWidth: 0,
	            color: 'white'
	        },
	        limitMax: 'false',
	        percentColors: [
	            [0.0, "#8BC34A"],
	            [0.50, "#8BC34A"],
	            [1.0, "#8BC34A"]
	        ],
	        strokeColor: '#F5F3F3',
	        generateGradient: true
	    };
	    var target = document.getElementById('boostGauge');
	    var gauge = new Gauge(target).setOptions(opts);
	    gauge.maxValue = 9
	    gauge.animationSpeed = 1;
	    gauge.set(gValue);
	},
	
	dropdownToggle: function() {
	    $('a[data-toggle="collapse"]').click(function() {
	        $('span.toggle-icon').not($(this).find('span.toggle-icon')).removeClass('glyphicon-chevron-up');
	        $('span.toggle-icon').not($(this).find('span.toggle-icon')).addClass('glyphicon-chevron-down');
	        $(this).find('span.toggle-icon').toggleClass('glyphicon-chevron-up glyphicon-chevron-down');
	    });
	},
	
	settingsSelectToggle: function() {
	    $('.operatorList').click(function(e) {
	        e.preventDefault();
	        $('.operatorListWrapper > ul').toggle();
	    });
	
	    $('#operatorTitle').click(function(e) {
	        e.preventDefault();
	        $('.operatorListWrapper > ul').css('display', 'none');
	    });
	
	    $('.deviceList').click(function(e) {
	        e.preventDefault();
	        $('.deviceListWrapper > ul').toggle();
	    });
	
	    $('#deviceTitle').click(function(e) {
	        e.preventDefault();
	        $('.deviceListWrapper > ul').css('display', 'none');
	    });
	
	    $(".menu-toggle").click(function(e) {
	        e.preventDefault();
	        $("#wrapper").toggleClass("toggled");
	    });
	
	    $(document.body).on('click', '.operatorListWrapper > ul li', function(event) {
	        var $target = $(event.currentTarget);
	        $('#operatorVal').html($target.text());
	        return false;
	    });
	
	    $(document.body).on('click', '.deviceListWrapper > ul li', function(event) {
	        var $target = $(event.currentTarget);
	        $('#deviceVal').html($target.text());
	        return false;
	    });
	},
	
	topMenuEvents: function() {
	    $('#dashboardMenu').click(function() {
	       DumpDataTables();
	       PrintLog(1, "");
	       PrintLog(1, "User selected Dashboard Menu.....");
	       RequestModeChange(PROG_MODE_TECH);
	    });
	    $('#settingsMenu').click(function() {
           DumpDataTables();
           PrintLog(1, "");
           PrintLog(1, "User selected Settings Menu .....");
           if( nxtyRxStatusIcd <= V1_ICD )
           {
               ShowAlertPopUpMsg("Booster Update Required", "A software update is required before the app will work correctly. Unfortunately, the update for this model is currently not available.");
           }
           else
           {
               RequestModeChange(PROG_MODE_SETTINGS);
           }
	    });
	    $('#advancedMenu').click(function() {
           DumpDataTables();
           PrintLog(1, "");
           PrintLog(1, "User selected Advanced Menu .....");
           if( nxtyRxStatusIcd <= V1_ICD )
           {
               ShowAlertPopUpMsg("Booster Update Required", "A software update is required before the app will work correctly. Unfortunately, the update for this model is currently not available.");
           }
           else
           {
               RequestModeChange(PROG_MODE_ADVANCED);
           }
	    });
	},
	
	loadBodyContainer: function(menuElem) {
	    mainScreenSelectedTab = menuElem;
	    $('#bodyContainer').html("");
	    if (menuElem == "dashboard") {
	        $('#bodyContainer').html(dashboardPanelContent);
	        util.loadDashboardContainer(menuElem);
	        $('#bodyContainer').addClass('bodyPadding');
	    } else if (menuElem == "settings") {
	        updateAntStatus();
	        $('#bodyContainer').removeClass('bodyPadding');
	        setTimeout(function() {
				if(guiCurrentMode == PROG_MODE_SETTINGS){
					if (deviceType == "phone") {
						util.loadPhoneSettingsContainer();
					} else {
						util.loadPhoneSettingsContainer();//util.loadTabletSettingsContainer();
					}
				}
	        }, 400);
	        guiCurrentMode = PROG_MODE_SETTINGS;
	    } else if (menuElem == "advanced") {
	        util.loadAdvancedContainer();
	        $('#bodyContainer').removeClass('bodyPadding');
	    }
	},
	
	changeBoosterSettings: function(slctId){
		for(var x=0; x<6; x++){
			$('#boosterRadioBtn'+x).removeClass('radioBtnSelected').addClass('radioBtnUnSelected');
			$('#boosterRadioLbl'+x).removeClass('boosterSelectedTxt').addClass('boosterUnSelectedTxt');
		}
		
		$('#boosterRadioBtn'+slctId).removeClass('radioBtnUnSelected').addClass('radioBtnSelected');
		$('#boosterRadioLbl'+slctId).removeClass('boosterUnSelectedTxt').addClass('boosterSelectedTxt');
		SetBooster(slctId);
		//alert(slctId);
	},
	
	loadPhoneSettingsContainer: function() {
	    var bodyContainer = document.getElementById("bodyContainer");
	    var settingScreenWrapper = util.createAppendElem("div", "settingsDataWrapper", "col-sm-12", bodyContainer);
	
	    var operatorListPanel = "";
	    var deviceListDropDown = "";
	
	    //operator list drop dwon panel
	    if (guiOperatorFlag) {
	        operatorListPanel = "<div class='panel panel-default'>" + "<div class='panel-heading dropDown' id='operatorTitle'>" + "<h4 class='panel-title'>" + "<a data-toggle='collapse' href='#collapseOne'>" + "<div><div class='settingsDropIcns' id='operatorIcn'></div>Operator</div>" + "<span class='pull-right'>" + "<span class='toggle-icon expand-more'></span>" + "</span>" + "</a>" + "</h4>" + "</div>" + "<div id='collapseOne' class='panel-collapse collapse'>" + "<div class='panel-body'>" + "<div>" + "<div class='operatorList col-xs-10 col-sm-8'>" + "<button type='button' class='form-control'>" + "<span data-bind='label' id='operatorVal'>";
	
	        operatorListPanel = operatorListPanel + guiOperator + "</span>" + "</span>&nbsp;<span class='caret'></span>" + "</button>" + "<div class='operatorListWrapper'>" + "<ul>";
	
	        for (var operLen = 0; operLen < guiOperatorList.length; operLen++) {
	            if (guiOperator == guiOperatorList[operLen]) {
	                operatorListPanel = operatorListPanel + "<li class='selectedListVal'>" + guiOperatorList[operLen] + "</li>";
	            } else {
	                operatorListPanel = operatorListPanel + "<li>" + guiOperatorList[operLen] + "</li>";
	            }
	        }
	
	        operatorListPanel = operatorListPanel + "</ul></div></div></div></div></div></div>";
	        $(operatorListPanel).appendTo('#settingsDataWrapper');
	    }
	
	    //Device list drop down panel
	    //if (guiDeviceFlag) {
	    	var deviceNameVar = guiSerialNumber;
	    	var deviceDispPetName = "";
	    	if(window.localStorage.getItem("__"+deviceNameVar)!=null && window.localStorage.getItem("__"+deviceNameVar)!=""){
	    		deviceDispPetName = window.localStorage.getItem("__"+deviceNameVar);
	    	}
	        deviceListDropDown = "<div class='panel panel-default'>"
								+"<div class='panel-heading dropDown' id='deviceTitle'>"
								+"<h4 class='panel-title'>"
								+"<a data-toggle='collapse' href='#collapseTwo'>"
								+"<div><div class='settingsDropIcns' id='deviceIcn'></div>Booster Name</div>"
								+"<span class='pull-right'>"
								+"<span class='toggle-icon expand-more'></span>"
								+"</span>"
								+"</a>"
								+"</h4>"
								+"</div>"
								+"<div id='collapseTwo' class='panel-collapse collapse'>"
								+"<div id='devicesFoundLbl'>Give your Device a name</div>"
								+"<input type='text' id='devicePetName' value='' maxlength='25'>"
								+"<div class='form-group' align='right'>"
								+"<button type='button' class='defaultButton fr' id='deviceUpdate' onclick='util.updateDevicePetName()'>Update</button>"
								+"<div class='fr' id='boosterNamedSavedMsg'></div>"
								+"<div class='cb'></div>"
								+"</div>"
								+"</div>"
								+"</div>";
	
	        $(deviceListDropDown).appendTo('#settingsDataWrapper');
			$('#devicePetName').val(unescape(deviceDispPetName));
	    //}
	
	    //Software update status panel
	    var softwareUpdatePanel = "<div class='panel panel-default'>" + "<div class='panel-heading dropDown' id='softwareTitle'>" + "<h4 class='panel-title'>" + "<a data-toggle='collapse' href='#collapseThree'>" + "<div><div class='settingsDropIcns' id='versionIcn'></div>Software Version</div>" + "<span class='pull-right'>" + "<span class='toggle-icon expand-more'></span>" + "</span>" + "</a>" + "</h4>" + "</div>" + "<div id='collapseThree' class='panel-collapse collapse'>" + "<div class='panel-body'>" + "<div id='versionWrapper'>";
	
	    //if (SWUpdateUIFlag) {
	    if(guiSoftwareStatus == SW_STATUS_PLEASE_UPDATE){
	        softwareUpdatePanel = softwareUpdatePanel + "<div class='versionLbl col-xs-7'>Please update your software</div>" + "<div class='form-group col-xs-4'>" + "<button type='button' class='primaryButton' id='versionUpdate' onclick='util.promptSoftwareUpdate()'>Update</button>" + "</div>";
	    } else if(guiSoftwareStatus == SW_STATUS_CHECKING){
	        softwareUpdatePanel = softwareUpdatePanel + "<div class='versionLbl fl'>Checking for updates...</div><div id='spinnerImgContainer' class='spinnerImgContainer waitLoader fl'></div>";
	    } else if(guiSoftwareStatus == SW_STATUS_UPDATE_IN_PROGRESS){
	        softwareUpdatePanel = softwareUpdatePanel + "<div class='versionLbl fl'>Update in progress...</div><div id='spinnerImgContainer' class='spinnerImgContainer waitLoader fl'></div>";
	    } else if(guiSoftwareStatus == SW_STATUS_UNKNOWN){
	        //softwareUpdatePanel = softwareUpdatePanel + "<div class='versionLbl fl'>Unknown state: Please try again later</div>";
			//softwareUpdatePanel = softwareUpdatePanel + "<div class='versionLbl'>Unknown state: Please try again later</div>" + "<div class='form-group pull-right'>" + "<button type='button' class='primaryButton' id='versionUpdate' onclick='CheckForSoftwareUpdates()'>Try Again</button>" + "</div>";
			
			softwareUpdatePanel = softwareUpdatePanel + "<div class='versionLbl'>Wave Cannot determine if an update is available. Please try again later</div>" + "<div class='form-group pull-right'>" + "<button type='button' class='primaryButton' id='versionUpdate' onclick='CheckForSoftwareUpdates()'>Try Again</button>" + "</div>";
	    } else if(guiSoftwareStatus == SW_STATUS_UP_TO_DATE){
	        softwareUpdatePanel = softwareUpdatePanel + "<div class='versionLbl fl'>You\'re up-to-date</div><div class='doneTick'></div>";
	    } 
	
	    softwareUpdatePanel = softwareUpdatePanel + "</div></div></div></div>";
	    $('#spinnerImgContainer').css('margin-top', '8px');
	    $(softwareUpdatePanel).appendTo('#settingsDataWrapper');
	
	    //Antenna settings panel
	    if (guiAntennaFlag) {
	        var antennaSettingsPanel = "<div class='panel panel-default'>" + "<div class='panel-heading dropDown'>" + "<h4 class='panel-title'>" + "<a data-toggle='collapse' href='#collapseFour'>" + "<div><div class='settingsDropIcns' id='antennaIcn'></div>Antenna Settings</div>" + "<span class='pull-right'>" + "<span class='toggle-icon expand-more'></span>" + "</span>" + "</a>" + "</h4>" + "</div>" + "<div id='collapseFour' class='panel-collapse collapse'>" + "<div class='panel-body'>" + "<div class='antennaDetailsWrapper'>" + "<div class='antennaLbl col-xs-6'>Antenna Control:</div>" + "<div class='antennaRadioWrapper col-xs-6'>";
	        //guiAntennaManualFlag = true;
	        if (guiAntennaManualFlag) {
	            antennaSettingsPanel = antennaSettingsPanel + "<div class='radioButtonWrapper'>" + "<label class='radioBtnWrapper radioBtnUnSelected col-xs-3' for='antennaSettingAuto' id='radioAntennaAuto'></label>" + "<label for='antennaSettingAuto'><div class='boosterUnSelectedTxt' id='labelAntennaAuto'>Auto</div></label>" + "<input type='radio' name='antennaCtrl' value='auto' id='antennaSettingAuto' onchange='util.updateAntennaSetting(this.value)' />" + "</div>" + "<div class='cb'></div>" + "<div class='radioButtonWrapper'>" + "<label class='radioBtnWrapper radioBtnSelected col-xs-3' for='antennaSettingManual' id='radioAntennaManual'></label>" + "<label for='antennaSettingManual'><div class='boosterSelectedTxt' id='labelAntennaManual'>Manual</div></label>" + "<input type='radio' name='antennaCtrl' value='manual' id='antennaSettingManual' checked onchange='util.updateAntennaSetting(this.value)' />" + "</div>";
	        } else {
	            antennaSettingsPanel = antennaSettingsPanel + "<div class='radioButtonWrapper'>" + "<label class='radioBtnWrapper radioBtnSelected col-xs-3' for='antennaSettingAuto' id='radioAntennaAuto'></label>" + "<label for='antennaSettingAuto'><div class='boosterSelectedTxt' id='labelAntennaAuto'>Auto</div></label>" + "<input type='radio' name='antennaCtrl' value='auto' id='antennaSettingAuto' checked onchange='util.updateAntennaSetting(this.value)' />" + "</div>" + "<div class='cb'></div>" + "<div class='radioButtonWrapper'>" + "<label class='radioBtnWrapper radioBtnUnSelected col-xs-3' for='antennaSettingManual' id='radioAntennaManual'></label>" + "<label for='antennaSettingManual'><div class='boosterUnSelectedTxt' id='labelAntennaManual'>Manual</div></label>" + "<input type='radio' name='antennaCtrl' value='manual' id='antennaSettingManual' onchange='util.updateAntennaSetting(this.value)' />" + "</div>";
	        }
	
	        antennaSettingsPanel = antennaSettingsPanel + "</div></div><div class='hr'></div>";
	
	        for (var bandLen = 0; bandLen < guiBands.length; bandLen++) {
	            antennaSettingsPanel = antennaSettingsPanel + "<div class='antennaDetailsWrapper'><div class='antennaLbl col-xs-6' id='bandTitle_" + bandLen + "'>";
	            antennaSettingsPanel = antennaSettingsPanel + "Band " + guiBands[bandLen] + " (" + guiAntennaFreqArrayMHz[bandLen] + ")";
	            antennaSettingsPanel = antennaSettingsPanel + "</div><div class='antennaRadioWrapper col-xs-6'>";
	            if (guiAntennaIntFlags[bandLen]) {
	                antennaSettingsPanel = antennaSettingsPanel + "<div class='radioButtonWrapper'>" + "<label class='radioBtnWrapper radioBtnSelected col-xs-3' for='band_" + bandLen + "_internal' id='band_" + bandLen + "_internalBtn'></label>" + "<label for='band_" + bandLen + "_internal'><div id='band_" + bandLen + "_internalLbl' class='boosterSelectedTxt'>Internal</div></label>" + "<input type='radio' name='antennaBang" + bandLen + "' value='internal' id='band_" + bandLen + "_internal' checked onchange='util.updateBandSettings(this.value," + bandLen + ")'/>" + "</div>" + "<div class='cb'></div>" + "<div class='radioButtonWrapper'>" + "<label class='radioBtnWrapper radioBtnUnSelected col-xs-3' for='band_" + bandLen + "_external' id='band_" + bandLen + "_externalBtn'></label>" + "<label for='band_" + bandLen + "_external'><div id='band_" + bandLen + "_externalLbl' class='boosterUnSelectedTxt'>External</div></label>" + "<input type='radio' name='antennaBang" + bandLen + "' value='external' id='band_" + bandLen + "_external' onchange='util.updateBandSettings(this.value," + bandLen + ")'/>" + "</div>";
	            } else {
	                antennaSettingsPanel = antennaSettingsPanel + "<div class='radioButtonWrapper'>" + "<label class='radioBtnWrapper radioBtnUnSelected col-xs-3' for='band_" + bandLen + "_internal' id='band_" + bandLen + "_internalBtn'></label>" + "<label for='band_" + bandLen + "_internal'><div id='band_" + bandLen + "_internalLbl' class='boosterUnSelectedTxt'>Internal</div></label>" + "<input type='radio' name='antennaBang" + bandLen + "' value='internal' id='band_" + bandLen + "_internal' onchange='util.updateBandSettings(this.value," + bandLen + ")'/>" + "</div>" + "<div class='cb'></div>" + "<div class='radioButtonWrapper'>" + "<label class='radioBtnWrapper radioBtnSelected col-xs-3' for='band_" + bandLen + "_external' id='band_" + bandLen + "_externalBtn'></label>" + "<label for='band_" + bandLen + "_external'><div id='band_" + bandLen + "_externalLbl' class='boosterSelectedTxt'>External</div></label>" + "<input type='radio' name='antennaBang" + bandLen + "' value='external' id='band_" + bandLen + "_external' checked onchange='util.updateBandSettings(this.value," + bandLen + ")'/>" + "</div>";
	            }
	            antennaSettingsPanel = antennaSettingsPanel + "</div></div>";
	        }
	        antennaSettingsPanel = antennaSettingsPanel + "</div></div></div>";
	
	        $(antennaSettingsPanel).appendTo('#settingsDataWrapper');
	        util.updateAntennaBandButtons();
	    }
	
	    //Booster settings panel
	    if (guiProductType == PRODUCT_TYPE_GO && guiBoosterFlag) {
	        var boosterSettingsPanel = "<div class='panel panel-default'>" + "<div class='panel-heading dropDown'>" + "<h4 class='panel-title'>" + "<a data-toggle='collapse' href='#collapseFive'>" + "<div><div class='settingsDropIcns' id='boosterIcn'></div>Booster Settings</div>" + "<span class='pull-right'>" + "<span class='toggle-icon expand-more'></span>" + "</span>" + "</a>" + "</h4>" + "</div>" + "<div id='collapseFive' class='panel-collapse collapse'>" + "<div class='panel-body'>" + "<div id='boosterWrapper'>" + "<div class='boosterLbl'>Select by Technology:</div>" + "<div class='cb'></div>";
	
	        var boosterModeArr = ["Auto", "3G", "4G"];
	        for (var bstLen = 0; bstLen < boosterModeArr.length; bstLen++) {
	            if (guiBoosterCurrentMode == bstLen) {
	                boosterSettingsPanel = boosterSettingsPanel + "<div class='radioButtonWrapper'>"
	                				+ "<div class='col-xs-1'></div>"
	                				+ "<label class='radioBtnWrapper radioBtnSelected col-xs-1' for='boosterStng" + bstLen + "' id='boosterRadioBtn" + bstLen + "'></label>" 
	                				+ "<div id='boosterRadioLbl" + bstLen + "' class='boosterSelectedTxt'><label for='boosterStng" + bstLen + "'>" + boosterModeArr[bstLen] + "</label><input type='radio' name='technologyType' value='" + bstLen + "' id='boosterStng" + bstLen + "' checked onchange='util.changeBoosterSettings(this.value)'/></div>" 
	                				+ "</div><div class='cb'></div>";
	            } else {
	                boosterSettingsPanel = boosterSettingsPanel + "<div class='radioButtonWrapper'>"
	            	+ "<div class='col-xs-1'></div>"
    				+ "<label class='radioBtnWrapper radioBtnUnSelected col-xs-1' for='boosterStng" + bstLen + "' id='boosterRadioBtn" + bstLen + "'></label>" 
    				+ "<div id='boosterRadioLbl" + bstLen + "' class='boosterUnSelectedTxt'><label for='boosterStng" + bstLen + "'>" + boosterModeArr[bstLen] + "</label><input type='radio' name='technologyType' value='" + bstLen + "' id='boosterStng" + bstLen + "' onchange='util.changeBoosterSettings(this.value)'/></div>" 
    				+ "</div><div class='cb'></div>";
	            }
	        }
	
	        boosterSettingsPanel = boosterSettingsPanel + "<div class='boosterLbl'>Select by Band (Advanced):</div><div class='cb'></div>";
	
	        for (var bbandLen = 0; bbandLen < guiBoosterBands.length; bbandLen++) {
	        	if(guiBoosterBands[bbandLen]!==0){
		        	if(guiBoosterCurrentMode == bbandLen+3){
		        		boosterSettingsPanel = boosterSettingsPanel + "<div class='radioButtonWrapper'>"
		        		+ "<div class='col-xs-1'></div>"
	    				+ "<label class='radioBtnWrapper radioBtnSelected col-xs-1' for='boosterStng" + (bbandLen+3) + "' id='boosterRadioBtn" + (bbandLen+3) + "'></label>" 
	    				+ "<div id='boosterRadioLbl" + (bbandLen+3) + "' class='boosterSelectedTxt'><label for='boosterStng" + (bbandLen+3) + "'>Band " + guiBoosterBands[bbandLen] + "</label><input type='radio' name='technologyType' value='" + (bbandLen+3) + "' id='boosterStng" + (bbandLen+3) + "' checked onchange='util.changeBoosterSettings(this.value)' /></div>"
	    				+ "</div><div class='cb'></div>";
		        	}else{
		        		boosterSettingsPanel = boosterSettingsPanel + "<div class='radioButtonWrapper'>"
		        		+ "<div class='col-xs-1'></div>"
	    				+ "<label class='radioBtnWrapper radioBtnUnSelected col-xs-1' for='boosterStng" + (bbandLen+3) + "' id='boosterRadioBtn" + (bbandLen+3) + "'></label>" 
	    				+ "<div id='boosterRadioLbl" + (bbandLen+3) + "' class='boosterUnSelectedTxt'><label for='boosterStng" + (bbandLen+3) + "'>Band " + guiBoosterBands[bbandLen] + "</label><input type='radio' name='technologyType' value='" + (bbandLen+3) + "' id='boosterStng" + (bbandLen+3) + "' onchange='util.changeBoosterSettings(this.value)' /></div>"
	    				+ "</div><div class='cb'></div>";
		        	}
	        	}
	        }
	        boosterSettingsPanel = boosterSettingsPanel + "</div></div></div></div>";
	        $(boosterSettingsPanel).appendTo('#settingsDataWrapper');
	    }
	
	    $(document.body).on('click', '.operatorListWrapper > ul li', function(event) {
	    	var $target = $(event.currentTarget);
	        $('#operatorVal').html($target.text());
	        $('.operatorListWrapper > ul li').removeClass('selectedListVal');
	        $(this).addClass('selectedListVal');
	        var selectedIndexOperator = $target.text();
	        SelectOperator(parseInt(guiOperatorList.indexOf(selectedIndexOperator))+1);
	        event.preventdefault();
	        return false;
	    });
		$('#spinnerImgContainer').css('margin-top', '8px');
	    $('a[data-toggle="collapse"]').click(function() {
	        $(this).find('span.toggle-icon').toggleClass('expand-less expand-more');
	    });
	
	    $('.operatorList').click(function(e) {
	        e.preventDefault();
	        $('.operatorListWrapper > ul').toggle();
	    });
	
	    $('#operatorTitle').click(function(e) {
	        e.preventDefault();
	        $('.operatorListWrapper > ul').css('display', 'none');
	    });
	
	    $('.deviceList').click(function(e) {
	        e.preventDefault();
	        $('.deviceListWrapper > ul').toggle();
	    });
	
	    $('#deviceTitle').click(function(e) {
	        e.preventDefault();
	        $('.deviceListWrapper > ul').css('display', 'none');
	    });
	},
	
	loadTabletSettingsContainer: function() {
	    var bodyContainer = document.getElementById("bodyContainer");
	    var settingScreenWrapper = util.createAppendElem("div", "settingsDataWrapper", "col-sm-12", bodyContainer);
	
	    var deviceListDropDown = "";
	    var settingsScreenContents = "<div class='col-sm-6'>";
	    
	    //operator list drop dwon panel
	    if (guiOperatorFlag) {
	        var operatorListPanel = "";
	        operatorListPanel = "<div class='settingsTabViewWrapper fl'>" + "<div class='col-sm-12'>" + "<div id='operatorTitle'><div class='settingsDropIcns' id='operatorIcn'></div>Operator</div>" + "<div>" + "<div class='operatorList col-xs-8'>" + "<button type='button' class='form-control'>" + "<span data-bind='label' id='operatorVal'>" + guiOperator + "</span>" + "&nbsp;<span class='caret'></span>" + "</button>" + "<div class='operatorListWrapper'>" + "<ul>";
	
	        for (var operLen = 0; operLen < guiOperatorList.length; operLen++) {
	            if (guiOperatorList[operLen] == guiOperator) {
	                operatorListPanel = operatorListPanel + "<li class='selectedListVal'>" + guiOperatorList[operLen] + "</li>";
	            } else {
	                operatorListPanel = operatorListPanel + "<li>" + guiOperatorList[operLen] + "</li>";
	            }
	        }
	
	        operatorListPanel = operatorListPanel + "</ul></div></div></div></div></div>";
	        settingsScreenContents = settingsScreenContents + operatorListPanel;
	    }
	
	    //Software update status panel
	    var softwareUpdatePanel = "<div class='settingsTabViewWrapper fl'>" + "<div class='col-sm-12'>" + "<div><div class='settingsDropIcns' id='versionIcn'></div>Software Version</div>" + "<div id='versionWrapper'>";
	
	    var SWUpdateUIFlag = true;
	    var deViceUpdatePositiveState = "OK";
	    for (var sw = 0; sw < guiSwStatus.length; sw++) {
	        if (deViceUpdatePositiveState != guiSwStatus[sw]) {
	            SWUpdateUIFlag = false;
	            break;
	        }
	    }
	    
	    if(guiSoftwareStatus == SW_STATUS_PLEASE_UPDATE){
	        softwareUpdatePanel = softwareUpdatePanel + "<div class='versionLbl col-xs-7'>Please update your software</div><div class='form-group col-xs-4' align='right'><button type='button' class='primaryButton' id='versionUpdate' onclick='util.promptSoftwareUpdate()'>Update</button></div>";
	    } else if(guiSoftwareStatus == SW_STATUS_CHECKING){
	        softwareUpdatePanel = softwareUpdatePanel + "<div class='versionLbl fl'>Checking for updates...</div><div id='spinnerImgContainer' class='spinnerImgContainer waitLoader fl'></div>";
	    } else if(guiSoftwareStatus == SW_STATUS_UPDATE_IN_PROGRESS){
	        softwareUpdatePanel = softwareUpdatePanel + "<div class='versionLbl fl'>Update in progress...</div><div id='spinnerImgContainer' class='spinnerImgContainer waitLoader fl'></div>";
	    } else if(guiSoftwareStatus == SW_STATUS_UNKNOWN){
	        //softwareUpdatePanel = softwareUpdatePanel + "<div class='versionLbl fl'>Unknown state: Please try again later</div>";
			//softwareUpdatePanel = softwareUpdatePanel + "<div class='versionLbl'>Unknown state: Please try again later</div><div class='form-group pull-right' align='right'><button type='button' class='primaryButton' id='versionUpdate' onclick='CheckForSoftwareUpdates()'>Try Again</button></div>";
			softwareUpdatePanel = softwareUpdatePanel + "<div class='versionLbl'>Wave Cannot determine if an update is available. Please try again later</div><div class='form-group pull-right' align='right'><button type='button' class='primaryButton' id='versionUpdate' onclick='CheckForSoftwareUpdates()'>Try Again</button></div>";
			
	    } else if(guiSoftwareStatus == SW_STATUS_UP_TO_DATE){
	        softwareUpdatePanel = softwareUpdatePanel + "<div class='versionLbl fl'>You\'re up-to-date</div><div class='doneTick' align='right'></div>";
	    } 
	
	    softwareUpdatePanel = softwareUpdatePanel + "</div></div></div></div>";
	    $('#spinnerImgContainer').css('margin-top', '8px');
	    $(softwareUpdatePanel).appendTo('#settingsDataWrapper');
	
	    //Antenna settings panel
	    if (guiAntennaFlag) {
	        var antennaSettingsPanel = "<div class='settingsTabViewWrapper fl cb'>" + "<div class='col-sm-12'>" + "<div><div class='settingsDropIcns' id='antennaIcn'></div>Antenna Settings</div>" + "<div class='antennaDetailsWrapper'>" + "<div class='antennaLbl col-sm-7 fl'>" + "Antenna Control:" + "</div>" + "<div class='col-sm-5 fr'>";
	
	        if (guiAntennaManualFlag) {
	            antennaSettingsPanel = antennaSettingsPanel + "<div class='radioButtonWrapper'>" + "<label class='radioBtnWrapper radioBtnUnSelected col-sm-3' for='antennaSettingAuto' id='radioAntennaAuto'></label>" + "<label for='antennaSettingAuto'><div for='auto' class='boosterUnSelectedTxt' id='labelAntennaAuto'>Auto</div></label>" + "<input type='radio' name='antennaCtrl' value='auto' id='antennaSettingAuto' onchange='util.updateAntennaSetting(this.value)'/>" + "</div>" + "<div class='cb'></div>" + "<div class='radioButtonWrapper'>" + "<label class='radioBtnWrapper radioBtnSelected col-sm-3' for='antennaSettingManual' id='radioAntennaManual'></label>" + "<label for='antennaSettingManual'><div for='manual' class='boosterSelectedTxt' id='labelAntennaManual'>Manual</div></label>" + "<input type='radio' name='antennaCtrl' value='manual' id='antennaSettingManual' checked onchange='util.updateAntennaSetting(this.value)'/>" + "</div>";
	        } else {
	            antennaSettingsPanel = antennaSettingsPanel + "<div class='radioButtonWrapper'>" + "<label class='radioBtnWrapper radioBtnSelected col-sm-3' for='antennaSettingAuto' id='radioAntennaAuto'></label>" + "<label for='antennaSettingAuto'><div for='auto' class='boosterSelectedTxt' id='labelAntennaAuto'>Auto</div></label>" + "<input type='radio' name='antennaCtrl' value='auto' id='antennaSettingAuto' checked onchange='util.updateAntennaSetting(this.value)'/>" + "</div>" + "<div class='cb'></div>" + "<div class='radioButtonWrapper'>" + "<label class='radioBtnWrapper radioBtnUnSelected col-sm-3' for='antennaSettingManual' id='radioAntennaManual'></label>" + "<label for='antennaSettingManual'><div for='manual' class='boosterUnSelectedTxt' id='labelAntennaManual'>Manual</div></label>" + "<input type='radio' name='antennaCtrl' value='manual' id='antennaSettingManual' onchange='util.updateAntennaSetting(this.value)'/>" + "</div>";
	        }
	
	        antennaSettingsPanel = antennaSettingsPanel + "</div></div><div class='hr'></div>";
	
	        for (var bandLen = 0; bandLen < guiBands.length; bandLen++) {
	            antennaSettingsPanel = antennaSettingsPanel + "<div class='antennaDetailsWrapper'><div class='antennaLbl col-sm-7 fl' id='bandTitle_" + bandLen + "'>";
	            antennaSettingsPanel = antennaSettingsPanel + "Band " + guiBands[bandLen] + " (" + guiAntennaFreqArrayMHz[bandLen] + ")";
	            antennaSettingsPanel = antennaSettingsPanel + "</div><div class='antennaRadioWrapper col-sm-5'>";
	            if (guiAntennaIntFlags[bandLen]) {
	                antennaSettingsPanel = antennaSettingsPanel + "<div class='radioButtonWrapper'>" + "<label class='radioBtnWrapper radioBtnSelected col-sm-3' for='band_" + bandLen + "_internal' id='band_" + bandLen + "_internalBtn'></label>" + "<label for='band_" + bandLen + "_internal'><div for='band_" + bandLen + "_internal' id='band_" + bandLen + "_internalLbl' class='boosterSelectedTxt'>Internal</div></label>" + "<input type='radio' name='antennaBang" + bandLen + "' value='internal' id='band_" + bandLen + "_internal' checked onchange='util.updateBandSettings(this.value," + bandLen + ")'/>" + "</div>" + "<div class='cb'></div>" + "<div class='radioButtonWrapper'>" + "<label class='radioBtnWrapper radioBtnUnSelected col-sm-3' for='band_" + bandLen + "_external' id='band_" + bandLen + "_externalBtn'></label>" + "<label for='band_" + bandLen + "_external'><div for='band_" + bandLen + "_external' id='band_" + bandLen + "_externalLbl' class='boosterUnSelectedTxt'>External</div></label>" + "<input type='radio' name='antennaBang" + bandLen + "' value='external' id='band_" + bandLen + "_external' onchange='util.updateBandSettings(this.value," + bandLen + ")'/>" + "</div>";
	            } else {
	                antennaSettingsPanel = antennaSettingsPanel + "<div class='radioButtonWrapper'>" + "<label class='radioBtnWrapper radioBtnUnSelected col-sm-3' for='band_" + bandLen + "_internal' id='band_" + bandLen + "_internalBtn'></label>" + "<label for='band_" + bandLen + "_internal'><div for='band_" + bandLen + "_internal' id='band_" + bandLen + "_internalLbl' class='boosterUnSelectedTxt'>Internal</div></label>" + "<input type='radio' name='antennaBang" + bandLen + "' value='internal' id='band_" + bandLen + "_internal' onchange='util.updateBandSettings(this.value," + bandLen + ")'/>" + "</div>" + "<div class='cb'></div>" + "<div class='radioButtonWrapper'>" + "<label class='radioBtnWrapper radioBtnSelected col-sm-3' for='band_" + bandLen + "_external' id='band_" + bandLen + "_externalBtn'></label>" + "<label for='band_" + bandLen + "_external'><div for='band_" + bandLen + "_external' id='band_" + bandLen + "_externalLbl' class='boosterSelectedTxt'>External</div></label>" + "<input type='radio' name='antennaBang" + bandLen + "' value='external' id='band_" + bandLen + "_external' checked onchange='util.updateBandSettings(this.value," + bandLen + ")'/>" + "</div>";
	            }
	            antennaSettingsPanel = antennaSettingsPanel + "</div></div>";
	        }
	        antennaSettingsPanel = antennaSettingsPanel + "</div></div>";
	        settingsScreenContents = settingsScreenContents + antennaSettingsPanel;
	    }
	
	    var colSMTab = "</div><div class='col-sm-6'>";
	    settingsScreenContents = settingsScreenContents + colSMTab;
	    var deviceNameVar = guiSerialNumber;
    	var deviceDispPetName = "";
    	if(window.localStorage.getItem("__"+deviceNameVar)!=null){
    		deviceDispPetName = window.localStorage.getItem("__"+deviceNameVar);
    	}
	    //Device list drop down panel
	    deviceListDropDown = "<div class='settingsTabViewWrapper fr'>"
					    		+"<div class='col-sm-12'>"
					    		+"<div id='deviceTitle'>"
					    		+"<div class='settingsDropIcns' id='deviceIcn'></div>"
					    		+"Booster Name"
					    		+"</div>"
					    		+"<div id='deviceDetailsWrapper'>"
					    		+"<div id='devicesFoundLbl'>Give your Device a name</div>"
					    		+"<input type='text' id='devicePetName' class='col-sm-8' value='' maxlength='25'>"
					    		+"<div class='form-group' align='right'>"
					    		+"<button type='button' class='defaultButton fr' id='deviceUpdate' onclick='util.updateDevicePetName()'>Update</button>"
					    		+"<div class='fr' id='boosterNamedSavedMsg'></div>"
					    		+"<div class='cb'></div>"
					    		+"</div>"
					    		+"</div>"
					    		+"</div>"
					    		+"</div>";
	
	    settingsScreenContents = settingsScreenContents + deviceListDropDown;
	    
	    //Booster settings panel
	    if (guiProductType == PRODUCT_TYPE_GO && guiBoosterFlag) {
	        var boosterSettingsPanel = "<div class='settingsTabViewWrapper fr'>" + "<div class='col-sm-12'>" + "<div><div class='settingsDropIcns' id='boosterIcn'></div>Booster Settings</div>" + "<div id='boosterWrapper'>" + "<div class='boosterLbl'>Select by Technology:</div>" + "<div class='cb'></div>";
	
	        var boosterModeArr = ["Auto", "3G", "4G"];
	        for (var bstLen = 0; bstLen < boosterModeArr.length; bstLen++) {
	        	if (guiBoosterCurrentMode == bstLen) {
	                boosterSettingsPanel = boosterSettingsPanel + "<div class='radioButtonWrapper'>"
	                				+ "<label class='radioBtnWrapper radioBtnSelected col-sm-3' for='boosterStng" + bstLen + "' id='boosterRadioBtn" + bstLen + "'></label>" 
	                				+ "<div id='boosterRadioLbl" + bstLen + "' class='boosterSelectedTxt'><label for='boosterStng" + bstLen + "'>" + boosterModeArr[bstLen] + "</label><input type='radio' name='technologyType' value='" + bstLen + "' id='boosterStng" + bstLen + "' checked onchange='util.changeBoosterSettings(this.value)'/></div>" 
	                				+ "</div><div class='cb'></div>";
	            } else {
	                boosterSettingsPanel = boosterSettingsPanel + "<div class='radioButtonWrapper'>"
    				+ "<label class='radioBtnWrapper radioBtnUnSelected col-sm-3' for='boosterStng" + bstLen + "' id='boosterRadioBtn" + bstLen + "'></label>" 
    				+ "<div id='boosterRadioLbl" + bstLen + "' class='boosterUnSelectedTxt'><label for='boosterStng" + bstLen + "'>" + boosterModeArr[bstLen] + "</label><input type='radio' name='technologyType' value='" + bstLen + "' id='boosterStng" + bstLen + "' onchange='util.changeBoosterSettings(this.value)'/></div>" 
    				+ "</div><div class='cb'></div>";
	            }
	        }
	
	        boosterSettingsPanel = boosterSettingsPanel + "<div class='boosterLbl'>Select by Band (Advanced):</div><div class='cb'></div>";
	
	        for (var bbandLen = 0; bbandLen < guiBoosterBands.length; bbandLen++) {
	        	if(guiBoosterCurrentMode == bbandLen+3){
	        		boosterSettingsPanel = boosterSettingsPanel + "<div class='radioButtonWrapper'>"
    				+ "<label class='radioBtnWrapper radioBtnSelected col-sm-3' for='boosterStng" + (bbandLen+3) + "' id='boosterRadioBtn" + (bbandLen+3) + "'></label>" 
    				+ "<div id='boosterRadioLbl" + (bbandLen+3) + "' class='boosterSelectedTxt'><label for='boosterStng" + (bbandLen+3) + "'>Band " + guiBoosterBands[bbandLen] + "</label><input type='radio' name='technologyType' value='" + (bbandLen+3) + "' id='boosterStng" + (bbandLen+3) + "' checked onchange='util.changeBoosterSettings(this.value)' /></div>" 
    				+ "</div><div class='cb'></div>";
	        	}else{
	        		boosterSettingsPanel = boosterSettingsPanel + "<div class='radioButtonWrapper'>"
    				+ "<label class='radioBtnWrapper radioBtnUnSelected col-sm-3' for='boosterStng" + (bbandLen+3) + "' id='boosterRadioBtn" + (bbandLen+3) + "'></label>" 
    				+ "<div id='boosterRadioLbl" + (bbandLen+3) + "' class='boosterUnSelectedTxt'><label for='boosterStng" + (bbandLen+3) + "'>Band " + guiBoosterBands[bbandLen] + "</label><input type='radio' name='technologyType' value='" + (bbandLen+3) + "' id='boosterStng" + (bbandLen+3) + "' onchange='util.changeBoosterSettings(this.value)' /></div>" 
    				+ "</div><div class='cb'></div>";
	        	}
	        }
	
	        boosterSettingsPanel = boosterSettingsPanel + "</div></div></div>";
	
	        //$(boosterSettingsPanel).appendTo('#settingsDataWrapper');
	        settingsScreenContents = settingsScreenContents + boosterSettingsPanel;
	    }
	    var colSMTab = "</div>";
	    settingsScreenContents = settingsScreenContents + colSMTab;
	    $(settingsScreenContents).appendTo('#settingsDataWrapper');
		$('#devicePetName').val(unescape(deviceDispPetName));
	    if (guiAntennaFlag){
	    	util.updateAntennaBandButtons();
	    }
	    $('a[data-toggle="collapse"]').click(function() {
	        $(this).find('span.toggle-icon').toggleClass('glyphicon-chevron-up glyphicon-chevron-down');
	    });
	
	    $('.operatorList').click(function(e) {
	        e.preventDefault();
	        $('.operatorListWrapper > ul').toggle();
	    });
	
	    $('#operatorTitle').click(function(e) {
	        e.preventDefault();
	        $('.operatorListWrapper > ul').css('display', 'none');
	    });
	
	    $('.deviceList').click(function(e) {
	        e.preventDefault();
	        $('.deviceListWrapper > ul').toggle();
	    });
	
	    $('#deviceTitle').click(function(e) {
	        e.preventDefault();
	        $('.deviceListWrapper > ul').css('display', 'none');
	    });
	
	    $(document.body).on('click', '.operatorListWrapper > ul li', function(event) {
	    	var $target = $(event.currentTarget);
	        $('#operatorVal').html($target.text());
	        $('.operatorListWrapper > ul li').removeClass('selectedListVal');
	        $(this).addClass('selectedListVal');
	        var selectedIndexOperator = $target.text();
	        SelectOperator(parseInt(guiOperatorList.indexOf(selectedIndexOperator))+1);
	        event.preventdefault();
	        return false;
	    });
	},
	
	updateAntennaSetting: function(antSetFlag) {
	    if (antSetFlag == "auto") {
	        $('#radioAntennaAuto').removeClass('radioBtnUnSelected').addClass('radioBtnSelected');
	        $('#labelAntennaAuto').removeClass('boosterUnSelectedTxt').addClass('boosterSelectedTxt');
	        $('#radioAntennaManual').removeClass('radioBtnSelected').addClass('radioBtnUnSelected');
	        $('#labelAntennaManual').removeClass('boosterSelectedTxt').addClass('boosterUnSelectedTxt');
	        SetAntenna(0x0020);
	    } else {
	        $('#radioAntennaAuto').removeClass('radioBtnSelected').addClass('radioBtnUnSelected');
	        $('#labelAntennaAuto').removeClass('boosterSelectedTxt').addClass('boosterUnSelectedTxt');
	        $('#radioAntennaManual').removeClass('radioBtnUnSelected').addClass('radioBtnSelected');
	        $('#labelAntennaManual').removeClass('boosterUnSelectedTxt').addClass('boosterSelectedTxt');
	        SetAntenna(0x2000);
	    }
	
	    util.updateAntennaBandButtons();
	},
	
	updateAntennaBandButtons: function() {
	    //band_"+bandLen+"_internal
	    if (guiAntennaManualFlag) {
	        $('#radioAntennaAuto').removeClass('radioBtnSelected').addClass('radioBtnUnSelected');
	        $('#labelAntennaAuto').removeClass('boosterSelectedTxt').addClass('boosterUnSelectedTxt');
	        $('#radioAntennaManual').removeClass('radioBtnUnSelected').addClass('radioBtnSelected');
	        $('#labelAntennaManual').removeClass('boosterUnSelectedTxt').addClass('boosterSelectedTxt');
	        $('#antennaSettingManual').prop('checked', true);
	
	        for (var bandId = 0; bandId < guiBands.length; bandId++) {
	            if (guiBands[bandId] != 0) {
	                $('#band_' + bandId + '_internal, #band_' + bandId + '_external').attr('disabled', false);
	                $('#band_' + bandId + '_internalBtn, #band_' + bandId + '_externalBtn').removeClass('disableRadio');
	                $('#band_' + bandId + '_internalLbl, #band_' + bandId + '_externalLbl').removeClass('disableLabel');
	                $('#bandTitle_' + bandId).removeClass('disabledBandTitle');
	            } else {
	                $('#band_' + bandId + '_internal, #band_' + bandId + '_external').attr('disabled', true);
	                $('#band_' + bandId + '_internalBtn, #band_' + bandId + '_externalBtn').addClass('disableRadio');
	                $('#band_' + bandId + '_internalLbl, #band_' + bandId + '_externalLbl').addClass('disableLabel');
	                $('#bandTitle_' + bandId).addClass('disabledBandTitle');
	            }
	        }
	    } else {
	        $('#radioAntennaAuto').removeClass('radioBtnUnSelected').addClass('radioBtnSelected');
	        $('#labelAntennaAuto').removeClass('boosterUnSelectedTxt').addClass('boosterSelectedTxt');
	        $('#radioAntennaManual').removeClass('radioBtnSelected').addClass('radioBtnUnSelected');
	        $('#labelAntennaManual').removeClass('boosterSelectedTxt').addClass('boosterUnSelectedTxt');
	        $('#antennaSettingAuto').prop('checked', true);
	
	        for (var bandId = 0; bandId < guiBands.length; bandId++) {
	            $('#band_' + bandId + '_internal, #band_' + bandId + '_external').attr('disabled', true);
	            $('#band_' + bandId + '_internalBtn, #band_' + bandId + '_externalBtn').addClass('disableRadio');
	            $('#band_' + bandId + '_internalLbl, #band_' + bandId + '_externalLbl').addClass('disableLabel');
	            $('#bandTitle_' + bandId).addClass('disabledBandTitle');
	        }
	    }
	    for (var bandId = 0; bandId < guiBands.length; bandId++) {
	        if (guiAntennaIntFlags[bandId]) {
	            $('#band_' + bandId + '_internal').prop('checked', true);
	            $('#band_' + bandId + '_internalBtn').removeClass('radioBtnUnSelected').addClass('radioBtnSelected');
	            $('#band_' + bandId + '_internalLbl').removeClass('boosterUnSelectedTxt').addClass('boosterSelectedTxt');
	
	            $('#band_' + bandId + '_externalBtn').removeClass('radioBtnSelected').addClass('radioBtnUnSelected');
	            $('#band_' + bandId + '_externalLbl').removeClass('boosterSelectedTxt').addClass('boosterUnSelectedTxt');
	        } else {
	            $('#band_' + bandId + '_external').prop('checked', true);
	            $('#band_' + bandId + '_internalBtn').removeClass('radioBtnSelected').addClass('radioBtnUnSelected');
	            $('#band_' + bandId + '_internalLbl').removeClass('boosterSelectedTxt').addClass('boosterUnSelectedTxt');
	
	            $('#band_' + bandId + '_externalBtn').removeClass('radioBtnUnSelected').addClass('radioBtnSelected');
	            $('#band_' + bandId + '_externalLbl').removeClass('boosterUnSelectedTxt').addClass('boosterSelectedTxt');
	        }
	    }
	},
	
	updateBandSettings: function(bandVal, bandSettingID) {
	    var antennaBandIntValArr = [0x0002, 0x0004, 0x0008, 0x0010];
	    var antennaBandExtValArr = [0x0200, 0x0400, 0x0800, 0x1000];
	    if (bandVal == "internal") {
	        $('#band_' + bandSettingID + '_internalBtn').removeClass('radioBtnUnSelected').addClass('radioBtnSelected');
	        $('#band_' + bandSettingID + '_internalLbl').removeClass('boosterUnSelectedTxt').addClass('boosterSelectedTxt');
	
	        $('#band_' + bandSettingID + '_externalBtn').removeClass('radioBtnSelected').addClass('radioBtnUnSelected');
	        $('#band_' + bandSettingID + '_externalLbl').removeClass('boosterSelectedTxt').addClass('boosterUnSelectedTxt');
	        SetAntenna(antennaBandIntValArr[bandSettingID]);
	    } else {
	        $('#band_' + bandSettingID + '_internalBtn').removeClass('radioBtnSelected').addClass('radioBtnUnSelected');
	        $('#band_' + bandSettingID + '_internalLbl').removeClass('boosterSelectedTxt').addClass('boosterUnSelectedTxt');
	
	        $('#band_' + bandSettingID + '_externalBtn').removeClass('radioBtnUnSelected').addClass('radioBtnSelected');
	        $('#band_' + bandSettingID + '_externalLbl').removeClass('boosterUnSelectedTxt').addClass('boosterSelectedTxt');
	        SetAntenna(antennaBandExtValArr[bandSettingID]);
	    }
	},
	
	updateDevicePetName: function(){
		var devicePetName = escape(document.getElementById('devicePetName').value);
		window.localStorage.setItem('__'+guiSerialNumber, devicePetName);
		$('#boosterNamedSavedMsg').html('Saved');
		setTimeout(function(){$('#boosterNamedSavedMsg').html('');},2000);
	},
	
	dynamicSettingsPanelData: function(){
		//Dynamic update for software status panel
		if(deviceType == "phone" && swUpdateFlagPreStatus != guiSoftwareStatus){
			var softwareUpdateStatusLine = "";
			if(guiSoftwareStatus == SW_STATUS_PLEASE_UPDATE){
				softwareUpdateStatusLine = "<div class='versionLbl col-xs-7'>Please update your software</div>" + "<div class='form-group col-xs-4'>" + "<button type='button' class='primaryButton' id='versionUpdate' onclick='util.promptSoftwareUpdate()'>Update</button></div>";
		    } else if(guiSoftwareStatus == SW_STATUS_CHECKING){
		    	softwareUpdateStatusLine = "<div class='versionLbl fl'>Checking for updates...</div><div id='spinnerImgContainer' class='spinnerImgContainer waitLoader fl'></div>";
		    } else if(guiSoftwareStatus == SW_STATUS_UPDATE_IN_PROGRESS){
		    	softwareUpdateStatusLine = "<div class='versionLbl fl'>Update in progress...</div><div id='spinnerImgContainer' class='spinnerImgContainer waitLoader fl'></div>";
		    } else if(guiSoftwareStatus == SW_STATUS_UNKNOWN){
		    	//softwareUpdateStatusLine = "<div class='versionLbl'>Unknown state: Please try again later</div>" + "<div class='form-group pull-right'>" + "<button type='button' class='primaryButton' id='versionUpdate' onclick='CheckForSoftwareUpdates()'>Try Again</button></div>";
				
				softwareUpdateStatusLine = "<div class='versionLbl'>Wave Cannot determine if an update is available. Please try again later</div>" + "<div class='form-group pull-right'>" + "<button type='button' class='primaryButton' id='versionUpdate' onclick='CheckForSoftwareUpdates()'>Try Again</button></div>";
		    } else if(guiSoftwareStatus == SW_STATUS_UP_TO_DATE){
		    	softwareUpdateStatusLine = "<div class='versionLbl fl'>You\'re up-to-date</div><div class='doneTick'></div>";
		    }
			swUpdateFlagPreStatus = guiSoftwareStatus;
			$('#versionWrapper').html(softwareUpdateStatusLine);
			$('#spinnerImgContainer').css('margin-top', '8px');
		}else if(deviceType == "tablet" && swUpdateFlagPreStatus != guiSoftwareStatus){
			var softwareUpdateStatusLine = "";
			if(guiSoftwareStatus == SW_STATUS_PLEASE_UPDATE){
				softwareUpdateStatusLine = "<div class='versionLbl col-xs-7'>Please update your software</div>" + "<div class='form-group col-xs-4' align='right'>" + "<button type='button' class='primaryButton' id='versionUpdate' onclick='util.promptSoftwareUpdate()'>Update</button></div>";
		    } else if(guiSoftwareStatus == SW_STATUS_CHECKING){
		    	softwareUpdateStatusLine = "<div class='versionLbl fl'>Checking for updates...</div><div id='spinnerImgContainer' class='spinnerImgContainer waitLoader fl'></div>";
		    } else if(guiSoftwareStatus == SW_STATUS_UPDATE_IN_PROGRESS){
		    	softwareUpdateStatusLine = "<div class='versionLbl fl'>Update in progress...</div><div id='spinnerImgContainer' class='spinnerImgContainer waitLoader fl'></div>";
		    } else if(guiSoftwareStatus == SW_STATUS_UNKNOWN){
		    	//softwareUpdateStatusLine = "<div class='versionLbl'>Unknown state: Please try again later</div>" + "<div class='form-group pull-right' align='right'>" + "<button type='button' class='primaryButton' id='versionUpdate' onclick='CheckForSoftwareUpdates()'>Try Again</button></div>";
				softwareUpdateStatusLine = "<div class='versionLbl'>Wave Cannot determine if an update is available. Please try again later</div>" + "<div class='form-group pull-right' align='right'>" + "<button type='button' class='primaryButton' id='versionUpdate' onclick='CheckForSoftwareUpdates()'>Try Again</button></div>";
		    } else if(guiSoftwareStatus == SW_STATUS_UP_TO_DATE){
		    	softwareUpdateStatusLine = "<div class='versionLbl fl'>You\'re up-to-date</div><div class='doneTick' align='right'></div>";
		    }
			swUpdateFlagPreStatus = guiSoftwareStatus;
			$('#versionWrapper').html(softwareUpdateStatusLine);
			$('#spinnerImgContainer').css('margin-top', '8px');
		}
		
		
		//Dynamic Antenna settings panel
		if (guiAntennaFlag) {
			util.updateAntennaBandButtons();
		}
	},
	
	loadAdvancedContainer: function() {
		var defaultSoftwareVersion = ['UnSec Cfg', 'NU_ART', 'NU_EVM', 'NU_PIC', 'Sec Cfg', 'Bluetooth', 'NU_Ares', 'CU_ART', 'CU_PIC', 'CU_Ares'],
			goPrimeVersions = ["UnSec Cfg", "ART", "EVM", "PIC", "Sec Cfg", "Bluetooth", "Ares"];
		
	    var advancedButtonWrapper = "<div class='advancedIcnContainer col-xs-12 col-sm-12' >" + "<div id='sendIcnWrapper'>" + "<div id='sendIcn'></div>" + "<div class='advancedIcnLbl' onclick='util.sendFeedBackEmail()'>Send Log</div>" + "</div>" + "</div>";
		
		var titleArray = ['Bandwidth', 'Downlink centre freq.', 'Uplink centre freq.', 'PRI Cell ID', 'Donor RSSI', 'Donor RSCP',  'Donor EC/IO',  'Donor SINR', 	'Downlink TX power', 'Uplink TX power', 'Ext. antenna in use', 	'Uplink Safe Mode Gain', 	'Downlink System Gain', 	'Uplink System Gain', 	'Downlink Echo Gain', 	'Uplink Echo Gain'];
	    var keyParams  = ['Bandwidth', 'DL Center Freq',        'UL Center Freq',      'ID0',         'DL RSSI',    'Max DL RSCP', 'Max DL ECIO', 'SINR',       	'DL Tx Power',       'UL Tx Power',     'Ext Ant In Use', 		'UL Safe Mode Gain', 	'DL System Gain', 				'UL System Gain', 		'DL Echo Gain', 		'UL Echo Gain'];
	    var unitsArray = ['MHz',       'MHz',                   'MHz',                 '',            'dBm',        'dBm',         'dB',          'dB',				'dB',               'dB',             '', 					'dB', 					'dB', 							'dB',					'dB',					'dB'];
		var sinrIndex;	
	    var advancedHeader = "<div id='advancedContentwrapper'>" + "<div class='panel-group' id='advancedDataContainer'>";
	    var overViewContent = '';
	    overViewContent = overViewContent + "<div class='divider'>OVERVIEW</div><div class='panel panel-default col-sm-6'>";
	    overViewContent = overViewContent + "<div class='panel-heading dropDown'>" + "<h4 class='panel-title'>" + "<a data-toggle='collapse' href='#networkBarsCollapse'>" + "<div>Network Strength</div>" + "<span class='pull-right'>" + "<span class='toggle-icon expand-less'></span>" + "</span></a></h4></div>" + "<div id='networkBarsCollapse' class='panel-collapse collapse in'>" + "<div class='panel-body' id='networkDataContainer'>";
	
	    for (var i = 0; i < guiBands.length; i++) {
	        overViewContent = overViewContent + "<div class='col-xs-3 col-sm-3 networkData'>" + "<div class='networkTitle' id='networkTitle_" + i + "'>" + guiRadios[i] + "</div><div class='networkStrength'>" + "<div class='signalContainerSM' id='signalContainer_" + i + "'>";
	        if (guiBands[i] !== 0) {
	            for (var j = 1; j < 6; j++) {
	                if (j <= guiNetworkBars[i])
	                    overViewContent = overViewContent + "<div class='networkSignalIndiSM activeStatus networkBar" + j + "' id='networkBars_" + i + "_" + j + "'></div>";
	                else
	                    overViewContent = overViewContent + "<div class='networkSignalIndiSM deactiveStatus networkBar" + j + "' id='networkBars_" + i + "_" + j + "'></div>";
	            }
	        }
	        overViewContent = overViewContent + "</div></div>";
	
	        var techType = '',
	            freq = '';
	        if (guiBands[i] !== 0) {
	            techType = guiTechnologyTypes[i] === 1 ? 'LTE' : 'WCDMA';
	            freq = parseFloat(parseFloat(guiFreqArrayMHz[i]).toFixed(2)) + " MHz";
	        }
	        overViewContent = overViewContent + "<div class='networkStatus'>" + "<div class='networkStatusLbl' id='networkStatusLbl_" + i + "'>" + techType + "</div>" + "<div class='networkFreq' id='freq_" + i + "'>" + freq + "</div>" + "</div></div>";	        
	    }
	
	    overViewContent = overViewContent + "</div></div></div>";
	
	    var clearFloat = "<div class='cb'></div>";
	
	    var cellStates = ['Not Boosting', 'Boosting'];
	    var superChannelsContent = '';
	    superChannelsContent = superChannelsContent + "<div class='divider'>SUPER CHANNELS</div>";
	    for (var i = 0; i < guiBands.length; i++) {
	        var techType = guiTechnologyTypes[i] === 1 ? 'LTE' : 'WCDMA';
	        if(i==0){
	        	superChannelsContent = superChannelsContent + "<div class='firstGroup col-sm-6'>";
	        }else if(i==2){
	        	superChannelsContent = superChannelsContent + "<div class='secondGroup col-sm-6'>";
	        }
	        superChannelsContent = superChannelsContent + "<div class='panel panel-default'>";
	
	        var radioStatusColour = '';
	        var radioHeader = '';
	        if (guiBands[i] !== 0) {
	            radioStatusColour = 'drop-green';
	            radioHeader = "<div id='radioTitle_" + i + "'>Radio " + guiRadios[i] + " Band " + guiBands[i] + " : " + techType + " (" + cellStates[guiCellState[i]] + ")</div>";
	        } else {
	            radioStatusColour = 'drop-red';
	            radioHeader = "<div id='radioTitle_" + i + "'>Radio " + guiRadios[i] + " : Unused</div>";
	        }
	
	        superChannelsContent = superChannelsContent + "<div class='panel-heading " + radioStatusColour + " dropDown' id='radioBar_" + i + "'>" + "<h4 class='panel-title'>" + "<a data-toggle='collapse' href='#channel" + i + "' id='radioHeader_" + i + "'>" + radioHeader + "<span class='pull-right'>" + "<span class='toggle-icon  expand-more'></span>" + "</span></a></h4></div>";
	
	        superChannelsContent = superChannelsContent + "<div id='channel" + i + "' class='panel-collapse collapse'>" + "<div class='panel-body dropDownList' id='channel_" + i + "'>";
	        if (guiBands[i] !== 0) {
				sinrIndex = keyParams.indexOf('SINR');
	            superChannelsContent = superChannelsContent + "<div class='dropDownInnerTitle '>" + "<div class='col-xs-8 col-sm-8'>Description</div>" + "<div class='col-xs-4 col-sm-4'>Value</div>" + "</div>";
                
	            var networkMode = GetTechValue('LTE?', i);
	            if(networkMode == 1) {
	            	var rscpIndex = titleArray.indexOf('Donor RSCP');
	            	var ecioIndex = titleArray.indexOf('Donor EC/IO');
	            	if (rscpIndex > -1)
	            		titleArray[rscpIndex] = 'Donor RSRP';
	            	if (ecioIndex > -1)
	            		titleArray[ecioIndex] = 'Donor RSRQ';
					if(sinrIndex < 0) {
						titleArray.splice(sinrIndex, 0, 'Donor SINR');
	            		keyParams.splice(sinrIndex, 0, 'SINR');
	            		unitsArray.splice(sinrIndex, 0, 'dB');						
					}
	            } else {
	            	var rsrpIndex = titleArray.indexOf('Donor RSRP');
	            	var rsrqIndex = titleArray.indexOf('Donor RSRQ');
					if (rsrpIndex > -1)
	            		titleArray[rsrpIndex] = 'Donor RSCP';
	            	if (rsrqIndex > -1)
	            		titleArray[rsrqIndex] = 'Donor EC/IO';
						
	            	if (sinrIndex > -1) {
	            		titleArray.splice(sinrIndex, 1);
	            		keyParams.splice(sinrIndex, 1);
	            		unitsArray.splice(sinrIndex, 1);
	            	}
	            }											
	            for (var j = 0; j < keyParams.length; j++) {
	                var techValue = '';
                    techValue = GetTechValue(keyParams[j], i);	                
	                if(j==7)
	                	techValue = parseFloat(parseFloat(techValue).toFixed(2));
	                superChannelsContent = superChannelsContent + "<div class='dropDownListValue'>" + "<div class='col-xs-8 col-sm-8' id='channelDesc_" + i + "_" + j + "'>" + titleArray[j] + "</div>" + "<div class='col-xs-4 col-sm-4' id='channelsData_" + i + "_" + j + "'>" + techValue + " " + unitsArray[j] + "</div>" + "</div>";
	            }
	        }
	        superChannelsContent = superChannelsContent + "</div></div>";
	        superChannelsContent = superChannelsContent + "</div>";
	        if(i==1 || i==3){
	        	superChannelsContent = superChannelsContent + "</div>";
	        }
	    }
	
	    var deviceStateContent = '';
	    if (guiProductType === PRODUCT_TYPE_DUO || guiProductType === PRODUCT_TYPE_PRO) {
	        deviceStateContent = deviceStateContent + "<div class='divider'>SYSTEM OVERVIEW</div>";
	        deviceStateContent = deviceStateContent + "<div class='panel panel-default col-sm-6'>" + "<div class='panel-heading drop-purple dropDown'>" + "<h4 class='panel-title'>" + "<a data-toggle='collapse' href='#deviceStateCollapse'>" + "<div>Device State</div>" + "<span class='pull-right'>" + "<span class='toggle-icon  expand-more'></span>" + "</span></a></h4></div>" + "<div id='deviceStateCollapse' class='panel-collapse collapse'>" + "<div class='panel-body dropDownList'>" + "<div class='dropDownInnerTitle '>" + "<div class='col-xs-8 col-sm-8'>Description</div>" + "<div class='col-xs-4 col-sm-4'>Value</div></div>";
	        var deviceStates = 		['UNII Modem State',		'5MHz Downlink Freq',		'5MHz Uplink Freq', 	'Distance Metric',		'Remote Shutdown State', 		'NU Temp', 		'CU Temp', 		'NU Ctrl Chan BER', 		'CAC', 		'CU TX Power', 		'NU TX Power'],
	            deviceStateUnits = 	['', 				'MHz', 				'MHz', 				'R:-7', 					'', 							'&deg;C', 		'&deg;C', 		'%', 						'seconds', 	'dBm', 				'dBm'],
	            deviceStateKeys = 	['NU UNII State', 	'NU 5G DL', 		'NU 5G UL', 		'NU Dist Metric', 		'Remote Shutdown', 				'NU Temp', 		'CU Temp', 		'NU Ctrl Chan BER', 		'CAC', 		'CU Tx Pwr', 		'NU Tx Pwr'];
	
	        for (var i = 0; i < deviceStateKeys.length; i++) {
	            var techValue = '';
	            if (deviceStateKeys[i] == "Remote Shutdown" || deviceStateKeys[i] == "NU Temp" || deviceStateKeys[i] == "CU Temp"){
	                for (var j = 0; j < guiBands.length; j++) {
	                    if (guiBands[j] !== 0) {
	                        techValue = GetTechValue(deviceStateKeys[i], j);
	                        break;
	                    }
	                }
	            } else
	                techValue = GetTechValue(deviceStateKeys[i], 4);
//	            if (deviceStateKeys[i] == "NU Temp" || deviceStateKeys[i] == "CU Temp"){
//	                techValue = techValue * 9 / 5 + 32; // Celcius to Fahrenheit conversion
//				}
	            deviceStateContent = deviceStateContent + "<div class='dropDownListValue'>" + "<div class='col-xs-8 col-sm-8'>" + deviceStates[i] + "</div>" + "<div class='col-xs-4 col-sm-4' id='deviceStateData_" + i + "'>" + techValue + " " + deviceStateUnits[i] + "</div></div>";
	        }
	        deviceStateContent = deviceStateContent + "</div></div>";
	        deviceStateContent = deviceStateContent + "</div>";
	    }
	
	    var softwareVersionContent = '';
	    softwareVersionContent = softwareVersionContent + "<div class='divider'>DEVICE VERSION</div><div class='panel panel-default col-sm-6'>";
	
	    softwareVersionContent = softwareVersionContent + "<div class='panel-heading drop-teal dropDown'>" + "<h4 class='panel-title'>" + "<a data-toggle='collapse' href='#versionCollapse'>" + "<div>Software Versions</div>" + "<span class='pull-right'>" + "<span class='toggle-icon expand-more'></span>" + "</span></a></h4></div>" + "<div id='versionCollapse' class='panel-collapse collapse'>" + "<div class='panel-body dropDownList'>" + "<div class='dropDownInnerTitle'>" + "<div class='col-xs-3 col-sm-3'>Name</div>" + "<div class='col-xs-3 col-sm-3'>Cel-Fi</div>" + "<div class='col-xs-3 col-sm-3'>Cloud</div>" + "<div class='col-xs-3 col-sm-3'>Status</div></div>";
	    for (var i = 0; i < guiSwNames.length; i++) {
	    	if(guiSwNames[i] !== '') {
	    		var celFiVersion = '', cloudVersion = '';
		    	if (guiProductType === PRODUCT_TYPE_DUO || guiProductType === PRODUCT_TYPE_PRO) {	    		
		    		for(var j = 0; j < defaultSoftwareVersion.length; j++) {
		    			if(guiSwNames[i] === defaultSoftwareVersion[j]) {
			    			celFiVersion = guiSwCelFiVers[i] === '' ? "000.000" : guiSwCelFiVers[i];
			    		    cloudVersion = guiSwCldVers[i] === '' ? "000.000" : guiSwCldVers[i];
							softwareVersionContent = softwareVersionContent + "<div class='dropDownListValue'>" + "<div class='col-xs-3 col-sm-3'>" + guiSwNames[i] + "</div>" + "<div class='col-xs-3 col-sm-3' id='celfiVersion_" + i + "'>" + celFiVersion + "</div>" + "<div class='col-xs-3 col-sm-3' id='cloudVersion_" + i + "'>" + cloudVersion + "</div>" + "<div class='col-xs-3 col-sm-3' id='softwareStatus_" + i + "'>" + guiSwStatus[i] + "</div></div>";
		    			}
		    		}
		    	} else {
		    		for(var j = 0; j < goPrimeVersions.length; j++) {
		    			if(guiSwNames[i] === goPrimeVersions[j]) {
			    			celFiVersion = guiSwCelFiVers[i] === '' ? "000.000" : guiSwCelFiVers[i];
			    		    cloudVersion = guiSwCldVers[i] === '' ? "000.000" : guiSwCldVers[i];
							softwareVersionContent = softwareVersionContent + "<div class='dropDownListValue'>" + "<div class='col-xs-3 col-sm-3'>" + guiSwNames[i] + "</div>" + "<div class='col-xs-3 col-sm-3' id='celfiVersion_" + i + "'>" + celFiVersion + "</div>" + "<div class='col-xs-3 col-sm-3' id='cloudVersion_" + i + "'>" + cloudVersion + "</div>" + "<div class='col-xs-3 col-sm-3' id='softwareStatus_" + i + "'>" + guiSwStatus[i] + "</div></div>";
		    			}
		    		}
		    	}
		    	
	    	}	    	
	    }	
	
	    softwareVersionContent = softwareVersionContent + "</div></div>";
	    softwareVersionContent = softwareVersionContent + "</div>";
	
		var cellDetails = '';
	    cellDetails = cellDetails + "<div class='divider'>CELL DETAILS</div>";
	    for (var i = 0; i < guiBands.length; i++) {
			
	        var techType = guiTechnologyTypes[i] === 1 ? 'LTE' : 'WCDMA';
	        if(i==0){
	        	cellDetails = cellDetails + "<div class='firstGroup col-sm-6'>";
	        }else if(i==2){
	        	cellDetails = cellDetails + "<div class='secondGroup col-sm-6'>";
	        }
	        cellDetails = cellDetails + "<div class='panel panel-default'>";
	
	        var radioStatusColour = '';
			var cellTitleArray = ['ID', 'DL Freq.', 'RSCP', 	'ECIO'],
				cellUnitsArray = ['',	'MHz',		'dBm',		'dB'];
	        var radioHeader = '';
	        if (guiBands[i] !== 0) {
	            radioStatusColour = 'drop-yellow';
	            radioHeader = "<div id='cellTitle_" + i + "'>Radio " + guiRadios[i] + " Band " + guiBands[i] + " : " + techType + "</div>";
	        } else {
	            radioStatusColour = 'drop-red';
	            radioHeader = "<div id='cellTitle_" + i + "'>Radio " + guiRadios[i] + " : Unused</div>";
	        }
	
	        cellDetails = cellDetails + "<div class='panel-heading " + radioStatusColour + " dropDown' id='cellBar_" + i + "'>" + "<h4 class='panel-title'>" + "<a data-toggle='collapse' href='#cell" + i + "' id='cellHeader_" + i + "'>" + radioHeader + "<span class='pull-right'>" + "<span class='toggle-icon  expand-more'></span>" + "</span></a></h4></div>";
	
	        cellDetails = cellDetails + "<div id='cell" + i + "' class='panel-collapse collapse'>" + "<div class='panel-body dropDownList' id='cell_" + i + "'>";
	        if (guiBands[i] !== 0) {					                            
	            var networkMode = GetTechValue('LTE?', i);
	            if(networkMode == 1) {
	            	cellTitleArray[2] = 'RSRP';
					cellTitleArray[3] = 'RSRQ';
	            }											
				
				cellDetails = cellDetails + "<div class='dropDownInnerTitle '>" + "<div class='col-xs-2 col-sm-2'>" + cellTitleArray[0] + "</div>" + "<div class='col-xs-4 col-sm-4'>" + cellTitleArray[1] + "</div>" + "<div class='col-xs-3 col-sm-3'>" + cellTitleArray[2] + "</div>" + "<div class='col-xs-3 col-sm-3'>" + cellTitleArray[3] + "</div>" +"</div>";
	            for (var j = 0; j < 5; j++) {
					var idVal = GetTechValue('ID' + j, i),
						dlFreq = GetTechValue('DL Freq ' + j, i);
					var rscpVal = 0;
					var ecloVal = 0;
					if(networkMode == 1){
						rscpVal = GetTechValue(cellTitleArray[2], i);
						ecloVal = GetTechValue(cellTitleArray[3], i);
					}else{
						rscpVal = GetTechValue(cellTitleArray[2] + " " + j, i);
						ecloVal = GetTechValue(cellTitleArray[3] + " " + j, i);
					}
	                cellDetails = cellDetails + "<div class='dropDownListValue'>" + "<div class='col-xs-2 col-sm-2'>" + idVal + "</div>" + "<div class='col-xs-4 col-sm-4' id='celfiVersion_" + i + "'>" + dlFreq + " " + cellUnitsArray[1] + "</div>" + "<div class='col-xs-3 col-sm-3' id='cloudVersion_" + i + "'>" + rscpVal + " " + cellUnitsArray[2] + "</div>" + "<div class='col-xs-3 col-sm-3' id='softwareStatus_" + i + "'>" + ecloVal + " " + cellUnitsArray[3] + "</div></div>";

					if(networkMode==1 && j<1){
						break;
					}
	            }
	        }
	        cellDetails = cellDetails + "</div></div>";
	        cellDetails = cellDetails + "</div>";
	        if(i==1 || i==3){
	        	cellDetails = cellDetails + "</div>";
	        }
	    }		
	    var footer = "</div></div>";
	
	    var advancedPanelContent = advancedButtonWrapper + clearFloat + advancedHeader + overViewContent + clearFloat + superChannelsContent + clearFloat + deviceStateContent + clearFloat + softwareVersionContent + clearFloat + cellDetails + footer;
	    $('#bodyContainer').html(advancedPanelContent);
	    $('a[data-toggle="collapse"]').click(function() {
	        $(this).find('span.toggle-icon').toggleClass('expand-less expand-more');
	    });
	    
	    $('#refreshIcnWrapper').click(util.loadAdvancedContainer);
	},
	
	updateAdvancedData : function() {
	    var cellStates = ['Not Boosting', 'Boosting'],
			channelsTitleArray = ['Bandwidth', 'Downlink centre freq.', 'Uplink centre freq.', 'PRI Cell ID', 'Donor RSSI', 'Donor RSCP',  'Donor EC/IO',  'Donor SINR', 	'Downlink TX power', 'Uplink TX power', 'Ext. antenna in use', 	'Uplink Safe Mode Gain', 	'Downlink System Gain', 	'Uplink System Gain', 	'Downlink Echo Gain', 	'Uplink Echo Gain'];
			channelsKeyParams  = ['Bandwidth', 'DL Center Freq',        'UL Center Freq',      'ID0',         'DL RSSI',    'Max DL RSCP', 'Max DL ECIO', 'SINR',       	'DL Tx Power',       'UL Tx Power',     'Ext Ant In Use', 		'UL Safe Mode Gain', 	'DL System Gain', 	'UL System Gain', 	'DL Echo Gain', 	'UL Echo Gain'];
			channelsUnitsArray = ['MHz',       'MHz',                   'MHz',                 '',            'dBm',        'dBm',         'dB',          'dB',				'dB',               'dB',             '', 					'dB', 					'dB', 				'dB',				'dB',				'dB'];
			deviceStateKeys = ['NU UNII State', 	'NU 5G DL', 		'NU 5G UL', 		'NU Dist Metric', 		'Remote Shutdown', 				'NU Temp', 		'CU Temp', 		'NU Ctrl Chan BER', 		'CAC', 		'CU Tx Pwr', 		'NU Tx Pwr'],
			deviceStateUnits = ['', 				'MHz', 				'MHz', 				'R:-7', 					'', 							'&deg;C', 		'&deg;C', 		'%', 						'seconds', 	'dBm', 				'dBm'];
		var sinrIndex;
		for (var i = 0; i < guiBands.length; i++) {
			$('#networkTitle_' + i).html(guiRadios[i]);
			if (guiBands[i] !== 0) {
				for (var j = 1; j < 6; j++) {
					if($('#signalContainer_' + i).html() !== '') {
						if (j <= guiNetworkBars[i])
							$('#networkBars_' + i + '_' + j).removeClass('activeStatus deactiveStatus').addClass('activeStatus');
						else
							$('#networkBars_' + i + '_' + j).removeClass('activeStatus deactiveStatus').addClass('deactiveStatus');
					} else {
						if (j <= guiNetworkBars[i])
							$('#signalContainer_' + i).html("<div class='networkSignalIndiSM activeStatus networkBar" + j + "' id='networkBars_" + i + "_" + j + "'></div>")							
		                else
		                	$('#signalContainer_' + i).html("<div class='networkSignalIndiSM deactiveStatus networkBar" + j + "' id='networkBars_" + i + "_" + j + "'></div>")		                    
					}
				}
			} else {
				$('#signalContainer_' + i).html('');
			}
			
			var techType = '',
            	freq = '';
	        if (guiBands[i] !== 0) {
	            techType = guiTechnologyTypes[i] === 1 ? 'LTE' : 'WCDMA';	            
	            freq = parseFloat(parseFloat(guiFreqArrayMHz[i]).toFixed(2)) + " MHz";
	        }
	        $('#networkStatusLbl_' + i).html(techType);
	        $('#freq_' + i).html(freq);
	        
	        var radioStatusColour = '';
	        if (guiBands[i] !== 0) {
	            radioStatusColour = 'drop-green';
	            $('#radioTitle_' + i).html("Radio " + guiRadios[i] + " Band " + guiBands[i] + " : " + techType + " (" + cellStates[guiCellState[i]] + ")");
	        } else {
	            radioStatusColour = 'drop-red';
	            $('#radioTitle_' + i).html("Radio " + guiRadios[i] + " : Unused");
	        }
	        $('#radioBar_' + i).removeClass('drop-green drop-red').addClass(radioStatusColour);
	        
	        if (guiBands[i] !== 0) {
				sinrIndex = channelsKeyParams.indexOf('SINR');
	        	var superChannelsContent = '';
	        	var networkMode = GetTechValue('LTE?', i);
	        	if(networkMode == 1) {					
	            	var rscpIndex = channelsTitleArray.indexOf('Donor RSCP');
	            	var ecioIndex = channelsTitleArray.indexOf('Donor EC/IO');
	            	if (rscpIndex > -1)
	            		channelsTitleArray[rscpIndex] = 'Donor RSRP';
	            	if (ecioIndex > -1)
	            		channelsTitleArray[ecioIndex] = 'Donor RSRQ';
					if(sinrIndex < 0) {
						channelsTitleArray.splice(sinrIndex, 0, 'Donor SINR');
	            		channelsKeyParams.splice(sinrIndex, 0, 'SINR');
	            		channelsUnitsArray.splice(sinrIndex, 0, 'dB');						
					}
	            } else {	            	
					var rsrpIndex = channelsTitleArray.indexOf('Donor RSRP');
	            	var rsrqIndex = channelsTitleArray.indexOf('Donor RSRQ');
					if (rsrpIndex > -1)
	            		channelsTitleArray[rsrpIndex] = 'Donor RSCP';
	            	if (rsrqIndex > -1)
	            		channelsTitleArray[rsrqIndex] = 'Donor EC/IO';
	            	if (sinrIndex > -1) {
	            		channelsTitleArray.splice(sinrIndex, 1);
	            		channelsKeyParams.splice(sinrIndex, 1);
	            		channelsUnitsArray.splice(sinrIndex, 1);
	            	}
	            }
			var superChannelsContent = "<div class='dropDownInnerTitle '>" + "<div class='col-xs-8 col-sm-8'>Description</div>" + "<div class='col-xs-4 col-sm-4'>Value</div>" + "</div>";
	        	for (var j = 0; j < channelsKeyParams.length; j++) {
	                var techValue = '';
                    techValue = GetTechValue(channelsKeyParams[j], i);	                
	                if(j==7)
	                	techValue = parseFloat(parseFloat(techValue).toFixed(2));
	                superChannelsContent = superChannelsContent + "<div class='dropDownListValue'><div class='col-xs-8 col-sm-8' id='channelDesc_" + i + "_" + j + "'>" + channelsTitleArray[j] + "</div><div class='col-xs-4 col-sm-4' id='channelsData_" + i + "_" + j + "'>" + techValue + " " + channelsUnitsArray[j] + "</div></div>"	                
	        	}
	        	$('#channel_' + i).html(superChannelsContent);
	        }
		}
		if (guiProductType === PRODUCT_TYPE_DUO || guiProductType === PRODUCT_TYPE_PRO) {						
	        for (var i = 0; i < deviceStateKeys.length; i++) {
	            var techValue = '';
	            if (deviceStateKeys[i] == "Remote Shutdown" || deviceStateKeys[i] == "NU Temp" || deviceStateKeys[i] == "CU Temp"){
	                for (var j = 0; j < guiBands.length; j++) {
	                    if (guiBands[j] !== 0) {
	                        techValue = GetTechValue(deviceStateKeys[i], j);
	                        break;
	                    }
	                }
	            } else {
	                techValue = GetTechValue(deviceStateKeys[i], 4);
				}
//	            if (deviceStateKeys[i] == "NU Temp" || deviceStateKeys[i] == "CU Temp"){
//	                techValue = techValue * 9 / 5 + 32; // Celcius to Fahrenheit conversion
//				}
	            $('#deviceStateData_'+ i).html(techValue + " " + deviceStateUnits[i]);	            
	        }
        }
		for (var i = 0; i < guiSwNames.length; i++) {
			if(guiSwNames[i] !== '') {
				var celFiVersion = guiSwCelFiVers[i] === '' ? "000.000" : guiSwCelFiVers[i],
						cloudVersion = guiSwCldVers[i] === '' ? "000.000" : guiSwCldVers[i];
				$('#celfiVersion_' + i).html(celFiVersion);
				$('#cloudVersion_' + i).html(cloudVersion);
				$('#softwareStatus_' + i).html(guiSwStatus[i]);
			}
		}
		
		for (var i = 0; i < guiBands.length; i++) {
			var techType = '';
			if (guiBands[i] !== 0) {
	            techType = guiTechnologyTypes[i] === 1 ? 'LTE' : 'WCDMA';	            
	        }
			
			var cellTitleArray = ['ID', 'Downlink Freq.', 	'RSCP', 	'ECIO'],
				cellUnitsArray = ['',	'MHz',				'dBm',		'dB'];
			
			if (guiBands[i] !== 0) {
				var cellDetails = '';
	            var networkMode = GetTechValue('LTE?', i);
	            if(networkMode == 1) {
	            	cellTitleArray[2] = 'RSRP';
					cellTitleArray[3] = 'RSRQ';
					
	            }										
				
				cellDetails = cellDetails + "<div class='dropDownInnerTitle '>" + "<div class='col-xs-2 col-sm-2'>" + cellTitleArray[0] + "</div>" + "<div class='col-xs-4 col-sm-4'>" + cellTitleArray[1] + "</div>" + "<div class='col-xs-3 col-sm-3'>" + cellTitleArray[2] + "</div>" + "<div class='col-xs-3 col-sm-3'>" + cellTitleArray[3] + "</div>" +"</div>";
	            for (var j = 0; j < 5; j++) {
					var idVal = GetTechValue('ID' + j, i),
						dlFreq = GetTechValue('DL Freq ' + j, i);
					var rscpVal = 0;
					var ecloVal = 0;
					if(networkMode==1){
						rscpVal = GetTechValue(cellTitleArray[2], i);
						ecloVal = GetTechValue(cellTitleArray[3], i);
					}else{
						rscpVal = GetTechValue(cellTitleArray[2] + " " + j, i);
						ecloVal = GetTechValue(cellTitleArray[3] + " " + j, i);
					}
	                cellDetails = cellDetails + "<div class='dropDownListValue'>" + "<div class='col-xs-2 col-sm-2'>" + idVal + "</div>" + "<div class='col-xs-4 col-sm-4' id='celfiVersion_" + i + "'>" + dlFreq + " " + cellUnitsArray[1] + "</div>" + "<div class='col-xs-3 col-sm-3' id='cloudVersion_" + i + "'>" + rscpVal + " " + cellUnitsArray[2] + "</div>" + "<div class='col-xs-3 col-sm-3' id='softwareStatus_" + i + "'>" + ecloVal + " " + cellUnitsArray[3] + " </div></div>";	 
					
					if(networkMode==1 && j<1){
						break;
					}
	            }
				var radioStatusColour = '';
				if (guiBands[i] !== 0) {
					radioStatusColour = 'drop-yellow';
					$('#cellTitle_' + i).html("Radio " + guiRadios[i] + " Band " + guiBands[i] + " : " + techType);
				} else {
					radioStatusColour = 'drop-red';
					$('#cellTitle_' + i).html("Radio " + guiRadios[i] + " : Unused");
				}
				$('#cellBar_' + i).removeClass('drop-yellow drop-red').addClass(radioStatusColour);
			
				$('#cell_' + i).html(cellDetails);
			}
		}		
	},
	loadDashboardContainer: function(menuElem) {
	    /*UI element updates for Dashboard view*/
		var userDPName = window.localStorage.getItem("firstName");
	    if (userDPName===null) {
	    	$('#userDpName').html(",");
	    } else {
	        $('#userDpName').html(" " + window.localStorage.getItem("firstName") + ",");
	    }
	    var signalErrorCode = guiEsErrorCode;  // GetTechValue("NU ES Err", UNII_CHANNEL );

        // Bug 1618: If product is mobile and boost is zero and relaying then say "Things look ok" instead of "Fix it now".
	    var tempGuiBoost = guiBoost;
	    
	    if( guiMobilityFlag && (guiBoost == 0) && guiRelayingFlag )
	    {
	       // Change so that the text reads "Things look ok".
	       tempGuiBoost = 4;
	    }   

        if( nxtyRxStatusIcd <= V1_ICD )
        {
	       // If old PIC, change so that the text reads "Things look ok".
	       tempGuiBoost = 4;        
        }
        
	    if (tempGuiBoost <= 2) {
	        $('#userDeviceStatusLine').html("Looks like there's a ");
	        $('#deviceStatus').html('problem');
	        $('#deviceStatus').removeClass().addClass('problem');
	        $('#fixItContent').html('Fix it now');
			$('#fixItContent').unbind("click");
	        $('#fixItContent').bind("click",util.showFixItPopup);
	        $('#fixIt').show();
	        if(deviceType=="phone"){
	        	$('.deviceStatusCtnr, #fixIt').css('font-size', '14px');
	        }
	    } else if (tempGuiBoost >= 3 && tempGuiBoost <= 6) {
	        $('#userDeviceStatusLine').html("Things look ");
	        $('#deviceStatus').html('ok');
	        $('#deviceStatus').removeClass().addClass('ok');
	        $('#fixIt').hide();
	    } else if (tempGuiBoost >= 7 && tempGuiBoost <= 9) {
	        $('#userDeviceStatusLine').html("Things look ");
	        $('#deviceStatus').html('good');
	        $('#deviceStatus').removeClass().addClass('good');
	        $('#fixIt').hide();
	    }
	
	    if(signalErrorCode > 0){
	    	if(deviceType=="phone"){
	        	$('#userDeviceStatusLine').html("<img src='img/assets/icons/WarningRed.svg' width='15px' height='15px'>");
	        	$('.deviceStatusCtnr, #fixIt').css('font-size', '14px');
	        }else{
	        	$('#userDeviceStatusLine').html("<img src='img/assets/icons/WarningRed.svg' width='20px' height='20px'>");
	        }
	    	util.handleErrorCode(signalErrorCode);
	        $('#deviceStatus').removeClass().addClass('problem');
	        $('#fixItContent').html('More');
			$('#fixItContent').unbind("click");
		    $('#fixItContent').bind("click",util.showErrorCodePopup);
	    }
	    
	    if (guiProductType == PRODUCT_TYPE_DUO) {
	        $('#deviceTypeBG').addClass("deviceDUO");
	    } else if (guiProductType == PRODUCT_TYPE_PRO) {
	        $('#deviceTypeBG').addClass("devicePRO");
	    } else if (guiProductType == PRODUCT_TYPE_GO) {
	        $('#deviceTypeBG').addClass("deviceGO");
	    } else if (guiProductType == PRODUCT_TYPE_PRIME) {
	        $('#deviceTypeBG').addClass("devicePRIME");
	    } else {
	        $('#deviceTypeBG').addClass("devicePRO");
	    }
	
	    if(guiProductType!=""){
	    	window.localStorage.setItem('_PRDTYP',guiProductType);
	    }
	    var deviceNameVar = guiSerialNumber;
    	var deviceDispPetName = "";
    	if(window.localStorage.getItem("__"+deviceNameVar)!=null && window.localStorage.getItem("__"+deviceNameVar)!=""){
    		deviceDispPetName = unescape(window.localStorage.getItem("__"+deviceNameVar));
    	}else{
    		deviceDispPetName = guiSerialNumber;
    	}
	    $('.deviceSerialNumber').html(deviceDispPetName);
		if(boosterSignalPreVal != guiBoost){
			var gaugeContainerElem = document.getElementById('gaugeContainer');
			gaugeContainerElem.innerHTML = "";
			var canvasContainer = util.createAppendElem("canvas", "boostGauge", "", gaugeContainerElem);
			if(guiBoost >= 1){
				util.showGauge(guiBoost);
			}else{
				//util.showGaugeNoSignal();
			}
			boosterSignalPreVal = guiBoost;
			var boosterLevelContainer = util.createAppendElem("div", "boosterLevel", "", gaugeContainerElem);
			boosterLevelContainer.innerHTML = guiBoost;
		}
	    var netWorkSignalArr = ['networkSignal1', 'networkSignal2', 'networkSignal3', 'networkSignal4', 'networkSignal5'];
	    for (var b = 1; b <= 5; b++) {
	    	$('#networkSignal' + b).removeClass('activeStatus').addClass('deactiveStatus');
	    }
	    if(guiNuBars > 0){
		    for (var n = 1; n <= guiNuBars; n++) {
		        $('#networkSignal' + n).removeClass('deactiveStatus').addClass('activeStatus');
		    }
	    }
	    var operatorDPName = null;
	    if(guiOperator){
	    	operatorDPName = guiOperator;
	    }else{
	    	operatorDPName = "Unknown";
	    }
	    
	    if(operatorDPName.length > 6){
	    	switch (operatorDPName.length){
	    		case 7:
	    		$('#operatorContainer').css('font-size','34px');
	    		break;
	
	    		case 8:
	    		$('#operatorContainer').css('font-size','29px');
	    		break;
				
				case 9:
	    		$('#operatorContainer').css('font-size','26px');
	    		break;
				
				case 10:
	    		$('#operatorContainer').css('font-size','23px');
	    		break;
				
				case 11:
	    		$('#operatorContainer').css('font-size','20px');
	    		break;
				
				case 12:
	    		$('#operatorContainer').css('font-size','18px');
	    		break;
				
				default:
					if(operatorDPName.length > 40){
						operatorDPName = operatorDPName.substr(0, 40);
						operatorDPName = operatorDPName + "...";
					}
	    			$('#operatorContainer').css('font-size','18px');
	    		break;
	    	}
	    }
	    
	    $('#operatorContainer').html('<span>'+operatorDPName+'</span>');
	    
        // Bug 1661:  Only show LTE if also relaying.	    
	    var bLte = false;
	    for(var i = 0; i < guiTechnologyTypes.length; i++) 
	    {
	       if( guiTechnologyTypes[i] & guiCellState[i] )
	       {
	           bLte = true;
	           break;
	       }
	    }
	    
//	    if (guiTechnologyTypes.indexOf(1) > -1) {
        if( bLte ) {
	        $('#coverageNamecontainer').html('<span>LTE</span>');
	    } else {
	        $('#coverageNamecontainer').html('<span>3G/4G</span>');
	    }
	},
	
	handleErrorCode: function(errCode){
		var errCodeObj = null;
		switch (guiProductType){
			case PRODUCT_TYPE_DUO:
				errCodeObj = errorCodesDuo;
				break;
				
			case PRODUCT_TYPE_PRO:
				errCodeObj = errorCodesPro;
				break;
				
			case PRODUCT_TYPE_GO:
				errCodeObj = errorCodesGo;
				break;
				
			case PRODUCT_TYPE_PRIME:
				errCodeObj = errorCodesPrime;
				break;
		}
		var errMsgObj = errCodeObj["ES"+errCode];
		var errorMessage = errMsgObj.errTitle;
		$('#deviceStatus').html(errorMessage);
	},
	
	showGaugeNoSignal: function(){
		var c=document.getElementById("boostGauge");
		var ctx=c.getContext("2d");

		ctx.font="30px Roboto-Regular";
		ctx.fillStyle = "#E60038";
		ctx.fillText("No Signal",90,50);
	},
	
	showHelpMenu: function() {
        PrintLog(1, "");
        PrintLog(1, "Help key pressed-----------------------------------------------------------");
        DumpDataTables();
	    var productType = window.localStorage.getItem('_PRDTYP');
	    if (typeof productType === 'undefined' || productType == null) {
	        this.selectProductView();
	    } else {
	    	this.createModalWrapper();
		    $('#modalTitle').html('Help Center');
		    var modalHelp = "<div class='modalHelpWrapper'></div>";
		    $(modalHelp).appendTo('.modalBodyWrapper');
	        switch (productType) {
	            case PRODUCT_TYPE_DUO:
	                {
	            		util.createHelpMenu(1, "duo");
	                    break;
	                }
	            case PRODUCT_TYPE_GO:
	                {
	            		util.createHelpMenu(2, "go");
	                    break;
	                }
	            case PRODUCT_TYPE_PRIME:
	                {
	            		util.createHelpMenu(2, "prime");
	                    break;
	                }
	            case PRODUCT_TYPE_PRO:
	                {
	            		util.createHelpMenu(1, "pro");
	                    break;
	                }
	        }
	    }
	    $('.headerContainer, #bodyContainer').hide();
	    $('.modalWrapper').show();
	},
	
	showFixItPopup: function(){
		util.createModalWrapper();
	    $('#modalTitle').html('Help Center');
	    var modalHelp = "<div class='modalHelpWrapper'></div>";
	    $(modalHelp).appendTo('.modalBodyWrapper');
	    $('.modalLeftBtn').removeAttr("onclick");
	    util.removeModal();
	    var productType = window.localStorage.getItem('_PRDTYP');
	    if (typeof productType === 'undefined' || productType == null) {
	    	this.createModalWrapper();
			$('#modalTitle').html('Help Center');
			var productSelectionMenu = "<div class='modalHelpWrapper'>" + "<p class='pageTitleContainer modalContentTitle modalContentPadding'>Select your product</p>" + "<div class='modalContentPadding' onClick='util.duoTroubleShoot();'>" + "<div class='helpDeviceIcns' id='deviceDuoIcn'></div>" + "<div class='modalBodyPanelHeaderTitle'>DUO</div>" + "<div class='modalChevronRightIcns'></div>" + "</div>" + "<div class='modalContentPadding' onClick='util.goTroubleShoot();'>" + "<div class='helpDeviceIcns' id='deviceGoIcn'></div>" + "<div class='modalBodyPanelHeaderTitle'>GO</div>" + "<div class='modalChevronRightIcns'></div>" + "</div>" + "<div class='modalContentPadding' onClick='util.primeTroubleShoot();'>" + "<div class='helpDeviceIcns' id='devicePrimeIcn'></div>" + "<div class='modalBodyPanelHeaderTitle'>PRIME</div>" + "<div class='modalChevronRightIcns'></div>" + "</div>" + "<div class='modalContentPadding' onClick='util.proTroubleShoot();'>" + "<div class='helpDeviceIcns' id='deviceProIcn'></div>" + "<div class='modalBodyPanelHeaderTitle'>PRO</div>" + "<div class='modalChevronRightIcns'></div>" + "</div></div>";
			$(productSelectionMenu).appendTo('.modalBodyWrapper');
			$('.modalWrapper').show();
			
	    }else if(productType==PRODUCT_TYPE_DUO){
	    	util.duoTroubleShoot();
	    }else if(productType==PRODUCT_TYPE_PRO){
	    	util.proTroubleShoot();
	    }else if(productType==PRODUCT_TYPE_GO){
	    	util.goTroubleShoot();
	    }else if(productType==PRODUCT_TYPE_PRIME){
	    	util.primeTroubleShoot();
	    }
	    $(".modalLeftBtn").remove();
	},
	
	showErrorCodePopup: function(){
		if(guiProductType == PRODUCT_TYPE_DUO){
	    	util.duoErrorCodes();
	    }else if(guiProductType == PRODUCT_TYPE_PRO){
	    	util.proErrorCodes();
	    }else if(guiProductType == PRODUCT_TYPE_GO){
	    	util.goErrorCodes();
	    }else if(guiProductType == PRODUCT_TYPE_PRIME){
	    	util.primeErrorCodes();
	    }
		if(guiEsErrorCode > 0){
			document.getElementById("ES"+guiEsErrorCode).scrollIntoView();
			//$('.modalBodyWrapper').css("margin-top", "120px");
		}
		$(".modalLeftBtn").remove();
	},
	
	selectProductView: function() {
	    this.createModalWrapper();
	    $('#modalTitle').html('Help Center');
	    var productSelectionMenu = "<div class='modalHelpWrapper'>" + "<p class='pageTitleContainer modalContentTitle modalContentPadding'>Select your product</p>" + "<div class='modalContentPadding' onClick='util.createHelpMenu(\"1\", \"duo\");'>" + "<div class='helpDeviceIcns' id='deviceDuoIcn'></div>" + "<div class='modalBodyPanelHeaderTitle'>DUO</div>" + "<div class='modalChevronRightIcns'></div>" + "</div>" + "<div class='modalContentPadding' onClick='util.createHelpMenu(\"2\", \"go\");'>" + "<div class='helpDeviceIcns' id='deviceGoIcn'></div>" + "<div class='modalBodyPanelHeaderTitle'>GO</div>" + "<div class='modalChevronRightIcns'></div>" + "</div>" + "<div class='modalContentPadding' onClick='util.createHelpMenu(\"2\", \"prime\");'>" + "<div class='helpDeviceIcns' id='devicePrimeIcn'></div>" + "<div class='modalBodyPanelHeaderTitle'>PRIME</div>" + "<div class='modalChevronRightIcns'></div>" + "</div>" + "<div class='modalContentPadding' onClick='util.createHelpMenu(\"1\", \"pro\");'>" + "<div class='helpDeviceIcns' id='deviceProIcn'></div>" + "<div class='modalBodyPanelHeaderTitle'>PRO</div>" + "<div class='modalChevronRightIcns'></div>" + "</div></div>";
	    $(productSelectionMenu).appendTo('.modalBodyWrapper');
	    if (helpMenuDeviceType != "" && helpMenuSelectedDevice != "") {
	        util.createHelpMenu(helpMenuDeviceType, helpMenuSelectedDevice);
	        $('.modalWrapper').show();
	    }
	},
	
	createModalWrapper: function() {
	    var modalWrapper = "<div class='modalWrapper'>" + "<div class='modalHeaderWrapper' class='col-xs-12 col-sm-12'>" + "<div id='modalTitle'></div>" + "<div class='modalCloseBtn' onClick= 'util.removeModal();'></div>";
	
	    if (helpMenuDeviceType == "" && helpMenuSelectedDevice == "") {
	        modalWrapper = modalWrapper + "<div class='modalLeftBtn' onClick= 'util.removeModal();'></div>";
	    } else {
	        modalWrapper = modalWrapper + "<div class='modalLeftBtn'" + "onclick=\"util.selectProductView()\"></div>";
	    }
	    modalWrapper = modalWrapper + "</div>" + "<div class='modalBodyWrapper'></div>" + "</div>";
	    if (typeof $('.modalWrapper') !== 'undefined') {
	        $('.modalWrapper').remove();
	    }
	    //$(modalWrapper).appendTo('body');
	    $(modalWrapper).appendTo(mainContainer);
	},
	
	removeModal: function() {
	    $('.modalWrapper').remove();
	    $('.headerContainer, #bodyContainer').show();
	    
	    if($('#registrationFormContainer').length){
		$('#registrationFormContainer').show();
	    }
	},
	
	showHelpDeviceSelection: function() {
	    helpMenuDeviceType = "";
	    helpMenuSelectedDevice = "";
	    util.selectProductView();
	    $('.modalWrapper').show();
	},
	
	createHelpMenu: function(menuType, menuSelected) {
	    helpMenuDeviceType = menuType;
	    helpMenuSelectedDevice = menuSelected;
	    var title = 'Cel-Fi ' + menuSelected.toUpperCase();
	
	    $('.modalLeftBtn').removeAttr("onclick");
	    var productType = window.localStorage.getItem('_PRDTYP');
	    if (typeof productType === 'undefined' || productType == null) {
	    	$('.modalLeftBtn').click(function() {
		        util.showHelpDeviceSelection();
		    });
	    }else{
		    $('.modalLeftBtn').click(function() {
		        util.removeModal();
		    });
	    }
	    // List of menu items
	    var menuListName = ['Installation Guide', 'Troubleshooting', 'Error Codes', 'Frequently Asked Questions', 'Registration', 'Contact Us'];
	    var menuListId = ['menuInstall', 'menuTroubleShoot', 'menuErrorCodes', 'menuFaq', 'menuRegistration', 'menuContactUs'];
	
	    /**
	     * check condition for registration menu here
	     * 
	     */
	    
	    //adding menu contents here
	    var menuOptions = "<p class='pageTitleContainer modalContentTitle modalContentPadding'>" + title + "</p>";
	
	    for (var i = 0; i < menuListName.length; i++) {
	        var menu = i === 0 ? "<div class='modalContentPadding' id='" + menuListId[i] + "'>" : "<div class='modalContentPadding' id='" + menuListId[i] + "'>";
	        menu += "<div class='modalBodyPanelHeaderTitle '>" + menuListName[i] + "</div>" + "<div class='modalChevronRightIcns'></div>" + "</div>";
	        menuOptions += menu;
	    }
	
	    $('.modalHelpWrapper').html(menuOptions);
	
	    // Bind events for individual menu item
	    for (var i = 0; i < menuListId.length; i++) {
	        if (menuListId[i] === 'menuInstall') {
	            $('#' + menuListId[i]).bind("click", function() {
	                if (menuSelected === 'duo')
	                    util.duoInstallationGuide();
	                else if (menuSelected === 'pro')
	                    util.proInstallationGuide();
	                else if (menuSelected === 'prime')
	                    util.primeInstallationGuide();
	                else if (menuSelected === 'go')
	                    util.goInstallationGuide();
	            });
	        } else if (menuListId[i] === 'menuTroubleShoot') {
	            $('#' + menuListId[i]).bind("click", function() {
	                if (menuSelected === 'duo')
	                    util.duoTroubleShoot()
	                else if (menuSelected === 'pro')
	                    util.proTroubleShoot();
			else if (menuSelected === 'go')
	                    util.goTroubleShoot();
			else if (menuSelected === 'prime')
	                    util.primeTroubleShoot();
	            });
	        } else if (menuListId[i] === 'menuErrorCodes') {
	            $('#' + menuListId[i]).bind("click", function() {
	                if (menuSelected === 'duo')
	                    util.duoErrorCodes()
	                else if (menuSelected === 'pro')
	                    util.proErrorCodes();
			else if (menuSelected === 'go')
	                    util.goErrorCodes();
			else if (menuSelected === 'prime')
	                    util.primeErrorCodes();
	            });
	        } else if (menuListId[i] === 'menuFaq') {
	            $('#' + menuListId[i]).bind("click", function() {
	                util.faqDetails();
	            });
	        } else if (menuListId[i] === 'menuRegistration') {
	            $('#' + menuListId[i]).bind("click", function() {
	                util.registrationInfo();
	            });
	        } else if (menuListId[i] === 'menuContactUs') {
	            $('#' + menuListId[i]).bind("click", function() {
	                util.contactInfo();
	            });
	        }
	    }
	},
	
	duoInstallationGuide: function() {
	    this.createModalWrapper();
	    $('#modalTitle').html('Installation Guide');
	    var duoInstallGuide = "<div class='installGuideWrapper'>" + "<p class='pageTitleContainer modalContentTitle modalContentPadding'>Installation Guide for Cel-Fi DUO</p>" + "<div class='modalContentPadding'>" + "<div class='helpSubTitle installGuideContent'>STEP 1</div>" + "<div class='helpHeadLine'>Find the location with the best coverage:</div>" + "<div class='helpContent'>The first step in setting up your Cel-Fi DUO Signal Booster system is to find the location in your home or office with the best cellular signal. Use your phone to identify the area with the most bars of signal. Typically, the best service will be near a window in the highest floor of your home or office. Make sure a 3G, 4G or 4G LTE icon is displayed on your handset.</div>" + "<div class='helpSubTitle installGuideContent'>STEP 2</div>" + "<div class='helpHeadLine'>Plug in the Network Unit:</div>" + "<div class='helpContent'>Plug the Network Unit into an easily accessible outlet near the area with the strongest 3G, 4G or 4G LTE signal. (Note: the power supplies in your kit are identical.) Make sure that at least one bar is displayed on the signal strength indicator on the front of the Network Unit. If you do not see at least one bar, try a different location.</div>" + "<div class='helpSubTitle installGuideContent'>STEP 3</div>" + "<div class='helpHeadLine'>Optimize the Network Unit Placement:</div>" + "<div class='helpContent'>The bars on the front of the device indicate the strength of the cellular signal in the area. Moving the Network Unit to a different location in your home may increase the signal, and can improve the quality of your service.</div>" + "<div class='helpSubTitle installGuideContent'>STEP 4</div>" + "<div class='helpHeadLine'>Place the Coverage Unit:</div>" + "<div class='helpContent'>Move to a location in your home where you need to improve coverage. Plug the Coverage Unit into an easily accessible outlet. After several minutes, the numeric display will stop cycling.</br></br>If your device is set up properly, the green icons will appear on the display as seen above. It is possible to place the Coverage Unit too close or too far from the Network Unit. If this happens, a red icon will illuminate indicating that you need to move the Coverage Unit either closer to, or further away from the Network Unit.</div>" + "<div class='helpSubTitle installGuideContent'>STEP 5</div>" + "<div class='helpHeadLine'>Optimize The Coverage Unit Placement:</div>" + "<div class='helpContent'>Place the Coverage Unit as far away as possible from the Network Unit. The number on the front of the Coverage Unit display indicates the quality of the placement. For the best service experience, move the Coverage Unit around your home until an 8 or 9 displays.</div>" + "</div></div>";
	    $(duoInstallGuide).appendTo('.modalBodyWrapper');
	    $('.headerContainer, #bodyContainer').hide();
	    $('.modalWrapper').show();
	},
	
	duoTroubleShoot: function() {
	    this.createModalWrapper();
	    $('#modalTitle').html('TroubleShooting');
	    var duoTroubleShoot = "<div class='installGuideWrapper'><p class='pageTitleContainer modalContentTitle modalContentPadding'>Network Unit Troubleshooting</p><div class='modalContentPadding'><div class='helpHeadLine installGuideContent troubleShootSubTitle'>No Power/Red Power indicator</div><div class='helpContent'>When your system does not power up, or has a red power indicator, one of the following things could be happening. You might have a power adaptor failure, a hardware failure, or the system may need a simple restart.<br><br>Try this... Both the Coverage Unit and Network Unit have identical power supplies. Try switching the power supplies to see if one of the following issues could be occurring:<br><br><ul><li>If you switch the power supplies and the problem moves from one unit to the other unit then you are experiencing a power supply issue. Please reach out to your point of sale for a replacement power supply.</li><li>If, after switching power supplies, you still have no power on your Coverage Unit try another outlet, or another lamp/appliance in the same outlet. If you continue to have problems with the unit please reach out to your point of sale for a system replacement.</li><li>If, after switching power supplies both system are functioning properly then your Cel-Fi DUO system simply needed a restart. This is not something that should continue, but if it occurs frequently please reach out to your point of sale for support.</li></ul></div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>Numeric Display is Cycling/Rotating</div><div class='helpContent'>When your Coverage Unit displays a rotating “0” zero your system is still preforming startup procedures. This process usually takes less than 20 minutes. If it takes longer than 45 minutes, please restart both units.<br></div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>Low Number on Display (0-6)</div><div class='helpContent'>When you have a display of 0, 1, 2, 3, 4, 5, or 6 your Cel-Fi Duo system has established a connection but is not working to the fullest ability. Try this... move your units further apart. If you have a particular spot in your home that you want coverage more than others try installing your Cel-Fi system in reverse. Put your Coverage Unit where you need coverage the most then place your Network Unit at the furthest location where you can get at least 1 bar of service.<br><br>If you cannot get your systems further apart, and you have the coverage you need, a higher number is not always possible or necessary.<br><br>When you have a solid \"0\" zero display you may also see a flashing green power indicator. This display indicates that your Network Unit and Coverage Unit are \"Too Close\" together. Try moving the units further apart, starting with the Coverage Unit.<br></div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>Poor Coverage</div><div class='helpContent'>Changes to your Cel-Fi placement can be made to improve your 3G/4G/LTE coverage.<br><br><ul><li>The more bars shown on the Network Unit the better. Try moving the Network Unit to an area that has better 3G/4G/LTE coverage. If the home/office has more than 1 floor upstairs is usually better than downstairs. Putting the Network Unit near a window or higher on a shelf often helps as well.</li><li>The numeric value on the display of the Coverage Unit is an indication of the area covered. A higher number means a larger area is covered. To increase the coverage area move the Coverage Unit farther away from the Network Unit. The less obstacles in their direct line of sight the further apart you can get them. The higher the Coverage Unit number, the better the coverage.</li></ul></div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>No LTE</div><div class='helpContent'>There are a few reasons why your phone would experience an issue with the LTE service. You may not have LTE in your area, your Cel-Fi system may have lost the LTE signal due to intermittent network outages, your phone may not support LTE, or your phone may not be compatible with the frequency being boosted by the Cel-Fi DUO. You will need to check the display on your Network Unit for more information click here (Link to LTE section of Network Unit issues).<br></div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>Frequent or Intermittent \"Too Far\" </div><div class='helpContent'>Intermittent rotating/too far issues. While the number 9 is the largest distance between your Coverage Unit and your Network Unit you can have the systems slightly too far apart. This may cause you to experience intermittent interference which can cause the connection to break. Frequent or intermittent issues can be related to heavy WiFi saturation in your home/office, or obstacles that move between the two units line of sight. Make sure that each unit is as far as possible from any access points or other WiFi enabled devices. An example of a wireless device could be, but is not limited to, a wireless home phone, laptop computer, or wireless router.<br></div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>Flashing \"E\" Error Message</div><div class='helpContent'><ul><li>E1 Try this... Walk around your home/office with your cellular device. Try to find a location with at least one consistent bar of 3G/4G/LTE, more bars is always better! Once you have found a usable signal place your Network Unit (also known as Window Unit) in this location. Note: If an External Donor Antenna is installed, check the connection.</li><li>E2 Your Coverage Unit may be experiencing a hardware error that might be remedied by a reset. Try this... reset your Coverage Unit. Simply unplug your Coverage Unit for a few seconds and plug in back in. If the problem persist after a restart contact your point-of-sale for further assistance.</li><li>E3 Your Coverage Unit is overheating. Please ensure that your Coverage Unit vents are clear of any blockage, and that the location of the unit allows free flow of air. Once your Coverage Unit has cooled down it will operate as normal. Normal operating temperature of the Cel-Fi unit is 0-40 Celsius. Note:  Your Network Unit will continue to search for the Coverage Unit. Normal operating temperature of the Cel-Fi unit is 0-40 Celsius.</li><li>E4 Your Network Unit (also known as a Window Unit) is overheating. Please ensure that your Network Unit vents are clear of any blockage, and that the location of the unit allows free flow of air. If you have your Network Unit in an exceptionally warm area you may need to relocate the device to insure that the system does not continue to overheat. Once your Network Unit has cooled down it will operate as normal. Normal operating temperature of the Cel-Fi unit is 0-40 Celsius.</li><li>E5 Before use, you must register this device and have your provider's consent. You must operate this device with approved cables as specified by the manufacturer. Systems can be registered with the wave application.</li><li>E7 Your system has been disabled by the mobile network operator. Contact your point-of-sale for further assistance.</li><li>E8 Your Network Unit is too close to a cellular tower. This may result in a reduced output power (smaller coverage bubble) to limit network interference. Try this... Move your Network Unit to another location. You might need to move your system to the other side of your home.</li><li>Too close, Your Coverage Unit is \"Too Close\" to your Network Unit. Try moving the units much further apart, starting with the Coverage Unit. The more distance between the Network Unit and the Coverage Unit the large your coverage bubble will be.</li><li>Too far, Your Coverage Unit is \"Too Far\" from your Network Unit. Try moving the units slightly (5-10 feet) closer together, starting with the Coverage Unit. Intermittent \"Too Far\" message? Frequent or intermittent issues can be related to heavy WiFi saturation in your home/office. Make sure that each unit is as far as possible from any access points or WiFi enabled devices. Your Network Unit will continue to search for the Coverage Unit, resulting in a flashing power indicator. Make sure that your Network Unit is operating normally, displaying a green (flashing or solid) power indicator and green signal strength bars. If you have a red power indicator (flashing or solid) on your Network Unit please reach out to your point-of-sale for further assistance.</li></ul></div></div><br><p class='pageTitleContainer modalContentTitle modalContentPadding'>Coverage Unit Troubleshooting</p><div class='modalContentPadding'><div class='helpHeadLine installGuideContent troubleShootSubTitle'>No Power/Red Power indicator</div><div class='helpContent'>When your system does not power up, or has a red power indicator, one of the following things could be happening. You might have a power adaptor failure, a hardware failure, or the system may need a simple restart.<br><br>Try this... Both the Coverage Unit and Network Unit have identical power supplies. Try switching the power supplies to see if one of the following issues could be occurring:<br><br><ul><li>If you switch the power supplies and the problem moves from one unit to the other unit then you are experiencing a power supply issue. Please reach out to your point of sale for a replacement power supply.</li><li>If, after switching power supplies, you still have no power on your Coverage Unit try another outlet, or another lamp/appliance in the same outlet. If you continue to have problems with the unit please reach out to your point of sale for a system replacement.</li><li>If, after switching power supplies both system are functioning properly then your Cel-Fi DUO system simply needed a restart. This is not something that should continue, but if it occurs frequently please reach out to your point of sale for support.</li></ul></div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>Numeric Display is Cycling/Rotating</div><div class='helpContent'>When your Coverage Unit displays a rotating \"0\" zero your system is still preforming startup procedures. This process usually takes less than 20 minutes. If it takes longer than 45 minutes, please restart both units.</div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>Low Number on Display (0-6)</div><div class='helpContent'>When you have a display of 0, 1, 2, 3, 4, 5, or 6 your Cel-Fi Duo system has established a connection but is not working to the fullest ability. Try this... move your units further apart. If you have a particular spot in your home that you want coverage more than others try installing your Cel-Fi system in reverse. Put your Coverage Unit where you need coverage the most then place your Network Unit at the furthest location where you can get at least 1 bar of service.<br><br>If you cannot get your systems further apart, and you have the coverage you need, a higher number is not always possible or necessary.<br><br>When you have a solid \"0\" zero display you may also see a flashing green power indicator. This display indicates that your Network Unit and Coverage Unit are \"Too Close\" together. Try moving the units further apart, starting with the Coverage Unit.</div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>Poor Coverage</div><div class='helpContent'>Changes to your Cel-Fi placement can be made to improve your 3G/4G/LTE coverage.<br><br>The more bars shown on the Network Unit the better. Try moving the Network Unit to an area that has better 3G/4G/LTE coverage. If the home/office has more than 1 floor upstairs is usually better than downstairs. Putting the Network Unit near a window or higher on a shelf often helps as well.<br><br>The numeric value on the display of the Coverage Unit is an indication of the area covered. A higher number means a larger area is covered. To increase the coverage area move the Coverage Unit farther away from the Network Unit. The less obstacles in their direct line of sight the further apart you can get them. The higher the Coverage Unit number, the better the coverage.</div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>No LTE</div><div class='helpContent'>There are a few reasons why your phone would experience an issue with the LTE service. You may not have LTE in your area, your Cel-Fi system may have lost the LTE signal due to intermittent network outages, your phone may not support LTE, or your phone may not be compatible with the frequency being boosted by the Cel-Fi DUO. You will need to check the display on your Network Unit for more information <a onclick=\"window.open('https://support.cel-fi.com/hc/en-us/articles/202987756-Troubleshoot-the-Cel-Fi-Window-Network-Unit', '_system');\">click here</a>.</div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>Frequent or Intermittent \"Too Far\"</div><div class='helpContent'>Intermittent rotating/too far issues. While the number 9 is the largest distance between your Coverage Unit and your Network Unit you can have the systems slightly too far apart. This may cause you to experience intermittent interference which can cause the connection to break. Frequent or intermittent issues can be related to heavy WiFi saturation in your home/office, or obstacles that move between the two units line of sight. Make sure that each unit is as far as possible from any access points or other WiFi enabled devices. An example of a wireless device could be, but is not limited to, a wireless home phone, laptop computer, or wireless router.</div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>Flashing \"E\" Error Message</div><div class='helpContent'><ul><li>E1 The cellular signal is too weak to boost. E1 Try this... Walk around your home/office with your cellular device. Try to find a location with at least one consistent bar of 3G/4G/LTE, more bars is always better! Once you have found a usable signal place your Network Unit (also known as Window Unit) in this location. Note: If an External Donor Antenna is installed, check the connection</li><li>E2 Your Coverage Unit may be experiencing a hardware error that might be remedied by a reset. Try this... reset your Coverage Unit. Simply unplug your Coverage Unit for a few seconds and plug in back in. If the problem persist after a restart contact your point-of-sale for further assistance.</li><li>E3 Your Coverage Unit is overheating. Please ensure that your Coverage Unit vents are clear of any blockage, and that the location of the unit allows free flow of air. Once your Coverage Unit has cooled down it will operate as normal. Normal operating temperature of the Cel-Fi unit is 0-40 Celsius. Note:  Your Network Unit will continue to search for the Coverage Unit. Normal operating temperature of the Cel-Fi unit is 0-40 Celsius.</li><li>E4 Your Network Unit (also known as a Window Unit) is overheating. Please ensure that your Network Unit vents are clear of any blockage, and that the location of the unit allows free flow of air. If you have your Network Unit in an exceptionally warm area you may need to relocate the device to insure that the system does not continue to overheat. Once your Network Unit has cooled down it will operate as normal. Normal operating temperature of the Cel-Fi unit is 0-40 Celsius.</li><li>E5 Before use, you must register this device and have your provider's consent. You must operate this device with approved cables as specified by the manufacturer. Systems can be registered with the wave application.</li><li>E7 Your system has been disabled by the mobile network operator. Contact your point-of-sale for further assistance.</li><li>E8 Your Network Unit is too close to a cellular tower. This may result in a reduced output power (smaller coverage bubble) to limit network interference. Try this... Move your Network Unit to another location. You might need to move your system to the other side of your home.</li><li>Too close, Your Coverage Unit is \"Too Close\" to your Network Unit. Try moving the units much further apart, starting with the Coverage Unit. The more distance between the Network Unit and the Coverage Unit the large your coverage bubble will be.</li><li>Too far, Your Coverage Unit is \"Too Far\" from your Network Unit. Try moving the units slightly (5-10 feet) closer together, starting with the Coverage Unit. Intermittent \"Too Far\" message? Frequent or intermittent issues can be related to heavy WiFi saturation in your home/office. Make sure that each unit is as far as possible from any access points or WiFi enabled devices. Your Network Unit will continue to search for the Coverage Unit, resulting in a flashing power indicator. Make sure that your Network Unit is operating normally, displaying a green (flashing or solid) power indicator and green signal strength bars. If you have a red power indicator (flashing or solid) on your Network Unit please reach out to your point-of-sale for further assistance.</li></ul></div></div></div>";
	    $(duoTroubleShoot).appendTo('.modalBodyWrapper');
	    $('.headerContainer, #bodyContainer').hide();
	    $('.modalWrapper').show();
	},
	
	duoErrorCodes: function() {
	    this.createModalWrapper();
	    $('#modalTitle').html('Error codes');
	    //var errorCodesDuo = '<div class="errorCodeModal"><h1 id="ES2" class="modelErrorCodeSubHeader modalContentTitle">E1: "(Error 1) Not Receiving Signal"</h1><div class="errorCodeEC_DUO_1"></div><div class="errorCodeEC_DUO_2"></div><p class="modelBodyContent">The cellular signal is too weak to boost. Try this... walk around your home/office with your cellular device. Try to find a location with at least one consistent bar of 3G/4G/LTE, more bars is always better! Once you have found a usable signal place your Network Unit (also known as Window Unit) in this location. </p><p class="modelBodyContent errCodeLastP">Note: If an External Donor Antenna is installed, check the connection.</p><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES3">E2: "(Error 2) CU Hardware Error"</h1><div class="errorCodeEC_DUO_3"></div><p class="modelBodyContent">Your Coverage Unit may be experiencing a hardware error that might be remedied by a reset.</p><p class="modelBodyContent errCodeLastP">Try this... reset your Coverage Unit. Simply unplug your Coverage Unit for a few seconds and plug in back in. If the problem persists after a restart contact your point-of-sale for further assistance.</p><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES6">E3: "(Error 3) CU is overheating"</h1><div class="errorCodeEC_DUO_4"></div><p class="modelBodyContent">Your Coverage Unit is overheating. Please ensure that your Coverage Unit vents are clear of any blockage, and that the location of the unit allows free flow of air. Once your Coverage Unit has cooled down it will operate as normal. Normal operating temperature of the Cel-Fi unit is 0-40 degrees Celsius.</p><p class="modelBodyContent errCodeLastP">Note: Your Network Unit will continue to search for the Coverage Unit. Normal operating temperature of the Cel-Fi unit is 0-40 degrees Celsius.</p><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES5">E4: "(Error 4) NU is overheating"</h1><div class="errorCodeEC_DUO_1"></div><div class="errorCodeEC_DUO_5"></div><p class="modelBodyContent errCodeLastP">Your Network Unit (also known as a Window Unit) is overheating. Please ensure that your Network Unit vents are clear of any blockage, and that the location of the unit allows free flow of air. If you have your Network Unit in an exceptionally warm area you may need to relocate the device to ensure that the system does not continue to overheat. Once your Network Unit has cooled down it will operate as normal. Normal operating temperature of the Cel-Fi unit is 0-40 degrees Celsius.</p><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES11">E5: "(Error 5) Registration Required"</h1><p class="modelBodyContent errCodeLastP">Before use, you must register this device and have your provider\'s consent. You must operate this device with approved cables as specified by the manufacturer. Systems can be registered with the wave application.</p><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES1">E6: "(Error 6) NU Hardware Error"</h1><div class="errorCodeEC_DUO_1"></div><p class="modelBodyContent">Your Network Unit may be experiencing a hardware error that might be remedied by a reset. Try this... reset your Network Unit (also known as a Window Unit). Simply unplug your Network Unit for a few seconds and plug it back in. If the problem persists after a restart please contact your point-of-sale for further assistance.</p><p class="modelBodyContent errCodeLastP">If you recently updated your device, try the update again. If the error persists please contact your point of sale for further assistance.</p><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES9">E7: "(Error 7) Unit disabled by network"</h1><div class="errorCodeEC_DUO_6"></div><div class="errorCodeEC_DUO_7"></div><p class="modelBodyContent errCodeLastP">Your system has been disabled by the mobile network operator. Contact your point-of-sale for further assistance.</p><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES4">E8: "(Error 8) Input signal too strong."</h1><div class="errorCodeEC_DUO_8"></div><div class="errorCodeEC_DUO_9"></div><p class="modelBodyContent">Your Network Unit is too close to a cellular tower. This may result in a reduced output power (smaller coverage bubble) to limit network interference.</p><p class="modelBodyContent errCodeLastP">If you have satisfactory boost in cellular service you can ignore this message. Otherwise move your Network Unit to another location. You might need to move your Network Unit to the other side of your home.</p><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES10">E9: "(Error 9) Location Lock – Registration Required"</h1><p class="modelBodyContent">Your system has been moved from its original address. Please move the system back to its original location or register your new address with your wireless provider. Systems can be registered with the WAVE application.</p><p class="modelBodyContent errCodeLastP">Note: In some cases the Error 9 cannot be remedied with a registration - instead the remedy is to return the unit to its original location.</p><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES8">Too Far</h1><div class="errorCodeEC_DUO_10"></div><p class="modelBodyContent">Your Coverage Unit is "Too Far" from your Network Unit. Try moving the units slightly (5-10 feet) closer together, starting with the Coverage Unit.</p><p class="modelBodyContent">Intermittent "Too Far" message? Frequent or intermittent issues can be related to heavy WiFi saturation in your home/office. Make sure that each unit is as far as possible from any access points or WiFi enabled devices.</p><p class="modelBodyContent errCodeLastP">Your Network Unit will continue to search for the Coverage Unit, resulting in a flashing power indicator. Make sure that your Network Unit is operating normally, displaying a green (flashing or solid) power indicator and green signal strength bars. If you have a red power indicator (flashing or solid) on your Network Unit please reach out to your point-of-sale for further assistance.</p><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES7">Too Close</h1><div class="errorCodeEC_DUO_11"></div><p class="modelBodyContent errCodeLastP">Your Coverage Unit is "Too Close" to your Network Unit. Try moving the units much further apart, starting with the Coverage Unit. The more distance between the Network Unit and the Coverage Unit the large your coverage bubble will be.</p></div>';
		
		var errorCodesDuo = '<div class="errorCodeModal"><h1 id="ES2" class="modelErrorCodeSubHeader modalContentTitle">E1: "(Error 1) Not Receiving Signal"</h1><div class="errorCodeEC_DUO_1"></div><div class="errorCodeEC_DUO_2"></div><p class="modelBodyContent">The cellular signal is too weak to boost. Try this... walk around your home/office with your cellular device. Try to find a location with at least one consistent bar of 3G/4G/LTE, more bars is always better! Once you have found a usable signal place your Network Unit (also known as Window Unit) in this location. </p><p class="modelBodyContent errCodeLastP" id="ES3">Note: If an External Donor Antenna is installed, check the connection.</p><h1 class="modelErrorCodeSubHeader modalContentTitle">E2: "(Error 2) CU Hardware Error"</h1><div class="errorCodeEC_DUO_3"></div><p class="modelBodyContent">Your Coverage Unit may be experiencing a hardware error that might be remedied by a reset.</p><p class="modelBodyContent errCodeLastP" id="ES6">Try this... reset your Coverage Unit. Simply unplug your Coverage Unit for a few seconds and plug in back in. If the problem persists after a restart contact your point-of-sale for further assistance.</p><h1 class="modelErrorCodeSubHeader modalContentTitle">E3: "(Error 3) CU is overheating"</h1><div class="errorCodeEC_DUO_4"></div><p class="modelBodyContent">Your Coverage Unit is overheating. Please ensure that your Coverage Unit vents are clear of any blockage, and that the location of the unit allows free flow of air. Once your Coverage Unit has cooled down it will operate as normal. Normal operating temperature of the Cel-Fi unit is 0-40 degrees Celsius.</p><p class="modelBodyContent errCodeLastP" id="ES5">Note: Your Network Unit will continue to search for the Coverage Unit. Normal operating temperature of the Cel-Fi unit is 0-40 degrees Celsius.</p><h1 class="modelErrorCodeSubHeader modalContentTitle">E4: "(Error 4) NU is overheating"</h1><div class="errorCodeEC_DUO_1"></div><div class="errorCodeEC_DUO_5"></div><p class="modelBodyContent errCodeLastP" id="ES11">Your Network Unit (also known as a Window Unit) is overheating. Please ensure that your Network Unit vents are clear of any blockage, and that the location of the unit allows free flow of air. If you have your Network Unit in an exceptionally warm area you may need to relocate the device to ensure that the system does not continue to overheat. Once your Network Unit has cooled down it will operate as normal. Normal operating temperature of the Cel-Fi unit is 0-40 degrees Celsius.</p><h1 class="modelErrorCodeSubHeader modalContentTitle">E5: "(Error 5) Registration Required"</h1><p class="modelBodyContent errCodeLastP" id="ES1">Before use, you must register this device and have your provider\'s consent. You must operate this device with approved cables as specified by the manufacturer. Systems can be registered with the wave application.</p><h1 class="modelErrorCodeSubHeader modalContentTitle">E6: "(Error 6) NU Hardware Error"</h1><div class="errorCodeEC_DUO_1"></div><p class="modelBodyContent">Your Network Unit may be experiencing a hardware error that might be remedied by a reset. Try this... reset your Network Unit (also known as a Window Unit). Simply unplug your Network Unit for a few seconds and plug it back in. If the problem persists after a restart please contact your point-of-sale for further assistance.</p><p class="modelBodyContent errCodeLastP" id="ES9">If you recently updated your device, try the update again. If the error persists please contact your point of sale for further assistance.</p><h1 class="modelErrorCodeSubHeader modalContentTitle">E7: "(Error 7) Unit disabled by network"</h1><div class="errorCodeEC_DUO_6"></div><div class="errorCodeEC_DUO_7"></div><p class="modelBodyContent errCodeLastP" id="ES4">Your system has been disabled by the mobile network operator. Contact your point-of-sale for further assistance.</p><h1 class="modelErrorCodeSubHeader modalContentTitle">E8: "(Error 8) Input signal too strong."</h1><div class="errorCodeEC_DUO_8"></div><div class="errorCodeEC_DUO_9"></div><p class="modelBodyContent">Your Network Unit is too close to a cellular tower. This may result in a reduced output power (smaller coverage bubble) to limit network interference.</p><p class="modelBodyContent errCodeLastP" id="ES10">If you have satisfactory boost in cellular service you can ignore this message. Otherwise move your Network Unit to another location. You might need to move your Network Unit to the other side of your home.</p><h1 class="modelErrorCodeSubHeader modalContentTitle">E9: "(Error 9) Location Lock – Registration Required"</h1><p class="modelBodyContent">Your system has been moved from its original address. Please move the system back to its original location or register your new address with your wireless provider. Systems can be registered with the WAVE application.</p><p class="modelBodyContent errCodeLastP" id="ES8">Note: In some cases the Error 9 cannot be remedied with a registration - instead the remedy is to return the unit to its original location.</p><h1 class="modelErrorCodeSubHeader modalContentTitle">Too Far</h1><div class="errorCodeEC_DUO_10"></div><p class="modelBodyContent">Your Coverage Unit is "Too Far" from your Network Unit. Try moving the units slightly (5-10 feet) closer together, starting with the Coverage Unit.</p><p class="modelBodyContent">Intermittent "Too Far" message? Frequent or intermittent issues can be related to heavy WiFi saturation in your home/office. Make sure that each unit is as far as possible from any access points or WiFi enabled devices.</p><p class="modelBodyContent errCodeLastP" id="ES7">Your Network Unit will continue to search for the Coverage Unit, resulting in a flashing power indicator. Make sure that your Network Unit is operating normally, displaying a green (flashing or solid) power indicator and green signal strength bars. If you have a red power indicator (flashing or solid) on your Network Unit please reach out to your point-of-sale for further assistance.</p><h1 class="modelErrorCodeSubHeader modalContentTitle">Too Close</h1><div class="errorCodeEC_DUO_11"></div><p class="modelBodyContent errCodeLastP">Your Coverage Unit is "Too Close" to your Network Unit. Try moving the units much further apart, starting with the Coverage Unit. The more distance between the Network Unit and the Coverage Unit the large your coverage bubble will be.</p></div>';
	    $(errorCodesDuo).appendTo('.modalBodyWrapper');
	    $('.modalBodyWrapper').css('overflow-y', 'visible');
	    $('.headerContainer, #bodyContainer').hide();
	    $('.modalWrapper').show();
	},
	
	proInstallationGuide: function() {
	    this.createModalWrapper();
	    $('#modalTitle').html('Installation Guide');
	    var duoInstallGuide = "<div class='installGuideWrapper'><p class='pageTitleContainer modalContentTitle modalContentPadding'>Installation Guide for Cel-Fi PRO</p><div class='modalContentPadding'><div class='helpSubTitle installGuideContent'>STEP 1</div><div class='helpHeadLine'>Find the best cellular signal</div><div class='helpContent'>For Cel-Fi to work correctly, use your phone to find the best 3G, 4G or LTE signal. Typically, you will get the best signal upstairs near a window.</div><div class='helpSubTitle installGuideContent'>STEP 2</div><div class='helpHeadLine'>Place the Network Unit</div><div class='helpContent'>Place the Network Unit (NU) in the location where you get the best cellular signal.</div><div class='helpSubTitle installGuideContent'>STEP 3</div><div class='helpHeadLine'>Place the Coverage Unit</div><div class='helpContent'>Place the Coverage Unit (CU) in the location where you need improved coverage.</div><div class='helpSubTitle installGuideContent'>STEP 4</div><div class='helpHeadLine'>Optimize the Coverage</div><div class='helpContent'>For best results, try moving the CU around to a few different spots. Typically, the farther the units are apart, the better coverage you will have. Although, it is possible to move the units too far apart.</div></div></div>";
	    $(duoInstallGuide).appendTo('.modalBodyWrapper');
	    $('.headerContainer, #bodyContainer').hide();
	    $('.modalWrapper').show();
	},
	
	proTroubleShoot: function() {
	    this.createModalWrapper();
	    $('#modalTitle').html('TroubleShooting');
	    var proTroubleShoot = "<div class='installGuideWrapper'><p class='pageTitleContainer modalContentTitle modalContentPadding'>Coverage Unit Troubleshooting</p><div class='modalContentPadding'><div class='helpHeadLine installGuideContent troubleShootSubTitle'>No Power</div><div class='helpContent'>When your system does not to power up, or has a red power indicator, one of the following things could be happening. You might have a power adaptor failure, a hardware failure, or the system may need a simple restart.<br><br>Try this... Both the Coverage Unit and Network Unit have identical power supplies. Try switching the power supplies to see if one of the following issues could be occurring:<br><br><ul><li>If you switch the power supplies and the problem moves from one unit to the other unit then you are experiencing a power supply issue. Please reach out to your point of sale for a replacement power supply.</li><li>If, after switching power supplies, you still have no power on your Coverage Unit try another outlet, or another lamp/appliance in the same outlet. If you continue to have problems with the unit please reach out to your point of sale for a system replacement.</li><li>If, after switching power supplies both system are functioning properly then your Cel-Fi PRO system simply needed a restart. This is not something that should continue, but if it occurs frequently please reach out to your point of sale for support.</li></ul></div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>No Bars over Coverage Unit</div><div class='helpContent'>When your Coverage Unit does not have bars but your Network Unit icon does, the system is still preforming start-up producers. If it takes longer than 45 minutes, please restart both units.</div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>Low amount of bars on your Coverage Unit</div><div class='helpContent'>When you have a 1, or 2 bars on the Coverage Unit your Cel-Fi PRO system has established a connection but might not be working to the fullest ability. Try this... move your units further apart. If you have a particular spot in your home that you want coverage more than others try installing your Cel-Fi system in reverse. Put your Coverage Unit where you need coverage the most then place your Network Unit at the furthest location where you can get at least 1 bar of service.<br><br>If you cannot get your systems further apart, and you have the coverage you need, a higher number is not always possible or necessary.</div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>Poor Coverage</div><div class='helpContent'>Changes to your Cel-Fi placement can be made to improve your 3G/4G/LTE coverage.<br><br>The more bars shown on the Network Unit the better. Try moving the Network Unit to an area that has better 3G/4G/LTE coverage. If the home/office has more than 1 floor. Upstairs is usually better than downstairs. Putting the Network Unit near a window or higher on a self often helps as well.<br><br>The bar display of the Coverage Unit is an indication of the area covered. More bars on the Coverage Unit means a larger area is covered. To increase the coverage area move the Coverage Unit farther away from the Network Unit. The less obstacles in their direct line of sight the further apart you can get them. The more bars on your (replace) Coverage Unit, the better the coverage area will be.<br></div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>No LTE</div><div class='helpContent'>There are a few reasons why your phone would experience an issue with the LTE service. You may not have LTE in your area, your Cel-Fi system may have lost the LTE signal due to intermittent network outages, or your phone may not support LTE. Check to see that your phone shows an LTE signal in the location of your Network Unit.</div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>Coverage Unit (CU) Error Message</div><div class='helpContent'><ul><li>\"(Error 2) CU Hardware Error\" Your Coverage Unit may be experiencing a hardware error that might be remedied by a reset. Try this...reset your Coverage Unit. Simply unplug your Coverage Unit for a few seconds and plug in back in. If the problem persist after a restart contact your point-of-sale for further assistance.</li><li>\"(Error 3) CU is overheating\" Your Coverage Unit is overheating. Please ensure that your Coverage Unit vents are clear of any blockage, and that the location of the unit allows free flow of air. Once your Coverage Unit has cooled down it will operate as normal. Normal operating temperature of the Cel-Fi unit is 0-40 Celsius. Note:  Your Network Unit will continue to search for the Coverage Unit.</li><li>Too Close Your Coverage Unit is \"Too Close\" to your Network Unit. Try moving the units much further apart, starting with the Coverage Unit. The more distance between the Network Unit and the Coverage Unit the large your coverage bubble will be.</li><li>Too Far Your Coverage Unit is \"Too Far\" from your Network Unit. Try moving the units slightly (5-10 feet) closer together, starting with the Coverage Unit. Intermittent \"Too Far\" message? Frequent or intermittent issues can be related to heavy WiFi saturation in your home/office. Make sure that each unit is as far as possible from any access points or WiFi enabled devices. Your Network Unit will continue to search for the Coverage Unit. Make sure that your Network Unit is operating normally, with a full color display reading the same Too Far message as your Coverage Unit. If you have a different message on your Network Unit please reach out to your point-of-sale for further assistance.</li></ul></div></div><br><p class='pageTitleContainer modalContentTitle modalContentPadding'>Network Unit Troubleshooting</p><div class='modalContentPadding'><div class='helpHeadLine installGuideContent troubleShootSubTitle'>No Power</div><div class='helpContent'>When your system does not power up, one of the following things could be happening. You could have a power adaptor failure, a hardware failure, or the system could need a simple restart.<br><br>Try this... Both the Network Unit and Coverage Unit have identical power supplies. Try switching the power supplies to see if one of the following issues could be occurring:<br><br><ul><li>If you switch the power supplies and the problem moves from one unit to the other unit then you are experiencing a power supply issue. Please reach out to your point of sale for a replacement power supply.</li><li>If, after switching power supplies, you still have no power on your Network Unit try another outlet, or lamp/appliance in the same outlet. If you continue to have problems with the Network Unit please reach out to your point of sale for a system replacement.</li><li>If, after switching power supplies both system are functioning properly then your Cel-Fi PRO system simply needed a restart. This is not something that should continue, but if it occurs frequently please reach out to your point of sale for support.</li></ul></div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>No Bars on the Network Unit (NU)</div><div class='helpContent'>If you have no bars, your Network Unit is still trying to find the incoming cellular network signal. Your Network Unit may display the \"Searching for the Network...\" message. This can sometimes take more than a few minutes.<br><br>Taking longer than 60 minutes? Try this...<br><br><ul><li>Walk around your home/office with your cellular device. Try to find a signal inside your home/office with at least one consistent bar of 3G/4G/LTE. More bars is always better! Once you have found a signal place your Network Unit in that location.</li><li>If you have bars of service on your phone in the location of your Network Unit, and after 60 minutes you are still unable to receive bars of service on your Network Unit try a simple restart. To restart your Network Unit simply unplug for a moment and then plug back in. If the restart does not solve the issue please reach out to your point of sale for support.</li></ul></div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>Network Unit (NU) continues to search for the Coverage Unit (CU)</div><div class='helpContent'>Your Cel-Fi PRO has found the network and is displaying bars over the (NU) Network Unit icon, but continues to try and find a connection to the Coverage Unit (CU).<br><br>If this screen is displayed for more than 30 minutes, after your Network Unit shows bars, you could have one of the following issues with your Cel-Fi PRO system.<br><ul><li>Insure that your Coverage Unit (CU) is plugged in and has power. If your Coverage Unit does not have power click here for a link to the PRO Coverage Unit (CU) troubleshooting section.</li><li>Make sure that your Units are not too far apart. Try placing the systems 10-15 feet apart to insure they can connect. The more interference (i.e. walls, doors, refrigerators, filing cabinets) between the two units the closer they will need to be. Once you have established a connection you can optimize the displayed number by moving either unit.</li><li>Intermittent too far issues. While the number 9 is the largest distance between your Coverage Unit and your Network Unit you can have the systems slightly too far apart. This may cause you to experience intermittent interference which can cause the connection to break. Frequent or intermittent issues can be related to heavy WiFi saturation in your home/office, or obstacles that move between the two units line of sight. Make sure that each unit is as far as possible from any access points or other WiFi enabled devices. An example of a wireless device could be, but is not limited to, a wireless home phone, laptop computer, or wireless router.</li></ul></div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>Network Unit Red Error Message</div><div class='helpContent'><ul><li>\"(Error 1) Not receiving signal from the cellular network\" The cellular signal is too weak to boost. Try this...Walk around your home/office with your cellular device. Try to find a location indoors with at least one consistent bar of 3G/4G/LTE, more bars is always better! Once you have found a usable signal place your Network Unit in this location. Note: If an External Donor Antenna is installed, check the connection</li><li>\"(Error 4) NU is overheating\" Your Network Unit is overheating. Please ensure that your Network Unit vents are clear of any blockage, and that the location of the unit allows free flow of air. If you have your Network Unit in an exceptionally warm area you may need to relocate the device to insure that the system does not continue to overheat. Once your Network Unit has cooled down it will operate as normal. Normal operating temperature of the Cel-Fi unit is 0-40 Celsius.</li><li>\"(Error 5) Registration Required\" Before use, you must register this device and have your provider's consent. You must operate this device with approved cables as specified by the manufacturer. Systems can be registered with the WAVE application.</li><li>\"(Error 6) NU Hardware Error\" Your Network Unit may experiencing a hardware error that might be remedied by a reset. Try this... reset your Network Unit. Simply unplug your Network Unit for a few seconds and plug it back in. If the problem persist after a restart please contact your point-of-sale for further assistance. If you recently updated the software of your device, try again. If the error persist please contact your point of sale for further assistance.</li><li>\"(Error 7) Unit disabled by network\" Your system has been disabled by the mobile network operator. Contact your point-of-sale for further assistance.</li><li>\"(Error 8) Input signal too strong\" Your Network Unit is too close to a cellular tower. This may result in a reduced output power (smaller coverage bubble) to limit network interference. Try this... move your Network Unit to another location. You might need to move your system to the other side of your home/office.</li><li>\"(Error 9) Location Lock – Registration Required\" Your system has been moved from its original address. Please move the system back to its original location or try to register your new address with your wireless provider. Systems can be registered with the WAVE application. Note: In some cases the Error 9 cannot be remedied with a registration - instead the remedy is to return the unit to its original location. Please reach out to your point-of-sale if registration did not unlock your error 9 message.</li><li>Too Close Your Coverage Unit is Too Close to your Network Unit. Try moving the units further apart, starting with the Coverage Unit.</li><li>Too Far Your Coverage Unit is Too Far from your Network Unit. Try moving the units slightly (5-10 feet) closer together, starting with the Coverage Unit. Intermittent \"Too Far\" message? Frequent or intermittent issues can be related to heavy WiFi saturation in your home/office. Make sure that each unit is as far as possible from any access points or other WiFi enabled devices.</li></ul></div></div></div>";
	    $(proTroubleShoot).appendTo('.modalBodyWrapper');
	    $('.headerContainer, #bodyContainer').hide();
	    $('.modalWrapper').show();
	},
	
	proErrorCodes: function() {
	    this.createModalWrapper();
	    $('#modalTitle').html('Error codes');
	    //var errorCodesPro = '<div class="errorCodeModal"><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES2">E1: "(Error 1) Not Receiving Signal"</h1><div class="errorCodeEC_PRO_1"></div><p class="modelBodyContent">The cellular signal is too weak to boost. Try this... walk around your home/office with your cellular device. Try to find a location indoors with at least one consistent bar of 3G/4G/LTE, more bars is always better! Once you have found a usable signal place your Network Unit in this location.</P><p class="modelBodyContent errCodeLastP">Note: If an External Donor Antenna is installed, check the connection</P><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES3">E2: "(Error 2) CU Hardware Error"</h1><div class="errorCodeEC_PRO_2"></div><p class="modelBodyContent">Your Coverage Unit may be experiencing a hardware error that might be remedied by a reset.</p><p class="modelBodyContent errCodeLastP">Try this... reset your Coverage Unit. Simply unplug your Cover-age Unit for a few seconds and plug in back in. If the problem persist after a restart contact your point-of-sale for further assistance.</p><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES6">E3: "(Error 3) CU is overheating"</h1><div class="errorCodeEC_PRO_3"></div><p class="modelBodyContent">Your Coverage Unit is overheating. Please ensure that your Coverage Unit vents are clear of any blockage, and that the loca-tion of the unit allows free flow of air. Once your Coverage Unit has cooled down it will operate as normal. Normal operating temperature of the Cel-Fi unit is 0-40 degrees Celsius.</p><p class="modelBodyContent errCodeLastP">Note: Your Network Unit will continue to search for the Coverage Unit.</p><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES5">E4: "(Error 4) NU is overheating"</h1><div class="errorCodeEC_PRO_4"></div><p class="modelBodyContent errCodeLastP">Your Network Unit is overheating. Please ensure that your Network Unit vents are clear of any blockage, and that the location of the unit allows free flow of air. If you have your Network Unit in an exceptionally warm area you may need to relocate the device to ensure that the system does not continue to overheat. Once your Network Unit has cooled down it will operate as normal. Normal operating temperature of the Cel-Fi unit is 0-40 degrees Celsius.</P><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES11">E5: "(Error 5) Registration Required"</h1><div class="errorCodeEC_PRO_4"></div><p class="modelBodyContent errCodeLastP">Before use, you must register this device and have your provider\'s consent. You must operate this device with approved cables as specified by the manufacturer. Systems can be registered with the WAVE application.</P><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES1">E6: "(Error 6) NU Hardware Error"</h1><div class="errorCodeEC_PRO_6"></div><p class="modelBodyContent">Your Network Unit may be experiencing a hardware error that might be remedied by a reset. Try this... reset your Network Unit. Simply unplug your Network Unit for a few seconds and plug it back in. If the problem persists after a restart please con-tact your point-of-sale for further assistance.</P><p class="modelBodyContent errCodeLastP">If you recently updated your device, try the update again. If the error persists please contact your point of sale for further assistance.</P><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES9">E7: "(Error 7) Unit disabled by network"</h1><div class="errorCodeEC_PRO_7"></div><p class="modelBodyContent errCodeLastP">Your system has been disabled by the mobile network operator. Contact your point-of-sale for further assistance.</P><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES4">E8: "(Error 8) Input signal too strong"</h1><div class="errorCodeEC_PRO_8"></div><p class="modelBodyContent">Your Network Unit is too close to a cellular tower. This may re-sult in a reduced output power (smaller coverage bubble) to limit network interference.</P><p class="modelBodyContent errCodeLastP">If you have satisfactory boost in cellular service you can ignore this message. Otherwise move your Network Unit to another location. You might need to move your Network Unit to the other side of your home/office.</P><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES10">E9: "(Error 9) Location Lock – Registration Required"</h1><p class="modelBodyContent">Your system has been moved from its original address. Please move the system back to its original location or register your new address with your wireless provider. Systems can be registered with the WAVE application.</P><p class="modelBodyContent errCodeLastP">Note: In some cases the Error 9 cannot be remedied with a reg-istration - instead the remedy is to return the unit to its original location.</P><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES8">Too Far</h1><div class="errorCodeEC_PRO_9"></div><p class="modelBodyContent">Your Coverage Unit is "Too Far" from your Network Unit. Try moving the units slightly (5-10 feet) closer together, starting with the Coverage Unit.</P><p class="modelBodyContent">Intermittent "Too Far" message? Frequent or intermittent is-sues can be related to heavy WiFi saturation in your home/office. Make sure that each unit is as far as possible from any access points or WiFi enabled devices.</P><p class="modelBodyContent errCodeLastP">Your Network Unit will continue to search for the Coverage Unit. Make sure that your Network Unit is operating normally, with a full color display reading the same Too Far message as your Cov-erage Unit. If you have a different message on your Network Unit please reach out to your point-of-sale for further assis-tance.</p><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES7">Too Close</h1><div class="errorCodeEC_PRO_10"></div><p class="modelBodyContent errCodeLastP">Your Coverage Unit is "Too Close" to your Network Unit. Try moving the units much further apart, starting with the Coverage Unit. The more distance between the Network Unit and the Coverage Unit the large your coverage bubble will be.</P></div>';
		
		var errorCodesPro = '<div class="errorCodeModal"><h1 class="modelErrorCodeSubHeader modalContentTitle" id="ES2">E1: "(Error 1) Not Receiving Signal"</h1><div class="errorCodeEC_PRO_1"></div><p class="modelBodyContent">The cellular signal is too weak to boost. Try this... walk around your home/office with your cellular device. Try to find a location indoors with at least one consistent bar of 3G/4G/LTE, more bars is always better! Once you have found a usable signal place your Network Unit in this location.</P><p class="modelBodyContent errCodeLastP" id="ES3">Note: If an External Donor Antenna is installed, check the connection</P><h1 class="modelErrorCodeSubHeader modalContentTitle">E2: "(Error 2) CU Hardware Error"</h1><div class="errorCodeEC_PRO_2"></div><p class="modelBodyContent">Your Coverage Unit may be experiencing a hardware error that might be remedied by a reset.</p><p class="modelBodyContent errCodeLastP" id="ES6">Try this... reset your Coverage Unit. Simply unplug your Cover-age Unit for a few seconds and plug in back in. If the problem persist after a restart contact your point-of-sale for further assistance.</p><h1 class="modelErrorCodeSubHeader modalContentTitle">E3: "(Error 3) CU is overheating"</h1><div class="errorCodeEC_PRO_3"></div><p class="modelBodyContent">Your Coverage Unit is overheating. Please ensure that your Coverage Unit vents are clear of any blockage, and that the loca-tion of the unit allows free flow of air. Once your Coverage Unit has cooled down it will operate as normal. Normal operating temperature of the Cel-Fi unit is 0-40 degrees Celsius.</p><p class="modelBodyContent errCodeLastP" id="ES5">Note: Your Network Unit will continue to search for the Coverage Unit.</p><h1 class="modelErrorCodeSubHeader modalContentTitle">E4: "(Error 4) NU is overheating"</h1><div class="errorCodeEC_PRO_4"></div><p class="modelBodyContent errCodeLastP" id="ES11">Your Network Unit is overheating. Please ensure that your Network Unit vents are clear of any blockage, and that the location of the unit allows free flow of air. If you have your Network Unit in an exceptionally warm area you may need to relocate the device to ensure that the system does not continue to overheat. Once your Network Unit has cooled down it will operate as normal. Normal operating temperature of the Cel-Fi unit is 0-40 degrees Celsius.</P><h1 class="modelErrorCodeSubHeader modalContentTitle">E5: "(Error 5) Registration Required"</h1><div class="errorCodeEC_PRO_4"></div><p class="modelBodyContent errCodeLastP" id="ES1">Before use, you must register this device and have your provider\'s consent. You must operate this device with approved cables as specified by the manufacturer. Systems can be registered with the WAVE application.</P><h1 class="modelErrorCodeSubHeader modalContentTitle">E6: "(Error 6) NU Hardware Error"</h1><div class="errorCodeEC_PRO_6"></div><p class="modelBodyContent">Your Network Unit may be experiencing a hardware error that might be remedied by a reset. Try this... reset your Network Unit. Simply unplug your Network Unit for a few seconds and plug it back in. If the problem persists after a restart please con-tact your point-of-sale for further assistance.</P><p class="modelBodyContent errCodeLastP" id="ES9">If you recently updated your device, try the update again. If the error persists please contact your point of sale for further assistance.</P><h1 class="modelErrorCodeSubHeader modalContentTitle">E7: "(Error 7) Unit disabled by network"</h1><div class="errorCodeEC_PRO_7"></div><p class="modelBodyContent errCodeLastP" id="ES4">Your system has been disabled by the mobile network operator. Contact your point-of-sale for further assistance.</P><h1 class="modelErrorCodeSubHeader modalContentTitle">E8: "(Error 8) Input signal too strong"</h1><div class="errorCodeEC_PRO_8"></div><p class="modelBodyContent">Your Network Unit is too close to a cellular tower. This may re-sult in a reduced output power (smaller coverage bubble) to limit network interference.</P><p class="modelBodyContent errCodeLastP" id="ES10">If you have satisfactory boost in cellular service you can ignore this message. Otherwise move your Network Unit to another location. You might need to move your Network Unit to the other side of your home/office.</P><h1 class="modelErrorCodeSubHeader modalContentTitle">E9: "(Error 9) Location Lock – Registration Required"</h1><p class="modelBodyContent">Your system has been moved from its original address. Please move the system back to its original location or register your new address with your wireless provider. Systems can be registered with the WAVE application.</P><p class="modelBodyContent errCodeLastP" id="ES8">Note: In some cases the Error 9 cannot be remedied with a reg-istration - instead the remedy is to return the unit to its original location.</P><h1 class="modelErrorCodeSubHeader modalContentTitle">Too Far</h1><div class="errorCodeEC_PRO_9"></div><p class="modelBodyContent">Your Coverage Unit is "Too Far" from your Network Unit. Try moving the units slightly (5-10 feet) closer together, starting with the Coverage Unit.</P><p class="modelBodyContent">Intermittent "Too Far" message? Frequent or intermittent is-sues can be related to heavy WiFi saturation in your home/office. Make sure that each unit is as far as possible from any access points or WiFi enabled devices.</P><p class="modelBodyContent errCodeLastP" id="ES7">Your Network Unit will continue to search for the Coverage Unit. Make sure that your Network Unit is operating normally, with a full color display reading the same Too Far message as your Cov-erage Unit. If you have a different message on your Network Unit please reach out to your point-of-sale for further assis-tance.</p><h1 class="modelErrorCodeSubHeader modalContentTitle">Too Close</h1><div class="errorCodeEC_PRO_10"></div><p class="modelBodyContent errCodeLastP">Your Coverage Unit is "Too Close" to your Network Unit. Try moving the units much further apart, starting with the Coverage Unit. The more distance between the Network Unit and the Coverage Unit the large your coverage bubble will be.</P></div>';
		
	    $(errorCodesPro).appendTo('.modalBodyWrapper');
	    $('.headerContainer, #bodyContainer').hide();
	    $('.modalWrapper').show();
	},
	
	primeInstallationGuide: function() {
	    this.createModalWrapper();
	    $('#modalTitle').html('Installation Guide');
	    var primeInstallGuide = "<div class='installGuideWrapper'><p class='pageTitleContainer modalContentTitle modalContentPadding'>Installation Guide for Cel-Fi PRIME</p><div class='modalContentPadding'><div class='helpSubTitle installGuideContent'>STEP 1</div><div class='helpHeadLine'>Find the best cellular signal</div><div class='helpContent'>Use your phone to find the best cellular signal. Typically, you will get the best signal near a window.</div><div class='helpSubTitle installGuideContent'>STEP 2</div><div class='helpHeadLine'>Plan your layout</div><div class='helpContent'>Remember, the Signal Booster needs to be placed where the cellular signal is strongest. Higher on the wall is better and it needs to be mounted vertically to operate normally. There must be a power outlet within 5 meters of the Signal Booster, it works best when the Power Supply is separated by as much space as possible.</div><div class='helpSubTitle installGuideContent'>STEP 3</div><div class='helpHeadLine'>Mount the System</div><div class='helpContent'>The mounting bracket for the Signal Booster can be installed either on a flat surface or in a corner. But the system will typically work best when placed in a corner. Use either the supplied double sided tape or screw kit (you don’t need to use both). Attach the Signal Booster to the mounting bracket. Make sure the logo on the front of the device is upright.</div><div class='helpSubTitle installGuideContent'>STEP 4</div><div class='helpHeadLine'>Connect the Cable</div><div class='helpContent'>Connect the white Power Cable (supplied) to the bottom of the Signal Booster and then to the Power Supply. Plug the Power Supply into the outlet identified in Step 2. It will take the system a couple of minutes to power up and optimize itself. When you see the blue light, you are all done.</div></div></div>";
	    $(primeInstallGuide).appendTo('.modalBodyWrapper');
	    $('.headerContainer, #bodyContainer').hide();
	    $('.modalWrapper').show();
	},
	
	goInstallationGuide: function() {
	    this.createModalWrapper();
	    $('#modalTitle').html('Installation Guide');
	    var goInstallGuide = "<div class='installGuideWrapper'><p class='pageTitleContainer modalContentTitle modalContentPadding'>Installation Guide for Cel-Fi GO</p><div class='modalContentPadding'><div class='helpSubTitle installGuideContent'>STEP 1</div><div class='helpHeadLine'>Install Donor Antenna</div><div class='helpContent'>Mount your Donor Antenna on the exterior of the vehicle, towards the rear, ac-cording to its design, and the type of vehicle it's being used with. Make sure you consider the cable connection to the Cel-Fi GO unit with your location choice.</div><div class='helpContent'>Note: For best performance make sure there is 50cm of metal plane around the base of the antenna.</div><div class='helpSubTitle installGuideContent'>STEP 2</div><div class='helpHeadLine'>Install Service Antenna</div><div class='helpContent'>Install Service Antenna in the cab, towards the front, where coverage is needed. Ideally, there should be substantial material, like the metal of the roof, between the Donor and Service antennas, to improve isolation.</div><div class='helpSubTitle installGuideContent'>STEP 3</div><div class='helpHeadLine'>Mount Cel-Fi GO</div><div class='helpContent'>Find a good mounting location in your vehicle. Location should have some air-flow, and be safe from bumps and external objects.</div><div class='helpContent'>Make sure the unit is within cable range of the 12V power supply on your vehicle. Best to make sure all cable lengths support the intended mounting location BE-FORE permanent mounting.</div><div class='helpContent'>Note: DO NOT plug in at this time</div><div class='helpSubTitle installGuideContent'>STEP 4</div><div class='helpHeadLine'>Connect Antennas to the Cel-Fi GO Unit</div><div class='helpContent'>Connect the Donor Antenna to the right side connector and the Service Antenna to the left side of the Cel-Fi GO Unit.</div><div class='helpSubTitle installGuideContent'>STEP 5</div><div class='helpHeadLine'>Plug in Cel-Fi GO & Select Mode</div><div class='helpContent'>Press the MODE button on the unit to select desired scanning mode. Status Indica-tor will blink during the setup process, and may take a few minutes to complete.</div><div class='helpSubTitle installGuideContent'>Tips & Tricks</div><div class='helpContent'><ul><li>Keep Donor and Service antennas separated/ isolated from each other for best performance</li><li>Do not use cable splitters for antennas</li><li>For best performance, the cable between the Donor Antenna and GO unit should be as short as possible</li><li>Use sealant if any connections are exposed to elements</li></ul></div></div></div>";
	    $(goInstallGuide).appendTo('.modalBodyWrapper');
	    $('.headerContainer, #bodyContainer').hide();
	    $('.modalWrapper').show();
	},
	
	primeTroubleShoot: function() {
	    this.createModalWrapper();
	    $('#modalTitle').html('TroubleShooting');
	    var primeTroubleShoot = "<div class='installGuideWrapper'><p class='pageTitleContainer modalContentTitle modalContentPadding'>PRIME Troubleshooting</p><div class='modalContentPadding'><div class='helpHeadLine installGuideContent troubleShootSubTitle'>No Power/No lights on the PRIME Signal Booster</div><div class='helpContent'>Make sure that you power source is a functional power source. Test something else, that you know works in the same power source, or try moving the PRIME to another power source that you have confirmed has working power.<br><br>Still Not Working? It is possible that you have a bad power supply, or malfunction of your PRIME Signal Booster hard-ware. Please reach out to your point of sale for further instructions.</div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>My Status Indicator is blinking blue</div><div class='helpContent'>A blinking blue status indicator means that your Cel-Fi PRIME is still in the startup process. Depending on the complexity of your cellular network, this process can take some time. If the Signal Booster’s Status Indicator continues to blink for more than 30 minutes please attempt a restart.</div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>My Status Indicator is Solid blue but my phone still has poor signal</div><div class='helpContent'>If your Cel-Fi PRIME Signal Booster has a solid Status Indicator with a blue light, the system is fully functional.<br>If your system has a solid blue status light but your phone is not picking up a stronger cellular signal you might need to check the power cable connections and your phones compatibility with the selected network. <br><br>Some cellular devices use combination of many different factor to calculate the number of “bars” displayed. To deter-mine if your signal strength is stronger you can look for your signal strength while PRIME is plugged in and not plugged in. For more information please reach out to your point-of-sale or visit <a onclick=\ 'window.open('http://www.cel-fi.com/phonebars', '_system');\'>www.cel-fi.com/phonebars</a>.</div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>My Status Indicator is Flashing Red</div><div class='helpContent'>There are several reason why your status indicator would be flashing red. The best way to determine the specific reason for your flashing light is to use the WAVE Mobile or Desktop application while connected to your device. For more information about Cel-Fi WAVE please visit <a onclick=\ 'window.open('http://www.cel-fi.com/wave', '_system');\'>www.cel-fi.com/wave</a><br><br><ul><li>E1 Not Receiving Signal: The cellular signal is too weak to boost. Using your cellular device, try to find a location with at least one consistent bar of 3G, 4G or 4G LTE. More bars is always better! Once you have found a usable signal, place your Signal Booster in this location.</li><li>E5 Registration Required: Before use, you must register this device with your wireless provider and have your provider's consent. You must operate this device with approved antennas and cables as specified by the manufacturer.</li><li>E7 PRIME has been disabled by network: Your system has been disabled by the mobile network operator. Contact your point-of-sale for further assistance.</li><li>E8 Input signal too strong: Your Signal Booster is too close to a cellular tower. This may result in a reduced output power (smaller coverage bubble) to limit network interference. Try this…move your Signal Booster to another physical location.</li><li>E9 Location Lock – Registration Required: Your system has been moved from its original address. Please move the system back to its original location or register your new address with your wireless provider. Systems can be registered via the WAVE application.</li><li>Too Close: Your Power Supply is Too Close to your Signal Booster. Try moving the antennas further apart, starting with the Power Supply.</li></ul></div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>My Status Indicator is Solid Red</div><div class='helpContent'>There are several reason why your status light would be solid red. The best way to determine the specific reason for your flashing light is to use the WAVE Mobile or Desktop application while connected to your device. For more information about Cel-Fi WAVE please visit <a onclick=\ 'window.open('http://www.cel-fi.com/wave', '_system');\">www.cel-fi.com/wave</a><br><br><ul><li>E4 PRIME Signal Booster is overheating: Your Signal Booster is overheating. Please ensure that your Signal Booster is clear of any blockage. If you have your PRIME in an exceptionally warm area you may need to relocate the device to ensure that the Signal Booster does not continue to overheat. Once PRIME has cooled it will operate as normal. *Normal operating temperature of the Cel-Fi Signal Booster is 0-65 Celsius.</li><li>E6 Hardware error: Your PRIME Signal Booster is experiencing a hardware failure. Try this…Reset your Signal Booster. To do this simply unplug your Power Supply from the power source for a few seconds and plug it back in. If the problem persist after a restart please contact your point-of-sale for further assistance. *If you recently updated the software of your device, try again. If the error persist please contact your point of sale for further assistance.</li><li>E12 Self-Test Failed: During a system check a part of your Signal Booster’s configuration has reported less than optimal performance. The system could be displaying a non-critical error message. If you have a boost in cellular service at your service antenna you can ignore the E12 message. If you do not have boosted signal, check to confirm that both your service antenna and donor antenna are properly connected and functional.  If the antennas checkout, the boost number on the Signal Booster is high and you still don’t have a boosted signal try restarting the Signal Booster.  If the problem persist after a restart please contact your point-of-sale for further assistance.  *If you recently updated the software of your device, try again. If the error persist please contact your point of sale for further assistance.</li></ul></div></div> </div>";
	    $(primeTroubleShoot).appendTo('.modalBodyWrapper');
	    $('.headerContainer, #bodyContainer').hide();
	    $('.modalWrapper').show();
	},
	
	goTroubleShoot: function() {
	    this.createModalWrapper();
	    $('#modalTitle').html('TroubleShooting');
	    var goTroubleShoot = "<div class='installGuideWrapper'><p class='pageTitleContainer modalContentTitle modalContentPadding'>GO Troubleshooting</p><div class='modalContentPadding'><div class='helpHeadLine installGuideContent troubleShootSubTitle'>No Power/No lights on GO</div><div class='helpContent'>Make sure that you power source is a functional power source. Test something else, that you know works in the same power source, or try moving the GO to another power source that you have confirmed has working power.<br><br>Still Not Working? It is possible that you have a bad power supply, or malfunction of your GO hardware. Please reach out to your point of sale for further instructions.</div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>My Status Indicator is blinking Green/Yellow but my phone still have poor signal at the Service Antenna</div><div class='helpContent'>A blinking green or yellow status light indicates that your CEL-FI GO is still in the startup process. Depending on the complexity of your cellular network, this process can take some time. If the units is still blinking for more than 30 minutes please attempt a restart.</div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>My Status Indicator is Solid Green/Yellow but my phone still have poor signal at the Service Antenna</div><div class='helpContent'>If your Cel-Fi GO has a solid Status Indicator light in either yellow or green, the system is fully functional.<br>If your system has a solid (non-red) status light but your phone is not picking up a stronger cellular signal you might need to check the Service Antenna. Make sure that your Service Antenna is fully functional. You might try swapping out your Service Antenna with another device. <br><br>To find out more, please contact your point of sale.</div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>My Status Indicator is Flashing Red</div><div class='helpContent'>There are several reason why your status light would be flashing red. The best way to determine the specific reason for your flashing light is to use the WAVE Mobile or Desktop application while connected to your device. For more information about Cel-Fi WAVE please visit <a onclick=\"window.open('http://www.cel-fi.com/wave', '_system');\">www.cel-fi.com/wave</a><br><br><ul><li>E1 Not Receiving Signal: The cellular signal is too weak to boost. Try this...check the connection between your Donor Antenna and GO. Confirm that your antenna is properly connected and working. You may need to try another Donor Antenna. Using your cellular device, try to find a location with at least one consistent bar of 3G, 4G or 4G LTE. More bars is always better! Once you have found a usable signal, place your Donor Antenna in this location.</li><li>E5 Registration Required: Before use, you must register this device with your wireless provider and have your provider's consent. You must operate this device with approved antennas and cables as specified by the manufacturer.</li><li>E7 Unit disabled by network: Your system has been disabled by the mobile network operator. Contact your point-of-sale for further assistance.</li><li>E8 Input signal too strong: Your Donor Antenna is too close to a cellular tower. This may result in a reduced output power (smaller coverage bubble) to limit network interference. Try this... move your Donor Antenna to another physical location.</li><li>E9 Location Lock – Registration Required: Your system has been moved from its original address. Please move the system back to its original location or register your new address with your wireless provider. Systems can be registered via the WAVE application.</li><li>Too Close: Your Service Antenna is Too Close to your Donor Antenna. Try moving the antennas further apart, starting with the Service Antenna.</li></ul></div><div class='helpHeadLine installGuideContent troubleShootSubTitle'>My Status Indicator is Solid Red</div><div class='helpContent'>There are several reason why your status light would be solid red. The best way to determine the specific reason for your flashing light is to use the WAVE Mobile or Desktop application while connected to your device. For more information about Cel-Fi WAVE please visit <a onclick=\"window.open('http://www.cel-fi.com/wave', '_system');\">www.cel-fi.com/wave</a><br><br><ul><li>E4 Go is overheating: Your GO Unit is overheating. Please ensure that your GO Unit is clear of any blockage. If you have your GO in an exceptionally warm area you may need to relocate the device to ensure that this unit does not continue to overheat. Once GO has cooled it will operate as normal. *Normal operating temperature of the Cel-Fi unit is 0-40 Celsius.</li><li>E6 Hardware error: Your GO Unit is experiencing a hardware failure. Try this...Reset your Unit. To do this simply unplug your GO from the power source for a few seconds and plug it back in. If the problem persist after a restart please contact your point-of-sale for further assistance. *If you recently updated the software of your device, try again. If the error persist please contact your point of sale for further assistance.</li><li>E12 Self-Test Failed: During a system check a part of your unit's configuration has reported less than optimal performance. The system could be displaying a non-critical error message. If you have a boost in cellular service at your service antenna you can ignore the E12 message. If you do not have boosted signal, check to confirm that both your service antenna and donor antenna are properly connected and functional.  If the antennas checkout, the boost number on the unit is high and you still don't have a boosted signal try restarting the unit.  If the problem persist after a restart please contact your point-of-sale for further assistance.  *If you recently updated the software of your device, try again. If the error persist please contact your point of sale for further assistance.</li></ul></div></div></div>";
	    $(goTroubleShoot).appendTo('.modalBodyWrapper');
	    $('.headerContainer, #bodyContainer').hide();
	    $('.modalWrapper').show();
	},
	
	primeErrorCodes: function() {
	    this.createModalWrapper();
	    $('#modalTitle').html('Error codes');
	    //var errorCodesPrime = "<div class='installGuideWrapper'><p class='pageTitleContainer modalContentTitle modalContentPadding'>Error Codes</p><div class='modalContentPadding'><div class='helpSubTitle installGuideContent' id='ES2'>Error 1: Status Indicator will blink red</div><div class='helpHeadLine'>Not Receiving Signal</div><div class='helpContent'>Your PRIME Unit is experiencing a hardware failure. Try this... reset your Unit. To do this simply unplug your PRIME from the power source for a few seconds and plug it back in. If the problem persist after a restart please contact your point-of-sale for further assistance.</div><div class='helpContent'>If you recently updated the software of your device, try again. If the error persist please contact your point of sale for further assistance.</div><div class='helpSubTitle installGuideContent' id='ES5'>Error 4: Status Indicator will be solid red</div><div class='helpHeadLine'>PRIME is overheating</div><div class='helpContent'>Your PRIME Unit is overheating. Please ensure that your PRIME Unit is clear of any blockage. If you have your PRIME in an exceptionally warm area you may need to relocate the device to ensure that this unit does not continue to overheat. Once PRIME has cooled it will operate as normal.</div><div class='helpContent'>Normal operating temperature of the Cel-Fi unit is 0-40 Celsius.</div><div class='helpSubTitle installGuideContent' id='ES11'>Error 5: Status Indicator will blink red</div><div class='helpHeadLine'>Registration Required</div><div class='helpContent'>Before use, you must register this device and have your provider's consent. You must operate this device with approved cables as specified by the manufacturer. Systems can be registered with the WAVE application.</div><div class='helpSubTitle installGuideContent' id='ES1'>Error 6: Status Indicator will be solid red</div><div class='helpHeadLine'>Hardware Error</div><div class='helpContent'>Your PRIME Unit is experiencing a hardware failure. Try this... reset your Unit. To do this simply unplug your PRIME from the power source for a few seconds and plug it back in. If the problem persist after a restart please contact your point-of-sale for further assistance.</div><div class='helpContent'>If you recently updated the software of your device, try again. If the error persist please contact your point of sale for further assistance.</div><div class='helpSubTitle installGuideContent' id='ES9'>Error 7: Status Indicator will blink red</div><div class='helpHeadLine'>Disabled by operator</div><div class='helpContent'>Your system has been disabled by the mobile network operator. Contact your point-of-sale for further assistance.</div><div class='helpSubTitle installGuideContent' id='ES4'>Error 8: Status Indicator will blink red</div><div class='helpHeadLine'>Input signal too strong</div><div class='helpContent'>Your Donor Antenna is too close to a cellular tower. This may result in a reduced output power (smaller coverage bubble) to limit network interference. Try this... move your Donor Antenna to another physical location.</div><div class='helpSubTitle installGuideContent' id='ES10'>Error 9: Status Indicator will blink red</div><div class='helpHeadLine'>Location Lock – Registration Required</div><div class='helpContent'>Your system has been moved from its original address. Please move the system back to its original location or register your new address with your wireless provider. Systems can be registered with the WAVE application.</div><div class='helpSubTitle installGuideContent' id='ES12'>Error 12: Status Indicator will be solid red</div><div class='helpHeadLine'>Self-Test Failed</div><div class='helpContent'>During a system check a part of your unit's configuration has reported less than optimal performance. The system could be displaying a non-critical error message. If you have a boost in cellular service at your service antenna you can ignore the E12 message. If you do not have boosted signal, check to confirm that both your service antenna and donor antenna are properly connected and functional.  If the antennas checkout, the boost number on the unit is high and you still don't have a boosted signal try restarting the unit.  If the problem persist after a restart please contact your point-of-sale for further assistance.</div><div class='helpContent'>If you recently updated the software of your device, try again. If the error persist please contact your point of sale for further assistance.</div><div class='helpSubTitle installGuideContent' id='ES7'>Status Indicator will blink red</div><div class='helpHeadLine'>Too Close</div><div class='helpContent'>Your Service Antenna and your Donor Antennas are too close together. Try moving the antennas further apart.</div></div></div>";
		
		var errorCodesPrime = "<div class='installGuideWrapper'><p class='pageTitleContainer modalContentTitle modalContentPadding'>Error Codes</p><div class='modalContentPadding'><div class='helpSubTitle installGuideContent' id='ES2'>Error 1: Status Indicator will blink red</div><div class='helpHeadLine'>Not Receiving Signal</div><div class='helpContent'>Your PRIME Unit is experiencing a hardware failure. Try this... reset your Unit. To do this simply unplug your PRIME from the power source for a few seconds and plug it back in. If the problem persist after a restart please contact your point-of-sale for further assistance.</div><div class='helpContent' id='ES5'>If you recently updated the software of your device, try again. If the error persist please contact your point of sale for further assistance.</div><div class='helpSubTitle installGuideContent'>Error 4: Status Indicator will be solid red</div><div class='helpHeadLine'>PRIME is overheating</div><div class='helpContent'>Your PRIME Unit is overheating. Please ensure that your PRIME Unit is clear of any blockage. If you have your PRIME in an exceptionally warm area you may need to relocate the device to ensure that this unit does not continue to overheat. Once PRIME has cooled it will operate as normal.</div><div class='helpContent' id='ES11'>Normal operating temperature of the Cel-Fi unit is 0-40 Celsius.</div><div class='helpSubTitle installGuideContent'>Error 5: Status Indicator will blink red</div><div class='helpHeadLine'>Registration Required</div><div class='helpContent' id='ES1'>Before use, you must register this device and have your provider's consent. You must operate this device with approved cables as specified by the manufacturer. Systems can be registered with the WAVE application.</div><div class='helpSubTitle installGuideContent'>Error 6: Status Indicator will be solid red</div><div class='helpHeadLine'>Hardware Error</div><div class='helpContent'>Your PRIME Unit is experiencing a hardware failure. Try this... reset your Unit. To do this simply unplug your PRIME from the power source for a few seconds and plug it back in. If the problem persist after a restart please contact your point-of-sale for further assistance.</div><div class='helpContent' id='ES9'>If you recently updated the software of your device, try again. If the error persist please contact your point of sale for further assistance.</div><div class='helpSubTitle installGuideContent'>Error 7: Status Indicator will blink red</div><div class='helpHeadLine'>Disabled by operator</div><div class='helpContent' id='ES4'>Your system has been disabled by the mobile network operator. Contact your point-of-sale for further assistance.</div><div class='helpSubTitle installGuideContent'>Error 8: Status Indicator will blink red</div><div class='helpHeadLine'>Input signal too strong</div><div class='helpContent' id='ES10'>Your Donor Antenna is too close to a cellular tower. This may result in a reduced output power (smaller coverage bubble) to limit network interference. Try this... move your Donor Antenna to another physical location.</div><div class='helpSubTitle installGuideContent'>Error 9: Status Indicator will blink red</div><div class='helpHeadLine'>Location Lock – Registration Required</div><div class='helpContent' id='ES12'>Your system has been moved from its original address. Please move the system back to its original location or register your new address with your wireless provider. Systems can be registered with the WAVE application.</div><div class='helpSubTitle installGuideContent'>Error 12: Status Indicator will be solid red</div><div class='helpHeadLine'>Self-Test Failed</div><div class='helpContent'>During a system check a part of your unit's configuration has reported less than optimal performance. The system could be displaying a non-critical error message. If you have a boost in cellular service at your service antenna you can ignore the E12 message. If you do not have boosted signal, check to confirm that both your service antenna and donor antenna are properly connected and functional.  If the antennas checkout, the boost number on the unit is high and you still don't have a boosted signal try restarting the unit.  If the problem persist after a restart please contact your point-of-sale for further assistance.</div><div class='helpContent' id='ES7'>If you recently updated the software of your device, try again. If the error persist please contact your point of sale for further assistance.</div><div class='helpSubTitle installGuideContent'>Status Indicator will blink red</div><div class='helpHeadLine'>Too Close</div><div class='helpContent'>Your Service Antenna and your Donor Antennas are too close together. Try moving the antennas further apart.</div></div></div>";
		
	    $(errorCodesPrime).appendTo('.modalBodyWrapper');
	    $('.modalBodyWrapper').css('overflow-y', 'visible');
	    $('.headerContainer, #bodyContainer').hide();
	    $('.modalWrapper').show();
	},
	
	goErrorCodes: function() {
	    this.createModalWrapper();
	    $('#modalTitle').html('Error codes');
	    //var errorCodesGo = "<div class='installGuideWrapper'><p class='pageTitleContainer modalContentTitle modalContentPadding'>Error Codes</p><div class='modalContentPadding'><div class='helpSubTitle installGuideContent' id='ES2'>Error 1: Status Indicator will blink red</div><div class='helpHeadLine'>Not Receiving Signal</div><div class='helpContent'>Your Unit is experiencing a hardware failure. Try this... reset your Unit. To do this simply unplug your Unit from the power source for a few seconds and plug it back in. If the problem persists after a restart please contact your point-of-sale for further assistance.</div><div class='helpContent'>If you recently updated your device, try the update again. If the error persists please contact your point of sale for further assistance.</div><div class='helpSubTitle installGuideContent' id='ES5'>Error 4: Status Indicator will be solid red</div><div class='helpHeadLine'>Unit is overheating</div><div class='helpContent'>Your Unit is overheating. Please ensure that your GO Unit is clear of any blockage. If you have your Unit in an exceptionally warm area you may need to relocate the Unit to ensure that this unit does not continue to overheat. Once your Unit has cooled it will operate as normal.</div><div class='helpContent'>Normal operating temperature of the Unit is 0-65 degrees Celsius.</div><div class='helpSubTitle installGuideContent' id='ES11'>Error 5: Status Indicator will blink red</div><div class='helpHeadLine'>Registration Required</div><div class='helpContent'>Before use, you must register this device and have your provider's consent. You must operate this device with approved cables as specified by the manufacturer. Systems can be registered with the WAVE application.</div><div class='helpSubTitle installGuideContent' id='ES1'>Error 6: Status Indicator will be solid red</div><div class='helpHeadLine'>Hardware Error</div><div class='helpContent'>Your Unit may be experiencing a hardware failure. Try this... reset your Unit. To do this simply unplug your Unit from the power source for a few seconds and plug it back in. If the problem persists after a restart please contact your point-of-sale for further assistance.</div><div class='helpContent'>If you recently updated your device, try the update again. If the error persists please contact your point of sale for further assistance.</div><div class='helpSubTitle installGuideContent' id='ES9'>Error 7: Status Indicator will blink red</div><div class='helpHeadLine'>Disabled by operator</div><div class='helpContent'>Your system has been disabled by the mobile network operator. Contact your point-of-sale for further assistance.</div><div class='helpSubTitle installGuideContent' id='ES4'>Error 8: Status Indicator will blink red</div><div class='helpHeadLine'>Input signal too strong</div><div class='helpContent'>Your Donor Antenna is too close to a cellular tower. This may result in a reduced output power (smaller coverage bubble) to limit network interference. If you have satisfactory boost in cellular service you can ignore this message. Otherwise move your Donor Antenna to another physical location.</div><div class='helpSubTitle installGuideContent' id='ES10'>Error 9: Status Indicator will blink red</div><div class='helpHeadLine'>Location Lock – Registration Required</div><div class='helpContent'>Your system has been moved from its original address. Please move the system back to its original location or register your new address with your wireless provider. Systems can be registered with the WAVE application.</div><div class='helpSubTitle installGuideContent' id='ES12'>Error 12: Status Indicator will be solid red</div><div class='helpHeadLine'>Self-Test Failed</div><div class='helpContent'>During a system check a part of your unit's configuration has reported less than optimal performance. The system could be displaying a non-critical error message. If you have a boost in cellular service at your service antenna you can ignore the E12 message. If you do not have boosted signal, check to confirm that both your service antenna and donor antenna are properly connected and functional.  If the antennas checkout, the boost number on the unit is high and you still don't have a boosted signal try restarting the unit.  If the problem persists after a restart please contact your point-of-sale for further assistance.</div><div class='helpContent'>If you recently updated your device, try the update again. If the error persists please contact your point of sale for further assistance.</div><div class='helpSubTitle installGuideContent' id='ES7'>Status Indicator will blink red</div><div class='helpHeadLine'>Too Close</div><div class='helpContent'>Your Service Antenna and your Donor Antennas are too close together. Try moving the antennas further apart.</div></div></div>";
		
		var errorCodesGo = "<div class='installGuideWrapper'><p class='pageTitleContainer modalContentTitle modalContentPadding'>Error Codes</p><div class='modalContentPadding'><div class='helpSubTitle installGuideContent' id='ES2'>Error 1: Status Indicator will blink red</div><div class='helpHeadLine'>Not Receiving Signal</div><div class='helpContent'>Your Unit is experiencing a hardware failure. Try this... reset your Unit. To do this simply unplug your Unit from the power source for a few seconds and plug it back in. If the problem persists after a restart please contact your point-of-sale for further assistance.</div><div class='helpContent' id='ES5'>If you recently updated your device, try the update again. If the error persists please contact your point of sale for further assistance.</div><div class='helpSubTitle installGuideContent'>Error 4: Status Indicator will be solid red</div><div class='helpHeadLine'>Unit is overheating</div><div class='helpContent'>Your Unit is overheating. Please ensure that your GO Unit is clear of any blockage. If you have your Unit in an exceptionally warm area you may need to relocate the Unit to ensure that this unit does not continue to overheat. Once your Unit has cooled it will operate as normal.</div><div class='helpContent' id='ES11'>Normal operating temperature of the Unit is 0-65 degrees Celsius.</div><div class='helpSubTitle installGuideContent'>Error 5: Status Indicator will blink red</div><div class='helpHeadLine'>Registration Required</div><div class='helpContent' id='ES1'>Before use, you must register this device and have your provider's consent. You must operate this device with approved cables as specified by the manufacturer. Systems can be registered with the WAVE application.</div><div class='helpSubTitle installGuideContent'>Error 6: Status Indicator will be solid red</div><div class='helpHeadLine'>Hardware Error</div><div class='helpContent'>Your Unit may be experiencing a hardware failure. Try this... reset your Unit. To do this simply unplug your Unit from the power source for a few seconds and plug it back in. If the problem persists after a restart please contact your point-of-sale for further assistance.</div><div class='helpContent' id='ES9'>If you recently updated your device, try the update again. If the error persists please contact your point of sale for further assistance.</div><div class='helpSubTitle installGuideContent'>Error 7: Status Indicator will blink red</div><div class='helpHeadLine'>Disabled by operator</div><div class='helpContent' id='ES4'>Your system has been disabled by the mobile network operator. Contact your point-of-sale for further assistance.</div><div class='helpSubTitle installGuideContent'>Error 8: Status Indicator will blink red</div><div class='helpHeadLine'>Input signal too strong</div><div class='helpContent' id='ES10'>Your Donor Antenna is too close to a cellular tower. This may result in a reduced output power (smaller coverage bubble) to limit network interference. If you have satisfactory boost in cellular service you can ignore this message. Otherwise move your Donor Antenna to another physical location.</div><div class='helpSubTitle installGuideContent'>Error 9: Status Indicator will blink red</div><div class='helpHeadLine'>Location Lock – Registration Required</div><div class='helpContent' id='ES12'>Your system has been moved from its original address. Please move the system back to its original location or register your new address with your wireless provider. Systems can be registered with the WAVE application.</div><div class='helpSubTitle installGuideContent'>Error 12: Status Indicator will be solid red</div><div class='helpHeadLine'>Self-Test Failed</div><div class='helpContent'>During a system check a part of your unit's configuration has reported less than optimal performance. The system could be displaying a non-critical error message. If you have a boost in cellular service at your service antenna you can ignore the E12 message. If you do not have boosted signal, check to confirm that both your service antenna and donor antenna are properly connected and functional.  If the antennas checkout, the boost number on the unit is high and you still don't have a boosted signal try restarting the unit.  If the problem persists after a restart please contact your point-of-sale for further assistance.</div><div class='helpContent' id='ES7'>If you recently updated your device, try the update again. If the error persists please contact your point of sale for further assistance.</div><div class='helpSubTitle installGuideContent'>Status Indicator will blink red</div><div class='helpHeadLine'>Too Close</div><div class='helpContent'>Your Service Antenna and your Donor Antennas are too close together. Try moving the antennas further apart.</div></div></div>";
		
	    $(errorCodesGo).appendTo('.modalBodyWrapper');
	    $('.modalBodyWrapper').css('overflow-y', 'visible');
	    $('.headerContainer, #bodyContainer').hide();
	    $('.modalWrapper').show();
	},
	
	faqDetails: function() {
	    this.createModalWrapper();
	    $('#modalTitle').html('FAQ');
	
	    var faqDetails = "<div class='modalHelpWrapper faqModalWrapper'><p class='pageTitleContainer modalContentTitle modalContentPadding'>Top 20 Frequently Asked Questions</p><div class='panel-group' id='faqPage'>";
	
	    for (var x = 0; x < faqQuesAns.length; x++) {
	        faqDetails = faqDetails + "<div class='panel panel-default' id='panel" + (x + 1) + "'>";
	        faqDetails = faqDetails + "<div class='panel-heading'><h4 class='panel-title'><a data-toggle='collapse' data-parent='#faqPage' data-target='#faq" + (x + 1) + "' class='collapsed'><div class='col-xs-11 fl faQuestion'>" + faqQuesAns[x].question + "</div><div class='col-xs-1'><span class='toggle-icon fr expand-more'></span></div></a></h4></div><div class='cb'></div>";
	        faqDetails = faqDetails + "<div id='faq" + (x + 1) + "' class='panel-collapse collapse'><div class='panel-body'>" + faqQuesAns[x].answer + "</div></div></div>";
	    }
	
	    faqDetails = faqDetails + "</div></div></div>";
	    $(faqDetails).appendTo('.modalBodyWrapper');
	    $('.modalBodyWrapper').css('overflow-y', 'visible');
	    $('.headerContainer, #bodyContainer').hide();
	    $('.modalWrapper').show();
	    $('a[data-toggle="collapse"]').click(function() {
	        $('span.toggle-icon').not($(this).find('span.toggle-icon')).removeClass('expand-less');
	        $('span.toggle-icon').not($(this).find('span.toggle-icon')).addClass('expand-more');
	        $(this).find('span.toggle-icon').toggleClass('expand-more expand-less');
	    });
	},
	
	registrationInfo: function() {
		if($('#registrationFormContainer').length){
			$('#registrationFormContainer').hide();
		}
	    this.createModalWrapper();
	    $('#modalTitle').html('Registration');
//	    var registrationInfo = '<div class="registrationInfoModal"><h1 class="modelBodyHeaderTitle modalContentTitle">Registration of Signal Boosters</h1><P class="modelBodyContent">In some cases, regulatory bodies and or mobile network operators may require users to register the signal booster to ensure it"s not interfering with cellular coverage.</br></br>Follow the installation instructions to setup the Network Unit and Coverage Unit. Wait for the system to complete the network selection. This can take between 5 to 7 minutes.</br></br>When this process is complete a message will appear on both displays indicating that registration is required. If you received one of the following documents you will need to register your Cel-Fi system.</P><h1 class="modelRegistrationTitle modalTopPadding">Which notice that was included with your Cel-Fi Booster?</h1><h1 class="modelRegistrationTitle modalContentTitle">1. Registration required <h1><div class="registerImages_1"></div><div class="HeaderTitle_OR">OR</div><div class="registerImages_2"></div><p class="modelBodyContent">If registration is required, you will be prompted to enter your contact and location details the first time you open this app.</P><h1 class="modelRegistrationTitle modalContentTitle">2.	Register with Network Operator <h1><div class="registerImages_3"></div><p class="modelBodyContent">Registration Requirements Per FCC regulations, AT&T and T-Mobile Signal Boosters need to be registered with the mobile network operator.</br></br>If you bought your Cel-Fi device from T-Mobile:<div align="center"><button type="button" class="defaultButton" id="regButton" onclick="window.open(\'http://www.t-mobile.com/boosterregistration\', \'_system\');">Register with T-Mobile</button></div></br><p class="modelBodyContent">Else, contact your Reseller</P><h1 class="modelBodyHeaderTitle modalContentTitle">What data is collected? </h1><p class="modelBodyContent">The information collected during registration is specific to locating the address where the booster is used, and user contact information to enable the carrier to contact the user about the booster. This also includes information about the signal booster such as location, make, model, and serial number. This information will be used to locate boosters in the event network issues are believed to be linked to the booster operation. Any information collected through this program will be used as described above and is subject to Cel-Fi"s Privacy Policy.</br></br>For more information and helpful videos about installation and registration of your Cel-Fi Booster, please visit <a onclick="window.open(\'http://www.Cel-Fi.com/register\', \'_system\');" style="color: #4faee0;">www.Cel-Fi.com/register</a></p></div>';
	    var registrationInfo = '<div class="registrationInfoModal"><h1 class="modelBodyHeaderTitle modalContentTitle">Registration of Signal Boosters</h1><P class="modelBodyContent">In some cases, regulatory bodies and or mobile network operators may require users to register their signal booster. You may be required to re-register the boosters location if moved to a different address.<h1 class="modelBodyHeaderTitle modalContentTitle">What data is collected? </h1><p class="modelBodyContent">The information collected during registration includes user contact information, the address where the booster is used, booster make, model and serial number. This information will enable the carrier to contact users or locate the booster in the event of network issues. Any information collected through this program will be used as described above and is subject the Cel-Fi’s Privacy Policy <a onclick="window.open(\'http://www.Cel-Fi.com/privacypolicy\', \'_system\');" style="color: #4faee0;">www.Cel-Fi.com/privacypolicy</a></br></br>For more information and helpful videos about installation and registration of your Cel-Fi Booster, please visit <a onclick="window.open(\'http://www.Cel-Fi.com/register\', \'_system\');" style="color: #4faee0;">www.Cel-Fi.com/register</a></p></div>';
	    $(registrationInfo).appendTo('.modalBodyWrapper');
	    $('.headerContainer, #bodyContainer').hide();
	    $('.modalWrapper').show();
	},
	
	contactInfo: function() {
	    this.createModalWrapper();
	    $('#modalTitle').html('Contact Us');
	    var operatorName = "T-Mobile";
	    var operatorContactNum = "1-877-453-1304";
	    var operatorContactEmail = "support@t-mobile.com";
	    var contactInfo = '<div id="contactOperatorModal">'
							+'<div class="contactUsTop">Questions about Cel-Fi? We would love to hear from you!</div>'
							+'<div class="contactUsSendEmail">Send us an email at <span class="supportLink">support@cel-fi.com</span></div>'
							+'<div class="contactLocationDetails">'
							+'<div class="ContactLocationHeader">Locations:</div>'
							+'<div class="contactAddr">'
							+'U.S Headquarters<br>'
							+'12230 World Trade Drive, Suite 250<br>'
							+'San Diego, CA 92128, USA</br><div class="contactUsSpace"></div>'
							+'tel: <span class="supportLink" href="tel:+18584859442">+1 858 485 9442</span><br>'
							+'fax: <span class="supportLink">+1 858 485 9445</span>'
							+'</div>'
							+'<div class="contactAddr location2">'
							+'European Office<br>'
							+'Unit 6, Basepoint Business Centre<br>'
							+'Rivermead Drive, Westlea<br>'
							+'Swindon SN5 7EX, UK<br><div class="contactUsSpace"></div>'
							+'tel: <span class="supportLink"  href="tel:+441316038182">+44 131 603 8182</span><br>'
							+'<span class="supportLink">EMEA@NextivityInc.com</span>'
							+'</div>'
							+'<div class="contactAddr location2">'
							+'Asia Office<br>'
							+'2 Changi Business Park,<br>'
							+'Avenue 1 Level 2, Suite 16</br>'
							+'Singapore, 486015</br>'
							+'<div class="contactUsSpace"></div>'
							+'tel: <span class="supportLink" href="tel:+6568097279">+65 6809 7279</span><br>'
							+'fax: <span class="supportLink">+65 6243 9202</span>'
							+'</div>'
							+'</div>'
							+'<div class="contactEvenmore">'
							+'Want more information?<br>'
							+'Visit us at <span class="supportLink" onclick="window.open(\'http://www.cel-fi.com\',\'_system\')">www.cel-fi.com</span>'
							+'</div>'
							+'</div>';
	    $(contactInfo).appendTo('.modalBodyWrapper');
	    $('.headerContainer, #bodyContainer').hide();
	    $('.modalWrapper').show();
	},
	
	showAdvancedFeedBack: function() {
	    this.createModalWrapper();
	    $('.modalLeftBtn').hide();
	    $('#modalTitle').html('Send Data');
	    var advancedFeedBack = "<div id='modalContentWrapper'>" + "<div class='feedbackSendWrappper'>" + "<div class='pageTitleContainer modalContentTitle'>Send us Feedback</div>" + "<div>" + "<div class='label'>Description (optional)</div>" + "<div class='cb'></div>" + "<div class='textArea col-xs-12 col-sm-9'>" + "<textarea rows='4' id='feedbackDescInput'></textarea>" + "</div></div>" + "<div class='cb'></div><div>" + "<div class='label'>System data</div>" + "<div class='cb'></div>" + "<div class='textArea col-xs-12 col-sm-9'>" + "<textarea rows='7' id='feedbackSystemDataInput'></textarea>" + "</div></div>" + "<div class='cb'></div><div>" + "<button type='button' class='defaultButton' id='sendFeedbackButton'>Send</button>" + "<div class='cb'></div></div></div></div>";
	    $(advancedFeedBack).appendTo('.modalBodyWrapper');
	    $('#sendFeedbackButton').click(util.sendFeedBackEmail);
	    $('.headerContainer, #bodyContainer').hide();
	    $('.modalWrapper').show();
	},
	
	sendFeedBackEmail: function(){
        if(window.device.platform != pcBrowserPlatform)
        {
			var filePath = "";
			
			if(window.device.platform == iOSPlatform){
				filePath = g_fileSystemDir.toURL() + "wave.log";
			}else{
				filePath = "file:///storage/emulated/0/Download/wave.log";
			}
			cordova.plugins.email.open({
					to:          [techModeEmail], // email addresses for TO field
					cc:          [], // email addresses for CC field
					bcc:         [], // email addresses for BCC field
					attachments: [filePath], // file paths or base64 data streams
					subject:     'Wave Log', // subject of the email
					body:        '(Type an optional description here)', // email body (for HTML, set isHtml to true)
					isHtml:    0, // indicats if the body is HTML or plain text
				});
        }
        else
        {
            OpenDefaultEmailClient(techModeEmail, "", "", "Wave Log", "(Type an optional description here)"); //To,Cc,Bcc,Subject,Body
        }
	},
	
	showAboutUs: function() {
	    util.createHamburgerContent();
	    $('.modalLeftBtnContainer').addClass('hamburgerBackBtn');
	    $('.modalLeftBtnContainer').click(function() {
	        util.removeModal();
	        bigSlideAPI.view.toggleOpen();
	    });
	    $('#modalTitle').html('About');
	    var modalWrapper = document.getElementById("modalWrapper");
	    var aboutFooterContainer = util.createAppendElem("div", "aboutFooterContainer", "aboutFooterContainer", modalWrapper);
	    var aboutLogoVersionContainer = util.createAppendElem("div", "aboutLogoVersionContainer", "aboutLogoVersionContainer", modalWrapper);
	    var aboutLogoContainer = util.createAppendElem("div", "aboutLogoContainer", "aboutLogoContainer", aboutLogoVersionContainer);
	    var aboutVersionContainer = util.createAppendElem("div", "aboutVersionContainer", "aboutVersionContainer", aboutLogoVersionContainer);
	    aboutVersionContainer.innerHTML = "Version "+szVerApp;
	    aboutFooterContainer.innerHTML = "Copyright &copy; 2016<br>Nextivity Inc. All rights reserved";
	},
	
	showPrivacyPolicy: function() {
	    var privacyPolicyContent = '<h1 class="modelBodyHeaderTitle modalContentTitle">Terms/Policy</h1><P class="modelBodyContent">At Nextivity, Inc., we adhere to industry-standard procedures to ensure your privacy. This privacy policy applies to data collection and usage on all Nextivity websites and related services (including, without limitation, any Nextivity mobile application) (collectively, the "Services"). Nextivity\'s websites are general audience websites.</br></br>Personal information of all users of the Services is collected, used and disclosed by us as described in this policy statement.  This policy statement does not cover the treatment, collection, use or disclosure of personal information by companies that we don\'t own or control, or people that we don\'t manage.</P><h2 class="modelBodySubHeaderTitle">Gathering/tracking personal information</h2><p class="modelBodyContent">We do not collect personal information about you unless you voluntarily provide it to us. For example, some of the purposes for which we collect such information are: to register your Nextivity product; provide feedback in our online surveys; request product information; and/or request contact from a Nextivity representative. Nextivity collects and uses your personal information in connection with the Services, to deliver the products and services you have requested, and as explained in more detail below.  In certain cases, we may share some of your personal information with third parties, but only as described below.</br></br>Please note that Nextivity may contact you about matters pertaining to your ownership of Nextivity products, or your interactive use of the company\'s website(s); for example, access to download new product software releases.  If you do not want to receive communications from us, please indicate your preference by sending an email to: support@cel-fi.com </br></br>The personal information that may be gathered includes your name, telephone number(s), fax number, street address, mailing address and e-mail address. You may also be asked to furnish other information about yourself such as your job category, industry type, company name and job title, and/or the number of people in your company.</p><h1 class="modelBodySubHeaderTitle">Sharing personal information</h1> <p class="modelBodyContent" >Telecommunications operators such as AT&T or T-Mobile (an "Operator") may be required under applicable law (for example, 47 CFR 20.21(h) in the United States) to register users of a Nextivity Product.  If, through the Services, you choose to register your Nextivity Product with an Operator, then we may disclose your personal information to such Operator or its affiliates in connection with such registration.  We have no control over the policies and practices of Operators as to privacy, their use or disclosure of your personal information, or anything else.  So if you choose to register your Nextivity Product with an Operator, please review all of that Operator\'s relevant policies on privacy.  For your information, and without limiting what an Operator may do with your personal information, please recognize that Operators may be required to disclose your personal information in accordance with applicable law.  By submitting personal information to us in connection with the registration of a Nextivity Product, you agree to hold Nextivity harmless against any disclosure, use, or security of such personal information by an Operator or its agents.</br></br>We may anonymize your personal information so that you are not individually identified, and provide that information to our partners or other third parties. We may also use your personal information on an aggregated basis to improve our products, services, and offerings thereof. However, we never disclose aggregate information to a partner or third party in a manner that would identify you personally, as an individual.</br></br>Personal information collected on any or all Nextivity websites may be stored and processed in the United States or any other country in which Nextivity or its affiliates, subsidiaries or agents maintain facilities. By using this site, or our Services, you consent to any such transfer of information outside of your country.</p><h1  class="modelBodySubHeaderTitle">Agents</h1><p class="modelBodyContent">We employ other companies and people to perform tasks on our behalf and need to share your information with them to provide products or services to you.  Unless we tell you differently, our agents do not have any right to use the personal information we share with them beyond what is necessary to assist us. </p><h1  class="modelBodySubHeaderTitle">Business Transfers</h1><p class="modelBodyContent">We may choose to buy or sell assets, and may share and/or transfer customer information in connection with the evaluation of and entry into such transactions. Also, if we (or our assets) are acquired, or if we go out of business, enter bankruptcy, or go through some other change of control, personal information could be one of the assets transferred to or acquired by a third party.<p><h1  class="modelBodySubHeaderTitle">Protection of Company and Others</h1><p class="modelBodyContent">We reserve the right to access, read, preserve, and disclose any information that we reasonably believe is necessary to comply with law or court order; enforce our agreements; or protect the rights, property, or safety of Company, our employees, our users, or others<p><h1 class="modelBodySubHeaderTitle">Managing personal information</h1><p class="modelBodyContent">You may contact Nextivity via e-mail at info@nextivityinc.com and we will attempt to assist you to remove, review, or revise any or all personal information that you have previously provided to us.  <p><h1  class="modelBodySubHeaderTitle">Additional information regarding privacy policy</h1><p class="modelBodyContent">If at any time you believe that Nextivity has not adhered to this privacy policy, or if you have questions regarding the policy or our methods of collecting and/or use of your personal information, please contact us. You may contact Nextivity via e-mail at info@nextivityinc.com, using the word "privacy" in the subject line.</br></br>This policy does not apply to Operators or other online or offline partner or affiliated sites, products or services that may be electronically linked to our company website(s). Nextivity is not responsible for enforcing the privacy policies of such websites. Further, Nextivity is not responsible for the content included on such websites, including but not limited to special offers, text, copy, photos, images and advertising claims, names or</br></br>Under California Civil Code Sections 1798.83-1798.84, California residents are entitled to ask us for a notice identifying the categories of personal information which we share with our affiliates and/or third parties for marketing purposes, and providing contact information for such affiliates and/or third parties.  If you are a California resident and would like a copy of this notice, please submit a written request to: info@nextivityinc.com.</br></br>Your browser may offer you a "Do Not Track" option, which allows you to signal to operators of websites and web applications and services (including behavioral advertising services) that you do not wish such operators to track certain of your online activities over time and across different websites.  Our Services do not support Do Not Track requests at this time, which means that we collect information about your online activity both while you are using the Services and after you leave our Services.<p>';
	    util.createHamburgerContent();
	    $('.modalLeftBtnContainer').addClass('hamburgerBackBtn');
	    $('.modalLeftBtnContainer').click(function() {
	        util.removeModal();
	        bigSlideAPI.view.toggleOpen();
	    });
	    $('#modalTitle').html('Privacy Policy');
	    var modalBodyWrapper = document.getElementById("modalBodyWrapper");
	    var privacyPolicyContainer = util.createAppendElem("div", "privacyPolicyContainer", "privacyPolicyContainer", modalBodyWrapper);
	    for (var y = 0; y < termsPrivacyContent.length; y++) {
	        if (y == 0) {
	            var titleElem = util.createAppendElem("h1", "modelBodyHeaderTitle" + y, "modelBodyHeaderTitle modalContentTitle", privacyPolicyContainer);
	        } else {
	            var titleElem = util.createAppendElem("h2", "modelBodyHeaderTitle" + y, "modelBodySubHeaderTitle", privacyPolicyContainer);
	        }
	        titleElem.innerHTML = termsPrivacyContent[y].privacyTitle;
	        var contentElem = util.createAppendElem("p", "pModelBodyContent" + y, "modelBodyContent", privacyPolicyContainer);
	        contentElem.innerHTML = termsPrivacyContent[y].privacyContent;
	    }
	},
	
	showSendFeedback: function() {
	    util.createHamburgerContent();
	    $('.modalLeftBtnContainer').addClass('hamburgerBackBtn');
	    $('.modalLeftBtnContainer').click(function() {
	        util.removeModal();
	        bigSlideAPI.view.toggleOpen();
	    });
	    $('.modalRightBtnContainer').html('Send').click(util.sendContactUsEmail);
	    $('#modalTitle').html('Contact Us');
	    var modalBodyWrapper = document.getElementById("modalBodyWrapper");
	    var feedBackComposer = util.createAppendElem("div", "feedBackComposer", "feedBackComposer", modalBodyWrapper);
	    var emailToContainer = util.createAppendElem("div", "emailToContainer", "emailToContainer", feedBackComposer);
	    var emailCCContainer = util.createAppendElem("div", "emailCCContainer", "emailCCContainer", feedBackComposer);
	    var emailSubContainer = util.createAppendElem("div", "emailSubContainer", "emailSubContainer", feedBackComposer);
	    var emailBodyContainer = util.createAppendElem("div", "emailBodyContainer", "emailBodyContainer", feedBackComposer);
	    emailToContainer.innerHTML = "To: <span class='emailTo'>support@cel-fi.com</span>";
	    emailCCContainer.innerHTML = "Cc/Bcc:";
	    emailSubContainer.innerHTML = "Subject: <span class='emailSubject'>Cel-Fi Wave Support</span>";
	    emailBodyContainer.innerHTML = "<textarea class='emailComposeBody' rows='15'></textarea>";
	},
	
	sendContactUsEmail: function(){
		var emailBody = $('.emailComposeBody').val();

        if(window.device.platform != pcBrowserPlatform)
        {
		cordova.plugins.email.open({
    	    to:          [celfiSupportEmail], // email addresses for TO field
    	    cc:          [], // email addresses for CC field
    	    bcc:         [], // email addresses for BCC field
    	    attachments: [], // file paths or base64 data streams
    	    subject:     'Cel-Fi Support', // subject of the email
    	    body:        emailBody, // email body (for HTML, set isHtml to true)
    	    isHtml:    0, // indicats if the body is HTML or plain text
    	});
        }
        else
        {
            OpenDefaultEmailClient(celfiSupportEmail, "", "", "Cel-Fi Support", emailBody ); //To,Cc,Bcc,Subject,Body
        }
    	util.removeModal();
        bigSlideAPI.view.toggleOpen();
	},
	
	createHamburgerContent: function() {
	    bigSlideAPI.view.toggleClose();
	    var modalWrapper = '<div class="modalWrapper" id="modalWrapper"><div class="modalHeaderWrapper"><div id="modalTitle"></div><div class="modalRightBtnContainer"></div><div class="modalLeftBtnContainer"></div></div><div id="modalBodyWrapper" class="modalBodyWrapper"></div></div>';
	    $(modalWrapper).appendTo('body');
	    $('.headerContainer, #bodyContainer').hide();
	    $('.modalWrapper').show();
	},
	
	highlightDeviceListLabel: function(lblId) {
		deviceRadioActiveStatus = false;
		connectBntStatus = false;
		if (typeof selectDeviceTimer != "undefined") {
	        clearTimeout(selectDeviceTimer);
	    }
	    for (var j = 0; j < guiDeviceList.length; j++) {
	    	if(guiDeviceList[j] != "None"){
		        $('#deviceLabelRadio' + j).removeClass('radioBtnSelected').addClass('radioBtnUnSelected');
		        document.getElementById('deviceIndicator'+j).className = 'deviceBlinkerContainer fr';
	    	}
	    }
	    $('#deviceLabelRadio' + lblId).removeClass('radioBtnUnSelected').addClass('radioBtnSelected');
	    util.showDeviceBlinker(lblId);
	    selectDeviceTimer = setTimeout(function(){util.bindConnectBTEvent(lblId);}, 3000);
	    ConnectAndIdentifyDevice(lblId);
	},
	
	bindConnectBTEvent: function(radId){
		deviceRadioActiveStatus = true;
		if (typeof indicatorTimer != "undefined") {
	        clearInterval(indicatorTimer);
	    }
		for (var j = 0; j < guiDeviceList.length; j++) {
			if(guiDeviceList[j] != "None"){
				document.getElementById('deviceIndicator'+j).className = 'deviceBlinkerContainer fr';
			}
		}
		document.getElementById('deviceIndicator'+radId).className = 'deviceBlinkerContainer fr';
		
		if(!isSouthBoundIfCnx){
			util.showDeviceSelectionPopup();
		}
	},

	checkConnectBluetooth: function(){
		connectBntStatus = true;
		if(connectBntStatus && deviceRadioActiveStatus){
			if (typeof checkConnectBTTimer != "undefined") {
		        clearInterval(checkConnectBTTimer);
		    }
			
			if(isSouthBoundIfCnx){
				ConnectBluetooth();
			}else{
				util.showDeviceSelectionPopup();
			}
		}else{
			if (typeof checkConnectBTTimer == "undefined") {
				checkConnectBTTimer = setInterval(function(){util.checkConnectBluetooth();}, 100);
			}
		}
	},
	
	showDeviceBlinker: function(radId2){
		if (typeof indicatorTimer != "undefined") {
	        clearInterval(indicatorTimer);
	    }
		for (var j = 0; j < guiDeviceList.length; j++) {
			if(guiDeviceList[j] != "None"){
				document.getElementById('deviceIndicator'+j).className = 'deviceBlinkerContainer fr';
			}
		}
		$('#deviceIndicator'+radId2).addClass('indicatorOn');
		var onOffFlag = 1;
		indicatorTimer = setInterval(function(){
			if(onOffFlag == 1){
				$('#deviceIndicator'+radId2).removeClass("indicatorOn").addClass("indicatorOff");
				onOffFlag = 2;
			}else{
				$('#deviceIndicator'+radId2).removeClass("indicatorOff").addClass("indicatorOn");
				onOffFlag = 1;
			}
		}, 300);
	},
		
	showDeviceSelectionPopup: function(){
		if (typeof indicatorTimer != "undefined") {
	        clearInterval(indicatorTimer);
	    }
		util.showErrorPopup();
		//if(guiDeviceList.length>2 && deviceType == "phone"){
		/*if(deviceType == "phone"){
        	document.getElementById("commonPopup").classList.add("privacyPolicy");
        }else{*/
        	document.getElementById("commonPopup").classList.add("deviceSelectionPopup");
        //}
		var deviceSelectionHeader = document.getElementById("popupHeader");
      	var deviceSelectionBody = document.getElementById("popupBody");
      	var deviceSelectionFooter = document.getElementById("popupFooter");
      	deviceSelectionHeader.innerHTML = "Select your booster";
      	var connectDeviceBtn = util.createAppendElem("button", "connectDevice", "defaultButton fr w50", deviceSelectionFooter);
      	connectDeviceBtn.innerHTML = "Connect";
      	connectDeviceBtn.addEventListener("click",util.checkConnectBluetooth, false);
      	var deviceSelectBody = "Multiple boosters have been found.";
      	deviceSelectBody = deviceSelectBody + "<div id='deviceSelectionPanel'>";
      	for(var i = 0; i < guiDeviceList.length; i++)
        {
      		if(guiDeviceList[i] != "None"){
	            var visibleDeviceName = "";
	      		visibleDeviceName = guiDeviceList[i];
	            visibleDeviceName = visibleDeviceName.substring(3);
	            var displayVisibleDeviceName = "";
	            if(window.localStorage.getItem("__"+visibleDeviceName)==null || window.localStorage.getItem("__"+visibleDeviceName)==""){
	            	//displayVisibleDeviceName = guiDeviceList[i];
	            	if( window.device.platform == iOSPlatform ){
		                // IOS MAC addresses are mangled and look like 0384C52F-7CA1-1CB0-F466-F97548504A5B.  Just grab the last 12 characters...
	            		displayVisibleDeviceName = guiDeviceList[i].substring( guiDeviceList[i].length - 12 );
		            }else{
		            	displayVisibleDeviceName = guiDeviceList[i];
		            }
					
					if((displayVisibleDeviceName == "ct to Update") || (displayVisibleDeviceName == "Connect to Update")){
						displayVisibleDeviceName = "Unidentified Booster";
					}
					
	            }else{
	            	displayVisibleDeviceName = unescape(window.localStorage.getItem("__"+visibleDeviceName));
	            }
	      		
				/*if(displayVisibleDeviceName.length > 17){
					displayVisibleDeviceName = displayVisibleDeviceName.slice(0,12);
					displayVisibleDeviceName = displayVisibleDeviceName + "...";
				}*/
				
	      		deviceSelectBody = deviceSelectBody + "<div class='col-xs-12'><label class='radioBtnWrapper radioBtnUnSelected col-xs-2' for='boosterDevice"+i+"' id='deviceLabelRadio"+i+"'></label><div class='boosterUnSelectedTxt selectBoosterDevice col-xs-8' id='deviceLabelText"+i+"'><label for='boosterDevice"+i+"'>"+displayVisibleDeviceName+"<input type='radio' name='celfiDeviceList' value='"+i+"' id='boosterDevice"+i+"'  onclick='util.highlightDeviceListLabel("+i+")' /></label></div><div class='deviceBlinkerContainer col-xs-2' id='deviceIndicator"+i+"'></div></div>";
      		}
        }
      	deviceSelectBody = deviceSelectBody + "</div>";
      	deviceSelectionBody.innerHTML = deviceSelectBody;
      	bDisplayDeviceListActive = true;
	},
	
	showRegisterHelp: function(){
		util.registrationInfo();
	},
	
	showSWProgressPopup: function(textTitle, textBody, textBottom, textUnits)
    {
        if( progressBarLoader == false )
        {
            util.removeElement('progressPopup');
            util.createBlackOverlay();
            var popupContainer = util.createAppendElem("div", "progressPopup", "progressPopup", mainContainer);
            var popElem = document.getElementById("progressPopup");
            var progressHeader = this.createAppendElem("div", "progressHeader", "", popElem);
            var progressInfo = this.createAppendElem("div", "progressInfo", "", popElem);
            var progressBarContainer = this.createAppendElem("div", "progressBarContainer", "", popElem);
            progressHeader.innerHTML = textTitle;
            progressInfo.innerHTML = textBody;
            var progressBarOverlay = this.createAppendElem("div", "progressBarOverlay", "", progressBarContainer);
            var progressBarText = this.createAppendElem("div", "progressBarText", "", progressBarContainer);
            progressBarText.align = "center";
            progressBarText.innerHTML = textUnits;
            
            var progressBottomTextA = this.createAppendElem("div", "progressBottomTextA", "", popElem);
            progressBottomTextA.innerHTML = textBottom;
            progressBottomTextA.style.color="#E60038";
           
            var progressBarBG = this.createAppendElem("div", "progressBarBG", "", progressBarContainer);
           
            progressBarLoader = true;
        }
	},
	
	removeSWProgressPopup: function()
    {
        if( progressBarLoader == true )
        {
            progressBarLoader = false;
            checkUpdateLoader = false;
            util.removeElement('blackOverlay');
            util.removeElement('progressPopup');
        }
	},
	
	showCellSearchProgressPopup: function(){
		util.removeElement('searchProgressPopup');
		util.createBlackOverlay();
	    var popupContainer = util.createAppendElem("div", "searchProgressPopup", "progressPopup", mainContainer);
	    var popElem = document.getElementById("searchProgressPopup");
	    var progressHeader = this.createAppendElem("div", "progressHeader", "", popElem);
	    var progressInfo = this.createAppendElem("div", "progressInfo", "", popElem);
	    var progressBarContainer = this.createAppendElem("div", "progressBarContainer", "", popElem);
	    progressHeader.innerHTML = "Network Search Progress";
	    progressInfo.innerHTML = "Please wait for cell search to complete...";
	    var progressBarOverlay = this.createAppendElem("div", "progressBarOverlay", "", progressBarContainer);
	    var progressBarText = this.createAppendElem("div", "progressBarText", "", progressBarContainer);
	    progressBarText.align = "center";
	    progressBarText.innerHTML = "0%";
	    var progressBarBG = this.createAppendElem("div", "progressBarBG", "", progressBarContainer);
	},
	
	removeCellSearchProgressPopup: function(){
		cellSearchProgressFlag = false;
		util.removeElement('blackOverlay');
		util.removeElement('searchProgressPopup');
	},
	
	updateCellSearchProgressBar: function(progPercent){
		$('#progressBarBG').css('width', progPercent + '%');
		$('#progressBarText').html(progPercent + "%");
	}
};

var privacyPolicy = {
checkboxPrivacyStatus: function() {
    var checkBox = document.getElementById("privacyCheckbox");
    var privacyBtn = document.getElementById("privacyAcceptBtn");
    if (checkBox.checked == true) {
        privacyBtn.className = "defaultButton";
        privacyBtn.addEventListener("click", privacyPolicy.acceptPrivacyPolicy);
    } else {
        privacyBtn.className = "defaultButtonDisabled";
        privacyBtn.removeEventListener("click", privacyPolicy.acceptPrivacyPolicy);
    }
},

acceptPrivacyPolicy: function() {
    window.localStorage.setItem("privacyPolicy", "1");
    util.removeElement("blackOverlay");
    util.removeElement("commonPopup");
    HandlePrivacyConfirmation(1);
}
};

var errorHandler = {
OSUpdateError: {
    errorTitle: "Error",
    errorBody: "Your Operating System is out of date.<br>Please upgrade it in order to run this app.",
},

UpgradeButtonContent: "Upgrade Now",
enableBluetoothButtonContent: "Activate Bluetooth",
searchDeviceAgainBtnContent: "Try Again",
tryAgainBtnContent: "Retry",
updateNowBtnContent: "Update",
locationAcquiredBtnContent: "OK",

bluetoothError: {
    errorTitle: "Bluetooth Required",
    errorBody: "This app requires Bluetooth to be enabled.<br>Please activate Bluetooth from your system settings.",
},
signalError: {
    errorTitle: "Not receiving a signal (E1)",
    errorBody: "The cellular signal might be too weak to boost.<br>Try our Signal Finder tool for the best location for the Network Unit (NU).",
},
registrationError: {
    errorTitle: "Registration Error",
    errorBody: "Error in user registration.<br>Please contact your network operator.",
},
linkDownError: {
    errorTitle: "Wireless Link Down",
    errorBody: "Wireless link between the Network Unit and Coverage Unit is down.  Please wait for the link to connect and try again.  Checking for local SW Updates.",
},
updatePICError: {
    errorTitle: "Update PIC Software",
    errorBody: "PIC software is out of date. Please install the latest version to make sure your Cel-Fi system is working correctly.",
},
updateCelFiError: {
    errorTitle: "Booster update required",
    errorBody: "Your booster's software is out of date. Please install the latest version to make sure your Cel-Fi system is working correctly.",
},
noWifiError: {
    errorTitle: "No WiFi or Cell",
    errorBody: "Unable to connect to cloud, no WiFi or Cell available.",
},
USBCommandError: {
    errorTitle: "HW Commanded from USB?",
    errorBody: "Cel-Fi may be receiving commands from USB. Unable to support both USB commands and Bluetooth.",
},
unableGPSError: {
    errorTitle: "Unable to acquire GPS.",
    errorBody: "No location information will be stored.",
},
updateBoosterError: {
    errorTitle: "Booster update required",
    errorBody: "Your booster software is out of date. Please install the latest version to make sure your Cel-Fi system is working correctly.",
},

showErrorPopup: function(errorType) {
    util.createBlackOverlay();
    util.createCommonPopup();
    this.modifyErrorPopup(errorType);
},

modifyErrorPopup: function(errorType) {
    var errHeader = document.getElementById("popupHeader");
    errHeader.className = "errorHeader";

    var errorIcon = util.createAppendElem("div", "errorIcon", "errorIcon", errHeader);
    var errTitleContainer = util.createAppendElem("div", "errTitleContainer", "errTitleContainer", errHeader);
    var errBody = document.getElementById("popupBody");
    errBody.className = "errorBody";

    var errFooter = document.getElementById("popupFooter");
    errFooter.align = "center";

    switch (errorType) {
        case "OSUpdateError":
            var errObj = errorHandler.OSUpdateError;
            var errBtn = util.createAppendElem("button", "errUpgradeBtn", "defaultButton", errFooter);
            errBtn.innerHTML = errorHandler.UpgradeButtonContent;
            errBtn.addEventListener("click", function() {
                //util.closeApplication();
            }, false);
            break;

        case "bluetoothError":
            var errObj = errorHandler.bluetoothError;
            var errBtn = util.createAppendElem("button", "errBluetoothBtn", "defaultButton", errFooter);
            errBtn.innerHTML = errorHandler.searchDeviceAgainBtnContent;
            errBtn.addEventListener("click", function() {
                //util.closeApplication();
				util.hideCommonPopup();
            	app.initialize();
            }, false);
            break;

        case "signalError":
            var errObj = errorHandler.signalError;
            errFooter.className = "noSignalError"
            var errBtn = util.createAppendElem("button", "errDeviceSearch", "defaultButton", errFooter);
            errBtn.innerHTML = errorHandler.searchDeviceAgainBtnContent;
            errBtn.addEventListener("click", function() {
                //util.hideCommonPopup();
                //util.showSearchAnimation();
            }, false);

            break;

        case "registrationError":
            var errObj = errorHandler.registrationError;
            break;

        case "linkDown":
            var errObj = errorHandler.linkDownError;
            var errBtn = util.createAppendElem("button", "errLinkDown", "defaultButton", errFooter);
            errBtn.innerHTML = errorHandler.tryAgainBtnContent;
            errBtn.addEventListener("click", function() {
                util.hideCommonPopup();
                HandleUniiRetry(1);
            }, false);
            break;

        case "updatePIC":
            var errObj = errorHandler.updatePICError;
            var errBtn = util.createAppendElem("button", "errupdatePIC", "defaultButton", errFooter);
            errBtn.innerHTML = errorHandler.updateNowBtnContent;
            errBtn.addEventListener("click", function() {
                util.hideCommonPopup();
                HandleSwUpdateConfirmation(1);
            }, false);
            break;
			
		case "updateCelFi":
            var errObj = errorHandler.updateCelFiError;
            var errBtn = util.createAppendElem("button", "errupdateCelhfi", "defaultButton", errFooter);
            errBtn.innerHTML = errorHandler.updateNowBtnContent;
            errBtn.addEventListener("click", function() {
                util.hideCommonPopup();
                HandleSwUpdateConfirmation(1);
            }, false);
            break;

        case "noWifiORCell":
            var errObj = errorHandler.noWifiError;
            var errBtn = util.createAppendElem("button", "errNoWifi", "defaultButton", errFooter);
            errBtn.innerHTML = errorHandler.tryAgainBtnContent;
            errBtn.addEventListener("click", function() {
                util.hideCommonPopup();
                HandleCloudRetry(1);
            }, false);
            break;

        case "USBCommand":
            var errObj = errorHandler.USBCommandError;
            var errBtn = util.createAppendElem("button", "errUSBCommand", "defaultButton", errFooter);
            errBtn.innerHTML = errorHandler.tryAgainBtnContent;
            errBtn.addEventListener("click", function() {
                util.hideCommonPopup();
                HandleUsbConflictConfirmation(1);
            }, false);
            break;

        case "unableGPS":
            var errObj = errorHandler.unableGPSError;
            var errBtn = util.createAppendElem("button", "errUnableGPS", "defaultButton", errFooter);
            errBtn.innerHTML = errorHandler.locationAcquiredBtnContent;
            errBtn.addEventListener("click", function() {
                util.hideCommonPopup();
                RequestModeChange(PROG_MODE_TECH);
            }, false);
            break;

        case "updateBooster":
            var errObj = errorHandler.updateBoosterError;
            var errBtn = util.createAppendElem("button", "errBoosterUpdate", "defaultButton", errFooter);
            errBtn.innerHTML = errorHandler.updateNowBtnContent;
            errBtn.addEventListener("click", function() {
                util.hideCommonPopup();
            }, false);
            break;
    }
    errTitleContainer.innerHTML = errObj.errorTitle;
    errBody.innerHTML = errObj.errorBody;
	util.alignCommonPopupToHeader(errHeader);
},

addErrorClass: function(elmId, errId) {
    var regFormElements = ["fName", "lName", "addr1", "city", "state", "zip", "country", "phone"];
    var regFormErr = ["errFn", "errLn", "errAddr", "errCity", "errState", "errZip", "errCtry", "errPN"];
    for (var i = 0; i < regFormElements.length; i++) {
        document.getElementById(regFormElements[i]).className = "form-control";
        document.getElementById(regFormErr[i]).style.display = "none";
    }
    document.getElementById(elmId).className = "form-control regErrorBorder";
    document.getElementById(errId).style.display = "block";
}
};

var splashScreen = {
	initiate: function() {
	    window.localStorage.setItem("deviceType", deviceType);
	    if (deviceType == "phone") {
	        screen.lockOrientation('portrait');
	    }
	
	    $('body').html(mainContainerWithoutMenu);
	    mainContainer = document.getElementById("mainContainer");
	    mainContainer.className = "connectionBG";
	    deviceHeight = document.documentElement.clientHeight;
	    deviceWidth = document.documentElement.clientWidth;
	    var logoContainer = document.createElement("div");
	    logoContainer.id = "logoContainer";
	    logoContainer.align = "center";
	    logoContainer.className = "w100 vh100";
	    mainContainer.appendChild(logoContainer);
	    setTimeout(function() {
	        app.initialize();
	    }, 2000);
	}
};

//document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	deviceOS = device.platform;
	deviceOSVersion = parseFloat(device.version);
	var envs = ['xs', 'sm', 'md', 'lg'];
	$el = $('<div>');
	$el.appendTo($('body'));
	var loopLength = 0;
	for (var i = envs.length - 1; i >= 0; i--) {
	    var env = envs[i];
	    $el.addClass('hidden-' + env);
	    if ($el.is(':hidden')) {
	        $el.remove();
	        loopLength++;
	        if (env == "xs") {
	            deviceType = "phone";
	        } else {
	            deviceType = "tablet";
	        }
	        if (loopLength != 0) {
	            break;
	        }
	    }
	}
	if(window.device.platform == pcBrowserPlatform){deviceType = "tablet";}
	splashScreen.initiate();
}
