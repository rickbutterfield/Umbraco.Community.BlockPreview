(function () {
    'use strict';
    angular.module("umbraco").controller("GodMode.UtilityBrowser.Controller",
        function ($routeParams, $http, navigationService, notificationsService, godModeResources, godModeConfig) {

            const vm = this;
            vm.languages = [];

            const noLang = {
                Id: -1,
                Name: "No Culture",
                Culture: null
            };

            vm.lang = noLang;

            navigationService.syncTree({ tree: $routeParams.tree, path: [-1, $routeParams.method], forceReload: false });

            vm.config = godModeConfig.config;
            vm.warmup = {
                current: 0,
                count: 0,
                url: null
            };

            godModeResources.getLanguages().then(function (data) {
                data.push(noLang);
                vm.languages = data;
            });

            vm.loading = false;

            const handleResponse = function (response) {
                if (response) {
                    if (response.Response === "Error") {
                        notificationsService.error(response.Message);
                    }
                    else if (response.Response === "Success") {
                        notificationsService.success(response.Message);
                    }
                    if (response.Response === "Warning") {
                        notificationsService.warning(response.Message);
                    }
                }
                else {
                    notificationsService.error("No response was sent back from the server. Something didn't quite work out.");
                }
            };

            const pingUrls = function (response) {

                if (response.length === 0) {
                    notificationsService.warning("The URL list was empty...");
                }

                vm.warmup.current = 0;
                vm.warmup.url = "[waiting...]";

                if (!response) {
                    console.log("Error fetching URLs....");
                }

                vm.warmup.count = response.length;

                angular.forEach(response, function (url) {
                    $http.get(url).then(function (res) {
                        vm.warmup.current++;
                        vm.warmup.url = url;
                        console.log("Warmed up page: " + url);
                    }, function (err) {
                        vm.warmup.current++;
                        vm.warmup.url = url;
                    });
                });
            }

            vm.clearCache = function (cache) {
                godModeResources.clearUmbracoCache(cache).then(function (response) {
                    handleResponse(response);
                });
            };

            vm.purgeMediaCache = function () {
                if (window.confirm("This will attempt to delete all the cached image crops on disk in the TEMP/MediaCache. IO operations can sometimes fail. Are you sure?")) {
                    vm.loading = true;
                    godModeResources.prugeMediaCache().then(function (response) {
                        vm.loading = false;
                        handleResponse(response);
                    });
                }
            };

            vm.restartAppPool = function () {
                if (window.confirm("This will take the site offline (and won't restart it). Are you really, really, really sure?")) {
                    godModeResources.restartAppPool().then(function (response) {
                        handleResponse(response);
                        document.location.reload(true);
                    });
                }
            };

            vm.warmUpTemplates = function () {
                godModeResources.getTemplateUrls().then(function (response) {
                    pingUrls(response);
                });
            };

            vm.pingUrls = function () {

                let culture = null;

                if (vm.lang) {
                    culture = vm.lang.Culture;
                }

                godModeResources.getUrlsToPing(culture).then(function (response) {
                    pingUrls(response);
                });
            };
        });
})();