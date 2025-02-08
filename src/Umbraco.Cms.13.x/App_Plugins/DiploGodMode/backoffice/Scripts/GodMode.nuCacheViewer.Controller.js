(function () {
    'use strict';
    angular.module("umbraco").controller("GodMode.nuCacheViewer.Controller",
        function ($scope, godModeResources, godModeConfig) {

            const vm = this;
            vm.isLoading = true;
            vm.cache = null;

            vm.config = godModeConfig.config;

            const infiniteMode = $scope.model && $scope.model.infiniteMode;
            const nodeId = infiniteMode ? $scope.model.id : null;

            godModeResources.getNuCacheItem(nodeId).then(function (data) {
                vm.isLoading = false;
                data.Data = JSON.parse(data.Data);
                vm.cache = data;
            });

        });
})();