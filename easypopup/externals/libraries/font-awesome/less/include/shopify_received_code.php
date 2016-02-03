<?php

$code = !empty($_GET['code']) ? $_GET['code'] : '';

if( !empty($code ) ) {
  $sc = new ShopifyClient($shop, "", SHOPIFY_API_KEY, SHOPIFY_SECRET);
  $helper = new ShopifyHelper($db, $shop, $sc);

  // request the token and store it in db
  $token = $sc->getAccessToken($code);
  if( $token ) {
    $helper->create_shop($token);
    $_SESSION['token'] = $token;
    unset($sc);
  } else {
    redirect( SCRIPT_URL );
  }

  if( RECURRING_PAYMENT ) {
    $sc = new ShopifyClient($shop, $token, SHOPIFY_API_KEY, SHOPIFY_SECRET);
    $charge = $sc->createCharge(RECURRING_PRICE, RECURRING_PAYMENT_TITLE, SCRIPT_URL, TEST_STATUS, RECURRING_TRIAL_DAYS);
    $db->query("UPDATE `shops` SET `charge_id` = '".(int)$charge['id']."' WHERE `name` = '".$shop."'");
    redirect( $charge['confirmation_url'] );
  } else {
    unset($_SESSION['token']);
    redirect( SHOPIFY_APP_URL, true );
  }
}