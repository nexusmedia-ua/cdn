<?php

$action   = !empty($_POST['action']) ? $_POST['action'] : '';
$layoutId = !empty($_POST['layout_id']) ? (int)$_POST['layout_id'] : 0;
$error = '';
$data = '';

if( !empty($ajax) and !empty($action) ) {
  if( $action == 'save' ) {
    $params = getFormData('layout_setting_');

    $title = !empty($params['title']) ? $params['title'] : '';
    if( empty($title) ) {
      $error = 'Title is a required field';
    } else {
      $enabled = !empty($params['enabled']);
      $event   = !empty($params['event']) ? $params['event'] : '';

      if( $event == 'click' and empty($params['click_link']) ) {
        $error = 'Attached link ID is a required field';
      } else {
        $layoutId = $helper->setLayout($layoutId, $title, $enabled, $event, $params);
        $data['id'] = $layoutId;
        $data['title'] = $title;
        $data['status'] = !empty($params['enabled']) ? 1 : 0;
      }
    }

  } elseif( !empty($layoutId) and $helper->checkLayoutPermission($layoutId)  ) {
    if( $action == 'duplicate' ) {
      $helper->duplicateLayout($layoutId);
    } elseif( $action == 'delete' ) {
      $helper->removeLayout($layoutId);
    }
  } else {
    $error = 'Invalid request';
  }
}

$result = array(
  'error' => $error,
  'data' => $data,
);

echo json_encode($result, JSON_UNESCAPED_UNICODE);
die();