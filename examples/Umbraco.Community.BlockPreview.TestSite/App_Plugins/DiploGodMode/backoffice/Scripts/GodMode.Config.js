(function () {
    'use strict';
    angular.module("umbraco")
        .constant("godModeConfig", {
            "baseApiUrl": "backoffice/Api/GodModeApi/",
            "basePathUrl": "/App_Plugins/DiploGodMode/backoffice/godModeTree/",
            "config": {
                "version": "10.0.0",
                "editTemplateUrl": "#/settings/templates/edit/",
                "editDataTypeUrl": "#/settings/datatypes/edit/",
                "editDocTypeUrl": "#settings/documentTypes/edit/",
                "editPartialUrl": "#/settings/partialViews/edit/",
                "editMediaUrl": "#/media/media/edit/",
                "editContentUrl": "#/content/content/edit/",
                "baseTreeUrl": "#/settings/godModeTree/",
                "baseViewUrl": "#/settings/godModeTree/"
            }
        })
        .directive('godmodeTrueFalse', function () {
            return {
                restrict: 'E',
                scope: {
                    value: '='
                },
                link: function (scope, element, attrs) {
                },
                template: '<span ng-show="value"><i class="icon icon-checkbox"></i> Yes</span><span ng-show="!value"><i class="icon icon-checkbox-empty"></i> No</span>'
            };
        })
        .directive('godmodeSortable', function () {
            return {
                restrict: 'E',
                scope: {
                    column: '@',
                    sort: "=",
                    sortBy: "&"
                },
                transclude: true,
                link: function (scope, element, attrs) {
                },
                template: '<a ng-click="sortBy()" ng-transclude></a><i class="icon" ng-show="sort.column === column && !sort.reverse">&#9650;</i><i class="icon" ng-show="sort.column === column && sort.reverse">&#9660;</i>'
            };
        })
        .directive('godmodeHeader', function ($route, godModeConfig) {
            return {
                restrict: 'E',
                scope: {
                    heading: '@',
                    tooltip: '@',
                    onReload: '&'
                },
                link: function (scope, element, attrs) {
                    scope.version = godModeConfig.config.version;
                },
                templateUrl: "/App_Plugins/DiploGodMode/backoffice/godModeTree/godModeHeader.html"
            };
        })
        .directive('clearable', function () {
            return {
                require: 'ngModel',
                link: function (scope, element, attrs, control) {

                    let wrapper = angular.element('<div>');
                    let button = angular.element('<div>').addClass('close-button');

                    button.bind('click', function () {
                        control.$setViewValue('');
                        element.val('');
                        scope.$apply();
                    });

                    element.wrap(wrapper);
                    element.parent().append(button);
                }
            };
        })
        .filter('godModeFileSize', function () {
            return function (bytes, precision) {
                if (!bytes) return "N/A";
                if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
                if (typeof precision === 'undefined') precision = 1;
                const units = ['bytes', 'KB', 'MB', 'GB'];
                let number = Math.floor(Math.log(bytes) / Math.log(1024));
                return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
            };
        })
        .filter('godModeUnique', function () {

            return function (items, filterOn) {

                if (filterOn === false) {
                    return items;
                }

                if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
                    let hashCheck = {}, newItems = [];

                    const extractValueToCompare = function (item) {
                        if (angular.isObject(item) && angular.isString(filterOn)) {
                            return item[filterOn];
                        } else {
                            return item;
                        }
                    };

                    angular.forEach(items, function (item) {
                        let valueToCheck, isDuplicate = false;

                        for (let i = 0; i < newItems.length; i++) {
                            if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                                isDuplicate = true;
                                break;
                            }
                        }
                        if (!isDuplicate) {
                            newItems.push(item);
                        }

                    });
                    items = newItems;
                }
                return items;
            };
        });
})();