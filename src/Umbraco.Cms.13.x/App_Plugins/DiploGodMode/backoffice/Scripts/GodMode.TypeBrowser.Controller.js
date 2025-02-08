(function () {
    'use strict';
    angular.module("umbraco").controller("GodMode.TypeBrowser.Controller",
        function ($routeParams, navigationService, godModeResources, godModeConfig) {
            const vm = this;

            navigationService.syncTree({ tree: $routeParams.tree, path: [-1, "reflectionTree", "typeBrowser"], forceReload: false });

            vm.isLoading = true;
            vm.config = godModeConfig.config;
            vm.search = {};
            vm.sort = {};
            vm.sort.column = "Name";
            vm.sort.reverse = false;

            vm.init = function () {
                vm.isLoading = true;
                godModeResources.getAssemblies().then(function (data) {
                    vm.assemblies = data;
                    vm.isLoading = false;
                });
            };
            vm.init();

            vm.getTypes = function (type) {
                vm.types = [];
                if (!type) return;

                vm.isLoading = true;
                godModeResources.getTypesAssignableFrom(type.LoadableName).then(function (data) {
                    vm.types = data;
                    vm.isLoading = false;
                });
            };

            vm.getInterfaces = function (assembly) {
                vm.interfaces = [];
                vm.types = [];

                if (!assembly) return;

                vm.isLoading = true;

                godModeResources.getInterfacesFrom(assembly.Value).then(function (data) {
                    vm.interfaces = data;
                    vm.isLoading = false;
                });
            };

            vm.sortBy = function (column) {
                vm.sort.column = column;
                vm.sort.reverse = !vm.sort.reverse;
            };
        });
})();