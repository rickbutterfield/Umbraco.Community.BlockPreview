angular.module('umbraco').controller('Umbraco.Community.BlockPreview.Controllers.BlockPreviewController',
    ['$scope', '$sce', '$timeout', 'editorState', 'Umbraco.Community.BlockPreview.Resources.PreviewResource',
        function ($scope, $sce, $timeout, editorState, previewResource) {
            var current = editorState.getCurrent();
            var active = current.variants.find(function (v) {
                return v.active;
            });

            $scope.nodeKey = current.key;

            if (active !== null) {
                if (active.language !== null) {
                    $scope.language = active.language.culture;
                }
            }

            $scope.cacheBuster = Umbraco.Sys.ServerVariables.application.cacheBuster;

            $scope.documentTypeKey = current.documentType.key;
            $scope.loading = true;
            $scope.markup = $sce.trustAsHtml('<div class="preview-alert preview-alert-info">Loading preview</div>');

            // There must be a better way to do this...
            $scope.blockEditorAlias = '';
            var parent = $scope.$parent;

            $scope.isGrid = false;
            $scope.isList = false;
            $scope.isRte = false;

            $scope.contentElementAlias = $scope.block.content.contentTypeAlias;
            $scope.contentUdi = $scope.block.content.udi;
            $scope.settingsUdi = $scope.block.settingsData?.udi || '';

            while (parent.$parent) {
                if (parent.vm) {
                    if (parent.vm.constructor.name == 'BlockGridController') {
                        $scope.blockEditorAlias = parent.vm.model.alias;
                        $scope.modelValue = parent.vm.model.value;
                        $scope.isGrid = true;
                        break;
                    }

                    if (parent.vm.constructor.name == 'BlockListController') {
                        $scope.blockEditorAlias = parent.vm.model.alias;
                        $scope.modelValue = parent.vm.model.value;
                        $scope.isList = true;
                        break;
                    }
                }

                if (parent.model) {
                    if (parent.model.constructor.name == 'umbRteBlockController') {
                        $scope.modelValue = {
                            contentData: [$scope.block.data],
                            settingsData: [$scope.block.settingsData],
                            layout: $scope.block.layout
                        }

                        $scope.isRte = true;
                        break;
                    }
                }

                parent = parent.$parent;
            }

            parent = $scope.$parent;
            while (parent.$parent) {
                if (parent.vm) {
                    if (parent.vm.constructor.name == 'ElementEditorContentComponentController') {
                        $scope.documentTypeKey = parent.vm.model.contentTypeKey;
                        break;
                    }
                }

                parent = parent.$parent;
            }

            function loadPreview() {
                $scope.markup = $sce.trustAsHtml('<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader>Loading preview...</div>');
                $scope.loading = true;

                if ($scope.isGrid) {
                    previewResource.getGridPreview(
                        $scope.nodeKey,
                        $scope.modelValue,
                        $scope.blockEditorAlias,
                        $scope.contentElementAlias,
                        $scope.language,
                        $scope.documentTypeKey,
                        $scope.contentUdi,
                        $scope.settingsUdi,
                        $scope.block.index)
                            .then(function (data) {
                                $scope.markup = $sce.trustAsHtml(data);
                                $scope.loading = false;
                            });
                }

                if ($scope.isList) {
                    previewResource.getListPreview(
                        $scope.nodeKey,
                        $scope.modelValue,
                        $scope.blockEditorAlias,
                        $scope.contentElementAlias,
                        $scope.language,
                        $scope.documentTypeKey,
                        $scope.contentUdi,
                        $scope.settingsUdi)
                        .then(function (data) {
                            $scope.markup = $sce.trustAsHtml(data);
                            $scope.loading = false;
                        });
                }

                if ($scope.isRte) {
                    previewResource.getRichTextPreview(
                        $scope.nodeKey,
                        $scope.modelValue,
                        $scope.blockEditorAlias,
                        $scope.contentElementAlias,
                        $scope.language,
                        $scope.documentTypeKey)
                        .then(function (data) {
                            $scope.markup = $sce.trustAsHtml(data);
                            $scope.loading = false;
                        });
                }
            }

            loadPreview();

            var timeoutPromise;

            $scope.$watch('block.layout.columnSpan', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $timeout.cancel(timeoutPromise);

                    timeoutPromise = $timeout(function () {
                        loadPreview(newValue, null);
                    }, 500);
                }
            }, true);

            $scope.$watch('block.layout.rowSpan', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $timeout.cancel(timeoutPromise);

                    timeoutPromise = $timeout(function () {
                        loadPreview(newValue, null);
                    }, 500);
                }
            }, true);

            $scope.$watch('block.data', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $timeout.cancel(timeoutPromise);

                    timeoutPromise = $timeout(function () {
                        loadPreview(newValue, null);
                    }, 500);
                }
            }, true);

            $scope.$watch('block.settingsData', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $timeout.cancel(timeoutPromise);

                    timeoutPromise = $timeout(function () {
                        loadPreview(null, newValue);
                    }, 500);
                }
            }, true);

            $scope.editBlock = function ($event, block) {
                var target = $event.target;
                var blockActions = target.closest('.umb-block-grid__block--actions');
                var areaCreate = target.closest('.umb-block-grid__create-button');
                var blockCreateButton = target.closest('.umb-block-grid__block--inline-create-button');
                var blockCreateButtonLast = target.closest('.umb-block-grid__block--last-inline-create-button');
                var blockScaling = target.closest('.umb-block-grid__scale-handler') || target.closest('.--scale-mode');

                if (!blockActions && !areaCreate && !blockCreateButton && !blockCreateButtonLast && !blockScaling) {
                    block.edit();
                    $event.preventDefault();
                    $event.stopPropagation();
                    $event.stopImmediatePropagation();
                    $event.cancelBubble = true;
                    return;
                }
            }
        }
    ]);
