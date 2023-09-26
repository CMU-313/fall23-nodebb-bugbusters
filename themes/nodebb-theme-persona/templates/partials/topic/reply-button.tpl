<div component="topic/reply/container" class="btn-group action-bar bottom-sheet <!-- IF !privileges.topics:reply -->hidden<!-- ENDIF !privileges.topics:reply -->">
   
     <!-- Endorse button code here -->
    <button type="button" class="btn btn-sm btn-primary" id="endorseButton" data-endorsed="false"><span id="endorseText">Endorse</span></button>

    <script>
        const endorseButton = document.getElementById("endorseButton");
        const endorseText = document.getElementById("endorseText");
        endorseButton.addEventListener("click", function () {
            if (endorseButton.getAttribute("data-endorsed") === "false") {
                endorseButton.setAttribute("data-endorsed", "true");
                endorseText.textContent = "Endorsed by Instructor";
                endorseButton.classList.remove("btn-primary");
                endorseButton.classList.add("btn-success"); // Change the color to green
            } else {
                endorseButton.setAttribute("data-endorsed", "false");
                endorseText.textContent = "Endorse";
                endorseButton.classList.remove("btn-success");
                endorseButton.classList.add("btn-primary"); // Revert to the original color
            }
        });

    </script>

    <a href="{config.relative_path}/compose?tid={tid}&title={title}" class="btn btn-sm btn-primary" component="topic/reply" data-ajaxify="false" role="button"><i class="fa fa-reply visible-xs-inline"></i><span class="visible-sm-inline visible-md-inline visible-lg-inline"> [[topic:reply]]</span></a>
    <button type="button" class="btn btn-sm btn-primary dropdown-toggle" data-toggle="dropdown">
        <span class="caret"></span>
    </button>
    <ul class="dropdown-menu pull-right" role="menu">
        <li><a href="#" component="topic/reply-as-topic">[[topic:reply-as-topic]]</a></li>
    </ul>
    
</div>

<!-- IF loggedIn -->
<!-- IF !privileges.topics:reply -->
<!-- IF locked -->
<a component="topic/reply/locked" class="btn btn-sm btn-primary" disabled><i class="fa fa-lock"></i> [[topic:locked]]</a>
<!-- ENDIF locked -->
<!-- ENDIF !privileges.topics:reply -->

<!-- IF !locked -->
<a component="topic/reply/locked" class="btn btn-sm btn-primary hidden" disabled><i class="fa fa-lock"></i> [[topic:locked]]</a>
<!-- ENDIF !locked -->

<!-- ELSE -->

<!-- IF !privileges.topics:reply -->
<a component="topic/reply/guest" href="{config.relative_path}/login" class="btn btn-sm btn-primary">[[topic:guest-login-reply]]</a>
<!-- ENDIF !privileges.topics:reply -->
<!-- ENDIF loggedIn -->