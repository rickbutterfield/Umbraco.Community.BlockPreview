(function () {
    'use strict';
    angular.module("umbraco").controller("GodMode.PartialBrowser.Controller",
        function ($routeParams, navigationService, godModeResources, godModeConfig, editorService) {

            const vm = this;
            vm.templates = [];

            navigationService.syncTree({ tree: $routeParams.tree, path: [-1, $routeParams.method], forceReload: false });

            vm.config = godModeConfig.config;
            vm.search = {};
            vm.sort = {};
            vm.sort.column = "Name";
            vm.sort.reverse = false;
            vm.triStateOptions = godModeResources.getTriStateOptions();

            vm.init = function () {
                vm.isLoading = true;

                godModeResources.getTemplates().then(function (data) {
                    vm.templates = data;

                    vm.partials = data.map(function (p) {
                        return p.Partials;
                    }).reduce(function (a, b) {
                        return a.concat(b);
                    });

                    vm.isLoading = false;
                });
            };

            vm.init();

            vm.sortBy = function (column) {
                vm.sort.column = column;
                vm.sort.reverse = !vm.sort.reverse;
            };

            vm.filterPartials = function (p) {
                if (vm.search.partial) {
                    if (p.Name.toLowerCase().indexOf(vm.search.partial.toLowerCase()) === -1) {
                        return;
                    }
                }

                if (vm.search.template) {
                    return p.TemplateId === vm.search.template.Id;
                }

                return p;
            };

            vm.openTemplate = function (templateId) {
                const editor = {
                    id: templateId,
                    submit: function () {
                        vm.init();
                        editorService.close();
                    },
                    close: function () {
                        editorService.close();
                    }
                };
                editorService.templateEditor(editor);
            };

            vm.openPartial = function (path) {
                const editor = {
                    view: "views/partialViews/edit.html",
                    id: encodeURIComponent(path),
                    submit: function () {
                        vm.init();
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