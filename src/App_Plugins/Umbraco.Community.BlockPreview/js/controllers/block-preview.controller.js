angular.module('umbraco').controller('Umbraco.Community.BlockPreview.Controllers.BlockPreviewController',
    ['$scope', '$sce', '$element', '$compile', '$timeout', 'editorState', 'Umbraco.Community.BlockPreview.Resources.PreviewResource', 'blockEditorService',
        function ($scope, $sce, $element, $compile, $timeout, editorState, previewResource, blockEditorService) {
            var active = editorState.getCurrent().variants.find(function (v) {
                return v.active;
            });

            if (active !== null) {
                if (active.language !== null) {
                    $scope.language = active.language.culture;
                }
            }

            $scope.id = editorState.getCurrent().id;
            $scope.loading = true;
            $scope.markup = $sce.trustAsHtml('Loading preview');

            function loadPreview(content, settings) {
                $scope.markup = $sce.trustAsHtml('Loading preview');
                $scope.loading = true;

                var formattedBlockData = {
                    layout: $scope.block.layout,
                    contentData: [content ?? $scope.block.data],
                    settingsData: [settings ?? $scope.block.settingsData]
                };

                previewResource.getPreview(formattedBlockData, $scope.id, $scope.model.constructor.name == 'BlockGridBlockController', $scope.language).then(function (data) {
                    $scope.markup = $sce.trustAsHtml(data);
                    $scope.loading = false;
                });
            }

            loadPreview($scope.block.data, $scope.block.settingsData);

            var timeoutPromise;

            $scope.$watch('block.data', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $timeout.cancel(timeoutPromise);

                    timeoutPromise = $timeout(function () {   //Set timeout
                        loadPreview(newValue, null);
                    }, 500);
                }
            }, true);

            $scope.$watch('block.settingsData', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $timeout.cancel(timeoutPromise);

                    timeoutPromise = $timeout(function () {   //Set timeout
                        loadPreview(null, newValue);
                    }, 500);
                }
            }, true);

            $scope.editBlock = function ($event, block) {
                var target = $event.target;
                var actions = target.closest('.umb-block-grid__block--actions');

                if (!actions) {
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
