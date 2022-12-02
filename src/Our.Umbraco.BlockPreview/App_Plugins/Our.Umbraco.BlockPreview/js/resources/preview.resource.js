(function () {
    'use strict';

    function previewResource($http, umbRequestHelper) {

        var gridApiUrl = "/umbraco/backoffice/api/BlockGridPreviewApi/PreviewMarkup";
        var listApiUrl = "/umbraco/backoffice/api/BlockListPreviewApi/PreviewMarkup";

        var resource = {
            getGridPreview: getGridPreview,
            getListPreview: getListPreview
        };

        return resource;

        function getGridPreview(data, pageId, culture) {

            return umbRequestHelper.resourcePromise(
                $http.post(gridApiUrl + '?pageId=' + pageId + '&culture=' + culture, data),
                'Failed getting block grid preview markup'
            );
        };

        function getListPreview(data, pageId, culture) {

            return umbRequestHelper.resourcePromise(
                $http.post(listApiUrl + '?pageId=' + pageId + '&culture=' + culture, data),
                'Failed getting block list preview markup'
            );
        };
    }

    angular.module('umbraco.resources').factory('Our.Umbraco.BlockPreview.Resources.PreviewResource', previewResource);

})();
