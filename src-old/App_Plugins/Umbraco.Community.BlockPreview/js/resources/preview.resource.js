(function () {
    'use strict';

    function previewResource($http, umbRequestHelper) {

        var apiUrl = Umbraco.Sys.ServerVariables.UmbracoCommunityBlockPreview.PreviewApi;

        var resource = {
            getPreview: getPreview,
        };

        return resource;

        function getPreview(data, pageId, isGrid, culture) {
            culture = culture || '';

            return umbRequestHelper.resourcePromise(
                $http.post(apiUrl + '?pageId=' + pageId + '&isGrid=' + isGrid + '&culture=' + culture, data),
                'Failed getting block preview markup'
            );
        };
    }

    angular.module('umbraco.resources').factory('Umbraco.Community.BlockPreview.Resources.PreviewResource', previewResource);

})();
