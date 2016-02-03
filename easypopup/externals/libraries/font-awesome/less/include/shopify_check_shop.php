<?php

$shopData = ShopifyHelper::get_shop_info_by_name($shop, $db);

if( !$shopData ) {
  $sc = new ShopifyClient($shop, '', SHOPIFY_API_KEY, SHOPIFY_SECRET);
  // redirect to authorize url
  redirect( $sc->getAuthorizeUrl(SHOPIFY_SCOPE, SCRIPT_URL) );
}

$sc     = new ShopifyClient($shop, $shopData['token'], SHOPIFY_API_KEY, SHOPIFY_SECRET);
$helper = new ShopifyHelper($db, $shop, $sc);

// Check is token is still valid (in case of app removal), otherwise clean DB and redirect to root
try {
  $shopDetails = $sc->call("GET", "admin/shop.json");
} catch (ShopifyApiException $e) {
  if( $e->getCode() == "401" ) {
    $helper->delete_shop($shop);
    redirect( SCRIPT_URL );
  } else {
    redirect( SHOPIFY_APP_URL, true );
  }
}

if( RECURRING_PAYMENT ) {
  // if there is no charge id or subscription is not active move to charge
  if( !$shopData['charge_id'] or !$helper->verify_payment() ) {
    $helper->delete_shop($shop);

    // redirect to authorize url
    redirect( $sc->getAuthorizeUrl(SHOPIFY_SCOPE, SCRIPT_URL), true );
  }
}