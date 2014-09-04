Imports System.Data.SqlClient

Public Class Calgary
    Inherits System.Web.UI.Page

    Protected Sub Page_Load(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Load
        If Not IsPostBack Then
            Dim conn As New SqlConnection("Data Source=SPD-REPORT\SQLEXPRESS;Initial Catalog=Sites;Persist Security Info=True;User ID=webuser;Password=P@$$wordwebuser")
            Dim sql As String = "SELECT * FROM Sites Where City like 'Calgary%'"
            Dim comm As New SqlCommand(sql, conn)
            conn.Open()
            Dim dr As SqlDataReader = comm.ExecuteReader

            drpSite.DataSource = dr
            drpSite.DataTextField = "Nickname"
            drpSite.DataValueField = "Nickname"
            drpSite.DataBind()
            conn.Close()
        End If

    End Sub

End Class