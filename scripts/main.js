'use strict';

var router = {
  _init: function() {
    this._registerRoutes();
    this._handleRoute();
    window.onhashchange = this._handleRoute.bind(this);
  },
  _registerRoutes: function() {
    this._routes = [];
    for (var key in this.routes) {
      var keyRegEx = key.replace(/:(\w+)/g, '(\\S*)');
    this._routes.push({keyRegEx: keyRegEx, key: key});
    }
  },
  _handleRoute: function() {
    var cleanHash = this._stripHash(window.location.hash);
    var hashMatch = this._matchRoutes(cleanHash);
    var fnIndex = this.routes[hashMatch['key']];
    var argsArray = [];
    if (hashMatch['args']) {
      argsArray = hashMatch['args'].slice(1);
    }
    this[fnIndex].apply(this, argsArray);
  },
  _stripHash: function(hash) {
    if (hash.match('\#')) {
      return hash.slice(1);
    } else {
      return hash;
    }
  },
  _matchRoutes: function(hash) {
    if (hash) {
      for (var i = 0; i < this._routes.length; i++) {
        if (this._routes[i]['keyRegEx'] && hash.match(this._routes[i]['keyRegEx'])) {
          return {
            key: this._routes[i]['key'],
            args: hash.match(this._routes[i]['keyRegEx'])
          };
        }
      }
    } else {
      return {key: ''};
    }
  },
  routes: {
    '': 'home',
    'colors/:color': 'color'
  },
  home: function() {
    document.body.style.backgroundColor = 'snow';
  },
  color: function(color) {
    document.body.style.backgroundColor = color;
  }
}

router._init();
