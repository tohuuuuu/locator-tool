angular.module('app', ['ui.router']);

angular.module('app').config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('input', {
    url: '/input',
    templateUrl: 'partials/input.html',
    controllerAs: '$ctrl',
    controller: function(ltData, $state) {
      var vm = this;
      vm.getFilesForCategory = function() {
        ltData.getFilesForCategory(vm.category).then(function(files) {
          vm.titles = files && files.join('\n');
        });
      };
      vm.next = function() {
        $state.go('list', {titles: vm.titles.split('\n').join('|')});
      };
    }
  });

  $stateProvider.state('list', {
    url: '/list?titles',
    templateUrl: 'partials/list.html',
    controllerAs: '$ctrl',
    controller: function(ltData, $stateParams) {
      var vm = this;
      ltData.getCoordinates($stateParams.titles).then(function(d) {
        vm.titles = d && d.query && d.query.pages;
      });
    }
  });
});

angular.module('app').factory('ltDataAuth', function($http) {
  return {
    getUserInfo: function() {
      return $http.get('/locator-tool/user').then(function(d) {
        return d.data && d.data.user;
      });
    }
  };
});

angular.module('app').factory('ltData', function($http) {
  return {
    getCoordinates: function(titles) {
      var params = {
        prop: 'coordinates|imageinfo',
        titles: titles,
        iiprop: 'url|extmetadata',
        iiurlwidth: 1024,
        iiextmetadatafilter: 'ImageDescription'
      };
      return $query(params).then(function(d) {
        return d.data;
      });
    },
    getFilesForCategory: function(cat) {
      var params = {
        lang: 'commons',
        type: 6,
        cat: cat
      };
      return $http.get('/cats-php/', {params: params}).then(function(d) {
        return d.data.map(function(i) {
          return 'File:' + i;
        });
      });
    }
  };

  function $query(params) {
    params = angular.extend({
      action: 'query',
      format: 'json',
      callback: 'JSON_CALLBACK'
    }, params);
    return $http.jsonp('https://commons.wikimedia.org/w/api.php', {params: params});
  }
});

angular.module('app').component('ltUserInfo', {
  template: [
    '<a ng-hide="$ctrl.user" class="btn btn-default navbar-btn">Sign in</a>',
    '<p ng-show="$ctrl.user" class="navbar-text">Signed in as {{$ctrl.user}}</p>'].join(''),
  controller: function(ltDataAuth) {
    var vm = this;
    ltDataAuth.getUserInfo().then(function(user) {
      vm.user = user;
    });
  }
});
