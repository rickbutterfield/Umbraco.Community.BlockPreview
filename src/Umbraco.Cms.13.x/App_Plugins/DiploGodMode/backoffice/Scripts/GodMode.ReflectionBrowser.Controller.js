(function () {
    'use strict';
    angular.module("umbraco").controller("GodMode.ReflectionBrowser.Controller",
        function ($routeParams, navigationService, godModeResources, godModeConfig) {

            const vm = this;
            vm.isLoading = true;

            navigationService.syncTree({ tree: $routeParams.tree, path: [-1, $routeParams.method], forceReload: false });

            vm.config = godModeConfig.config;
            vm.search = {};
            vm.sort = {};
            vm.sort.column = "Name";
            vm.sort.reverse = false;
            vm.triStateOptions = godModeResources.getTriStateOptions();
            vm.search.isUmbraco = vm.triStateOptions[0];
            vm.heading = "";

            navigationService.syncTree({ tree: $routeParams.tree, path: [-1, "reflectionTree", $routeParams.method + $routeParams.id], forceReload: false });

            vm.init = function () {
                vm.isLoading = true;

                var getControllersFunction;

                if ($routeParams.id === "api") {
                    getControllersFunction = godModeResources.getApiControllers();
                    vm.heading = "API Controller";
                }
                else if ($routeParams.id === "surface") {
                    getControllersFunction = godModeResources.getSurfaceControllers();
                    vm.heading = "Surface Controller";
                }
                else if ($routeParams.id === "models") {
                    getControllersFunction = godModeResources.getPublishedContentModels();
                    vm.heading = "Published Content Model";
                }
                else if ($routeParams.id === "render") {
                    getControllersFunction = godModeResources.getRenderMvcControllers();
                    vm.heading = "RenderMvc Controller";
                }
                else if ($routeParams.id === "converters") {
                    getControllersFunction = godModeResources.getPropertyValueConveters();
                    vm.heading = "Property Value Converter";
                }
                else if ($routeParams.id === "composers") {
                    getControllersFunction = godModeResources.getComposers();
                    vm.heading = "Composer";
                }
                else if ($routeParams.id === "components") {
                    getControllersFunction = godModeResources.getViewComponents();
                    vm.heading = "View Component";
                }
                else if ($routeParams.id === "taghelpers") {
                    getControllersFunction = godModeResources.getTagHelpers();
                    vm.heading = "Tag Helpers";
                }
                else if ($routeParams.id === "finders") {
                    getControllersFunction = godModeResources.getContentFinders();
                    vm.heading = "Content Finders";
                }
                else if ($routeParams.id === "urlproviders") {
                    getControllersFunction = godModeResources.getUrlProviders();
                    vm.heading = "URL Providers";
                }

                getControllersFunction.then(function (data) {
                    vm.controllers = data;
                    vm.isLoading = false;
                });
            };
            vm.init();

            vm.filterByUmbraco = function (c) {
                if (!c.IsUmbraco === vm.search.isUmbraco.value) {
                    return;
                }
                return c;
            };

            vm.sortBy = function (column) {
                vm.sort.column = column;
                vm.sort.reverse = !vm.sort.reverse;
            };

            vm.resetFilters = function () {
                vm.search.namespace = null;
                vm.search.baseType = null;
            };

            vm.filterControllers = function (c) {
                if (vm.search.controller && c.Name.toLowerCase().indexOf(vm.search.controller.toLowerCase()) === -1) {
                    return;
                }

                if (vm.search.namespace && c.Namespace !== vm.search.namespace.Namespace) {
                    return;
                }

                if (!c.IsUmbraco === vm.search.isUmbraco.value) {
                    return;
                }

                if (vm.search.baseType && c.BaseType !== vm.search.baseType.BaseType) {
                    return;
                }

                return c;
            };
        });
})();