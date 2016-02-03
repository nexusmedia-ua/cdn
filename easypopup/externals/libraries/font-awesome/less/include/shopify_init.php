<?php

error_reporting(1);
ini_set('display_errors', 1);

require 'shopify_config.php';
require 'classes/database.php';
require 'include/tools.php';

$db = new Database(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if( !empty($_GET['charge_id']) ) {
  $_GET['shop'] = $db->get_one("SELECT `name` FROM `shops` WHERE `charge_id` = '" . (int)$_GET['charge_id'] . "'");
}

header('P3P: CP="IDC DSP COR ADM DEVi TAIi PSA PSD IVAi IVDi CONi HIS OUR IND CNT"');
if( getBrowser() == "Safari" ) session_id($_SERVER['SSL_SESSION_ID']);
session_start();

require 'classes/shopify.php';
require 'classes/shopify_helper.php';
require 'classes/shopify_storage.php';

// request data
$task  = !empty($_POST['task'])  ? $_POST['task']  : ( !empty($_GET['task'])  ? $_GET['task']  : 'main' );
$error = !empty($_POST['error']) ? $_POST['error'] : ( !empty($_GET['error']) ? $_GET['error'] : '' );
$ajax  = !empty($_POST['ajax'])  ? true : ( !empty($_GET['ajax']) ? true : false );

// init $shop
require "include/shopify_init_shop.php";

if( !empty($shop) and $task != 'install' ) {
  define('SHOPIFY_APP_URL', 'https://' . $shop . '/admin/apps/' . APP_ALIAS);
  define('SHOPIFY_APP_CURRENT_URL', SHOPIFY_APP_URL . $_SERVER['REQUEST_URI']);
  define('SCRIPT_URL', SCRIPT_MAIN_URL . "?shop=" . $shop );
  define('SCRIPT_URL_INSTALL', SCRIPT_URL . '&task=install');
  define('SCRIPT_URL_LAYOUT_EDITOR', SCRIPT_URL . '&task=layout_editor');

  $data = new ShopifyStorage($db, $shop);

  require "include/shopify_received_code.php";
  require "include/shopify_charge.php";
  require "include/shopify_check_shop.php"; // $sc, $helper, $shopData, $shopDetails init here
}

// router
if( file_exists("controllers/{$task}.php") ) {
  require "controllers/{$task}.php";
} else {
  require 'controllers/invalid_task.php';
}