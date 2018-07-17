<!doctype html>
<html lang="en" ng-app="DBEditorAPF">
<head>
  <meta charset="utf-8">
  <title></title>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <meta name="HandheldFriendly" content="true">
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="js/vakata-jstree-0097fab/dist/themes/default/style.min.css">
  <link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
  <script src="node_modules/jquery/dist/jquery.min.js"></script>
  <script src="node_modules/angular/angular.min.js"></script>
  <script src="node_modules/angular-route/angular-route.min.js"></script>
  <script src="js/vakata-jstree-0097fab/dist/jstree.min.js"></script>
  <script src="node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
  <script src="js/script.js"></script>
  <script src="js/id.js"></script>
  <script>
    function sqlfun(){
      var x= '<?php ex(); ?>';
      alert("uhu");
    }
  </script>

  <?php
    function ex(){
      $host        = "host = 10.237.169.202";
      $port        = "port = 5432";
      $dbname      = "";
      $credentials = "user = postgres password=postgres";

      $db = pg_connect( "$host $port $dbname $credentials"  );
      if(!$db) {
         echo "Error : Unable to open database\n";
      } else {
         echo "Opened database successfully\n";
      }
    }
  ?>

</head>
<body ng-controller="postgresqlController" onload="verif_cook()">
  <header class="container">
    <a href="/"><img src="/css/img/logo_DBE.png" /></a>
    <a target="_blank" href="https://www.orange-business.com"><img src="/css/img/logo.png" class="topRight" /></a>
  </header>
  <div id = "connexion">
    <center>
    	<form>
    		<p class="petit_titre">Inscription</p>
    		<p>Nom d'utilisateur</p>
    		<input type="text" name="var1" required id="user" />
    		<br/><p>Adresse Email</p>
        <input type="email" name="var2" required id="mail"/>
        <br/><p>Mot de passe</p>
    		<input type="password" name="var3" required id="pass"/>
    		<br/><input type="button" value="Créer un compte" onclick="sqlfun()"/>
  	  </form>
    </center>
  </div>
</body>
</html>
