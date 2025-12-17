(function () {
    'use strict';
    angular.module("umbraco").controller("GodMode.TagBrowser.Controller",
        function ($routeParams, navigationService, godModeResources, editorService, notificationsService) {

            const vm = this;
            vm.isLoading = true;
            vm.search = {};
            vm.tags = [];
            vm.orphanedTags = [];

            navigationService.syncTree({ tree: $routeParams.tree, path: [-1, $routeParams.method], forceReload: false });

            const fetchContent = function () {
                vm.isLoading = true;

                godModeResources.getTagMapping().then(function (data) {
                    vm.tags = data;
                    vm.isLoading = false;
                });

                godModeResources.getOrphanedTags().then(function (data) {
                    vm.orphanedTags = data;
                });
            };

            vm.tagFilter = function (t) {

                if (vm.search.tagName) {
                    if (t.Tag.Text.toLowerCase().indexOf(vm.search.tagName.toLowerCase()) === -1) {
                        return;
                    }
                }

                if (vm.search.tagGroup) {
                    if (t.Tag.Group.toLowerCase().indexOf(vm.search.tagGroup.toLowerCase()) === -1) {
                        return;
                    }
                }

                if (vm.search.tagContent && t.Content != null) {

                    var mapped = t.Content.map(i => i.Name.toLowerCase());

                    if (mapped.findIndex(element => element.includes(vm.search.tagContent.toLowerCase()))) {
                        return;
                    }
                }

                return t;
            };

            vm.contentFilter = function (c) {

                if (vm.search.tagContent) {

                    if (c.Name.toLowerCase().indexOf(vm.search.tagContent.toLowerCase()) === -1) {
                        return;
                    }
                }

                return c;
            };

            vm.deleteTag = function (id, name) {

                name = name.replace("'", "");

                if (!confirm("Are you sure you want to permanently delete the tag '" + name + "'?")) {
                    return;
                }

                godModeResources.deleteTag(id).then(function (response) {

                    if (response) {
                        notificationsService.success("Successfully deleted the tag '" + name + "'");
                    }
                    else {
                        notificationsService.error("Error deleting the tag '" + name + "'");
                    }

                    fetchContent();
                });
            }

            vm.openContent = function (contentId) {
                const editor = {
                    id: contentId,
                    submit: function () {
                        vm.fetchContent();
                        editorService.close();
                    },
                    close: function () {
                        editorService.close();
                    }
                };
                editorService.contentEditor(editor);
            };

            vm.openMedia = function (mediaId) {
                const editor = {
                    id: mediaId,
                    submit: function () {
                        vm.fetchContent();
                        editorService.close();
                    },
                    close: function () {
                        editorService.close();
                    }
                };
                editorService.mediaEditor(editor);
            };

            fetchContent();

        });
})();