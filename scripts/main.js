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
    red: 'red',
    blue: 'blue',
    pink: 'pink',
  },
  home: function() {
    document.body.style.backgroundColor = 'snow';
  },
  red: function() {
    document.body.style.backgroundColor = 'crimson';
  },
  blue: function() {
    document.body.style.backgroundColor = 'dodgerblue';
  },
  pink: function() {
    document.body.style.backgroundColor = 'hotpink';
  },
}

router._init();
