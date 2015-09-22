'use strict';

var router = {
  _init: function() {
    this._handleRoute();
    window.onhashchange = this._handleRoute.bind(this);
  },
  _handleRoute: function() {
    var cleanHash = this._stripHash(window.location.hash);
    var fnIndex = this.routes[cleanHash];
    this[fnIndex]();
  },
  _stripHash: function(hash) {
    if (hash.match('\#')) {
      return hash.slice(1);
    } else {
      return hash;
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
