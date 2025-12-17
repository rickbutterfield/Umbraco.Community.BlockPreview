(function () {
    'use strict';
    angular.module("umbraco").controller("GodMode.MediaBrowser.Controller",
        function ($routeParams, navigationService, godModeResources, godModeConfig, editorService) {

            const vm = this;
            vm.isLoading = true;

            navigationService.syncTree({ tree: $routeParams.tree, path: [-1, $routeParams.method], forceReload: false });

            vm.config = godModeConfig.config;
            vm.criteria = {
                mediaType: {
                }
            };

            vm.page = {};
            vm.currentPage = 1;
            vm.itemsPerPage = 20;
            vm.sort = {};
            vm.sort.column = "id";

            vm.fetchContent = function (orderBy, orderByDir) {
                vm.isLoading = true;
                godModeResources.getMedia(vm.currentPage, vm.itemsPerPage, vm.criteria, orderBy, orderByDir).then(function (data) {
                    vm.page = data;
                    vm.isLoading = false;
                });
            };

            vm.sortBy = function (column) {
                vm.sort.column = column;
                vm.sort.reverse = !vm.sort.reverse;
                let orderBy = vm.sort.column;
                let orderByDir = vm.sort.reverse ? "DESC" : "ASC";

                vm.fetchContent(orderBy, orderByDir);
            };

            vm.prevPage = function () {
                if (vm.currentPage > 1) {
                    vm.currentPage--;
                    vm.fetchContent();
                }
            };

            vm.nextPage = function () {
                if (vm.currentPage < vm.page.TotalPages) {
                    vm.currentPage++;
                    vm.fetchContent();
                }
            };

            vm.setPage = function (pageNumber) {
                vm.currentPage = pageNumber;
                vm.fetchContent();
            };

            vm.filterChange = function () {
                vm.currentPage = 1;
                vm.page = {};
                vm.fetchContent();
            };

            vm.getMediaTypes = function () {
                godModeResources.getMediaTypes().then(function (data) {
                    vm.mediaTypes = data;
                    vm.criteria.mediaType = null;
                });
            };

            vm.getMediaTypes();

            vm.fetchContent();

            vm.openMedia = function (mediaId) {
                const editor = {
                    id: mediaId,
                    submit: function () {
                        vm.fetchContent();
                        editorService.close();
                    },
                    close: function () {
                        editorService.close();
                    }
                };
                editorService.mediaEditor(editor);
            };
        });
})();