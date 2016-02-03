<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title><?php echo APP_TITLE ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
    <script src="https://code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script>

    <?php if( !empty($gridstack) and $gridstack ) : ?>
      <link href="<?php echo SCRIPT_URL_DIR_EXTERNALS?>libraries/bootstrap/bootstrap-3.2.0.min.css" rel="stylesheet" />
      <link href="<?php echo SCRIPT_URL_DIR_EXTERNALS?>libraries/gridstack/gridstack.css" rel="stylesheet" />

      <script src="<?php echo SCRIPT_URL_DIR_EXTERNALS?>libraries/bootstrap/bootstrap-3.2.0.min.js"></script>
      <script src="<?php echo SCRIPT_URL_DIR_EXTERNALS?>libraries/lodash/lodash-3.5.0.min.js"></script>
      <script src="<?php echo SCRIPT_URL_DIR_EXTERNALS?>libraries/knockout/knockout-3.2.0.min.js"></script>
      <script src="<?php echo SCRIPT_URL_DIR_EXTERNALS?>libraries/gridstack/gridstack.js"></script>
      <script src="//tinymce.cachefly.net/4.2/tinymce.min.js"></script>
    <?php endif; ?>

    <link href="<?php echo SCRIPT_URL_DIR_EXTERNALS?>libraries/font-awesome/css/font-awesome.min.css" rel="stylesheet" />
    <link href="<?php echo SCRIPT_URL_DIR_EXTERNALS?>libraries/featherlight/featherlight.css" rel="stylesheet" />
    <script src="<?php echo SCRIPT_URL_DIR_EXTERNALS?>libraries/featherlight/featherlight.js"></script>

    <link href="<?php echo SCRIPT_URL_DIR_EXTERNALS?>libraries/colorpicker/colorpicker.css" rel="stylesheet" />
    <script src="<?php echo SCRIPT_URL_DIR_EXTERNALS?>libraries/colorpicker/colorpicker.js"></script>

    <link href="<?php echo SCRIPT_URL_DIR_EXTERNALS?>css/grid.css" rel="stylesheet" />
    <link href="<?php echo SCRIPT_URL_DIR_EXTERNALS?>css/normalize.css" rel="stylesheet" />
    <link href="<?php echo SCRIPT_URL_DIR_EXTERNALS?>css/base.css" rel="stylesheet" />
    <link href="<?php echo SCRIPT_URL_DIR_EXTERNALS?>css/tooltips.css" rel="stylesheet" />
    <script src="<?php echo SCRIPT_URL_DIR_EXTERNALS?>js/common.js"></script>
    <script src="<?php echo SCRIPT_URL_DIR_EXTERNALS?>js/ajax.js"></script>

    <!-- HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
      <script src="//cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.2/html5shiv.min.js"></script>
    <![endif]-->

    <script type="text/javascript">
      var globalBaseUrl  = "<?php echo SCRIPT_URL?>";
      var globalShopName = "<?php echo $shop?>";
      var globalAppUrl   = "<?php echo SHOPIFY_APP_URL?>";
      var globalAppCurrentUrl   = "<?php echo SHOPIFY_APP_CURRENT_URL?>";
    </script>

    <?php if( !empty($shop) and !empty($shopData) ) : ?>
      <script src="https://cdn.shopify.com/s/assets/external/app.js"></script>
      <script type="text/javascript">

        ShopifyApp.init({
          apiKey: "<?php echo SHOPIFY_API_KEY?>",
          shopOrigin: "https://<?php echo $shop?>",
          debug: false,
          forceRedirect: false
        });

        ShopifyApp.ready(function(){ ShopifyApp.Bar.initialize({}); });
      </script>
    <?php endif; ?>

    <link href="<?php echo SCRIPT_URL_DIR_EXTERNALS?>css/plugin.css" rel="stylesheet" />
    <script src="<?php echo SCRIPT_URL_DIR_EXTERNALS?>js/plugin.js"></script>

  </head>
  <body id="<?php echo APP_ALIAS . '_page_' . $task?>">
    <div class="wrapper">