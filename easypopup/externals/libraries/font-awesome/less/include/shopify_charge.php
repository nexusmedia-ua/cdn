<?php

$chargeId  = !empty($_GET['charge_id'])  ? (int)$_GET['charge_id'] : '';

if( !empty($chargeId) ) {
  $db->query("
    UPDATE `shops`
    SET `charge_id` = '{$chargeId}'
    WHERE `name` = '{$shop}'"
  );

  $sc = new ShopifyClient($shop, $_SESSION['token'], SHOPIFY_API_KEY, SHOPIFY_SECRET);
  $helper = new ShopifyHelper($db, $shop, $sc);

  if( $helper->verify_payment($chargeId) ) {
    // Payment is verified here = add some AFTER INSTALLED code
    $helper->installAssets();
  }

  unset($_SESSION['token']);
  redirect( SHOPIFY_APP_URL, true );
}