(function () {
    'use strict';
    angular.module("umbraco").controller("GodMode.DataTypeBrowser.Controller",
        function ($routeParams, navigationService, godModeResources, godModeConfig, editorService) {

            const vm = this;

            navigationService.syncTree({ tree: $routeParams.tree, path: [-1, $routeParams.method], forceReload: false });

            vm.config = godModeConfig.config;
            vm.search = {};
            vm.sort = {};
            vm.sort.column = "Name";
            vm.sort.reverse = false;

            vm.triStateOptions = godModeResources.getTriStateOptions();
            vm.search.isUsed = vm.triStateOptions[0];

            const init = function () {
                vm.isLoading = true;
                godModeResources.getDataTypesStatus().then(function (data) {
                    vm.dataTypes = data;
                    vm.isLoading = false;
                });
            };

            init();

            vm.reload = function () { init(); };

            vm.sortBy = function (column) {
                vm.sort.column = column;
                vm.sort.reverse = !vm.sort.reverse;
            }

            godModeResources.getPropertyEditors().then(function (data) {
                vm.propertyEditors = data;
            });

            vm.filterDataTypes = function (d) {
                if (vm.search.dataType) {
                    if (d.Name.toLowerCase().indexOf(vm.search.dataType.toLowerCase()) === -1 &&
                        d.Id !== parseInt(vm.search.dataType) &&
                        d.Udi.toLowerCase().indexOf(vm.search.dataType.toLowerCase()) === -1) {
                        return;
                    }
                }

                if (vm.search.propertyEditor) {
                    if (d.Alias.toLowerCase().indexOf(vm.search.propertyEditor.Alias.toLowerCase()) === -1) {
                        return;
                    }
                }

                if (vm.search.dbType) {
                    if (d.DbType !== vm.search.dbType.DbType) {
                        return;
                    }
                }

                if (!d.IsUsed === vm.search.isUsed.value) {
                    return;
                }

                return d;
            };

            vm.openDataType = function (dataTypeId) {
                const editor = {
                    view: "views/common/infiniteeditors/datatypesettings/datatypesettings.html",
                    id: dataTypeId,
                    submit: function () {
                        init();
                        editorService.close();
                    },
                    close: function () {
                        editorService.close();
                    }
                };
                editorService.open(editor);
            };

            vm.openDocTypeBrowser = function (dataTypeAlias) {

                const editor = {
                    view: godModeConfig.basePathUrl + "docTypeBrowser.html",
                    id: dataTypeAlias,
                    submit: function () {
                        init();
                        editorService.close();
                    },
                    close: function () {
                        editorService.close();
                    }
                };
                editorService.open(editor);
            };
        });
})();