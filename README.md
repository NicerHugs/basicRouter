# A super simple router

## What is a router?
Routers, in the JavaScript world, exist to allow single page applications (SPAs) to take advantage of this cool thing about the internet called URLs. You've probably heard of them... they are pretty much internet's coolest feature; they allow us to link to, bookmark, and share specific locations on the web with any other user and any web browser in the world - they are what make the internet the internet. But SPAs pose a particular problem for this cool feature - namely that they are _single_ pages... We load a single set of static resources, thus a single _location_, and then use JavaScript to do all the cool stuff within our application. This gives the user the impression that they are navigating through locations when in fact, according to their browser they haven't moved at all.

### Application state
So  If the "locations" we navigate through on a SPA are not locations, what are they? And if we are only ever on one single page, how can we use that cool feature of the internet to bookmark, share, or link to some particular pseudo-location? This brings us to the concept of _application state_. Application state is what an application knows about what it is doing. What components/views should it display? What data populates those components/views? Are menus expanded, closed? Is a user logged in/authenticated? Has the user requested an action, and has it completed? The answer to these questions comprise application state.

One great feature of writing web-apps is that we can take advantage of that cool internet feature (the URL) to keep track of application state. We can choose how much detail about our application state we want to track, and make that state sharable by storing it publicly in the browser location bar, in the form of a URL. The router in a JavaScript application allows us to do just this. We store 'pseudo-locations' (not new pages locations that are returned from our server) in our browser history, keeping track of application state, making it sharable and navigable by our end users. Because we use a router to track our application state, we typically call these states 'routes'.

## Building a Basic Router
So what does a router actually have to do? I've broken down basic router into the following steps:
* [Capture a Route](#capture-routes)
* [Capture changes in route](#capture-changes)
* [Process route fragments](#process-fragments)
* [Register known routes](#register-routes)
* [Map routes to behaviors](#map-routes)
* [Get Fancy (dynamic routing)](#add-dynamic-routes)

### <a name="capture-routes"></a>Capture a Route
First we need to be able to figure out what route, or application state, the user is trying to access. We can do this by monitoring the URL of our application via the HTML5 window.location api.
```
// index.html

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title></title>
  </head>
  <body>
    <nav>
      <a href="#">Home</a>
      <a href="#colors/pink">pink</a>
      <a href="#colors/red">red</a>
      <a href="#colors/blue">blue</a>
    </nav>
    <script type="text/javascript" src="main.js">
  </body>
</html>
```
```
// main.js

var router = {
  _handleRoute: function() {
    alert(window.location);
  }
}

router._handleRoute();

```

`window.location` returns the current browser location as a string. When you open the index.html file in your browser, you should see an alert telling you the current location. You'll notice that you do not see an alert as you navigate through the links on the page unless you refresh the browser window (although you will see the browser location bar update appropriately). This brings us to step 2:

### <a name="capture-changes">Capture changes in routes
Not only do we care about what route the user navigated to when they first opened our application, but we also want to know when and to where the user is navigating. We update our main.js file:

```
var router = {
  _init: function() {
    this._handleRoute();
    window.onhashchange = this._handleRoute.bind(this);
  },
  _handleRoute: function() {
    alert(window.location.hash);
  }
}

router._init();

```

We've added an `_init` function, that registers an event handler with the browser. The window.onhashchange will be fired every time the fragment identifier (aka anything that follows the # symbol) of the URL changes. Because we are only listening for changes in the URL that occur after the hash, we have also changed our `_handleRoute` function to alert only the `window.location.hash`. Now, instead of the full browser location, we are only alerting the # and anything that follows it.

The 'fragment identifier' exists to allow client side state management; changes in the fragment identifier do not trigger a new resource request from the browser. In fact, unless you explicitly tell your app to somehow handle the fragment identifiers, they will be all but ignored by your browser and app. The only thing they will do on their own is trigger a hashChange event.

### <a name="process-fragments">Process route fragments
For now, our router is extremely basic, and our app is also incredibly simple. If you're astute, tho, you've noticed that when we navigate 'Home', the alert is blank. Other alerts look something like `#colors/pink`. To our browser, a # with nothing following it is the same as no hash at all, and it correctly identifies that there is no fragment identifier, and therefore `window.location.hash` returns an empty string. But this means our behavior is inconsistent - sometimes we are returned with a hash symbol, and sometimes we are not. Since we need to use these fragment identifiers to map to application state behavior, we should whip them into a consistent format. We change our router's `_handleRoute` function and add a `_stripHash` function:

```
  _handleRoute: function() {
    var cleanHash = this._stripHash(window.location.hash);
    alert(cleanHash);
  },
  _stripHash: function(hash) {
    if (hash.match('\#')) {
      return hash.slice(1);
    } else {
      return hash;
    }
  }

```

We will do more hash processing in the future, but for now, this is a good start.

### <a name="store-behaviors">Register known routes
Every router will have its own method for registering routes. Basically, we need to know what application states our app cares about. We will keep track of our available routes in a simple `routes` object on our router, pretty much exactly the way it is done in Backbone. We add a routes hash to our router object:

```
routes: {
  '': 'home',
  'colors/red': 'red',
  'colors/blue': 'blue',
  'colors/pink': 'pink',
}
```

### <a name="map-routes">Map routes to behaviors
How your router handles state change management will depend on the rest of your application architecture. A flux based app would probably send word to the dispatcher that an important event has occurred. An Ember app has `Route` objects which are mapped (internally) to hash locations and handle logic and template rendering for a given state. Since our app is very basic, we'll re-create the Backbone model, which is to map each route to a function directly in the router. Add the following to the router object:

```
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
}

```

and update the `_handleRoute` function as follows: 
```
_handleRoute: function() {
  var cleanHash = this._stripHash(window.location.hash);
  var fnIndex = this.routes[cleanHash];
  this[fnIndex]();
}

```

### <a name="add-dynamic-routes">Get Fancy (dynamic routes)
Notice that we are repeating behavior with our color routes
update our process fragments fn to look for dynamic segments and handle them appropriately
