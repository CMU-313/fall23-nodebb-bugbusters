<!-- IMPORT partials/breadcrumbs.tpl -->
<div data-widget-area="header">
    {{{each widgets.header}}}
    {{widgets.header.html}}
    {{{end}}}
</div>
<div class="tags">
    <div class="topic-list-header btn-toolbar">
        <div class="pull-left">
            <!-- IF loggedIn -->
            <!-- IMPORT partials/buttons/newTopic.tpl -->
            <!-- ELSE -->
            <a component="category/post/guest" href="{config.relative_path}/login" class="btn btn-primary">[[category:guest-login-post]]</a>
            <!-- ENDIF loggedIn -->
        </div>

        <!-- IF displayTagSearch -->
        <!-- IF tags.length -->
        <div class="col-lg-10 pull-right">
            <div class="input-group">
                <input type="text" class="form-control" placeholder="[[global:search]]" id="tag-search">
                <span class="input-group-addon search-button"><i class="fa fa-search"></i></span>
            </div>
        </div>
        <!-- ENDIF tags.length -->
        <!-- ENDIF displayTagSearch -->
    </div>

    <!-- IF !tags.length -->
    <div class="alert alert-warning">[[tags:no_tags]]</div>
    <!-- ENDIF !tags.length -->

    <div class="category row">
        <div class="col-md-12 clearfix tag-list" data-nextstart="{nextStart}">
            <!-- IMPORT partials/tags_list.tpl -->
        </div>
    </div>
</div>
