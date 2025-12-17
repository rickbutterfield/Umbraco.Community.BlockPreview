(function () {
    'use strict';
    angular.module("umbraco").controller("GodMode.ServiceBrowser.Controller",
        function ($routeParams, navigationService, godModeResources, godModeConfig) {

            const vm = this;
            vm.isLoading = true;

            navigationService.syncTree({ tree: $routeParams.tree, path: [-1, $routeParams.method], forceReload: false });

            vm.config = godModeConfig.config;
            vm.search = {};
            vm.sort = {};
            vm.sort.column = "Name";
            vm.sort.reverse = false;
            vm.heading = "";
            vm.services = [];
            vm.search.hideNonPublic = true;

            navigationService.syncTree({ tree: $routeParams.tree, path: [-1, $routeParams.method], forceReload: false });

            vm.init = function () {
                vm.isLoading = true;

                godModeResources.getRegisteredServices().then(function (data) {
                    vm.services = data;
                    vm.isLoading = false;
                });
            };

            vm.init();

            vm.sortBy = function (column) {
                vm.sort.column = column;
                vm.sort.reverse = !vm.sort.reverse;
            };

            vm.resetFilters = function () {
                vm.search.namespace = null;
                vm.search.baseType = null;
            };

            vm.toggleVisibility = function () {
                vm.search.hideNonPublic = !vm.search.hideNonPublic;
            }

            vm.filterServices = function (c) {

                if (vm.search.name && c.Name.toLowerCase().indexOf(vm.search.name.toLowerCase()) === -1) {
                    return;
                }

                if (vm.search.namespace && c.Namespace !== vm.search.namespace.Namespace) {
                    return;
                }

                if (vm.search.implementName && c.ImplementName.toLowerCase().indexOf(vm.search.implementName.toLowerCase()) === -1) {
                    return;
                }

                if (vm.search.implementNamespace && c.ImplementNamespace !== vm.search.implementNamespace.ImplementNamespace) {
                    return;
                }

                if (vm.search.lifetime && c.Lifetime !== vm.search.lifetime.Lifetime) {
                    return;
                }

                if (vm.search.hideNonPublic && !c.IsPublic) {
                    return;
                }

                return c;
            };
        });
})();