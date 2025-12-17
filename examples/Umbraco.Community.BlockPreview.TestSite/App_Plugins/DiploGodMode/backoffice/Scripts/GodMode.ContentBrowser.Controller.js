(function () {
    'use strict';
    angular.module("umbraco").controller("GodMode.ContentBrowser.Controller",
        function ($routeParams, navigationService, godModeResources, godModeConfig, editorService, $scope) {

            const vm = this;
            const infiniteMode = $scope.model && $scope.model.infiniteMode;
            const param = infiniteMode ? $scope.model.id : null;

            navigationService.syncTree({ tree: $routeParams.tree, path: [-1, $routeParams.method], forceReload: false });

            vm.config = godModeConfig.config;
            vm.criteria = {};
            vm.page = {};
            vm.currentPage = 1;
            vm.itemsPerPage = 15;
            vm.content = [];
            vm.contentTypeAliases = [];
            vm.languages = [];
            vm.sort = {};
            vm.sort.column = "N.id";
            vm.nuCacheViewer = false;

            vm.triStateOptions = godModeResources.getTriStateOptions();
            vm.criteria.Trashed = vm.triStateOptions[0];

            godModeResources.getNuCacheType().then(function (data) {
                if (data) {
                    vm.nuCacheViewer = data !== "MessagePack";
                }
            });

            vm.fetchContent = function (orderBy) {

                vm.isLoading = true;
                godModeResources.getContentPaged(vm.currentPage, vm.itemsPerPage, vm.criteria, orderBy).then(function (data) {
                    vm.page = data;
                    vm.currentPage = vm.page.CurrentPage;
                    vm.isLoading = false;
                });
            };

            vm.sortBy = function (column) {
                vm.sort.column = column;
                vm.sort.reverse = !vm.sort.reverse;
                var orderBy = vm.sort.column;

                if (orderBy) {
                    orderBy = vm.sort.reverse ? orderBy + " DESC" : orderBy + " ASC";
                }

                vm.fetchContent(orderBy);
            };

            vm.prevPage = function () {
                if (vm.currentPage > 1) {
                    vm.currentPage--;
                    vm.fetchContent(vm.sort.column);
                }
            };

            vm.nextPage = function () {
                if (vm.currentPage < vm.page.TotalPages) {
                    vm.currentPage++;
                    vm.fetchContent(vm.sort.column);
                }
            };

            vm.setPage = function (pageNumber) {
                vm.currentPage = pageNumber;
                vm.fetchContent(vm.sort.column);
            };

            vm.filterChange = function () {
                vm.currentPage = 1;
                vm.page = {};
                vm.fetchContent(vm.sort.column);
            };

            godModeResources.getLanguages().then(function (data) {

                data.push({
                    Id: -1,
                    Name: "No Language",
                    Culture: null
                })

                vm.languages = data;
            });

            godModeResources.getStandardContentTypeAliases().then(function (data) {
                vm.contentTypeAliases = data;

                if (param !== "browse") {
                    vm.contentTypeAliases.filter(function (elem) {
                        if (elem === param) {
                            vm.criteria.Alias = elem;
                        }
                    });
                }

                vm.fetchContent();
            });

            vm.openContent = function (contentId) {
                const editor = {
                    id: contentId,
                    submit: function () {
                        vm.fetchContent();
                        editorService.close();
                    },
                    close: function () {
                        editorService.close();
                    }
                };
                editorService.contentEditor(editor);
            };


            vm.openNuCacheViewer = function (id) {
                const editor = {
                    view: godModeConfig.basePathUrl + "nuCacheViewer.html",
                    id: id,
                    submit: function () {
                        vm.fetchContent();
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