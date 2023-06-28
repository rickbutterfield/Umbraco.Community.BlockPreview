@echo off
dotnet build ../src/Umbraco.Community.BlockPreview/Umbraco.Community.BlockPreview.csproj --configuration Release /t:rebuild /t:pack -p:PackageOutputPath=../releases/nuget
dotnet build ../src/Our.Umbraco.BlockPreview/Our.Umbraco.BlockPreview.csproj --configuration Release /t:rebuild /t:pack -p:PackageOutputPath=../releases/nuget