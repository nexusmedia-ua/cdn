<?php

$layoutId = !empty($_POST['layout_id']) ? $_POST['layout_id'] : ( !empty($_GET['layout_id'])  ? $_GET['layout_id']  :  0 );
if( empty($layoutId) or !$helper->checkLayoutPermission($layoutId) ) redirect( SCRIPT_URL );

$layout = $helper->getLayout($layoutId);
$parentLayoutId = empty($layout['parent_layout_id']) ? $layout['layout_id'] : $layout['parent_layout_id'];

$layoutsFamily = $helper->getLayoutsFamily( $parentLayoutId );
$containers    = $helper->getContainers( $layoutId );
$widgets       = $helper->getWidgets( $layoutId );

$containersParams  = array();
$widgetsParams     = array();
$minWidth          = ($layout['view_type'] != 'mobile') ? 1 : 12;

// containers prepare
foreach( $containers as $container ) {
  $cp = array(
    'x' => $container['x'],
    'y' => $container['y'],
    'width' => $container['width'],
    'height' => 1,
    'min_width' => $minWidth,
    'max_width' => 12,
    'max_height' => 1,
    'min_height' => 1,
    'content_id' => $container['container_id'],
    'content_name' => 'column_' . $container['container_id'],
    'content_type' => 'column',
  );
  $containersParams[] = $cp;
  $widgetsParams[$container['container_id']] = array();
}

// widgets prepare
foreach( $widgets as $widget ) {
  $wp = array(
    'x' => $widget['x'],
    'y' => $widget['y'],
    'width' => $widget['width'],
    'height' => 1,
    'min_width' => $minWidth,
    'max_width' => 12,
    'max_height' => 1,
    'min_height' => 1,
    'content_id' => $widget['widget_id'],
    'content_name' => 'widget_' . $widget['widget_id'],
    'content_type' => $widget['widget_type'],
  );
  if( isset($widgetsParams[$widget['container_id']]) ) {
    $widgetsParams[$widget['container_id']][] = $wp;
  }
}

$containersParams = json_encode( $containersParams, JSON_UNESCAPED_UNICODE);
$widgetsParams = json_encode( $widgetsParams, JSON_UNESCAPED_UNICODE);

include "views/layout_editor.tpl";