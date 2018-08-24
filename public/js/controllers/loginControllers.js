app.controller('loginController', function($scope, $http, $route, postgresqlFactory, loginFactory){
  loginFactory.setScope($scope)
  var postgresScope = postgresqlFactory.getScope();
  $scope.time_to_expire = 0.041;

  $scope.iden = function() {
    var user= document.getElementById("user").value;
    var pass= document.getElementById("pass").value;
    var rm= document.getElementById("check");
    var userpass = user + pass;

    $scope.getAdminFromId(user, function(){
      if($scope.successRequest){
        if($scope.admin.data.length > 0) localStorage['isAdmin'] = 'true';
        else localStorage['isAdmin'] = 'false';
      }
      else{
        console.log($scope.admin);
        alert("Error on getAdminFromId request, check console logs.");
      }
    });

    $scope.getMD5(userpass, function(){
      if($scope.successRequest){
        $scope.check_login($scope.md5.data, rm);
      }
      else{
        console.log($scope.md5);
        alert("Error on getMD5, check console logs.");
      }
    });
  }

  $scope.clear_cook = function(){
    $scope.createCookie('identifiant', "", -1);
    $scope.createCookie('date', "", -1);
    window.location="#!/login"
  }

  $scope.verifco = function(){
    var login_page = document.getElementById("connexion");
    var signup_page = document.getElementById("inscription");
    var reset_passwd_page = document.getElementById("reset_passwd");
    var name = "date=";
    var cook = "";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            cook = c.substring(name.length, c.length);
        }
    }

    name = "identifiant=";
    var cookid = "";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            cookid = c.substring(name.length, c.length);
        }
    }
    if(login_page == null && signup_page == null && reset_passwd_page == null){
      if(cook == "" && cookid == ""){
        window.location="#!/login";
      }
      else{
        $scope.createCookie('date', '1', $scope.time_to_expire);
      }
    }
  }

  $scope.isLoggedOn = function(){
    var name = "date" + "=";
    var cook = "";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            cook = c.substring(name.length, c.length);
        }
    }

    name = "identifiant=";
    var cookid = "";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            cookid = c.substring(name.length, c.length);
        }
    }

    ret = false;
    if(cook != "" || cookid != "")
      ret = true;

    return ret;
  }

  $scope.check_login = function(md5, rm) {
    $scope.getIdFromMD5(md5, function(){
      if($scope.successRequest){
        if($scope.queryLogin.data.length > 0){
          if(rm.checked){
            $scope.createCookie('identifiant', md5, 31);
          }
          window.location="/";
          $scope.createCookie('date', '1', $scope.time_to_expire);
        }
        else {
          alert("Id or password incorrect");
        }
      }
      else {
        console.log($scope.queryLogin);
        alert("Error on getIdFromMD5 request, check console logs.");
      }
    });
  }

  $scope.readCookie = function() {
    var name ="date=";
    cook = "";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            cook = c.substring(name.length, c.length);
        }
    }
    alert(cook);
  }

  $scope.createCookie = function(name,value,days) {
  	if (days) {
  		var date = new Date();
  		date.setTime(date.getTime()+(days*24*60*60*1000));
  		var expires = "; expires="+date.toGMTString();
  	}
  	else var expires = "";
  	document.cookie = name+"="+value+expires+"; path=/";
  }

  $scope.getIdFromMD5 = function(md5,callback){
    $http({
      method: 'GET',
      url: '/login/getIdFromMD5?md5='+md5
    })
    .then(
      function successCallback(data) {
        $scope.successRequest = true;
        $scope.queryLogin = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.successRequest = false;
        $scope.queryLogin = data;
        if(callback) callback();
    });
  };

  $scope.addLogin = function(user,md5,email,md5NameMail,validate,callback){
    $http({
      method: 'POST',
      url: "/login/addLogin?id="+user+"&md5="+md5+"&mail="+email+"&md5NameMail="+md5NameMail+"&validate="+validate
    })
    .then(
      function successCallback(data) {
        $scope.successRequest = true;
        $scope.addLogin = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.successRequest = false;
        $scope.addLogin = data;
        if(callback) callback();
    });
  };

  $scope.getMD5 = function(up, callback){
    $http({
      method: 'GET',
      url: '/login/getTheMd5?up='+up
    })
    .then(
      function successCallback(data) {
        $scope.successRequest = true;
        $scope.md5 = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.successRequest = false;
        $scope.md5 = data;
        if(callback) callback();
    });
  };

  $scope.getIdFromMd5NameMail = function(npm, callback){
    $http({
      method: 'GET',
      url: '/login/getIdFromMd5NameMail?md5namemail='+npm
    })
    .then(
      function successCallback(data) {
        $scope.successRequest = true;
        $scope.md5NameMail = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.successRequest = false;
        $scope.md5NameMail = data;
        if(callback) callback();
    });
  };

  $scope.getAdminFromId = function(id, callback){
    $http({
      method: 'GET',
      url: '/login/getAdminFromId?id='+id
    })
    .then(
      function successCallback(data) {
        $scope.successRequest = true;
        $scope.admin = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.successRequest = false;
        $scope.admin = data;
        if(callback) callback();
    });
  };

  //Sometimes the display is not as expected due to JS async problems are databases network issues, this allows to relaod the view which is much faster than reload the all page
  $scope.reload = function(){
    $route.reload();
  };

  //Check if the logged on user is administrator
  $scope.isAdmin = function(){
    let ret = false;
    if(localStorage['isAdmin'] == 'true') ret = true;
    return ret;
  }

  $scope.wantToLog = function(even){
    if(even.originalEvent.keyCode == 13)
      $scope.iden();
  }
});

app.controller('signupController', function($scope, $http, postgresqlFactory, loginFactory){
  var postgresScope = postgresqlFactory.getScope();
  var loginScope = loginFactory.getScope();

  $scope.normalizeStr = function(str){
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(" ", "+");
  };

  $scope.checkInfo = function(){
    var user= document.getElementById("user").value;
    var pass= document.getElementById("pass").value;
    var rePass = document.getElementById("repass").value;
    var mail= document.getElementById("mail").value;

    var nom= document.getElementById("nom").value;
    var prenom= document.getElementById("prenom").value;

    var userpass = user + pass;
    var result = null;

    var nom_lien = $scope.normalizeStr(nom);
    var prenom_lien = $scope.normalizeStr(prenom);
    var mail_lien = mail.replace("@", "%40");
    var param = [user, pass, mail, nom, prenom];

    var lien = "http://annuaire.sso.infra.ftgroup/persons?searchType=PERSON_COMPLEX&personCriteriaN="+nom_lien+"&personCriteriaP="+prenom_lien+"&personCriteriaM="+mail_lien;

    if(pass === rePass){
      if($scope.areCorrectParam(param)){
        $scope.getAnnuaire(lien, function(){
          if($scope.successRequest){
            if($scope.annuaire.data.includes("Aucun résultat trouvé. Relancer la requête sur des critères différents"))
              alert("You cannot register with the giving information, please try again or contact your administrator.");
            else if($scope.annuaire.data.includes("Profil de")){
              loginScope.getMD5(nom+prenom+mail, function(){
                if(loginScope.successRequest){
                  var md5NameMail = loginScope.md5.data;
                  loginScope.getIdFromMd5NameMail(loginScope.md5.data, function(){
                    if(loginScope.successRequest){
                      if(loginScope.md5NameMail.data != "" || (loginScope.md5NameMail.data.length != null && loginScope.md5NameMail.data.length > 0))
                        alert("An account already exists for this person.")
                      else{
                        loginScope.getMD5(user+pass, function(){
                          if(loginScope.successRequest){
                            loginScope.addLogin(user,loginScope.md5.data, mail, md5NameMail, true/*false*/, function(){
                              if(loginScope.successRequest){
                                //alert("An email was sent to "+mail+" to confirm your registration.");
                                alert("You have been registered.")
                                window.location = "#!/login";
                              }
                              else{
                                console.log(loginScope.addLogin);
                                alert("Error on addLogin request, check console logs.");
                              }
                            });
                          }
                          else{
                            console.log(loginScope.md5);
                            alert("Error on getMD5 request, check console logs.");
                          }
                        });
                      }
                    }
                    else{
                      console.log(loginScope.md5NameMail);
                      alert("Error on getIdFromMd5NameMail request, check console logs.");
                    }
                  });
                }
                else{
                  console.log(loginScope.md5);
                  alert("Error on getMD5 request, check console logs.");
                }
              });
            }
            else
              console.log("Unhandle");
          }
          else{
            console.log($scope.annuaire);
            alert("Error on getAnnuaire request, check console logs.");
          }
        });
      }
      else{
        alert("Invalid parameters, try again.")
      }
    }
    else
      alert("The 2 passwords don't match.");
  }

  $scope.getAnnuaire = function(lien, callback){
      $http({
        method: 'GET',
        url: '/web/getAnnuaire?lien='+lien
      })
      .then(
        function successCallback(data) {
          $scope.successRequest = true;
          $scope.annuaire = data;
          if(callback) callback();
        },
        function errorCallback(data) {
          $scope.successRequest = false;
          $scope.annuaire = data;
          if(callback) callback();
      });
    }

  $scope.areCorrectParam = function(params){
    var ret = true;
    for(let i=0; i<params.length; i++){
      if(params[i] == "" || containsForbiddenChar(params[i])){
        ret = false;
        break;
      }
    }
    return ret;
  };
});

app.controller('resetController', function($scope, $http){

  $scope.verif = function() {

    var user= document.getElementById("user").value;
    var mail= document.getElementById("mail").value;

    $scope.verifuser = function(user, mail, callback){
      $http({
        method: 'GET',
        url: '/login/verifuser?user='+user+'&mail='+mail
      })
      .then(
        function successCallback(data) {
          $scope.successRequest = true;
          $scope.queryLogin = data;
          if(callback) callback();
        },
        function errorCallback(data) {
          $scope.successRequest = false;
          $scope.queryLogin = data;
          if(callback) callback();
      });
    };



    $scope.getuser(userpass, function(){
      if($scope.successRequest){
        $scope.check_user(user, mail);
      }
      else{
        console.log($scope.md5);
        alert("Error on getMD5, check console logs.");
      }
    });
  }

  $scope.check_user = function(user, mail) {
    $scope.verifuser(user, mail, function(){
      if($scope.successRequest){
        if($scope.queryLogin.data.length > 0){
          console.log("ok");
        }
        else {
          alert("Id or password incorrect");
        }
      }
      else {
        console.log($scope.queryLogin);
        alert("Error on getIdFromMD5 request, check console logs.");
      }
    });
  }
});
