<?php
$shopGET = !empty($_GET['shop']) ? $_GET['shop'] : '';

if( !empty($_GET['hmac']) ) {
  $shop = $shopGET;
  if( ShopifyHelper::check_signature(SHOPIFY_SECRET) ) {
    // hmac + valid shop = save shop in SESSION
    $_SESSION['shop'] = $shop;
  } else {
    // hmac + invalid shop = reload page
    unset($_SESSION['shop']);
    redirect( 'https://' . $shop . '/admin/apps/' . APP_ALIAS, true );
  }
} else {
  $shop = !empty($_SESSION['shop']) ? $_SESSION['shop'] : '';
  if( empty($shop) ) {
    if( $ajax ) die('invalid shop');

    if( !empty($shopGET) ) {
      // hmac-less + session shop-less + get shop = try authorize
      $sc = new ShopifyClient($shopGET, '', SHOPIFY_API_KEY, SHOPIFY_SECRET);
      redirect( $sc->getAuthorizeUrl(SHOPIFY_SCOPE, SCRIPT_MAIN_URL), true );
      //redirect( $sc->getAuthorizeUrl(SHOPIFY_SCOPE, SCRIPT_CURRENT_URL) );
    } else {
      // hmac-less + session shop-less + get shop-less = install form
      $task = "install";
    }
  }
  // hmac-less + session shop = success
}