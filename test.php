<?php
   $host        = "host = 10.237.169.202";
   $port        = "port = 5432";
   $dbname      = "dbname = test";
   $credentials = "user = postgres password=postgres";

   $db = pg_connect( "$host $port $dbname $credentials"  );
   if(!$db) {
      echo "Error : Unable to open database\n";
   } else {
      echo "Opened database successfully\n";
   }
?>
