Imports System.Web.Services
Imports System.Web.Services.Protocols
Imports System.ComponentModel
Imports System.Data
Imports System.Data.SqlClient

' To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line.
<System.Web.Script.Services.ScriptService()> _
<System.Web.Services.WebService(Namespace:="http://tempuri.org/")> _
<System.Web.Services.WebServiceBinding(ConformsTo:=WsiProfiles.BasicProfile1_1)> _
<ToolboxItem(False)> _
Public Class BSPData
    Inherits System.Web.Services.WebService

    <WebMethod()> _
    Public Function HelloWorld() As String
        Return "Hello World"
    End Function

    <WebMethod()> _
    Public Function GetSites(ByVal status As String) As List(Of SiteSL)
        Dim retVal As New List(Of SiteSL)
        Dim conn As New SqlConnection("Data Source=SPD-RPT-DEV;Initial Catalog=GISTool;Persist Security Info=True;User ID=webuser;Password=P@$$wordwebuser")
        Dim comm As New SqlCommand("SELECT * FROM SITES WHERE SiteType=@sitetype", conn)
        comm.Parameters.Add("@sitetype", SqlDbType.VarChar)
        comm.Parameters("@sitetype").Value = status

        conn.Open()
        Dim dr As SqlDataReader = comm.ExecuteReader
        Do While dr.Read
            retVal.Add(New SiteSL(dr("GroupName"), dr("GroupName"), False))
        Loop
        conn.Close()
        Return retVal
    End Function


    Public Class SiteSL
        Private _value As String
        Public Property value() As String
            Get
                Return _value
            End Get
            Set(ByVal value As String)
                _value = value
            End Set
        End Property
        Private _label As String
        Public Property label() As String
            Get
                Return _label
            End Get
            Set(ByVal value As String)
                _label = value
            End Set
        End Property
        Private _selected As Boolean
        Public Property selected() As Boolean
            Get
                Return _selected
            End Get
            Set(ByVal value As Boolean)
                _selected = value
            End Set
        End Property

        Public Sub New(ByVal v As String, ByVal l As String, ByVal s As Boolean)
            _value = v
            _label = l
            _selected = s
        End Sub
    End Class
End Class
