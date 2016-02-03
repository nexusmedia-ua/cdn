<?php

$id   = !empty($_POST['id']) ? (int)$_POST['id'] : 0;
$type = !empty($_POST['type'])  ? $_POST['type'] : '';

if( $type == 'layout' ) {
  if( $id ) {
    $layout = $helper->getLayout($id);
    $p = !empty($layout['params']) ? json_decode($layout['params'], true) : array();
  } else {
    $p = array(
      'main_width'         => POPUP_MAIN_WIDTH,
      'tablet_width'       => POPUP_TABLET_WIDTH,
      'close_button_color' => POPUP_CLOSE_BTN_COLOR,
      'background_color'   => POPUP_BG_COLOR,
      'background_style'   => POPUP_BG_STYLE,
    );
  }

  $blogs = $helper->getBlogs();
  $collections = $helper->getCollections();

} else {
  if( empty($id) or !$helper->checkWidgetPermission($id) ) die();

  $widget = $helper->getWidget($id);
  $cp = !empty($widget) ? json_decode($widget['params'], true) : array();

  $previewWidgetObject = $helper->generatePopup($widget['layout_id'], true, $id);
}

switch ( $type ) {
  case 'text'     : include "views/forms/form_text.tpl"; break;
  case 'html'     : include "views/forms/form_html.tpl"; break;
  case 'image'    : include "views/forms/form_image.tpl"; break;
  case 'social'   : include "views/forms/form_social.tpl"; break;
  case 'share'    : include "views/forms/form_share.tpl"; break;
  case 'button'   : include "views/forms/form_button.tpl"; break;
  case 'video'    : include "views/forms/form_video.tpl"; break;
  case 'subscribe': include "views/forms/form_subscribe.tpl"; break;

  case 'layout' : include "views/forms/form_layout.tpl"; break;
}

die();