/*
 * angular-bind-compile v0.1.0
 * https://github.com/emn178/angular-bind-compile
 *
 * Copyright 2014, emn178@gmail.com
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
angular.module('umbraco.filters')
    .directive('ngBindCompile', ['$sce', '$compile', function ($sce, $compile) {
        return {
            restrict: 'A',
            compile: function (tElement, tAttrs) {
                return function (scope, element, attrs) {
                    scope.$watch(function () {
                        return $sce.getTrustedHtml(scope.$eval(attrs.ngBindCompile));
                    }, function (value) {
                        element.html(value);
                        $compile(element.contents())(scope);
                    });
                };
            }
        };
    }]);