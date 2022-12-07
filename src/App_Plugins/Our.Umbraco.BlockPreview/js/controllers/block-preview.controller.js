angular.module('umbraco').controller('Our.Umbraco.BlockPreview.Controllers.BlockPreviewController',
    ['$scope', '$sce', '$element', '$compile', '$timeout', 'editorState', 'Our.Umbraco.BlockPreview.Resources.PreviewResource',
        function ($scope, $sce, $element, $compile, $timeout, editorState, previewResource) {
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
                    content: content ?? $scope.block.data,
                    settings: settings ?? $scope.block.settingsData
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
        }
    ]);
