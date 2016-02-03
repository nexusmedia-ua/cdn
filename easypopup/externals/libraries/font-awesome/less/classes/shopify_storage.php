<?php

if( !class_exists("ShopifyStorage") ) {
class ShopifyStorage {
  private $data;
  private $shop_data;

  public function __construct($db, $shopify_shop_name)
  {
    $this->db = $db;
    $this->shop_data = ShopifyHelper::get_shop_info_by_name($shopify_shop_name, $db);
    $this->data = unserialize($this->db->get_one("SELECT `shop_data` FROM `shop_values` WHERE shop_id = ".$this->shop_data['id']));
  }

  public function get($key, $default = null)
  {
    return isset($this->data[$key]) ? $this->data[$key] : $default;
  }

  public function set($key, $value)
  {
    $this->data[$key] = $value;
    $this->db->query("REPLACE INTO `shop_values` SET `shop_data` = '".serialize($this->data)."', `shop_id` = ".$this->shop_data['id']);
  }
}}