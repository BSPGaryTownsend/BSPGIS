<%@ Page Language="vb" AutoEventWireup="false" CodeBehind="DojoTest.aspx.vb" Inherits="WebMap.DojoTest" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <script src="/dojo/dojo.js" data-dojo-config="async: true"></script>
    <link rel="stylesheet" href="/dijit/themes/claro/claro.css" />
    <link rel="stylesheet" href="/dijit/themes/claro/form/slider.css" />
    <script type="text/javascript">
        require(["dojo/request/script", "dojo/dom-construct", "dojo/dom", "dojo/_base/array", "dojo/domReady!"
        ], function (script, domConstruct, dom, arrayUtil) {
            // wait for the page and modules to be ready...
            // Make a request to GitHub API for dojo pull requests
            script.get("https://www.arcgis.com/sharing/oauth2/token?client_id=UWNMCTbys2h3RGsb&grant_type=client_credentials&client_secret=99b2b08a1b7c44bd9518716b777b0756&f=pjson&expiration=1440", {
                jsonp: "callback"
            }).then(function (response) {
                alert(response.access_token);
            });
        });
    </script>   
</head>
<body class="claro">

    <form id="form1" runat="server">
        <div id="pullrequests"></div>
    </form>
</body>
</html>
