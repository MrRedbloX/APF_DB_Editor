app.controller('mainProvidersController', function($scope){
  $scope.checkProvider = function(){
    console.log(((window.location.href.split('?')[1]).split('&')[0]).split('=')[1]);

  };
});
