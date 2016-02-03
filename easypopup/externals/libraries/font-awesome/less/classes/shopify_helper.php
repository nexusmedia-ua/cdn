<?php

if (!class_exists("ShopifyHelper")) {
class ShopifyHelper {

  private $db;
  private $shopify_shop_name;
  private $token;
  private $shopify;
  private $_allowedViewTypes;
  public  $error_message;

  public function __construct($db, $shopify_shop_name, $shopify = '')
  {
    $error_message = "Subscription activation error. Please <a href='http://".$shopify_shop_name."/admin/applications'>re-install plugin</a> or contact us by email <a href='support@nexusmedia-ua.com'>support@nexusmedia-ua.com</a>";
    $this->shopify_shop_name = htmlspecialchars($shopify_shop_name, ENT_QUOTES);
    $this->shopify = $shopify;
    $this->db = $db;
    $this->db->query("DELETE FROM `shop_values` WHERE shop_id NOT IN (SELECT id FROM `shops`)");
    $this->_allowedViewTypes = array('desktop', 'mobile', 'tablet');
  }


  public function link_to($url, $params = "")
  {
    $link = SCRIPT_URL . $url . "?";
    foreach( $_GET as $param => $value ) {
      if( $param == "sha256" or $param == "code" or $param == "shop" or $param == "hmac" or $param == "timestamp" ) {
        $link .= $param . "=" . $value . "&";
      }
    }
    $link .= $params;
    return $link;
  }


  public function get_shop_info() {
    return $this->db->get_row( "SELECT * FROM `shops` WHERE `name`='" . $this->shopify_shop_name . "'" );
  }
  public function get_shop_info_by_name($name, $db) {
    return $db->get_row( "SELECT * FROM `shops` WHERE `name`='".htmlspecialchars($name, ENT_QUOTES)."'" );
  }
  public function get_shop_info_by_charge_id($charge_id) {
    return $this->db->get_row( "SELECT * FROM `shops` WHERE `charge_id`='" . (int)$charge_id . "'" );
  }
  public function delete_shop($name) {
    return $this->db->query( "DELETE FROM `shops` WHERE `name` = '" . $name . "'" );
  }
  public function is_shop_exist() {
    return $this->get_shop_info() ? true : false;
  }


  public function get_subscription_status($charge_id)
  {
    try {
      $res = $this->shopify->call('GET', '/admin/recurring_application_charges/'.$charge_id.'.json');
    } catch (ShopifyApiException $e) {
      return false;
    }
    return $res['status'];
  }


  public function get_payment_status($charge_id)
  {
    try {
      $res = $this->shopify->call('GET', '/admin/application_charges/'.$charge_id.'.json');
    } catch (ShopifyApiException $e) {
      return false;
    }
    return $res['status'];
  }


  public function create_shop($token)
  {
    $this->db->query("DELETE FROM `shops` WHERE `name` = '".$this->shopify_shop_name."'");
    $this->db->query("INSERT INTO `shops` (`name`, `token`) VALUES ('".$this->shopify_shop_name."', '".htmlspecialchars($token, ENT_QUOTES)."')");
    return true;
  }


  public function create_user($email, $name = '', $dob = '', $phone = '')
  {
    $name = explode(" ", $name);
    try {
      $customer = array(
        "customer" => array(
          "first_name"   => $name[0],
          "last_name" => $name[1],
          "email" => $email,
          "verified_email" => true,
          "note" => date("m/d/Y",strtotime($dob)),
          "addresses" => array(
            0 => array("phone" => $phone)
          ),
          "send_email_invite"  => true
        )
      );

      $this->shopify->call('POST', '/admin/customers.json', $customer);
    }
    catch (ShopifyApiException $e) {}
  }


  public function create_webhook($topic, $address, $format)
  {
    try {
      $webhook = array(
        "webhook" => array(
          "topic"   => $topic,
          "address" => $address,
          "format"  => $format
        )
      );

      return $this->shopify->call('POST', '/admin/webhooks.json', $webhook);
    }
    catch (ShopifyApiException $e) {}
  }


  public function alter_asset($title, $replacements = array())
  {
    try {
      $themes = $this->shopify->call('GET', '/admin/themes.json');
    } catch (ShopifyApiException $e) {}

    foreach ($themes as $theme) {
      try {
        $asset_content = $this->shopify->call('GET', '/admin/themes/'.$theme['id'].'/assets.json?asset[key]='.$title.'&theme_id='.$theme['id']);
        $asset = array(
          "asset" => array(
            "key"   => str_replace(".liquid", "", $title)."-bckp.liquid",
            "value" => $asset_content['value'], //str_replace(array("", '"', "\n", "\t", "\r"), array("", '\"', "\\n", "\\t", "\\r"), $asset_content['value'])
          )
        );

        $newValue = $asset_content['value'];
        foreach( $replacements as $replacement ) {
          $newValue = str_replace($replacement[0], $replacement[1], $newValue);
        }

        $this->shopify->call('PUT', '/admin/themes/'.$theme['id'].'/assets.json', $asset);
        $asset = array(
          "asset" => array(
            "key"   => $title,
            "value" => $newValue, //str_replace(array("", '"', "\n", "\t", "\r"), array("", '\"', "\\n", "\\t", "\\r"), str_replace($heystack, $needle, $asset_content['value']))
          )
        );

        $this->shopify->call('PUT', '/admin/themes/'.$theme['id'].'/assets.json', $asset);
      }
      catch (ShopifyApiException $e) { }
    }
    return true;
  }

  public function create_asset($title, $content)
  {
    try {
      $themes = $this->shopify->call('GET', '/admin/themes.json');
    } catch (ShopifyApiException $e) {}

    $content = addslashes( $content );
    foreach ($themes as $theme) {
      try {
        $asset = array(
          "asset" => array(
            "key"   => $title,
            "value" => $content
          )
        );
        $this->shopify->call('PUT', '/admin/themes/' . $theme['id'] . '/assets.json', $asset);
      }
      catch (ShopifyApiException $e) {}
    }
    return true;
  }

  public function create_maintheme_asset($key, $type, $value)
  {
    try {
      $themes = $this->shopify->call('GET', '/admin/themes.json');
    } catch (ShopifyApiException $e) {}

    $assetResult = null;
    try {
      $mainTheme = $this->shopify->call('GET', 'admin/themes.json', array('role' => 'main'));
      if( !empty($mainTheme) and !empty($mainTheme[0]) ) {
        $assetsParams = array(
          'asset' => array(
            'key' => $key,
            $type => $value,
          )
        );
        $assetResult = $this->shopify->call('PUT', 'admin/themes/' . $mainTheme[0]['id'] . '/assets.json', $assetsParams);
      }
    } catch (ShopifyApiException $e) {}

    return $assetResult;
  }

  public function delete_asset($title)
  {
    try {
      $themes = $this->shopify->call('GET', '/admin/themes.json');
    } catch (ShopifyApiException $e) {}

    foreach ($themes as $theme) {
      try {
        $asset = array( "asset" => array( "key" => $title ) );
        $this->shopify->call("DELETE", '/admin/themes/' . $theme['id'] . '/assets.json', $asset);
      }
      catch (ShopifyApiException $e) {}
    }
    return true;
  }


  public function create_script_tag($url)
  {
    try {
      $script_tag = array(
        "script_tag" => array(
          "event" => "onload",
          "src" => $url
        )
      );
      $res = $this->shopify->call('POST', '/admin/script_tags.json', $script_tag);
      return true;
    } catch (ShopifyApiException $e) {
      return false;
    }
  }


  public function check_signature($secret)
  {
    $hmac = !empty($_GET['hmac']) ? $_GET['hmac'] : '';

    $query = '';
    foreach( $_GET as $k => $v ) {
      if( $k == 'hmac' or $k == 'signature' ) continue;
      $query .= "&" . $k . "=" . $v;
    }
    $query = substr($query, 1);

    return (hash_hmac("sha256", $query, $secret) === $hmac);
  }


  public function verify_payment($charge_id = 0)
  {
    if( !$this->shopify ) return false;

    if( !$charge_id ) {
      $shop = $this->get_shop_info();
      if( !($charge_id = (int)$shop['charge_id']) ) return false;
    }

    try {
      $this->db->query("
        UPDATE `shops`
        SET `charge_id` = '{$charge_id}' WHERE `name` = '{$this->shopify_shop_name}'"
      );

      $status = $this->get_subscription_status($charge_id);

      // activate subscription if accepted but not active
      if( $status == 'accepted' ) {
        $subscription = array(
          "recurring_application_charge" => array(
            "activated_on"  => null,
            "billing_on"    => $recurring_application_charge['billing_on'],
            "cancelled_on"  => null,
            "created_at"    => $recurring_application_charge['created_at'],
            "id"            => $recurring_application_charge['id'],
            "name"          => $recurring_application_charge['name'],
            "price"         => $recurring_application_charge['price'],
            "return_url"    => $recurring_application_charge['return_url'],
            "status"        => $recurring_application_charge['status'],
            "test"          => $recurring_application_charge['test'],
            "trial_days"    => $recurring_application_charge['trial_days'],
            "trial_ends_on" => $recurring_application_charge['trial_ends_on'],
            "updated_at"    => $recurring_application_charge['updated_at']
          )
        );

        $recurring_application_charge_app = $this->shopify->call('POST', '/admin/recurring_application_charges/'.$charge_id.'/activate.json', $subscription);
        return true;

      } elseif( $status == "active" ) {
        return true;
      } else {
        return false;
      }
    }
    catch (ShopifyApiException $e) {
      exit;
    }
  }


  public function verify_one_time_payment( $charge_id = 0, $recurring_application_charge )
  {
    if( !$this->shopify ) return false;
    try {
      $status = $this->get_payment_status($charge_id);

      // activate subscription if accepted but not active
      if( $status == 'accepted' ) {
        $payment = array( "application_charge" => array(
          "api_client_id"        => $recurring_application_charge['api_client_id'],
          "created_at"           => $recurring_application_charge['created_at'],
          "id"                   => $recurring_application_charge['id'],
          "name"                 => $recurring_application_charge['name'],
          "price"                => $recurring_application_charge['price'],
          "return_url"           => $recurring_application_charge['return_url'],
          "status"               => $recurring_application_charge['status'],
          "test"                 => $recurring_application_charge['test'],
          "updated_at"           => $recurring_application_charge['updated_at'],
          "charge_type"          => null,
          "decorated_return_url" => $recurring_application_charge['decorated_return_url']
        ));

        $this->shopify->call('POST', '/admin/application_charges/' . $charge_id . '/activate.json', $payment);
        return true;
      } else {
        return false;
      }
    } catch (ShopifyApiException $e) {
      exit;
    }
  }


  /*--------------------------------------------------------------------------------------------------------------*/

  public function getBlogs()
  {
    $blogs = array();
    try {
      $blogs = $this->shopify->call('GET', '/admin/blogs.json') ;
    } catch (ShopifyApiException $e) {}

    return $blogs;
  }


  public function getCollections()
  {
    $allCollections = array();
    $collectionsPage = 1;

    do { // pagination
      $collectionsCount = 0;

      $collectionsRequest = array( "limit" => 200, "page"  => $collectionsPage );
      $collections = $this->shopify->call('GET', '/admin/custom_collections.json', $collectionsRequest);

      if( !empty($collections) ) {
        $collectionsCount = count($collections);
        $allCollections = array_merge($allCollections, $collections);
      }
      $collectionsPage++;
    } while( $collectionsCount > 0 );

    return $allCollections;
  }


  // ------------------------------ Layouts ------------------------------

  // +
  public function checkLayoutPermission( $layoutId )
  {
    $layoutId = (int)$layoutId;
    if( !$layoutId ) return false;

    $sql = "
      SELECT COUNT(*) as cnt
      FROM `layouts`
      WHERE `layout_id` = '{$layoutId}'
      AND `shop_name` = '{$this->shopify_shop_name}'
      LIMIT 1"
    ;

    $result = $this->db->get_one($sql);
    return (bool)$result;
  }

  // +
  public function getLayouts( $parentLayoutId = null, $syncOnly = true )
  {
    $sql = "
      SELECT *
      FROM `layouts`
      WHERE `shop_name` = '{$this->shopify_shop_name}'"
    ;

    if( $parentLayoutId === null ) {
      $sql .= " AND `parent_layout_id` IS NULL";
    } else {
      $sql .= " AND `parent_layout_id` = " . (int)$parentLayoutId;
      $sql .= " AND `sync` = " . ( $syncOnly ? 1 : 0 );
    }

    $sql .= " ORDER BY `layout_id` DESC";
    return $this->db->get_all($sql);
  }

  // +
  public function getLayoutsFamily( $parentLayoutId )
  {
    $results = array();

    $sql = "
      SELECT *
      FROM `layouts`
      WHERE `shop_name` = '{$this->shopify_shop_name}'
      AND (`layout_id` = '{$parentLayoutId}' OR `parent_layout_id` = '{$parentLayoutId}')
      ORDER BY `layout_id` ASC"
    ;

    $rows = $this->db->get_all($sql);
    foreach ($rows as $row) {
      $results[$row['view_type']] = $row;
    }

    return $results;
  }

  // +
  public function getLayout( $layoutId )
  {
    if( !$layoutId ) return array();
    $sql = "
      SELECT *
      FROM `layouts`
      WHERE `shop_name` = '{$this->shopify_shop_name}'
      AND `layout_id` = '{$layoutId}'
      LIMIT 1"
    ;

    return $this->db->get_row($sql);
  }

  // +
  public function setLayout( $layoutId, $title, $enabled = 0, $event = 'welcome', $params = array() )
  {
    $allowedEvents = array('welcome', 'exit', 'click');
    $allowedPages  = array('all', 'home', 'product', 'collection', 'blog', 'article', 'cart', 'account');
    $allowedPeriod = array(315360000, 86400, 259200, 604800, 1209600, 2592000);

    $title   = !empty($title) ? $this->db->real_escape_string($title) : '';
    $enabled = !empty($enabled) ? 1 : 0;
    $event   = (!empty($event) and in_array($event, $allowedEvents)) ? $event : $allowedEvents[0];
    $preparedParams = array();

    if( $event == 'welcome') {
      if( !empty($params['welcome_products']) ) {
        $productList = explode(',', $params['welcome_products']);
        $preparedProductList = array();
        foreach( $productList as $product ) {
          $product = trim($product);
          if( !empty($product ) ) $preparedProductList[] = $this->db->real_escape_string($product);
        }
        $preparedParams['welcome_products'] = implode($preparedProductList);
      } else {
        $preparedParams['welcome_products'] = array();
      }

      $preparedParams['welcome_pages'] = (!empty($params['welcome_pages']) and in_array($params['welcome_pages'], $allowedPages)) ? $params['welcome_pages'] : $allowedPages[0];
      $preparedParams['welcome_collections'] = !empty($params['welcome_collections']) ? $params['welcome_collections'] : array();
      $preparedParams['welcome_blogs'] = !empty($params['welcome_blogs']) ? $params['welcome_blogs'] : array();
      $preparedParams['welcome_period'] = (!empty($params['welcome_period']) and in_array($params['welcome_period'], $allowedPeriod)) ? $params['welcome_period'] : $allowedPeriod[0];

    } elseif( $event == 'exit') {
      if( !empty($params['exit_products']) ) {
        $productList = explode(',', $params['exit_products']);
        $preparedProductList = array();
        foreach( $productList as $product ) {
          $product = trim($product);
          if( !empty($product ) ) $preparedProductList[] = $this->db->real_escape_string($product);
        }
        $preparedParams['exit_products'] = $preparedProductList;
      } else {
        $preparedParams['exit_products'] = array();
      }

      $preparedParams['exit_pages'] = (!empty($params['exit_pages']) and in_array($params['exit_pages'], $allowedPages)) ? $params['exit_pages'] : $allowedPages[0];
      $preparedParams['exit_collections'] = !empty($params['exit_collections']) ? $params['exit_collections'] : array();
      $preparedParams['exit_blogs'] = !empty($params['exit_blogs']) ? $params['exit_blogs'] : array();
      $preparedParams['exit_period'] = (!empty($params['exit_period']) and in_array($params['exit_period'], $allowedPeriod)) ? $params['exit_period'] : $allowedPeriod[0];

    } else {
      $preparedParams['click_link'] = !empty($params['click_link']) ? $params['click_link'] : '';
    }

    $preparedParams['main_width'] = !empty($params['main_width']) ? (int)$params['main_width'] : POPUP_MAIN_WIDTH;
    $preparedParams['tablet_width'] = !empty($params['tablet_width']) ? (int)$params['tablet_width'] : POPUP_TABLET_WIDTH;
    $preparedParams['close_button_color'] = !empty($params['close_button_color']) ? $params['close_button_color'] : POPUP_CLOSE_BTN_COLOR;
    $preparedParams['background_color'] = !empty($params['background_color']) ? $params['background_color'] : POPUP_BG_COLOR;
    $preparedParams['background_style'] = !empty($params['background_style']) ? $params['background_style'] : POPUP_BG_STYLE;
    $preparedParams['background_image_url'] = '';

    $oldParams = array();

    if( empty($layoutId) ) {
      $sql = "
        INSERT INTO `layouts` (`shop_name`, `title`, `enabled`, `event`, `params`)
        VALUES ('{$this->shopify_shop_name}', '{$title}', {$enabled}, '{$event}', '')"
      ;

      $this->db->query( $sql );
      $layoutId = (int)$this->db->last_insert();

      $sql = "
        INSERT INTO `layouts` (`parent_layout_id`, `shop_name`, `view_type`, `title`, `enabled`, `event`, `params`, `sync`)
        VALUES ({$layoutId}, '{$this->shopify_shop_name}', 'tablet', '{$title}', {$enabled}, '{$event}', '', 1),
               ({$layoutId}, '{$this->shopify_shop_name}', 'mobile', '{$title}', {$enabled}, '{$event}', '', 1)"
      ;
      $this->db->query( $sql );
    }

    if( !empty($params['background_image_remove']) ) {
      $preparedParams['background_image_url'] = '';
    } elseif( !empty($_FILES['image']) and !$_FILES['image']['error'] ) {
      $imageInfo = getimagesize($_FILES['image']['tmp_name']);
      if( $imageInfo !== false and ($imageInfo[2] === IMAGETYPE_GIF or $imageInfo[2] === IMAGETYPE_JPEG or $imageInfo[2] === IMAGETYPE_PNG ) ) {
        $imageData = file_get_contents($_FILES['image']['tmp_name']);
        $ext = array(IMAGETYPE_GIF => 'gif', IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png');

        $assetKey = 'assets\/' . APP_ALIAS . '_background_image_' . $layoutId . '.' . $ext[$imageInfo[2]];
        $assetType = 'attachment';
        $assetValue = base64_encode($imageData);
        $assetResult = $this->create_maintheme_asset($assetKey, $assetType, $assetValue);

        if( !empty($assetResult) and !empty($assetResult['public_url']) ) {
          $preparedParams['background_image_url'] = $assetResult['public_url'];
        }
      }
    } else {
      $layout = $this->getLayout($layoutId);
      $oldParams = json_decode($layout['params'], true);
      $preparedParams['background_image_url'] = $oldParams['background_image_url'];
    }

    $preparedParams = json_encode($preparedParams, JSON_UNESCAPED_UNICODE);
    if( $layoutId ) {
      $sql = "
        UPDATE `layouts`
        SET `title` = '{$title}', `enabled` = {$enabled}, `event` = '{$event}', `params` = '{$preparedParams}'
        WHERE `shop_name` = '{$this->shopify_shop_name}'
        AND (`layout_id` = '{$layoutId}' OR `parent_layout_id` = '{$layoutId}')"
      ;

      $this->db->query( $sql );
    }

    $this->_assetMainSnippet();
    $this->_assetPopupSnippet( $layoutId );

    return $layoutId;
  }

  // +
  public function duplicateLayout( $layoutId )
  {
    $layoutsFamily = $this->getLayoutsFamily( $layoutId );
    if( empty($layoutsFamily) ) return false;

    $ld = !empty($layoutsFamily['desktop']) ? $layoutsFamily['desktop'] : null;
    $lt = !empty($layoutsFamily['tablet'])  ? $layoutsFamily['tablet']  : null;
    $lm = !empty($layoutsFamily['mobile'])  ? $layoutsFamily['mobile']  : null;
    if( empty($ld) or empty($lt) or empty($lm) ) return false;

    $ld = array_map(array($this->db, 'real_escape_string'), $ld);
    $lt = array_map(array($this->db, 'real_escape_string'), $lt);
    $lm = array_map(array($this->db, 'real_escape_string'), $lm);

    // clone desktop layout
    $sql = "
      INSERT INTO `layouts` (`shop_name`, `view_type`, `title`, `event`, `enabled`, `params`, `sync`)
      VALUES ('{$ld['shop_name']}', '{$ld['view_type']}', '{$ld['title']}', '{$ld['event']}', {$ld['enabled']}, '{$ld['params']}', '{$ld['sync']}')"
    ;
    $this->db->query( $sql );
    $cloneLDId = (int)$this->db->last_insert();

    // clone tablet layout
    $sql = "
      INSERT INTO `layouts` (`parent_layout_id`, `shop_name`, `view_type`, `title`, `event`, `enabled`, `params`, `sync`)
      VALUES ('{$cloneLDId}', '{$lt['shop_name']}', '{$lt['view_type']}', '{$lt['title']}', '{$lt['event']}', {$lt['enabled']}, '{$lt['params']}', '{$lt['sync']}')"
    ;
    $this->db->query( $sql );
    $cloneLTId = (int)$this->db->last_insert();

    // clone mobile layout1
    $sql = "
      INSERT INTO `layouts` (`parent_layout_id`, `shop_name`, `view_type`, `title`, `event`, `enabled`, `params`, `sync`)
      VALUES ('{$cloneLDId}', '{$lm['shop_name']}', '{$lm['view_type']}', '{$lm['title']}', '{$lm['event']}', {$lm['enabled']}, '{$lm['params']}', '{$lm['sync']}')"
    ;
    $this->db->query( $sql );
    $cloneLMId = (int)$this->db->last_insert();


    // clone desktop containers
    $cd = $this->getContainers($ld['layout_id'], '`container_id` ASC');
    $cloneCD = array();
    foreach( $cd as $c ) {
      $sql = "
        INSERT INTO `containers` (`layout_id`, `x`, `y`, `width`, `extra_order`, `sync_with`)
        VALUES ('{$cloneLDId}', {$c['x']}, {$c['y']}, {$c['width']}, '{$c['extra_order']}', NULL)"
      ;
      $this->db->query( $sql );
      $cloneCD[$c['container_id']] = (int)$this->db->last_insert();
    }

    // clone desktop widgets
    $wd = $this->getWidgets($ld['layout_id'], '`widget_id` ASC');
    $cloneWD = array();
    foreach( $wd as $w ) {
      if( empty($cloneCD[$w['container_id']]) ) continue;
      $w['params'] = $this->db->real_escape_string($w['params']);

      $sql = "
        INSERT INTO `widgets` (`layout_id`, `container_id`, `widget_type`, `x`, `y`, `width`, `extra_order`, `params`, `sync_with`)
        VALUES ('{$cloneLDId}', '{$cloneCD[$w['container_id']]}', '{$w['widget_type']}', {$w['y']}, {$w['y']}, {$w['width']}, '{$w['extra_order']}', '{$w['params']}', NULL)"
      ;
      $this->db->query( $sql );
      $cloneWD[$w['widget_id']] = (int)$this->db->last_insert();
    }


    // clone tablet containers
    $ct = $this->getContainers($lt['layout_id'], '`container_id` ASC');
    $cloneCT = array();
    foreach( $ct as $c ) {
      $cpid = ( !empty($c['sync_with']) and !empty($cloneCD[$c['sync_with']]) ) ? $cloneCD[$c['sync_with']] : 'NULL';
      $sql = "
        INSERT INTO `containers` (`layout_id`, `x`, `y`, `width`, `extra_order`, `sync_with`)
        VALUES ('{$cloneLTId}', {$c['x']}, {$c['y']}, {$c['width']}, '{$c['extra_order']}', {$cpid})"
      ;
      $this->db->query( $sql );
      $cloneCT[$c['container_id']] = (int)$this->db->last_insert();
    }

    // clone tablet widgets
    $wt = $this->getWidgets($lt['layout_id'], '`widget_id` ASC');
    foreach( $wt as $w ) {
      if( empty($cloneCT[$w['container_id']]) ) continue;
      $cwid = ( !empty($w['sync_with']) and !empty($cloneWD[$w['sync_with']]) ) ? $cloneWD[$w['sync_with']] : 'NULL';
      $w['params'] = $this->db->real_escape_string($w['params']);

      $sql = "
        INSERT INTO `widgets` (`layout_id`, `container_id`, `widget_type`, `x`, `y`, `width`, `extra_order`, `params`, `sync_with`)
        VALUES ('{$cloneLTId}', '{$cloneCT[$w['container_id']]}', '{$w['widget_type']}', {$w['y']}, {$w['y']}, {$w['width']}, '{$w['extra_order']}', '{$w['params']}', {$cwid})"
      ;
      $this->db->query( $sql );
    }


    // clone mobile containers
    $cm = $this->getContainers($lm['layout_id'], '`container_id` ASC');
    $cloneCM = array();
    foreach( $cm as $c ) {
      $cpid = ( !empty($c['sync_with']) and !empty($cloneCD[$c['sync_with']]) ) ? $cloneCD[$c['sync_with']] : 'NULL';
      $sql = "
        INSERT INTO `containers` (`layout_id`, `x`, `y`, `width`, `extra_order`, `sync_with`)
        VALUES ('{$cloneLMId}', {$c['x']}, {$c['y']}, {$c['width']}, '{$c['extra_order']}', {$cpid})"
      ;
      $this->db->query( $sql );
      $cloneCM[$c['container_id']] = (int)$this->db->last_insert();
    }

    // clone mobile widgets
    $wm = $this->getWidgets($lm['layout_id'], '`widget_id` ASC');
    foreach( $wm as $w ) {
      if( empty($cloneCM[$w['container_id']]) ) continue;
      $cwid = ( !empty($w['sync_with']) and !empty($cloneWD[$w['sync_with']]) ) ? $cloneWD[$w['sync_with']] : 'NULL';
      $w['params'] = $this->db->real_escape_string($w['params']);

      $sql = "
        INSERT INTO `widgets` (`layout_id`, `container_id`, `widget_type`, `x`, `y`, `width`, `extra_order`, `params`, `sync_with`)
        VALUES ('{$cloneLMId}', '{$cloneCM[$w['container_id']]}', '{$w['widget_type']}', {$w['y']}, {$w['y']}, {$w['width']}, '{$w['extra_order']}', '{$w['params']}', {$cwid})"
      ;
      $this->db->query( $sql );
    }
  }

  // +
  public function removeLayout( $layoutId )
  {
    $layout = $this->getLayout($layoutId);
    if( empty($layout) or $layout['parent_layout_id'] ) return;

    $this->db->query("
      DELETE FROM `layouts`
      WHERE `layout_id` = {$layoutId}
      OR `parent_layout_id` = {$layoutId}"
    );

    $this->_assetMainSnippet();
    $this->delete_asset( 'snippets/' . getPopupName($layoutId) . '.liquid' );
  }

  // +
  private function _unsyncLayout( $layoutId )
  {
    if( $viewType == 'desktop' ) return;

    // unsync layouts
    $this->db->query("
      UPDATE `layouts` SET `sync` = 0
      WHERE `shop_name` = '{$this->shopify_shop_name}'
      AND `layout_id` = {$layoutId}"
    );

    $this->db->query("
      UPDATE `containers` SET `sync_with` = NULL
      WHERE `layout_id` = {$layoutId}"
    );

    $this->db->query("
      UPDATE `layouts` SET `sync_with` = NULL
      WHERE `layout_id` = {$layoutId}"
    );
  }


  // ------------------------------ Containers ------------------------------

  // +
  public function checkContainerPermission( $containerId, $layoutId = null )
  {
    $containerId = (int)$containerId;
    if( !$containerId ) return false;

    $sql = "
      SELECT COUNT(*) as cnt
      FROM `containers` c
      JOIN `layouts` l ON c.`layout_id` = l.`layout_id`
      WHERE c.`container_id` = '{$containerId}'
      AND l.`shop_name` = '{$this->shopify_shop_name}'"
    ;

    if( $layoutId !== null ) $sql .= " AND c.`layout_id` = " . (int)$layoutId;
    $sql .= "LIMIT 1";

    $result = $this->db->get_one($sql);
    return (bool)$result;
  }

  // +
  public function getContainers( $layoutId, $order = '' )
  {
    $sql = "
      SELECT *
      FROM `containers`
      WHERE `layout_id` = '{$layoutId}'"
    ;

    if( empty($order) ) $sql .= " ORDER BY `extra_order` ASC, `y` ASC, `x` ASC, `container_id` ASC";
    else $sql .= " ORDER BY " . $order;

    return $this->db->get_all($sql);
  }

  // +
  public function getContainer( $containerId )
  {
    $sql = "
      SELECT *
      FROM `containers`
      WHERE `container_id` = '{$containerId}'
      LIMIT 1"
    ;

    return $this->db->get_row($sql);
  }

  // +
  public function getSyncContainer( $layoutId, $parentContainerId )
  {
    $sql = "
      SELECT *
      FROM `containers`
      WHERE `layout_id` = '{$layoutId}'
      AND `sync_with` = '{$parentContainerId}'
      LIMIT 1"
    ;

    return $this->db->get_row($sql);
  }

  // +
  public function addContainer( $layoutId, $containerParams )
  {
    $layoutId = (int)$layoutId;
    $layout = $this->getLayout( $layoutId );
    if( empty($layout) ) return 0;

    $viewType = $layout['view_type'];

    // create container
    $cp = $this->_prepareContainerParams($containerParams, $viewType);

    $this->db->query("
      INSERT INTO `containers` (`layout_id`, `x`, `y`, `width`, `extra_order`)
      VALUES ({$layoutId}, '{$cp['x']}', '{$cp['y']}', '{$cp['width']}', '{$cp['extra_order']}')"
    );
    $containerId = (int)$this->db->last_insert();
    if( !$containerId ) return 0;

    if( $viewType == 'desktop' ) {
      // create clones
      $syncLayouts = $this->getLayouts( $layoutId );
      if( !empty($syncLayouts) ) {
        foreach( $syncLayouts as $syncLayout ) {
          $syncLayoutId = $syncLayout['layout_id'];
          $syncType     = $syncLayout['view_type'];
          $syncCP       = $this->_prepareContainerParams($cp, $syncType);

          $this->db->query("
            INSERT INTO `containers` (`layout_id`, `x`, `y`, `width`, `extra_order`, `sync_with`)
            VALUES ({$syncLayoutId}, '{$syncCP['x']}', '{$syncCP['y']}', '{$syncCP['width']}', '{$syncCP['extra_order']}', '{$containerId}')"
          );

          $this->_containersPositionsRecalculate($syncLayoutId, $syncType);
        }
      }

    } else {
      if( !empty($layout['sync']) ) $this->_unsyncLayout( $layoutId );
      $this->_containersPositionsRecalculate($layoutId, $viewType);
    }

    $this->_assetPopupSnippet( $layoutId );

    return $containerId;
  }

  // +
  public function removeContainer( $containerId )
  {
    $container = $this->getContainer( $containerId );
    if( empty($container) ) return;

    $layout = $this->getLayout($container['layout_id']);
    if( empty($layout) ) return;

    $layoutId = $layout['layout_id'];
    $viewType = $layout['view_type'];
    $this->db->query("
      DELETE FROM `containers`
      WHERE `container_id` = {$containerId}
      LIMIT 1"
    );

    if( $viewType == 'desktop' ) {
      // remove clones
      $syncLayouts = $this->getLayouts( $layoutId );
      if( !empty($syncLayouts) ) {
        foreach( $syncLayouts as $syncLayout ) {
          $syncLayoutId = $syncLayout['layout_id'];
          $syncType     = $syncLayout['view_type'];

          $this->db->query("
            DELETE FROM `containers`
            WHERE `layout_id` = '{$syncLayoutId}'
            AND `sync_with` = '{$containerId}'"
          );

          $this->_containersPositionsRecalculate($syncLayoutId, $syncType);
        }
      }

    } else {
      if( !empty($layout['sync']) ) $this->_unsyncLayout( $layoutId );
      $this->_containersPositionsRecalculate($layoutId, $viewType);
    }

    $this->_assetPopupSnippet( $layoutId );
  }

  // +
  public function updateContainersParams( $layoutId, $containersList )
  {
    $layoutId = (int)$layoutId;
    $layout = $this->getLayout( $layoutId );
    if( empty($layout) ) return 0;

    $viewType = $layout['view_type'];

    if( $viewType == 'desktop' ) {
      $syncLayouts = $this->getLayouts( $layoutId );
    }

    // widgets setup
    foreach( $containersList as $cp ) {
      $containerId = !empty($cp['container_id']) ? (int)$cp['container_id'] : 0;
      if( empty($containerId) ) continue;

      $container = $this->getContainer( $containerId );
      if( empty($container) or $layoutId != $container['layout_id'] ) continue;

      $cp = $this->_prepareContainerParams($cp, $viewType);
      $sql = "
        UPDATE `containers`
        SET `x` = '{$cp['x']}', `y` = '{$cp['y']}', `width` = '{$cp['width']}', `extra_order` = '{$cp['extra_order']}'
        WHERE `container_id` = '{$containerId}'
        LIMIT 1"
      ;
      $this->db->query($sql);

      if( $viewType == 'desktop' ) {
        if( !empty($syncLayouts) ) {
          foreach( $syncLayouts as $syncLayout ) {
            $syncLayoutId  = $syncLayout['layout_id'];
            $syncType = $syncLayout['view_type'];
            $syncCP   = $this->_prepareContainerParams($cp, $syncType);

            $sql = "
              UPDATE `containers`
              SET `x` = '{$syncCP['x']}', `y` = '{$syncCP['y']}', `width` = '{$syncCP['width']}', `extra_order` = '{$syncCP['extra_order']}'
              WHERE `layout_id` = '{$syncLayoutId}'
              AND `sync_with` = '{$containerId}'
              LIMIT 1"
            ;
            $this->db->query($sql);
          }
        }

      } elseif( !empty($layout['sync']) ) {
        $this->_unsyncLayout( $layoutId );
        $layout['sync'] = 0;
      }
    }

    // layput setup
    if( $viewType == 'desktop' ) {
      foreach( $syncLayouts as $syncLayout ) {
        $syncLayoutId  = $syncLayout['layout_id'];
        $syncType = $syncLayout['view_type'];
        $this->_containersPositionsRecalculate($syncLayoutId, $syncType);
      }
    } else {
      $this->_containersPositionsRecalculate($layoutId, $viewType);
    }

    $this->_assetPopupSnippet( $layoutId );
  }

  // +
  private function _prepareContainerParams( $containerParams, $viewType = 'desktop' )
  {
    $cp = array();
    $maxWidth = 12;
    $minWidth = ($viewType != 'mobile') ? 1 : 12;

    $cp['x'] = isset($containerParams['x']) ? (int)$containerParams['x'] : 0;
    $cp['y'] = isset($containerParams['y']) ? (int)$containerParams['y'] : 0;
    $cp['width'] = isset($containerParams['width']) ? (int)$containerParams['width'] : $minWidth;

    if( $cp['x'] < 0 ) $cp['x'] = 0;
    if( $cp['y'] < 0 ) $cp['y'] = 0;
    if( $cp['width'] < $minWidth ) $cp['width'] = $minWidth;

    $cp['extra_order'] = (int)( "{$cp['y']}{$cp['x']}" );

    // 'x' prepare
    if( $cp['x'] > $maxWidth - $minWidth ) $cp['x'] = $maxWidth - $minWidth;

    // 'width' prepare
    if( $cp['width'] > $maxWidth - $cp['x'] ) $cp['width'] = $maxWidth - $cp['x'];

    return $cp;
  }

  // +
  private function _containersPositionsRecalculate( $layoutId, $viewType = 'desktop' )
  {
    if( $viewType == 'mobile' ) {
      $this->db->query('SET @counter = 0');
      $sql = "
        UPDATE `containers` SET `y` = (@counter := @counter + 1)
        WHERE `layout_id` = {$layoutId}
        ORDER BY `extra_order`"
      ;
      $this->db->query($sql);
    }
  }


  // ------------------------------ Widgets ------------------------------

  // +
  public function checkWidgetPermission( $widgetId, $layoutId = null )
  {
    $widgetId = (int)$widgetId;
    if( !$widgetId ) return false;

    $sql = "
      SELECT COUNT(*) as cnt
      FROM `widgets` w
      JOIN `layouts` l ON w.`layout_id` = l.`layout_id`
      WHERE w.`widget_id` = '{$widgetId}'
      AND l.`shop_name` = '{$this->shopify_shop_name}'"
    ;

    if( $layoutId !== null ) $sql .= " AND w.`layout_id` = " . (int)$layoutId;
    $sql .= "LIMIT 1";

    $result = $this->db->get_one($sql);
    return (bool)$result;
  }

  // +
  public function getWidgets( $layoutId, $order = '' )
  {
    $sql = "
      SELECT *
      FROM `widgets`
      WHERE `layout_id` = '{$layoutId}'"
    ;

    if( empty($order) ) $sql .= " ORDER BY `container_id` ASC, `extra_order` ASC, `y` ASC, `x` ASC, `widget_id` ASC";
    else $sql .= " ORDER BY " . $order;

    return $this->db->get_all($sql);
  }

  // +
  public function getWidget( $widgetId )
  {
    $sql = "
      SELECT *
      FROM `widgets`
      WHERE `widget_id` = '{$widgetId}'
      LIMIT 1"
    ;

    return $this->db->get_row($sql);
  }

  // +
  public function addWidget( $containerId, $widgetParams )
  {
    $containerId = (int)$containerId;
    $container = $this->getContainer( $containerId );
    if( empty($container) ) return 0;

    $layout = $this->getLayout($container['layout_id']);
    if( empty($layout) ) return 0;

    $layoutId = $layout['layout_id'];
    $viewType = $layout['view_type'];

    // create widget
    $wp = $this->_prepareWidgetParams($widgetParams, $viewType);
    $cp = $this->initContentParams($wp['widget_type']);

    $this->db->query("
      INSERT INTO `widgets` (`layout_id`, `container_id`, `widget_type`, `x`, `y`, `width`, `extra_order`, `params`)
      VALUES ({$layoutId}, '{$containerId}', '{$wp['widget_type']}', '{$wp['x']}', '{$wp['y']}', '{$wp['width']}', '{$wp['extra_order']}', '{$cp}')"
    );
    $widgetId = (int)$this->db->last_insert();
    if( !$widgetId ) return 0;

    if( $viewType == 'desktop' ) {
      $syncLayouts = $this->getLayouts( $layoutId );

      if( !empty($syncLayouts) ) {
        foreach( $syncLayouts as $syncLayout ) {
          $syncLayoutId  = $syncLayout['layout_id'];
          $syncContainer = $this->getSyncContainer($syncLayoutId, $containerId);

          $syncType = $syncLayout['view_type'];
          $syncWP   = $this->_prepareWidgetParams($wp, $syncType);

          $sql = "
            INSERT INTO `widgets` (`layout_id`, `container_id`, `widget_type`, `x`, `y`, `width`, `extra_order`, `params`, `sync_with`)
            VALUES ({$syncLayoutId}, '{$syncContainer['container_id']}', '{$wp['widget_type']}', '{$syncWP['x']}', '{$syncWP['y']}', '{$syncWP['width']}', '{$wp['extra_order']}', '{$cp}', '{$widgetId}')"
          ;
          $this->db->query($sql);

          $this->_widgetsPositionsRecalculate($syncContainer['container_id'], $syncType);
        }
      }

    } else {
      if( !empty($layout['sync']) ) $this->_unsyncLayout( $layoutId );
      $this->_widgetsPositionsRecalculate($containerId, $viewType);
    }

    $this->_assetPopupSnippet( $layoutId );

    return $widgetId;
  }

  // +
  public function initContentParams( $type, $json = true )
  {
    $cp = array(
      "text_align" => "center",
      "padding_v" => 5,
      "padding_h" => 10,
      "background_color" => "",
      "border_width" => 0,
      "border_color" => "ebeef0",
      "border_radius" => 0
    );

    switch( $type ) {
      case "text" :  $cp["text_color"] = "333333";
                     $cp["font_size"] = 13;
                     $cp["font_style"] = "normal";
                     break;

      case "image" : $cp["stretch"] = 1;
                     break;

      case "share" : $cp["btn_size"] = 30;
                     $cp["fb"] = 1;
                     $cp["tw"] = 1;
                     $cp["pinterest"] = 1;
                     $cp["gplus"] = 1;
                     break;

      case "social": $cp["btn_icon_color"] = 'ffffff';
                     $cp["btn_size"] = 30;
                     $cp["btn_background_color"] = '479ccf';
                     break;

      case "video":  $cp["padding_h"] = 5;
                     break;

      case "button": $cp["btn_text_color"] = 'ffffff';
                     $cp["btn_background_color"] = '479ccf';
                     $cp["btn_padding_v"] = 5;
                     $cp["btn_padding_h"] = 10;
                     $cp["btn_border_width"] = 0;
                     $cp["btn_border_color"] = 'ebeef0';
                     $cp["btn_border_radius"] = 3;
                     $cp["btn_full_width"] = 0;
                     $cp["btn_font_size"] = 13;
                     $cp["btn_font_style"] = 'normal';
                     break;

      case "subscribe": $cp["label"] = "Email";
                        $cp["placeholder"] = "";
                        $cp["btn_text_color"] = 'ffffff';
                        $cp["btn_background_color"] = '479ccf';
                        $cp["btn_padding_v"] = 5;
                        $cp["btn_padding_h"] = 10;
                        $cp["btn_border_width"] = 0;
                        $cp["btn_border_color"] = 'ebeef0';
                        $cp["btn_border_radius"] = 3;
                        $cp["btn_full_width"] = 0;
                        $cp["btn_font_size"] = 13;
                        $cp["btn_font_style"] = 'normal';
                        $cp["btn_text"] = "Subscribe";
                        $cp["text_align"] = "left";
                        break;
    }

    return $json ? json_encode($cp, JSON_UNESCAPED_UNICODE) : $cp;
  }

  // +
  public function updateWidgetsParams( $containerId, $widgetsList )
  {
    $containerId = (int)$containerId;
    $container = $this->getContainer( $containerId );
    if( empty($container) ) return 0;

    $layout = $this->getLayout($container['layout_id']);
    if( empty($layout) ) return 0;

    $layoutId = $layout['layout_id'];
    $viewType = $layout['view_type'];

    if( $viewType == 'desktop' ) {
      $syncLayouts = $this->getLayouts( $layoutId );
    }

    // widgets setup
    foreach( $widgetsList as $wp ) {
      $widgetId = !empty($wp['widget_id']) ? (int)$wp['widget_id'] : 0;
      if( empty($widgetId) ) continue;

      $widget = $this->getWidget( $widgetId );
      if( empty($widget) or $layoutId != $widget['layout_id'] ) continue;

      $wp = $this->_prepareWidgetParams($wp, $viewType);
      $sql = "
        UPDATE `widgets`
        SET `container_id` = '{$containerId}', `x` = '{$wp['x']}', `y` = '{$wp['y']}', `width` = '{$wp['width']}', `extra_order` = '{$wp['extra_order']}'
        WHERE `widget_id` = '{$widgetId}'
        LIMIT 1"
      ;
      $this->db->query($sql);

      if( $viewType == 'desktop' ) {
        if( !empty($syncLayouts) ) {
          foreach( $syncLayouts as $syncLayout ) {
            $syncLayoutId  = $syncLayout['layout_id'];
            $syncType = $syncLayout['view_type'];
            $syncWP   = $this->_prepareWidgetParams($wp, $syncType);

            $sql = "
              UPDATE `widgets`
              SET `container_id` = '{$containerId}', `x` = '{$syncWP['x']}', `y` = '{$syncWP['y']}', `width` = '{$syncWP['width']}', `extra_order` = '{$syncWP['extra_order']}'
              WHERE `layout_id` = '{$syncLayoutId}'
              AND `sync_with` = '{$widgetId}'
              LIMIT 1"
            ;
            $this->db->query($sql);
          }
        }

      } elseif( !empty($layout['sync']) ) {
        $this->_unsyncLayout( $layoutId );
        $layout['sync'] = 0;
      }
    }

    // layput setup
    if( $viewType == 'desktop' ) {
      foreach( $syncLayouts as $syncLayout ) {
        $syncType = $syncLayout['view_type'];
        $syncContainer = $this->getSyncContainer($syncLayout['layout_id'], $containerId);
        $this->_widgetsPositionsRecalculate($syncContainer['container_id'], $syncType);
      }
    } else {
      $this->_widgetsPositionsRecalculate($containerId, $viewType);
    }

    $this->_assetPopupSnippet( $layoutId );
  }

  // +
  public function widgetContentValidate( $widgetId, &$cp )
  {
    $widget = $this->getWidget( $widgetId );
    if( empty($widget) ) return 'Invalid widget';

    $error = '';
    switch( $widget['widget_type'] ) {
      case 'text':
          if( empty($cp['text']) ) $error = 'Text is required field';
          break;

      case 'html':
          if( empty($cp['html']) ) $error = 'HTML is required field';
          break;

      case 'share':
          if( empty($cp['url']) ) $error = 'Sharing URL is required field';
          elseif( !empty($cp['pinterest']) and empty($cp['media_url']) ) $error = 'Pin Image URL is required field';
          elseif( empty($cp['btn_size']) ) $error = 'Button size is required field';
          elseif( $cp['btn_size'] < 12 or $cp['btn_size'] > 60 ) $cp['btn_size'] = 30;
          break;

      case 'social':
          if( empty($cp['btn_size']) ) $error = 'Button size is required field';
          elseif( $cp['btn_size'] < 12 or $cp['btn_size'] > 60 ) $cp['btn_size'] = 30;
          break;

      case 'button':
          if( empty($cp['btn_text']) ) $error = 'Text is required field';
          elseif( empty($cp['url']) ) $error = 'URL is required field';
          break;

      case 'video':
          if( empty($cp['url']) ) $error = 'URL is required field';
          else {
            $videoParams = prepareVideoParams($cp['url']);
            if( empty($videoParams['type']) ) $error = 'Only youtube or vimeo links';
            elseif( empty($videoParams['code']) ) $error = 'Invalid URL';
            else {
              $cp['type'] = $videoParams['type'];
              $cp['code'] = $videoParams['code'];
            }
          }
          break;

      case 'subscribe':
          if( empty($cp['btn_text']) ) $error = 'Text is required field';
          elseif( empty($cp['url']) ) $error = 'URL is required field';
          break;
    }

    return $error;
  }

  // +
  public function updateWidgetContentParams( $widgetId, $contentParams )
  {
    $widget = $this->getWidget( $widgetId );
    if( empty($widget) ) return;

    $layout = $this->getLayout($widget['layout_id']);
    if( empty($layout) ) return;

    $layoutId = $layout['layout_id'];
    $viewType = $layout['view_type'];

    if( !empty($_FILES['image']) and !$_FILES['image']['error'] ) {
      $imageInfo = getimagesize($_FILES['image']['tmp_name']);
      if( $imageInfo !== false and ($imageInfo[2] === IMAGETYPE_GIF or $imageInfo[2] === IMAGETYPE_JPEG or $imageInfo[2] === IMAGETYPE_PNG ) ) {
        $imageData = file_get_contents($_FILES['image']['tmp_name']);
        $ext = array(IMAGETYPE_GIF => 'gif', IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png');

        $assetKey = 'assets\/' . APP_ALIAS . '_content_image_' . $widgetId . '.' . $ext[$imageInfo[2]];
        $assetType = 'attachment';
        $assetValue = base64_encode($imageData);
        $assetResult = $this->create_maintheme_asset($assetKey, $assetType, $assetValue);

        if( !empty($assetResult) and !empty($assetResult['public_url']) ) {
          $contentParams['image_url'] = $assetResult['public_url'];
        }
      }
    } else {
      $currentCP = json_decode($widget['params'], true);
      if( !empty($currentCP) and !empty($currentCP['image_url']) ) $contentParams['image_url'] = $currentCP['image_url'];
    }

    $cpJSON = json_encode($contentParams, JSON_UNESCAPED_UNICODE);
    $cpJSON = $this->db->real_escape_string($cpJSON);

    $sql = "
      UPDATE `widgets`
      SET `params` = '{$cpJSON}'
      WHERE `widget_id` = '{$widgetId}'
      LIMIT 1"
    ;
    $this->db->query($sql);

    if( $viewType == 'desktop' ) {
      $syncLayouts = $this->getLayouts( $layoutId );
      if( !empty($syncLayouts) ) {
        foreach( $syncLayouts as $syncLayout ) {
          $syncLayoutId = $syncLayout['layout_id'];
          $syncType     = $syncLayout['view_type'];

          $sql = "
            UPDATE `widgets`
            SET `params` = '{$cpJSON}'
            WHERE `layout_id` = '{$syncLayoutId}'
            AND `sync_with` = '{$widgetId}'
            LIMIT 1"
          ;
          $this->db->query($sql);
        }
      }

    } elseif( !empty($layout['sync']) ) {
      $this->_unsyncLayout( $layoutId );
    }

    $this->_assetPopupSnippet( $layoutId );
  }

  // +
  public function removeWidget($widgetId)
  {
    $widget = $this->getWidget( $widgetId );
    if( empty($widget) ) return;

    $layout = $this->getLayout($widget['layout_id']);
    if( empty($layout) ) return;

    $layoutId = $layout['layout_id'];
    $viewType = $layout['view_type'];
    $containerId = $widget['widget_id'];

    $this->db->query("
      DELETE FROM `widgets`
      WHERE `widget_id` = {$widgetId}
      LIMIT 1"
    );

    if( $viewType == 'desktop' ) {
      // remove clones
      $syncLayouts = $this->getLayouts( $layoutId );
      if( !empty($syncLayouts) ) {
        foreach( $syncLayouts as $syncLayout ) {
          $syncLayoutId = $syncLayout['layout_id'];
          $syncType = $syncLayout['view_type'];
          $syncContainer = $this->getSyncContainer($syncLayoutId, $containerId);

          $this->db->query("
            DELETE FROM `widgets`
            WHERE `layout_id` = '{$syncLayoutId}'
            AND `sync_with` = '{$widgetId}'
            LIMIT 1"
          );

          $this->_widgetsPositionsRecalculate($syncContainer['container_id'], $syncType);
        }
      }
    } else {
      if( !empty($layout['sync']) ) $this->_unsyncLayout( $layoutId );
      $this->_widgetsPositionsRecalculate($containerId, $viewType);
    }

    $this->_assetPopupSnippet( $layoutId );
  }

  // +
  private function _prepareWidgetParams( $widgetParams, $viewType = 'desktop' )
  {
    $allowedTypes = array('text', 'image', 'html', 'social', 'share', 'button', 'video', 'subscribe');
    $wp = array();
    $maxWidth = 12;
    $minWidth = ($viewType != 'mobile') ? 1 : 12;

    $wp['x'] = isset($widgetParams['x']) ? (int)$widgetParams['x'] : 0;
    $wp['y'] = isset($widgetParams['y']) ? (int)$widgetParams['y'] : 0;
    $wp['width'] = isset($widgetParams['width']) ? (int)$widgetParams['width'] : $minWidth;

    if( $wp['x'] < 0 ) $wp['x'] = 0;
    if( $wp['y'] < 0 ) $wp['y'] = 0;
    if( $wp['width'] < $minWidth ) $wp['width'] = $minWidth;

    $wp['extra_order'] = (int)( "{$wp['y']}{$wp['x']}" );

    // 'x' prepare
    if( $wp['x'] > $maxWidth - $minWidth ) $wp['x'] = $maxWidth - $minWidth;

    // 'width' prepare
    if( $wp['width'] > $maxWidth - $wp['x'] ) $wp['width'] = $maxWidth - $wp['x'];

    // 'widget_type' prepare
    if( isset($widgetParams['widget_type']) and in_array($widgetParams['widget_type'], $allowedTypes) ) {
      $wp['widget_type'] = $widgetParams['widget_type'];
    } else {
      $wp['widget_type'] = 'text';
    }

    return $wp;
  }

  // +
  private function _widgetsPositionsRecalculate( $containerId, $viewType = 'desktop' )
  {
    if( $viewType == 'mobile' ) {
      $this->db->query('SET @counter = 0');
      $sql = "
        UPDATE `widgets` SET `y` = (@counter := @counter + 1)
        WHERE `container_id` = {$containerId}
        ORDER BY `extra_order` ASC"
      ;
      $this->db->query($sql);
    }
  }


  public function installAssets()
  {
    // prepare main js-script
    $assetSrc = SCRIPT_URL_DIR_EXTERNALS . 'frontend/easypopup.js';
    $this->create_script_tag($assetSrc);

    $layouts = $this->getLayouts();
    if( !count($layouts) ) {
      $this->_createFirstPopup();
    } else {
      // prepare old popups
      $this->db->query("
        UPDATE `layouts`
        SET `enabled` = 0
        WHERE `shop_name` = '{$this->shopify_shop_name}'"
      );
    }

    // alter all theme-template
    $replacements = array(
      array("{% include 'easypopup' %}", ''),
      array("</body>", "{% include 'easypopup' %}\n</body>")
    );
    $this->alter_asset('layout/theme.liquid', $replacements);

    // prepare main snippet
    $this->_assetMainSnippet();
  }

  private function _createFirstPopup()
  {
    // create layout
    $layoutId = $this->setLayout( 0, 'Sample Subscribe Popup' );

    // create 2 containers
    $containerParams_1 = array('x' => 0, 'y' => 0, 'width' => 6, 'extra_order' => 0);
    $containerParams_2 = array('x' => 6, 'y' => 0, 'width' => 6, 'extra_order' => 6);

    $containerId_1 = $this->addContainer( $layoutId, $containerParams_1 );
    $containerId_2 = $this->addContainer( $layoutId, $containerParams_2 );

    // create 3 widgets
    $widgetParams_1_1 = array('widget_type' => 'text', 'x' => 0, 'y' => 0, 'width' => 12, 'extra_order' => 0);
    $widgetParams_1_2 = array('widget_type' => 'subscribe', 'x' => 0, 'y' => 1, 'width' => 12, 'extra_order' => 10);
    $widgetParams_2_1 = array('widget_type' => 'image', 'x' => 0, 'y' => 0, 'width' => 12, 'extra_order' => 0);

    $widgetId_1_1 = $this->addWidget( $containerId_1, $widgetParams_1_1 );
    $widgetId_1_2 = $this->addWidget( $containerId_1, $widgetParams_1_2 );
    $widgetId_2_1 = $this->addWidget( $containerId_2, $widgetParams_2_1 );

    // set widgets content
    $widgetContent_1_1 = $this->initContentParams( 'text', false );
    $widgetContent_1_1['text'] = '<p><h4>Welcome to our Store</h4></p><p>Subscribe to our popup to get our latest updates and discounts!</p>';
    $widgetContent_1_1['text_align'] = 'left';

    $widgetContent_1_2 = $this->initContentParams( 'subscribe', false );
    $widgetContent_1_2['url'] = '#';

    $widgetContent_2_1 = $this->initContentParams( 'image', false );
    $_FILES['image'] = array();
    $_FILES['image']['error'] = 0;
    $_FILES['image']['tmp_name'] = 'externals/images/no-image.png';

    $this->updateWidgetContentParams( $widgetId_1_1, $widgetContent_1_1 );
    $this->updateWidgetContentParams( $widgetId_1_2, $widgetContent_1_2 );
    $this->updateWidgetContentParams( $widgetId_2_1, $widgetContent_2_1 );
  }

  private function _assetMainSnippet()
  {
    $layouts = $this->getLayouts();

    ob_start();
      include "views/snippet_main.tpl";
    $tpl = ob_get_clean();

    $this->create_asset('snippets\/' . APP_ALIAS . '.liquid', $tpl);
  }


  private function _assetPopupSnippet( $layoutId )
  {
    $layout = $this->getLayout($layoutId);
    if( empty($layout) ) return '';

    $parentLayoutId = empty($layout['parent_layout_id']) ? $layout['layout_id'] : $layout['parent_layout_id'];
    $popup = $this->generatePopup( $parentLayoutId );

    $name = 'snippets\/' . getPopupName($parentLayoutId) . '.liquid';
    $this->create_asset($name, $popup);
  }


  public function generatePopup( $layoutId, $preview = false, $previewWidgetId = null )
  {
    $layout = $this->getLayout($layoutId);
    if( empty($layout) ) return '';

    $layoutParams = !empty($layout['params']) ? json_decode($layout['params'], true) : array();
    $allowPages = array();
    if( $layout['event'] == 'welcome' and !empty($layoutParams['welcome_pages']) ) {
      if( $layoutParams['welcome_pages'] == 'product' and !empty($layoutParams['welcome_products']) ) $allowPages = $layoutParams['welcome_products'];
      elseif( $layoutParams['welcome_pages'] == 'collection' and !empty($layoutParams['welcome_collections']) ) $allowPages = $layoutParams['welcome_collections'];
      elseif( $layoutParams['welcome_pages'] == 'blog' and !empty($layoutParams['welcome_blogs']) ) $allowPages = $layoutParams['welcome_blogs'];
    } elseif( $layout['event'] == 'exit' and !empty($layoutParams['exit_pages']) ) {
      if( $layoutParams['exit_pages'] == 'product' and !empty($layoutParams['exit_products']) ) $allowPages = $layoutParams['exit_products'];
      elseif( $layoutParams['exit_pages'] == 'collection' and !empty($layoutParams['exit_collections']) ) $allowPages = $layoutParams['exit_collections'];
      elseif( $layoutParams['exit_pages'] == 'blog' and !empty($layoutParams['exit_blogs']) ) $allowPages = $layoutParams['exit_blogs'];
    }
    $allowPages = !empty($allowPages) ? '["' . implode('","', $allowPages) . '"]' : '[]';

    $parentLayoutId = empty($layout['parent_layout_id']) ? $layout['layout_id'] : $layout['parent_layout_id'];
    $layoutsFamily = $this->getLayoutsFamily( $parentLayoutId );
    $layoutsList = array();
    $maxWidth = 12;

    foreach( $layoutsFamily as $viewType => $viewLayout ) {
      $viewLayoutId = $viewLayout['layout_id'];

      $containers = $this->getContainers($viewLayoutId);
      if( empty($containers) ) continue;

      $widgets = $this->getWidgets( $viewLayoutId );
      foreach( $widgets as $widget ) {
        $preparedWidgets[$widget['container_id']][] = $widget;
      }

      foreach( $containers as $container ) {
        $widgetsList = array();
        foreach( $preparedWidgets[$container['container_id']] as $widget ) {
          $widgetsList[$widget['y']][$widget['x']] = array(
            'widget_id' => $widget['widget_id'],
            'width' => $widget['width'],
            'type' => $widget['widget_type'],
            'cp' => (array)json_decode($widget['params'], true),
          );
        }

        $layoutsList[$viewType][$container['y']][$container['x']] = array(
          'container_id' => $container['container_id'],
          'width'   => $container['width'],
          'widgets' => $widgetsList,
        );

      }
    }

    $shop = $this->shopify_shop_name;
    ob_start();
      include "views/snippet_popup_item.tpl";
    $tpl = ob_get_clean();

    return $tpl;
  }

}}