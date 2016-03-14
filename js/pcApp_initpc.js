//=================================================================================================
//
//  File: pcApp_initpc.js
//
// Add the fake functions to make the general code work as if on phone
//
//=================================================================================================

function initAppToRunOnPc()
{
    PrintLog(1, "---- initAppToRunOnPc ----" );

    if (typeof qt !== "undefined")
    {
        new QWebChannel(qt.webChannelTransport, function(channel)
        {
            QtFileSystemIf = channel.objects.QtFileSystemIf;
            QtSerEngIf     = channel.objects.QtSerEngIf;
            QtNbManager    = channel.objects.QtNbManager;
        });
    }
    else
        PrintLog(1, " qt undefined" );
    
    if (navigator.connection === undefined)
    {
        navigator.connection = {
            isConnected : true,
            ManualCheckInternetUp : function()
            {
                return this.isConnected; //how to check connected?? call function in Qt and in QT use http://karanbalkar.com/2014/02/detect-internet-connection-using-qt-5-framework/ to return true/false
            }
        };
    }
    else
        PrintLog(1, " found navigator.connection" );

    if (navigator.app === undefined)
    {
        navigator.app = {
            exitApp : function()
            {
                PrintLog(1, "**** navigator.app.exitApp triggered!! ****" );
            }
        };
    }
    else
        PrintLog(1, " found navigator.app" );

    if (navigator.notification === undefined)
    {
    }
    else
        PrintLog(1, " found navigator.notification" );

    if (window.plugins === undefined)
    {
    }
    else
        PrintLog(1, " found window.plugins" );

    var OsVer = "unknown";
    if (window.navigator !== undefined)
    {
        var nAgt = window.navigator.userAgent;
        var clientStrings = [
            {s:'Win10', r:/(Windows 10.0|Windows NT 10.0)/},
            {s:'Win8.1', r:/(Windows 8.1|Windows NT 6.3)/},
            {s:'Win8', r:/(Windows 8|Windows NT 6.2)/},
            {s:'Win7', r:/(Windows 7|Windows NT 6.1)/},
            {s:'WinVista', r:/Windows NT 6.0/},
            {s:'Win2003', r:/Windows NT 5.2/},
            {s:'WinXP', r:/(Windows NT 5.1|Windows XP)/},
            {s:'Win2000', r:/(Windows NT 5.0|Windows 2000)/},
            {s:'WinME', r:/(Win 9x 4.90|Windows ME)/},
            {s:'Win98', r:/(Windows 98|Win98)/},
            {s:'Win95', r:/(Windows 95|Win95|Windows_95)/},
            {s:'WinNT4', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
            {s:'WinCE', r:/Windows CE/},
            {s:'Win3.11', r:/Win16/},
            {s:'Android', r:/Android/},
            {s:'OpenBSD', r:/OpenBSD/},
            {s:'SunOS', r:/SunOS/},
            {s:'Linux', r:/(Linux|X11)/},
            {s:'iOS', r:/(iPhone|iPad|iPod)/},
            {s:'MacOSX', r:/Mac OS X/},
            {s:'MacOS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
            {s:'QNX', r:/QNX/},
            {s:'UNIX', r:/UNIX/},
            {s:'BeOS', r:/BeOS/},
            {s:'OS/2', r:/OS\/2/},
            {s:'SearchBot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
        ];
        for (var id in clientStrings) {
            var cs = clientStrings[id];
            if (cs.r.test(nAgt)) {
                OsVer = cs.s;
                break;
            }
        }
    }
    
    if (window.device === undefined)
    {
        window.device = {
            platform : "PcBrowser", // pcBrowserPlatform from main.js
            version  : "1.5",
            model    : "Qt QWebView",
            PlatformOS: OsVer,
            printDeviceId : function()
            {
                return "Model: " + this.model + " OS: " + this.PlatformOS + " Ver:" + this.version;
            }
        };
    }
    else
        PrintLog(1, " found window.device" );
    
    if(window.localStorage === undefined)
    {
        PrintLog(99, "window.localStorage undefined!");
        window.localStorage = {
            deviceType : "PcBrowser" // pcBrowserPlatform from main.js
        };        
    }
    else
    {
        //window.localStorage.clear("privacyPolicy");
        window.localStorage.deviceType = "PcBrowser"; // pcBrowserPlatform from main.js
        //PrintLog(99, "   window = " + window.toString() );for (var prop in window){PrintLog(1,prop);}
        //PrintLog(99, "   window.localStorage = " + window.localStorage ); for (var prop in window.localStorage){PrintLog(1,prop);}
    }

}

function SetMaxTxPhoneBuffers(numBuffers)
{
}
