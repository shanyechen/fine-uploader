describe("templating.js", function() {
    var $template, templating,
        HIDE_CSS = "test-hide",
        EDITABLE_CSS = "test-editable",
        emptyTemplate = '<div class="qq-uploader-selector qq-uploader">' +
                            '<ul class="qq-upload-list-selector qq-upload-list">' +
                                '<li></li>' +
                            '</ul>' +
                        '</div>',
        defaultTemplate = '<div class="qq-uploader-selector qq-uploader">' +
                            '<div class="qq-upload-drop-area-selector qq-upload-drop-area" qq-hide-dropzone>' +
                                '<span>Drop files here to upload</span>' +
                            '</div>' +
                            '<div class="qq-upload-button-selector qq-upload-button">' +
                                '<div>Upload a file</div>' +
                            '</div>' +
                            '<span class="qq-drop-processing-selector qq-drop-processing">' +
                                '<span>Processing dropped files...</span>' +
                                '<span class="qq-drop-processing-spinner-selector qq-drop-processing-spinner"></span>' +
                            '</span>' +
                            '<ul class="qq-upload-list-selector qq-upload-list">' +
                                '<li>' +
                                    '<div class="qq-progress-bar-container-selector">' +
                                        '<div class="qq-progress-bar-selector qq-progress-bar"></div>' +
                                    '</div>' +
                                    '<span class="qq-upload-spinner-selector qq-upload-spinner"></span>' +
                                    '<span class="qq-edit-filename-icon-selector qq-edit-filename-icon"></span>' +
                                    '<span class="qq-upload-file-selector qq-upload-file"></span>' +
                                    '<input class="qq-edit-filename-selector qq-edit-filename" tabindex="0" type="text">' +
                                    '<span class="qq-upload-size-selector qq-upload-size"></span>' +
                                    '<a class="qq-upload-cancel-selector qq-upload-cancel" href="#">Cancel</a>' +
                                    '<a class="qq-upload-retry-selector qq-upload-retry" href="#">Retry</a>' +
                                    '<a class="qq-upload-delete-selector qq-upload-delete" href="#">Delete</a>' +
                                    '<span class="qq-upload-status-text-selector qq-upload-status-text"></span>' +
                                '</li>' +
                            '</ul>' +
                        '</div>'

    function renderTemplate(content) {
        $template = $('<script id="qq-template" type="text/template"></script>');
        $template[0].text = content;
        $fixture.append($template);
        templating = new qq.Templating({
            log: function() {},
            containerEl: $fixture[0],
            classes: {
                hide: HIDE_CSS,
                editable: EDITABLE_CSS
            }
        });
        templating.render();
    }

    afterEach(function() {
        $("#qq-template").remove();
    });

    describe("hasAttr", function() {
        it("detects presence of an attr", function() {
            renderTemplate(emptyTemplate);

            var div = document.createElement("div");

            div.setAttribute("foobar", "true");
            div.setAttribute("foobar1", "false");

            assert.ok(templating._testing.hasAttr(div, "foobar"));
            assert.ok(!templating._testing.hasAttr(div, "foobar1"));
            assert.ok(!templating._testing.hasAttr(div, "foobar2"));
        });
    });

    describe("test with empty template", function() {
        it("ensure missing elements do not cause exceptions", function() {
            renderTemplate(emptyTemplate);

            templating.clearFiles();
            templating.addFile(0, "foobar");
            assert.ok(templating.getFileList() != null);
            templating.markFilenameEditable(0);
            templating.updateFilename(0, "test");
            templating.hideFilename(0);
            templating.showFilename(0);
            assert.ok(templating.getButton() == null);
            templating.hideDropProcessing();
            templating.showDropProcessing();
            assert.ok(templating.getDropZone() !== null);
            assert.ok(!templating.isEditFilenamePossible());
            assert.ok(!templating.isRetryPossible());
            assert.ok(templating.getFileContainer(0) != null);
            templating.showEditIcon(0);
            templating.hideEditIcon(0);
            assert.ok(templating.getEditInput(0) == null);
            templating.updateProgress(0, 50, 100);
            templating.hideProgress(0);
            templating.resetProgress(0);
            templating.showCancel(0);
            templating.hideCancel(0);
            templating.showDelete(0);
            templating.hideDelete(0);
            templating.updateSize(0, "100MB");
            templating.setStatusText(0, "test");
            templating.hideSpinner(0);
            templating.showSpinner(0);
            templating.removeFile(0);
        });
    });

    describe("test with default template", function() {
        var fileContainer0;


        beforeEach(function() {
            renderTemplate(defaultTemplate);
            templating.addFile(0, "foobar");
            fileContainer0 = templating.getFileContainer(0);
        });

        afterEach(function() {
            templating.clearFiles();
        });

        it("only displays relevant elements initially", function() {
            assert.ok($(fileContainer0).find(".qq-upload-delete-selector").hasClass(HIDE_CSS));
            assert.ok($(fileContainer0).find(".qq-progress-bar-container-selector").hasClass(HIDE_CSS));
            assert.ok($(fileContainer0).find(".qq-upload-size-selector").hasClass(HIDE_CSS));
            assert.ok($(fileContainer0).find(".qq-upload-retry-selector").hasClass(HIDE_CSS));

            qq.supportedFeatures.fileDrop && assert.ok($fixture.find(".qq-drop-processing-selector").hasClass(HIDE_CSS));
        });

        it("has edit filename & retry features enabled, also button present if applicable", function() {
            assert.ok(templating.isEditFilenamePossible());
            assert.ok(templating.isRetryPossible());
            assert.ok(templating.getButton() != null);
        });

        it("adds & removes file entries", function() {
            assert.ok(templating.getFileContainer(0) != null);
            templating.removeFile(0);
            assert.ok(templating.getFileContainer(0) == null);
            templating.addFile(0, "test");
            templating.clearFiles();
            assert.ok(templating.getFileContainer(0) == null);
        });

        it("embeds the file ID correctly", function() {
            assert.equal(templating.getFileId(fileContainer0), 0);
        });

        it("hides and shows spinner", function() {
            templating.hideSpinner(0);
            assert.ok($(fileContainer0).find(".qq-upload-spinner-selector").hasClass(HIDE_CSS));

            templating.showSpinner(0);
            assert.ok(!$(fileContainer0).find(".qq-upload-spinner-selector").hasClass(HIDE_CSS));
        });

        it("updates status text", function() {
            templating.setStatusText(0, "foobar");
            assert.equal($(fileContainer0).find(".qq-upload-status-text-selector").text(), "foobar");
        });

        it("updates file name", function() {
            templating.updateFilename(0, "123abc");
            assert.equal($(fileContainer0).find(".qq-upload-file-selector").text(), "123abc");
        });

        it("updates size text", function() {
            templating.updateSize(0, "123MB");
            assert.equal($(fileContainer0).find(".qq-upload-size-selector").text(), "123MB");
        });

        it("hides and shows delete link", function() {
            templating.hideDelete(0);
            assert.ok($(fileContainer0).find(".qq-upload-delete-selector").hasClass(HIDE_CSS));

            templating.showDelete(0);
            assert.ok(!$(fileContainer0).find(".qq-upload-delete-selector").hasClass(HIDE_CSS));
        });

        it("hides and shows cancel link", function() {
            templating.hideCancel(0);
            assert.ok($(fileContainer0).find(".qq-upload-cancel-selector").hasClass(HIDE_CSS));

            templating.showCancel(0);
            assert.ok(!$(fileContainer0).find(".qq-upload-cancel-selector").hasClass(HIDE_CSS));
        });

        it("hides and shows edit icon", function() {
            templating.hideEditIcon(0);
            assert.ok(!$(fileContainer0).find(".qq-edit-filename-icon-selector").hasClass(EDITABLE_CSS));

            templating.showEditIcon(0);
            assert.ok($(fileContainer0).find(".qq-edit-filename-icon-selector").hasClass(EDITABLE_CSS));
        });

        if (qq.supportedFeatures.fileDrop) {
            it("hides and shows drop processing spinner", function() {
                templating.hideDropProcessing(0);
                assert.ok($fixture.find(".qq-drop-processing-selector").hasClass(HIDE_CSS));

                templating.showDropProcessing(0);
                assert.ok(!$fixture.find(".qq-drop-processing-selector").hasClass(HIDE_CSS));
            });
        }
    });

});
