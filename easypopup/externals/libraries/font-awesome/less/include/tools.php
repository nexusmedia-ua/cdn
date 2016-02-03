<?php

function redirect($url, $top = false)
{
  if( !$top ) {
    if( !headers_sent() ) {
      header('Location: ' . $url);
    } else {
      echo '<meta http-equiv="refresh" content="0; url=' . $url . '">';
    }
  } else {
    echo "<script type='text/javascript'>
      window.top.location.href = '{$url}';
    </script>";
  }
  die();
}

function debugLog($text, $type = 'main', $rewrite = false)
{
  if( !DEBUG_MODE ) return;
  $path = str_replace("include", "temporary/log/{$type}.log", __DIR__);

  if( !is_string($text) ) $text = 'Invalid text param.';
  $text = date("Y-m-d H:i:s") . " - " . $text . "\n";

  $level = error_reporting(0);

  if( !$rewrite ) file_put_contents($path, $text, FILE_APPEND);
  else file_put_contents($path, $text);

  error_reporting($level);
}

function getWidthClassName($width)
{
  switch($width) {
    case 1  : $name = 'one-twelfth';    break;
    case 2  : $name = 'two-twelfths';   break;
    case 3  : $name = 'three-twelfths'; break;
    case 4  : $name = 'four-twelfths';  break;
    case 5  : $name = 'five-twelfths';  break;
    case 6  : $name = 'six-twelfths';   break;
    case 7  : $name = 'seven-twelfths'; break;
    case 8  : $name = 'eight-twelfths'; break;
    case 9  : $name = 'nine-twelfths';  break;
    case 10 : $name = 'ten-twelfths';   break;
    case 11 : $name = 'eleven-twelfths';break;
    default : $name = 'full';
  }
  return $name;
}

function getPopupName($layoutId)
{
  return APP_ALIAS . '_popup_' . $layoutId;
}

function getFormData($prefix)
{
  $result = array();
  $prefixLength = strlen($prefix);

  foreach( $_POST as $key => $value ) {
    if( $key != $prefix and substr($key, 0, $prefixLength) == $prefix ) {
      $result[substr($key, $prefixLength)] = $value;
    }
  }

  return $result;
}

function prepareVideoParams($url)
{
  $result = array(
    'type' => '',
    'code' => '',
  );

  if( strpos($url, 'youtube.com') !== false ) {
    $pathinfo = pathinfo($url);
    $result['type'] = 'youtube';
    $result['code'] = $pathinfo['basename'];

    $url = preg_replace("/#!/", "?", $url);
    $urlArr = parse_url($url);

    parse_str($urlArr["query"], $params);
    if( isset($params['v']) and !$params['v'] == '' ) {
      $result['code'] = $params['v'];
    };

  } elseif( strpos($url, 'vimeo.com') !== false ) {
    $result['type'] = 'vimeo';
    try {
      $vimeoJSON = file_get_contents('https://vimeo.com/api/oembed.json?url=' . $url);
      if( !empty($vimeoJSON) ) {
        $vimeo = json_decode($vimeoJSON, true);
        if( !empty($vimeo["video_id"]) ) $result['code'] = $vimeo["video_id"];
      }
    } catch (Exception $e) {}
  }

  return $result;
}


function getBrowser()
{
  $u_agent  = $_SERVER['HTTP_USER_AGENT'];
  $bname    = 'Unknown';
  $platform = 'Unknown';
  $version  = "";

  //First get the platform?
  if( preg_match('/linux/i', $u_agent) ) {
    $platform = 'linux';
  } elseif( preg_match('/macintosh|mac os x/i', $u_agent) ) {
    $platform = 'mac';
  } elseif( preg_match('/windows|win32/i', $u_agent) ) {
    $platform = 'windows';
  }

  // Next get the name of the useragent yes seperately and for good reason
  if( preg_match('/MSIE/i',$u_agent) and !preg_match('/Opera/i',$u_agent) ) {
    $bname = 'Internet Explorer';
    $ub = "MSIE";
  } elseif( preg_match('/Firefox/i',$u_agent) ) {
    $bname = 'Mozilla Firefox';
    $ub = "Firefox";
  } elseif( preg_match('/Chrome/i',$u_agent) ) {
    $bname = 'Google Chrome';
    $ub = "Chrome";
  } elseif( preg_match('/Safari/i',$u_agent) ) {
    $bname = 'Apple Safari';
    $ub = "Safari";
  } elseif( preg_match('/Opera/i',$u_agent) ) {
    $bname = 'Opera';
    $ub = "Opera";
  } elseif( preg_match('/Netscape/i',$u_agent) ) {
    $bname = 'Netscape';
    $ub = "Netscape";
  }

  // finally get the correct version number
  $known = array('Version', $ub, 'other');
  $pattern = '#(?<browser>' . join('|', $known) . ')[/ ]+(?<version>[0-9.|a-zA-Z.]*)#';

  if( !preg_match_all($pattern, $u_agent, $matches) ) {
    // we have no matching number just continue
  }

  // see how many we have
  $i = count($matches['browser']);
  if( $i != 1 ) {
    //we will have two since we are not using 'other' argument yet
    //see if version is before or after the name
    if( strripos($u_agent,"Version") < strripos($u_agent,$ub) ) {
      $version = $matches['version'][0];
    } else {
      $version = $matches['version'][1];
    }
  } else {
    $version= $matches['version'][0];
  }

  // check if we have a number
  if( $version == null or $version == "" ) $version = "?";

  return $ub;
  return array(
    'userAgent' => $u_agent,
    'name'      => $bname,
    'version'   => $version,
    'platform'  => $platform,
    'pattern'    => $pattern
  );
}
