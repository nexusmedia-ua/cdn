<?php

if (!class_exists("Database")) {
class Database {

  private $server;
  private $login;
  private $password;
  private $db;
  private $mysqli;
  public  $connect_errno;
  public  $error;

  public function __construct($server, $login, $password, $db) {
    $this->server = $server;
    $this->login = $login;
    $this->password = $password;
    $this->db = $db;

    if (!$this->db_connect()) die("MySQL connection error: ".$this->connect_errno);
  }

  public function __destruct() {
    $this->mysqli->close();
  }

  public function db_connect() {
    $this->mysqli = new mysqli($this->server, $this->login, $this->password, $this->db);
    if ($this->mysqli->connect_errno) {
        $this->connect_errno = $this->mysqli->connect_errno;
        return false;
    }
    $this->mysqli->query("SET NAMES `utf8`");
    $this->mysqli->query("DEFAULT CHARACTER SET `utf8`");
    $this->mysqli->query("DEFAULT COLLATE `utf8_general_ci`");
    return true;
  }

  public function query($query) {
    $res = $this->mysqli->query($query);
    $this->error = $this->mysqli->error;
    if( !empty($this->error) ) {
      debugLog($this->error, 'db');
    }
    return $res;
  }

  public function get_one($query) {
    if ($res = $this->query($query)) {
      $result = $res->fetch_array();
      $res->free();
      return $result[0];
    } else {
      return false;
    }
  }

  public function get_row($query) {
    if ($res = $this->query($query)) {
      $result = $res->fetch_assoc();
      $res->free();
      return $result;
    } else {
      return false;
    }
  }

  public function get_col($query) {
    if ($res = $this->query($query)) {

      $all = array();
      while ($row = $res->fetch_array()) {
        if ($row) $all[] = $row[0];
      }

      $res->free();
      return $all;
    } else {
      return false;
    }
  }

  public function get_all($query) {
    if ($res = $this->query($query)) {

    $all = array();
    while ($row = $res->fetch_assoc()) {
          if ($row) $all[] = $row;
      }

      $res->free();
      return $all;
    } else {
      return false;
    }
  }

  function last_insert() {
    return $this->mysqli->insert_id;
  }

  function real_escape_string($string) {
    return $this->mysqli->real_escape_string($string);
  }
}}