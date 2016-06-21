ininvid
=======

## Description
Web server Drop-In Code for ININ + Vidyo Integration

## Overview

This Javascript code can be used in your website to display a small toaster at the bottom right side of the page to request a Vidyo Chat from an Interaction Center(c) server.

## Installation

On your web server, go to the root of the web pages (Apache: /var/www/html, IIS: C:\Inetpub\wwwroot) and clone this repository:

```bash
git clone https://github.com/gildas/ininvid.git ininvid
```

## Usage

To use and configure the ININ Vidyo integration, add the following code at the very end of the *body* section of your HTML page, like this:  

```html
<body>
  ...

  <!-- ININ: Help Toaster {{{ -->
    <span id="ininvid_displayName" data-localize="ininvid.displayName"        style="display: none">Guest</span>
    <span id="ininvid_support"     data-localize="ininvid.workgroups.support" style="display: none">Customer Service</span>
    <span id="ininvid_sales"       data-localize="ininvid.workgroups.sales"   style="display: none">Sales</span>
    <span id="ininvid_help"        data-localize="ininvid.workgroups.help"    style="display: none">Web Help</span>
    <script type="text/javascript" src="ininvid/jquery-2.1.1.js"></script>
    <script type="text/javascript" src="ininvid/jquery.cookie-1.4.1.min.js"></script>
    <script type="text/javascript" src="ininvid/jquery.localize.min.js" charset="utf-8"></script>
    <script type="text/javascript" src="ininvid/injector.js"></script>
    <script type="text/javascript">
      $("[data-localize]").localize("index", { language: $.get_url_param('lang'), skipLanguage: /^en/ });

      var ininvid_serverRoot  = 'http://www.acme.com/vidyo-bridge';
      var ininvid_displayName = $('#ininvid_displayName').text();
      var ininvid_reasons = [ 
            { text: $('#ininvid_support').text(), value:'support'},
            { text: $('#ininvid_sales').text(),   value:'sales'},
            { text: $('#ininvid_help').text(),    value:'vidyo'}
          ];
    </script>
  <!-- ININ: end Help Toaster }}} -->
</body>
```

Note the localization bits. Just provide an index-xx.json in the same folder, where xx is the localized language to provide a localized display of your toaster configurations.  

Here is an example in Japanese (index-ja.json):  

```json
{
  "welcome": "Vidyo と Interaction Center &copy;のサンプラーにようこそ！",
  "ininvid":
  {
    "displayName": "ゲスト",
    "workgroups":
    {
      "support": "カスタマーサポート",
      "sales":   "セールズ",
      "help":    "ヘルプ"
    }
  }
}
```

If you want to force the language (and not let Javascript detect it), add a new variable with the [ISO 639-1][https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes] code:

```javascript
  var ininvid_language    = 'ja'
  var ininvid_serverRoot  = 'http://www.acme.com/vidyo-bridge';
  . . .
```

# Notes:
- do not forget *ininvid_serverRoot*: it should point to your Vidyo portal
- do not forget *ininvid_reasons*: it should contains an array of the workgroup queue to send the Vidyo to
- See injector.js for other varilabe you can overwrite.

# ACD On Hold configuration:
In the body of your HTML page, place a <div id="ininvid"> where you want to display information while waiting for an agent.

```html
<body>
  My super website text...
  ...
  ...
<!-- ININVID: ACD Wait {{{ -->
  <div id="ininvid"></div>
<!-- ININVID: ACD Wait }}} -->
  ...
  ...
</body>
```

You can configure the images that are displayed while waiting for an agent in the "carroussel" variables.

* Example:
```javascript
var ininvid_carrouselImagePaths = [
  "ininvid/img/banners/0411_CCVideoInterview_banner.gif",
  "ininvid/img/banners/CaaSFaster_Banner_728x90_0714.gif",
  "ininvid/img/banners/CaaSFlexible_Banner_728x90_0714.gif",
  "ininvid/img/banners/CaaSMigrate_Banner_728x90_0714.gif",
  "ininvid/img/banners/CaaSMinimal_Banner_728x90_0714.gif",
  "ininvid/img/banners/CloudComm_banner_728x90_0714.gif"
];

var ininvid_carrouselRotationIntervalMs = 10000;
```

## Authors/Contributors

[Gildas Cherruel](https://github.com/gildas) [![endorse](https://api.coderwall.com/gildas/endorsecount.png)](https://coderwall.com/gildas)

## License

Copyright (c) 2016 Gildas CHERRUEL (MIT License)
