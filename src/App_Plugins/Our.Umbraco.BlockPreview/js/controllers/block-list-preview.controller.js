angular.module('umbraco').controller('Our.Umbraco.BlockPreview.Controllers.BlockListPreviewController',
    ['$scope', '$sce', '$timeout', 'editorState', 'Our.Umbraco.BlockPreview.Resources.PreviewResource',
        function ($scope, $sce, $timeout, editorState, previewResource) {
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

            function loadPreview() {
                $scope.markup = $sce.trustAsHtml('Loading preview');
                $scope.loading = true;

                var formattedBlockData = {
                    content: $scope.block.data,
                    settings: $scope.block.settingsData
                };

                previewResource.getGridPreview(formattedBlockData, $scope.id, $scope.language).then(function (data) {
                    $scope.markup = $sce.trustAsHtml(data);
                    $scope.loading = false;
                });
            }

            var timeoutPromise;

            $scope.$watch('block.content', function (newValue, oldValue) {
                $timeout.cancel(timeoutPromise);

                timeoutPromise = $timeout(function () {   //Set timeout
                    loadPreview();
                }, 500);
            }, true);
        }
    ]);
