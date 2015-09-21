'use strict';

var app = {};

app.router = {
  init: function() {
    this.handleRoute();
    window.onhashchange = this.handleRoute;
  },
  //capture hash change event
  handleRoute: function() {
    console.log(window.location.hash);
  }
}

app.router.init();
