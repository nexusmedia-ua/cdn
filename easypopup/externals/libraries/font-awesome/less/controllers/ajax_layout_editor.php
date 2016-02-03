<?php

$action    = !empty($_POST['action']) ? $_POST['action'] : '';
$contentId = !empty($_POST['content_id']) ? (int)$_POST['content_id'] : 0;

$error = '';
$data = array();

if( empty($ajax) or empty($action) ) {
  $error = 'Wrong request';

} elseif( $action == 'create_container' ) {
  $layoutId = $contentId;
  if( !empty($layoutId) and $helper->checkLayoutPermission($layoutId) ) {
    $cp = !empty($_POST['container_params']) ? $_POST['container_params'] : array();
    $containerId = $helper->addContainer($layoutId, $cp);

    if( $containerId ) {
      $data['id'] = $containerId;
      $data['name'] = 'column_' . $containerId;
    } else {
      $error = 'Create column error';
    }
  }

} elseif( $action == 'save_containers' ) {
  $layoutId = $contentId;
  $cpList = !empty($_POST['data']) ? (array)$_POST['data'] : array();
  if( !empty($cpList) and !empty($layoutId) and $helper->checkLayoutPermission($layoutId) ) {
    $helper->updateContainersParams($layoutId, $cpList);
  }

} elseif( $action == 'delete_container' ) {
  $containerId = $contentId;
  if( !empty($containerId) and $helper->checkContainerPermission($containerId) ) {
    $container = $helper->getContainer($containerId);
    $layoutId = $container['layout_id'];

    $helper->removeContainer($containerId);
  } else {
    $error = 'You have not permission to delete this column';
  }

} elseif( $action == 'create_widget' ) {
  $containerId = $contentId;
  if( !empty($containerId) and $helper->checkContainerPermission($containerId) ) {
    $wp = !empty($_POST['widget_params']) ? $_POST['widget_params'] : array();
    $widgetId = $helper->addWidget($containerId, $wp);
    if( $widgetId ) {
      $data['id'] = $widgetId;
      $data['name'] = 'widget_' . $widgetId;

      $widget = $helper->getWidget($widgetId);
      $layoutId = $widget['layout_id'];
    } else {
      $error = 'Create widget error';
    }
  }

} elseif( $action == 'save_widgets' ) {
  $containerId = $contentId;
  $wpList = !empty($_POST['data']) ? (array)$_POST['data'] : array();
  if( !empty($wpList) and !empty($containerId) and $helper->checkContainerPermission($containerId) ) {
    $helper->updateWidgetsParams($containerId, $wpList);

    $container = $helper->getContainer($containerId);
    $layoutId = $container['layout_id'];
  }

} elseif( $action == 'save_widget_content' ) {
  $widgetId = $contentId;
  $cp = getFormData('widget_setting_');
  if( !empty($widgetId) and $helper->checkWidgetPermission($widgetId) ) {
    $error = $helper->widgetContentValidate($widgetId, $cp);
    if( empty($error) ) {
      $helper->updateWidgetContentParams($widgetId, $cp);

      $widget = $helper->getWidget($widgetId);
      $layoutId = $widget['layout_id'];
    }
  }

} elseif( $action == 'delete_widget' ) {
  $widgetId = $contentId;
  if( !empty($widgetId) and $helper->checkWidgetPermission($widgetId) ) {
    $widget = $helper->getWidget($widgetId);
    $layoutId = $widget['layout_id'];

    $helper->removeWidget($widgetId);
  } else {
    $error = 'You have not permission to delete this widget';
  }
}

$result = array(
  'error' => $error,
  'data' => $data,
  'preview' => (empty($error) and !empty($layoutId)) ? $helper->generatePopup($layoutId, 1) : '',
);

echo json_encode($result, JSON_UNESCAPED_UNICODE);
die();