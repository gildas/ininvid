// General configuration
// You might want to override this in your own html pages
// To use and configure the ININ Vidyo integration, add the following code the head of your HTML page, like this:
/*
<!-- ININVID: Configuration {{{ -->
<script type="text/javascript" src="ininvid/jquery-2.1.1.js"></script>
<script type="text/javascript" src="ininvid/jquery.cookie-1.4.1.min.js"></script>
<script type="text/javascript" src="ininvid/jquery.localize.min.js"></script>
<script type="text/javascript" src="ininvid/injector.js" charset="utf-8"></script>
<script type="text/javascript">
  // Load the translation except if we are in English (as the strings are already in English)
  $("[data-localize]").localize("example", { skipLanguage: /^en/ })
  var ininvid_serverRoot  = 'http://www.demo.apac.inin.com/vidyo-bridge';
  var ininvid_displayName = 'Guest';
  var ininvid_reasons = [
        { text:'Customer Service', value:'support' },
        { text:'Sales Question',   value:'sales'   },
        { text:'Website Help',     value:'vidyo'   }
      ];
</script>
<!-- ININVID: Configuration }}} -->
*/
// Notes:
//   - do not forget *ininvid_serverRoot: it should point to your Vidyo portal
//   - do not forget *ininvid_reasons: it should contains an array of the workgroup queue to send the Vidyo to
//
// The other variables override the values defined below:
//
// ACD On Hold configuration:
// In the body of your HTML page, place a <div id="ininvid"> where you want to display information while waiting for an agent.
/*
<body>
...
  <div id="ininvid"></div>
...
</body>
*/

// ***************************************************************************
// Customizable Configuration
// ***************************************************************************

// The language used for displaying the toaster and other messages
// Leave to undefined to let the browser detect
var ininvid_language = undefined;

// This is the URL of your Vidyo portal
var ininvid_serverRoot = 'http://www.acme.com:8000';

// How often to check when Waiting for an Agent
var ininvid_checkIntervalMs = 1000;

// The message to display while waiting for an Agent
var ininvid_messageWaitingForAgent = 'Please wait for an agent to join...';

// The images to display in the carrousel while waiting for an agent
var ininvid_carrouselImagePaths = [
  "ininvid/img/banners/0411_CCVideoInterview_banner.gif",
  "ininvid/img/banners/CaaSFaster_Banner_728x90_0714.gif",
  "ininvid/img/banners/CaaSFlexible_Banner_728x90_0714.gif",
  "ininvid/img/banners/CaaSMigrate_Banner_728x90_0714.gif",
  "ininvid/img/banners/CaaSMinimal_Banner_728x90_0714.gif",
  "ininvid/img/banners/CloudComm_banner_728x90_0714.gif"
];
// The amount of milli-seconds between two images in the carrousel
var ininvid_carrouselRotationIntervalMs = 10000;

// When an error occurs, the URL to redirect to (if empty or undefined no redirection happens)
var ininvid_OnErrorRedirectTo      = "http://www.inin.com";
var ininvid_errorImagePath         = "ininvid/img/tumbeasts/something_broken.png";
var ininvid_OnErrorRedirectAfterMs = 10000;

// ***************************************************************************
// NON Customizable Configuration
// Warning: DO NOT modify the values below
// ***************************************************************************
var ininvid_version           = '0.1.2';
var ininvid_cookieName        = 'ininvid_sessionData';
var ininvid_displayNameLoaded = true;
var ininvid_statusAreaId      = '#ininvid';
var ininvid_toasterId         = '#ininvid-footer';

// ***************************************************************************
// Code {{{

// Main injection function {{{
$(document).ready(function()
{
  $.get('ininvid/injection-head.html', function(data) { $('head').append(data); });
  if ($('#ininvid') == undefined) $('body').append('<div id="ininvid"/>')
  $('#ininvid').append('<div id="ininvid-headerMessage"/>')
  $('#ininvid').append('<div id="ininvid-header"/>')
  $('#ininvid').append('<div id="ininvid-main"/>')
  $.get('ininvid/injection-body.html', function(data)
  {
    $('body').append(data);
    var ininvid_sessionData = $.cookie(ininvid_cookieName);

    if (ininvid_sessionData != undefined)
    {
      console.debug('[ININVID] Session Data: %s', ininvid_sessionData);
      console.debug("[ININVID] Hiding toaster %s", '#ininvid-footer');
      $(ininvid_toasterId).hide();
      waitForAgent(ininvid_statusAreaId, eval('('+ininvid_sessionData+')'));
    }
    else
    {
      $(ininvid_statusAreaId).hide();
      configureToaster(ininvid_toasterId);
    }
  });
}); // }}}

// function: configureToaster {{{
/**
 * Configures the toaster for requesting Vidyo conversations
 *
 * @method           configureToaster
 * @param {String}   The DOM identifier of the toaster
 */
function configureToaster(toasterId)
{
  console.debug('[ININVID] Configuring toaster %s', toasterId);
  $(toasterId).show();

  // Populate reasons list
  try
  {
    console.debug('[ININVID] Retrieving list of reasons');
    if (ininvid_reasons != undefined && ininvid_reasons.constructor === Array)
    {
      console.debug('[ININVID] Adding %d reasons', ininvid_reasons.length);
      ininvid_reasons.forEach(function(reason)
      {
        console.debug('[ININVID] Adding reason %s (text=%s)', reason.value, reason.text);
        $('#ininvid-reason').append($("<option />").val(reason.value).text(reason.text));
      });
    }
  }
  catch (err)
  { 
    displayError(err);
  }

  // Register click event on #ininvid-chatContainer
  console.debug('[ININVID] Adding click event to %s', '#ininvid-chatContainer');
  $('#ininvid-chatContainer').click(function()
  {
    // If it was hidden, try to populate the name before opening
    console.debug('[ININVID] Click detected on %s', this);
    try
    {
      if (!ininvid_displayNameLoaded)
      {
        ininvid_displayNameLoaded = true;
        if ($('#ininvid-chatDetails').css('display') == 'none')
        {
          $('#ininvid-displayName').val(ininvid_displayName);
        }
      }
    }
    catch (err)
    { 
        // Supress error
        //console.debug(err); 
    }

    $('#ininvid-chatDetails').slideToggle();
    $('#ininvid-chatPeek').slideUp();
  });

  // Register hover event on #ininvid-chatContainer
  console.debug('[ININVID] Adding hover event to %s', '#ininvid-chatContainer');
  $('#ininvid-chatContainer').hover(
    function()
    { 
      if ($('#ininvid-chatDetails').css('display') != 'none') return;
      $('#ininvid-chatPeek').slideDown({ duration: 70, queue: false }); 
    },
    function() { $('#ininvid-chatPeek').slideUp(); }
  );

  // Register for click from #ininvid-chatNowLink
  console.debug('[ININVID] Adding click event to %s', '#ininvid-chatNowLink');
  $('#ininvid-chatNowLink').click(function()
  {
    startConversation({ displayName: $('#ininvid-displayName').val()}, $('#ininvid-reason').val());
  });
} // }}}

// function: waitForAgent {{{
/**
 * Wait for an agent
 *
 * @method           waitForAgent
 * @param {String}   The area id where we show the status
 * @param {Object}   The guest information
 */
function waitForAgent(statusAreaId, guestInfo)
{
    console.debug('[ININVID] Guest information:');
    console.dir(guestInfo);

    $(statusAreaId).show();
    $('#ininvid-headerMessage').html($('<h1 data-localize="waiting.for_agent">' + ininvid_messageWaitingForAgent + '</h1>')
                                     .localize("ininvid", { pathPrefix: "ininvid", skipLanguage: /^en/ }));
    if (ininvid_carrouselImagePaths != undefined && ininvid_carrouselImagePaths.length > 0)
    {
      preloadImages(ininvid_carrouselImagePaths);
      displayCarrousel('#ininvid-header', ininvid_carrouselRotationIntervalMs, ininvid_carrouselImagePaths, 0);
    }
    checkConversationStatus(guestInfo, ininvid_checkIntervalMs);
} // }}}

// function: startConversation {{{
/**
 * Request a new conversation
 *
 * @method startConversation
 * @param {Object} The guest information gathered from the toaster
 * @param {String} The queue to send this request to
 */
function startConversation(guestInfo, queueName)
{
  try
  {
    console.debug('[ININVID] requesting conversation on %s', queueName);
    console.debug('[ININVID] Building request');
    var request = {
      queueName:           queueName,
      queueType:           'Workgroup',
      mediaTypeParameters: {
        mediaType:    'GenericInteraction',
        initialState: 'Offering',
        additionalAttributes:[
            { key:'Eic_RemoteName', value:'Vidyo chat from ' + guestInfo.displayName }
          ]
      }
    };
    console.dir(request);

      // Send request
      $.ajax({
        url:     ininvid_serverRoot + '/ininvid/v1/conversations',
        type:    'post',
        data:    JSON.stringify(request),
        headers: {
                   'Content-Type': 'application/json'
                 }
      }).done(function(data)
      {
        // Clear the attribute dictionary.
        // It was causing the cookie to be too large, and we don't need that data here anyway
        data.attributeDictionary = [];

        // Make a string from JSON
        var dataString = JSON.stringify(data);

        // Set cookies
        $.cookie('ininvid_sessionData', dataString, { expires: 1 });
        $.cookie('ininvid_displayName', guestInfo.displayName, { expires: 1 });

        $(ininvid_toasterId).hide();
        waitForAgent(ininvid_statusAreaId, data);
      });
  }
  catch(err)
  {
    displayError(err);
  }
} // }}}

// function: checkConversationStatus {{{
/**
 * Checks for a conversation status
 *
 * @method           checkConversationStatus
 * @param {Object}   The guest information gathered from session data
 * @param {Integer}  The interval in milli-seconds between two checks
 */
function checkConversationStatus(guestInfo, checkIntervalMs)
{
  try
  {
    console.count('[ININVID] Checking status of conversation ' + guestInfo.conversationId.toString());
    // Send request
    $.ajax({
      url:     ininvid_serverRoot + '/ininvid/v1/conversations/' + guestInfo.conversationId,
      type:    'get',
      headers: {
                 'Content-Type': 'application/json'
               }
    }).done(function(data)
    {
      console.groupCollapsed('[ININVID] Query results: ');
      console.dir(data);
      if (data.userOwner != undefined && data.userOwner != '')
      {
        console.debug("[ININVID] Agent %s answered and is connected", data.userOwner);
        // Redirect user to join url
        var cookie      = $.cookie('ininvid_displayName');
        var displayName = (cookie != undefined) ? cookie : 'Website Guest';
        console.debug('[ININVID] Display Name Cookie: %s, display name: %s', cookie, displayName);
        console.debug('[ININVID] Redirecting to: %s', guestInfo.roomUrl);
        $.removeCookie('ininvid_sessionData');
        $.removeCookie('ininvid_displayName');
        window.location.replace(guestInfo.roomUrl + '&guestName=' + encodeURIComponent(displayName));
      }
      else
      {
        console.debug('[ININVID] Interaction %s is waiting on %s', data.InteractionId, data.scopedQueueName);
        console.debug('[ININVID] Checking again in: %dms', checkIntervalMs);
        setTimeout(function(){checkConversationStatus(guestInfo, checkIntervalMs);}, checkIntervalMs);
      }
      console.groupEnd();
    }).fail(function(jqXHR, textStatus, error)
    {
      if (jqXHR.status == 410)
      {
        console.error("[ININVID] Conversation %s does not exist!", guestInfo.conversationId);
        console.debug("[ININVID] Resetting everything...");
        $.removeCookie('ininvid_sessionData');
        $.removeCookie('ininvid_displayName');
        $(ininvid_statusAreaId).hide();
        configureToaster(ininvid_toasterId);
      }
      else
      {
        console.debug("[ININVID] GET failed: status=%d (%s), error=%s", jqXHR.status, textStatus, error);
        console.dir(jqXHR);
      }
    });
  }
  catch (err)
  {
    displayError(err);
  }
} // }}}

// function: displayError {{{
/**
 * Display an error and redirect to a URL as needed
 *
 * @method         displayError
 * @param {Object} The error
 */
function displayError(error)
{
  console.error('[ININVID] Error: %s', error);
  $('#ininvid-headerMessage').html('<h1>' + error + '</h1>');
  $('#ininvid-header').html('<img src="' + ininvid_errorImagePath + '"/>');
  if (ininvid_OnErrorRedirectTo != undefined && ininvid_OnErrorRedirectTo.length > 0)
  {
    $('#ininvid-main').html('<h3>Redirecting you in <span id="ininvid-countdown"/> seconds...</h3>');
    redirectTo(ininvid_OnErrorRedirectTo, ininvid_OnErrorRedirectAfterMs, '#ininvid-countdown');
  }
} // }}}

// function: redirectTo {{{
/**
 * Redirect to an URL (waits for a given amount of time before redirecting)
 *
 * @method         redirectTo
 * @param {String}  The URL to redirect to
 * @param {Integer} The amount of milli-seconds to wait before redirecting
 * @param {String}  The DOM id to display what time left there is
 */
function redirectTo(url, redirectAfterMs, displayId)
{
  if (count == 0) window.location.replace(url);
  $(displayId).html(redirectAfterMs / 1000);
  console.debug('[ININVID] Redirecting in %d seconds', redirectAfterMs / 1000);
  setTimeout(function(){redirectIn(url, redirectAfterMs - 1000, displayId);}, 1000);
} // }}}

// function: preloadImages {{{
/**
 * Preloads images in the document
 *
 * @method           preloadImages
 * @param {String[]} The array of image paths
 */
function preloadImages(images)
{
  $(images).each(function()
  {
    console.debug('[ININVID] Preloading image: %s', this.toString()); 
    (new Image()).src = this;
  });
} // }}}

// function: displayCarrousel {{{
/**
 * Displays a carrousel of images in an id
 *
 * @method           diplayCarrousel
 * @param {String}   The DOM id to inject the carrousel into
 * @param {Integer}  The interval in milli-seconds between two images
 * @param {String[]} The carrousel (array of image paths)
 * @param {Integer}  The index of the image in the carrousel to display
 */
function displayCarrousel(id, rotationIntervalMs, imagePathCarrousel, imageIndex)
{
  if (! $(id).is(':visible')) return;
  if (imagePathCarrousel.length == 0) return;
  if (imageIndex < 0 || imageIndex >= imagePathCarrousel.length) imageIndex = 0;
  console.debug('[ININVID] Showing banner #%d: %s', imageIndex, imagePathCarrousel[imageIndex]);
  $(id).html('<img src="' + imagePathCarrousel[imageIndex] + '" />');
  setTimeout(function(){displayCarrousel(id, rotationIntervalMs, imagePathCarrousel, imageIndex + 1);}, rotationIntervalMs);
} // }}}

// }}}
