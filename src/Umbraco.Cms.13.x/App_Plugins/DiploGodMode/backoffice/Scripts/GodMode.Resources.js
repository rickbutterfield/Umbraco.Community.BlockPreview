(function () {
    'use strict';
    angular.module('umbraco.resources').factory('godModeResources', function ($q, $http, umbRequestHelper, godModeConfig) {
        return {
            getContentTypeMap: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetContentTypeMap")
                );
            },
            getPropertyGroups: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetPropertyGroups")
                );
            },
            getCompositions: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetCompositions")
                );
            },
            getDataTypes: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetDataTypes")
                );
            },
            getDataTypesStatus: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetDataTypesStatus")
                );
            },
            getPropertyEditors: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetPropertyEditors")
                );
            },
            getTemplates: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetTemplates")
                );
            },
            getMedia: function (page, pageSize, criteria, orderBy, orderByDir) {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetMedia",
                        {
                            params: { page: page, pageSize: pageSize, name: criteria.name, id: criteria.id, mediaTypeId: criteria.mediaType !== null ? criteria.mediaType.Id : null, orderBy: orderBy, orderByDir: orderByDir }
                        })
                );
            },
            getMediaTypes: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetMediaTypes")
                );
            },
            getContentPaged: function (page, pageSize, criteria, orderBy) {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetContentPaged",
                        {
                            params: { page: page, pageSize: pageSize, name: criteria.Name, alias: criteria.Alias, creatorId: criteria.CreatorId, id: criteria.Id, level: criteria.Level, trashed: criteria.Trashed.value, updaterId: criteria.UpdaterId, languageId: criteria.LanguageId ? criteria.LanguageId.Id : null, orderBy: orderBy }
                        })
                );
            },
            getLanguages: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetLanguages")
                );
            },
            getMembersPaged: function (page, pageSize, groupId, search, orderBy) {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetMembersPaged",
                        {
                            params: { page: page, pageSize: pageSize, groupId: groupId, search: search, orderBy: orderBy }
                        })
                );
            },
            getMemberGroups: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetMemberGroups")
                );
            },
            getContentTypeAliases: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetContentTypeAliases")
                );
            },
            getStandardContentTypeAliases: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetStandardContentTypeAliases")
                );
            },
            getSurfaceControllers: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetSurfaceControllers")
                );
            },
            getApiControllers: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetApiControllers")
                );
            },
            getRenderMvcControllers: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetRenderMvcControllers")
                );
            },
            getPublishedContentModels: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetPublishedContentModels")
                );
            },
            getPropertyValueConveters: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetPropertyValueConverters")
                );
            },
            getComposers: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetComposers")
                );
            },
            getContentFinders: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetContentFinders")
                );
            },
            getUrlProviders: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetUrlProviders")
                );
            },
            getViewComponents: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetViewComponents")
                );
            },
            getTagHelpers: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetTagHelpers")
                );
            },
            getEnvironmentDiagnostics: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetEnvironmentDiagnostics")
                );
            },
            getTypesAssignableFrom: function (baseType) {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetTypesAssignableFrom?baseType=" + baseType)
                );
            },
            getInterfacesFrom: function (assembly) {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetInterfacesFrom?assembly=" + assembly)
                );
            },
            getTypesFrom: function (assembly) {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetTypesFrom?assembly=" + assembly)
                );
            },
            getTypesToBrowse: function (baseType) {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetTypesToBrowse")
                );
            },
            getUmbracoAssemblies: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetUmbracoAssemblies")
                );
            },
            getAssemblies: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetAssembliesWithInterfaces")
                );
            },
            getRegisteredServices: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetRegisteredServices")
                );
            },
            clearUmbracoCache: function (cache) {
                return umbRequestHelper.resourcePromise(
                    $http.post(godModeConfig.baseApiUrl + "ClearUmbracoCache?cache=" + cache)
                );
            },
            prugeMediaCache: function () {
                return umbRequestHelper.resourcePromise(
                    $http.post(godModeConfig.baseApiUrl + "PurgeMediaCache")
                );
            },
            deleteTag: function (id) {
                return umbRequestHelper.resourcePromise(
                    $http.post(godModeConfig.baseApiUrl + "DeleteTag?id=" + id)
                );
            },
            getOrphanedTags: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetOrphanedTags")
                );
            },
            fixTemplateMasters: function () {
                return umbRequestHelper.resourcePromise(
                    $http.post(godModeConfig.baseApiUrl + "FixTemplateMasters")
                );
            },
            restartAppPool: function () {
                return umbRequestHelper.resourcePromise(
                    $http.post(godModeConfig.baseApiUrl + "RestartAppPool")
                );
            },
            bumpClientDependencyVersion: function () {
                return umbRequestHelper.resourcePromise(
                    $http.post(godModeConfig.baseApiUrl + "BumpClientDependencyVersion")
                );
            },
            getTemplateUrls: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetTemplateUrlsToPing")
                );
            },
            getUrlsToPing: function (culture) {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetUrlsToPing?culture=" + culture)
                );
            },
            getConfig: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetConfig")
                );
            },
            getTagMapping: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetTagMapping")
                );
            },
            getContentUsage: function (id, orderBy) {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetContentUsageData",
                        {
                            params: { id: id, orderBy: orderBy }
                        })
                );
            },
            getTriStateOptions: function () {
                return [
                    { label: 'Any', value: null },
                    { label: 'Yes', value: true },
                    { label: 'No', value: false },
                ];
            },
            getNuCacheItem: function (id) {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetNuCacheItem",
                        {
                            params: { id: id }
                        })
                );
            },
            getNuCacheType: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get(godModeConfig.baseApiUrl + "GetNuCacheType")
                );
            },
            copyDataType: function (id) {
                return umbRequestHelper.resourcePromise(
                    $http.post(godModeConfig.baseApiUrl + "CopyDataType?id=" + id)
                );
            },
        };
    });
})();