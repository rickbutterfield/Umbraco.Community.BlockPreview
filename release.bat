@echo off
dotnet build src/Our.Umbraco.BlockPreview.csproj --configuration Release /t:rebuild /t:pack -p:BuildTools=1 -p:PackageOutputPath=../releases/nuget