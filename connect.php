<?php
  $conf=pg_connect("host=10.237.169.202 dbname=test user=postgres password=postgres port=5432"):
  if($conf){
    echo "success";
  }
?>
