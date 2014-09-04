<%@ Page Language="vb" AutoEventWireup="false" CodeBehind="default.aspx.vb" Inherits="WebMap._default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Business Intelligence Department</title>
    <link href="css/default.css" rel="stylesheet" />
    <link href='http://fonts.googleapis.com/css?family=Open+Sans&subset=latin,cyrillic-ext' rel='stylesheet' type='text/css' />
</head>
<body>
    <form id="form1" runat="server">
        <div id="header" class="defaultHeader">
            <div>
                <img src="images/default/banner_BusinessIntel.jpg" />
            </div>
            <span style="font-size:24px;">Visualizing our Competitive Advantages</span>
        </div>
        <div id="pageBody" class="mainContent">
            <table id="linksTable">
                <tr onclick="window.location.href='360c.html';">
                    <td style="width:350px;">
                        <img src="images/default/360_portal.png" /></td><td>Still under development this early beta release of the 360 tool allows users to find out demographic information about the areas around our current sites as well as see the local amenities with a user defined radius of the site or of a location of the users choosing. More features to come!</td>
                </tr>
                <tr onclick="window.location.href='SiteMap.html';">
                    <td style="width:350px;">
                        <img src="images/default/SiteMap_Portal.png" /></td><td>This is a map of all of our current and upcoming sites, it is coded to match the site statuses in the 360 Tool</td>
                </tr>
                <tr onclick="window.location.href='2brmrents.html';">
                    <td style="width:350px;">
                        <img src="images/default/2Bedroom.png" /></td><td>Using data from the rental market data capture form this map was built to show the price ranges in areas which we have data for.</td>
                </tr>
            </table>
        </div>
    </form>
</body>
</html>
