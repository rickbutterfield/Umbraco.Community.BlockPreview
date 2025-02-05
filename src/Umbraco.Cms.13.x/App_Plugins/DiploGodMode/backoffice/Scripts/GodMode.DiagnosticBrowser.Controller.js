(function () {
    'use strict';
    angular.module("umbraco").controller("GodMode.DiagnosticBrowser.Controller",
        function ($routeParams, navigationService, godModeResources, godModeConfig) {

            const vm = this;
            vm.isLoading = true;

            navigationService.syncTree({ tree: $routeParams.tree, path: [-1, $routeParams.method], forceReload: false });

            vm.config = godModeConfig.config;
            vm.search = {};
            vm.sort = {};
            vm.sort.column = "Name";
            vm.sort.reverse = false;
            vm.heading = "Diagnostics";

            vm.init = function () {
                vm.isLoading = true;
                godModeResources.getEnvironmentDiagnostics().then(function (data) {
                    vm.diagnostics = data;
                    vm.groups = vm.diagnostics.map(function (g) {
                        return { Id: g.Id, Title: g.Title };
                    });

                    vm.search.group = vm.groups[0];
                    vm.selectGroup(vm.search.group);

                    vm.isLoading = false;
                });
            };
            vm.init();

            vm.selectGroup = function (group) {
                let selectedGroup = vm.diagnostics.filter(function (g) {
                    return g.Id === group.Id;
                });

                vm.group = selectedGroup[0];
            };

            vm.filterValues = function (v) {
                if (vm.search.name && v.Key.toLowerCase().indexOf(vm.search.name.toLowerCase()) === -1) {
                    return;
                }

                if (vm.search.value && v.Value !== null && v.Value.toLowerCase().indexOf(vm.search.value.toLowerCase()) === -1) {
                    return;
                }

                return v;
            };
        });
})();