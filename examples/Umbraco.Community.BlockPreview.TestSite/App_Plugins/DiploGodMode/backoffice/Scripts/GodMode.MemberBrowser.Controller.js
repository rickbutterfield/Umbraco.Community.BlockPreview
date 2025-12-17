(function () {
    'use strict';
    angular.module("umbraco").controller("GodMode.MemberBrowser.Controller",
        function ($routeParams, navigationService, editorService, godModeResources, godModeConfig) {

            const vm = this;

            navigationService.syncTree({ tree: $routeParams.tree, path: [-1, $routeParams.method], forceReload: false });

            vm.config = godModeConfig.config;
            vm.criteria = {
                group: { Name: null, Id: null },
                search: null
            };

            vm.page = {};
            vm.currentPage = 1;
            vm.itemsPerPage = 15;
            vm.members = [];
            vm.memberGroups = [];
            vm.sort = {};

            vm.fetchMembers = function (orderBy) {
                vm.isLoading = true;
                let groupId = vm.criteria.group !== null ? vm.criteria.group.Id : null;

                godModeResources.getMembersPaged(vm.currentPage, vm.itemsPerPage, groupId, vm.criteria.search, orderBy).then(function (data) {
                    vm.page = data;
                    vm.currentPage = vm.page.CurrentPage;
                    vm.isLoading = false;
                });
            };

            vm.sortBy = function (column) {
                vm.sort.column = column;
                vm.sort.reverse = !vm.sort.reverse;
                let orderBy = vm.sort.column;

                if (orderBy) {
                    orderBy = vm.sort.reverse ? orderBy + " DESC" : orderBy + " ASC";
                }

                vm.fetchMembers(orderBy);
            };

            vm.prevPage = function () {
                if (vm.currentPage > 1) {
                    vm.currentPage--;
                    vm.fetchMembers();
                }
            };

            vm.nextPage = function () {
                if (vm.currentPage < vm.page.TotalPages) {
                    vm.currentPage++;
                    vm.fetchMembers();
                }
            };

            vm.setPage = function (pageNumber) {
                vm.currentPage = pageNumber;
                vm.fetchMembers();
            };

            vm.filterChange = function () {
                vm.currentPage = 1;
                vm.page = {};
                vm.fetchMembers();
            };

            godModeResources.getMemberGroups().then(function (data) {
                vm.memberGroups = data;
                vm.fetchMembers();
            });

            vm.openMember = function (memberId) {
                const editor = {
                    view: "views/member/edit.html",
                    id: memberId,
                    submit: function () {
                        vm.fetchMembers();
                        editorService.close();
                    },
                    close: function () {
                        editorService.close();
                    }
                };
                editorService.open(editor);
            };
        });
})();