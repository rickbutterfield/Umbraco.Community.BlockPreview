(function () {
    'use strict';
    angular.module("umbraco").controller("GodMode.TypesIntro.Controller",
        function ($routeParams, navigationService, godModeConfig) {

            navigationService.syncTree({ tree: $routeParams.tree, path: ["reflectionTree"], forceReload: false });

            const vm = this;
            vm.config = godModeConfig.config;

            vm.pages = [
                { name: "Surface Controllers", url: "reflectionBrowser/surface", desc: "Browse Umbraco Surface Controllers" },
                { name: "API Controllers", url: "reflectionBrowser/api", desc: "Browse Umbraco Web API Controllers" },
                { name: "Render Controllers", url: "reflectionBrowser/render", desc: "Browse Umbraco Render Controllers" },
                { name: "Content Models", url: "reflectionBrowser/models", desc: "List Umbraco Content Models" },
                { name: "Composers", url: "reflectionBrowser/composers", desc: "Browse Umbraco Composers (DI)" },
                { name: "Value Converters", url: "reflectionBrowser/converters", desc: "View configured Property Value Converters" },
                { name: "View Components", url: "reflectionBrowser/components", desc: "List all View Components used on your site" },
                { name: "Tag Helpers", url: "reflectionBrowser/taghelpers", desc: "All Tag Helpers that you can use" },
                { name: "Content Finders", url: "reflectionBrowser/finders", desc: "View the registered Content Finders" },
                { name: "URL Providers", url: "reflectionBrowser/urlproviders", desc: "List all URL Providers that are available" },
                { name: "Interface Browser", url: "typeBrowser", desc: "Interogate C# Interfaces and derived types in your site" }
            ];

        });
})();