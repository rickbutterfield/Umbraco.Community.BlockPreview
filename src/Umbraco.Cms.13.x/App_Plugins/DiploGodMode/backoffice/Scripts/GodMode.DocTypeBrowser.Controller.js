(function () {
    'use strict';
    angular.module("umbraco").controller("GodMode.DocTypeBrowser.Controller",
        function ($routeParams, navigationService, godModeResources, godModeConfig, editorService, $scope) {

            const vm = this;
            const infiniteMode = $scope.model && $scope.model.infiniteMode;
            const param = infiniteMode ? $scope.model.id : null;

            vm.contentTypes = [];

            navigationService.syncTree({ tree: $routeParams.tree, path: [-1, $routeParams.method], forceReload: false });

            vm.config = godModeConfig.config;
            vm.search = {};
            vm.search.includeInherited = true;

            vm.triStateOptions = godModeResources.getTriStateOptions();
            vm.variations = ["Any", "Nothing", "Culture", "Segment", "CultureAndSegment"];

            vm.search.hasTemplate = vm.triStateOptions[0];
            vm.search.isListView = vm.triStateOptions[0];
            vm.search.allowedAtRoot = vm.triStateOptions[0];
            vm.search.hasCompositions = vm.triStateOptions[0];
            vm.search.isElement = vm.triStateOptions[0];
            vm.search.variesBy = vm.variations[0];

            const init = function () {
                vm.isLoading = true;
                const openContentTypes = vm.contentTypes.filter(function (ct) { return ct.IsOpen; }).map(function (ct) { return ct.Id; });

                godModeResources.getContentTypeMap().then(function (data) {
                    vm.contentTypes = data;
                    if (openContentTypes) {
                        vm.contentTypes.map(function (ct) { if (openContentTypes.indexOf(ct.Id) > -1) ct.IsOpen = true; });
                    }
                    vm.isLoading = false;
                });

                godModeResources.getPropertyGroups().then(function (data) {
                    vm.propertyGroups = data;
                });

                godModeResources.getCompositions().then(function (data) {
                    vm.compositions = data;
                });

                godModeResources.getDataTypes().then(function (data) {
                    vm.dataTypes = data;
                });

                godModeResources.getPropertyEditors().then(function (data) {
                    vm.propertyEditors = data;
                    if (param !== "browse") {
                        vm.propertyEditors.filter(function (elem) {
                            if (elem.Alias === param) {
                                vm.search.propertyEditor = elem;
                            }
                        });
                    }
                });
            };

            vm.reload = function () { init(); };

            init();

            vm.filterContentTypes = function (ct) {

                if (vm.search.doctype) {
                    if (ct.Name.toLowerCase().indexOf(vm.search.doctype.toLowerCase()) === -1 &&
                        ct.Alias.toLowerCase().indexOf(vm.search.doctype.toLowerCase()) === -1 &&
                        ct.Udi.toLowerCase().indexOf(vm.search.doctype.toLowerCase()) === -1) {
                        return;
                    }
                }

                if (!ct.HasTemplates === vm.search.hasTemplate.value) {
                    return;
                }

                if (!ct.IsListView === vm.search.isListView.value) {
                    return;
                }

                if (!ct.AllowedAtRoot === vm.search.allowedAtRoot.value) {
                    return;
                }

                if (!ct.HasCompositions === vm.search.hasCompositions.value) {
                    return;
                }

                if (!ct.IsElement === vm.search.isElement.value) {
                    return;
                }

                if (vm.search.variesBy !== "Any" && ct.VariesBy !== vm.search.variesBy) {
                    return;
                }

                if (vm.search.propertyGroup && ct.PropertyGroups.indexOf(vm.search.propertyGroup) === -1) {
                    return;
                }

                if (vm.search.composedOf) {
                    if (!ct.Compositions.some(function (elem) {
                        return elem.Id === vm.search.composedOf.Id;
                    })) return;
                }

                if (vm.search.property) {
                    const props = vm.search.includeInherited ? ct.AllProperties : ct.Properties;

                    if (!props.some(function (elem) {
                        return elem.Name.toLowerCase().indexOf(vm.search.property.toLowerCase()) > -1 || elem.Alias.toLowerCase().indexOf(vm.search.property.toLowerCase()) > -1;
                    })) return;
                }

                if (vm.search.template) {
                    if (!ct.Templates.some(function (elem) {
                        return elem.Alias.toLowerCase().indexOf(vm.search.template.toLowerCase()) > -1 || elem.Name.toLowerCase().indexOf(vm.search.template.toLowerCase()) > -1;
                    })) return;
                }

                if (vm.search.dataType) {
                    if (!ct.AllProperties.some(function (elem) {
                        return elem.EditorId === vm.search.dataType.Id;
                    })) return;
                }

                if (vm.search.propertyEditor) {
                    if (!ct.AllProperties.some(function (elem) {
                        return elem.EditorAlias === vm.search.propertyEditor.Alias;
                    })) return;
                }

                return ct;
            };

            vm.openContentType = function (contentTypeId) {
                const editor = {
                    id: contentTypeId,
                    submit: function () {
                        init();
                        editorService.close();
                    },
                    close: function () {
                        editorService.close();
                    }
                };
                editorService.documentTypeEditor(editor);
                return false;
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

            vm.openTemplate = function (templateId) {
                const editor = {
                    id: templateId,
                    submit: function () {
                        init();
                        editorService.close();
                    },
                    close: function () {
                        editorService.close();
                    }
                };
                editorService.templateEditor(editor);
            };
        });
})();