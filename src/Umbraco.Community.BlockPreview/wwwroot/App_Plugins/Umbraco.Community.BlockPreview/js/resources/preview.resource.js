(function () {
    'use strict';

    function previewResource($http, umbRequestHelper) {

        var apiGridUrl = Umbraco.Sys.ServerVariables.UmbracoCommunityBlockPreview.PreviewGridApi;
        var apiListUrl = Umbraco.Sys.ServerVariables.UmbracoCommunityBlockPreview.PreviewListApi;
        var apiRichTextUrl = Umbraco.Sys.ServerVariables.UmbracoCommunityBlockPreview.PreviewRichTextApi;

        var resource = {
            getGridPreview: getGridPreview,
            getListPreview: getListPreview,
            getRichTextPreview: getRichTextPreview,
        };

        return resource;

        function getGridPreview(
            nodeKey,
            blockData,
            blockEditorAlias,
            contentElementAlias,
            culture,
            documentTypeKey,
            contentUdi,
            settingsUdi,
            blockIndex)
        {
            culture = culture || '';

            return umbRequestHelper.resourcePromise(
                $http.post(`${apiGridUrl}?nodeKey=${nodeKey}&blockEditorAlias=${blockEditorAlias}&contentElementAlias=${contentElementAlias}&documentTypeKey=${documentTypeKey}&contentUdi=${contentUdi}&settingsUdi=${settingsUdi}&culture=${culture}&blockIndex=${blockIndex}`, blockData),
                'Failed getting block preview markup'
            );
        };

        function getListPreview(
            nodeKey,
            blockData,
            blockEditorAlias,
            contentElementAlias,
            culture,
            documentTypeKey,
            contentUdi,
            settingsUdi,
            blockIndex)
        {
            culture = culture || '';

            return umbRequestHelper.resourcePromise(
                $http.post(`${apiListUrl}?nodeKey=${nodeKey}&blockEditorAlias=${blockEditorAlias}&contentElementAlias=${contentElementAlias}&culture=${culture}&documentTypeKey=${documentTypeKey}&contentUdi=${contentUdi}&settingsUdi=${settingsUdi}&blockIndex=${blockIndex}`, blockData),
                'Failed getting block preview markup'
            );
        };

        function getRichTextPreview(
            nodeKey,
            blockData,
            blockEditorAlias,
            contentElementAlias,
            culture,
            documentTypeKey)
        {
            culture = culture || '';

            return umbRequestHelper.resourcePromise(
                $http.post(`${apiRichTextUrl}?nodeKey=${nodeKey}&blockEditorAlias=${blockEditorAlias}&contentElementAlias=${contentElementAlias}&culture=${culture}&documentTypeKey=${documentTypeKey}`, blockData),
                'Failed getting block preview markup'
            );
        };
    }

    angular.module('umbraco.resources').factory('Umbraco.Community.BlockPreview.Resources.PreviewResource', previewResource);

})();
