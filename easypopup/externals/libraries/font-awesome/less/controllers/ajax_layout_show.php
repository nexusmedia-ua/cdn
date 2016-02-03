<?php

if( empty($ajax) ) die();

$layoutId = !empty($_POST['layout_id']) ? (int)$_POST['layout_id'] : 0;
$preview  = !empty($_POST['preview']) ? true : false;

if( !empty($layoutId) and $helper->checkLayoutPermission($layoutId)  ) {
  echo $helper->generatePopup($layoutId, $preview);
}
die();