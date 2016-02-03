<?php

// database
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'devnexu$media');
define('DB_NAME', 'easypopup');

// shopify
define("SHOPIFY_API_KEY","e57e1d4edcd1bc6e52f4f66e68b67d10");
define("SHOPIFY_SECRET","59e4a736141c6805a047d75f88f028f4");
define("SHOPIFY_SCOPE", "read_products,write_products,read_content,read_themes,write_themes,write_script_tags");

// server
define('SCRIPT_MAIN_URL', 'https://dev.nexusmedia-ua.com/easypopup/');
define('SCRIPT_URL_DIR_EXTERNALS', SCRIPT_MAIN_URL . 'externals/');
define('SCRIPT_CURRENT_URL', '//' . $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI']);

// app
define('DEBUG_MODE', false);
define('APP_ALIAS', 'easypopup');
define("APP_TITLE", "Shopify App");
define("RECURRING_TRIAL_DAYS", 5);
define("RECURRING_PRICE", 5);
define("RECURRING_PAYMENT", true);
define("RECURRING_PAYMENT_TITLE", "Shopify App Monthly Fee");
define("TEST_STATUS", true);
define("EMAIL", "support@nexusmedia-ua.com");

// popup default params
define('POPUP_MAIN_WIDTH', 800);
define('POPUP_TABLET_WIDTH', 500);
define('POPUP_CLOSE_BTN_COLOR', '333333');
define('POPUP_BG_COLOR', 'ffffff');
define('POPUP_BG_STYLE', 'centered');