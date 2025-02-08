(function () {
    'use strict';
    angular.module("umbraco").controller("GodMode.UsageBrowser.Controller",
        function ($routeParams, navigationService, godModeResources, godModeConfig, editorService) {

            const vm = this;
            vm.isLoading = true;

            navigationService.syncTree({ tree: $routeParams.tree, path: [-1, $routeParams.method], forceReload: false });

            vm.config = godModeConfig.config;
            vm.criteria = {};
            vm.contentTypeAliases = [];
            vm.sort = {};
            vm.sort.column = "CT.Alias";
            vm.usage = [];

            vm.fetchContent = function (orderBy) {
                vm.isLoading = true;
                orderBy = orderBy === undefined ? "CT.Alias" : orderBy;

                godModeResources.getContentUsage(null, orderBy).then(function (data) {
                    vm.usage = data;
                    vm.isLoading = false;
                });
            };

            vm.sortBy = function (column) {
                vm.sort.column = column;
                vm.sort.reverse = !vm.sort.reverse;
                let orderBy = vm.sort.column;

                if (orderBy) {
                    orderBy = vm.sort.reverse ? orderBy + " DESC" : orderBy + " ASC";
                }

                vm.fetchContent(orderBy);
            };

            vm.filterChange = function () {
                vm.currentPage = 1;
                vm.page = {};
                vm.fetchContent();
            };

            vm.fetchContent();

            vm.openContentBrowser = function (contentTypeAlias) {
                const editor = {
                    view: godModeConfig.basePathUrl + "contentBrowser.html",
                    id: contentTypeAlias,
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