@echo off
dotnet build ../src/Umbraco.Community.BlockPreview.csproj --configuration Release /t:rebuild /t:pack -p:PackageOutputPath=../releases/nuget