# A super simple router

## What is a router?
Routers, in the JavaScript world, exist to allow single page applications (SPAs) to take advantage of this cool thing about the internet called URLs. You've probably heard of them... they are pretty much internet's coolest feature; they allow us to link to, bookmark, and share specific locations on the web with any other user and any web browser in the world - they are what make the internet the internet. But SPAs pose a particular problem for this cool feature - namely that they are _single_ pages... We load a single set of static resources, thus a single _location_, and then use JavaScript to do all the cool stuff within our application. This gives the user the impression that they are navigating through locations when in fact, according to their browser they haven't moved at all.

### Application state
So  If the "locations" we navigate through on a SPA are not locations, what are they? And if we are only ever on one single page, how can we use that cool feature of the internet to bookmark, share, or link to some particular pseudo-location? This brings us to the concept of _application state_. Application state is what an application knows about what it is doing. What components/views should it display? What data populates those components/views? Are menus expanded, closed? Is a user logged in/authenticated? Has the user requested an action, and has it completed? The answer to these questions comprise application state.

One great feature of writing web-apps is that we can take advantage of that cool internet feature (the URL) to keep track of application state. We can choose how much detail about our application state we want to track, and make that state sharable by storing it publicly in the browser location bar, in the form of a URL. The router in a JavaScript application allows us to do just this. We store 'pseudo-locations' (not new pages locations that are returned from our server) in our browser history, keeping track of application state, making it sharable and navigable by our end users. Because we use a router to track our application state, we typically call these states 'routes'.

## Building a Basic Router
So what does a router actually have to do? I've broken down basic router into the following steps:
* [Capture changes in route](#capture-changes)
* [Process route fragments](#process-fragments)
* [Register known routes](#register-routes)
* [Map routes to behaviors](#map-routes)
* [Get Fancy (dynamic routing)](#add-dynamic-routes)

### <a name="capture-changes">Capture changes in routes
First we need to be able to figure out what route, or application state, the user is trying to access. We can do this by monitoring the URL of our application via the HTML5 window.location api. Not only do we care about what route the user navigated to when they first opened our application, but we also want to know when and to where the user is navigating.

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

window.onhashchange = function() {
  alert(window.location.hash);
}

```

The window.onhashchange is an event listener that will be fired every time the 'fragment identifier' (aka anything that follows the # symbol) of the URL changes. `window.location.hash` returns the current browser 'fragment identifier', allowing us to get a handle on the current browser 'location'.

The 'fragment identifier' exists to allow client side state management; changes in the fragment identifier do not trigger a new resource request from the browser. In fact, unless you explicitly tell your app to somehow handle the fragment identifiers, they will be all but ignored by your browser and app. The only thing they will do on their own is trigger a hashChange event. When you open the index.html file in your browser, you should see an alert telling you the current location, and as you click the links on the page you will see not only the alert but also that the browser location bar updates appropriately.

### <a name="process-fragments">Process route fragments
Right now, we don't really have a router, just a simple event handler that captures and alerts pseudo locations. If you're astute, tho, you've noticed that when we navigate 'Home', the alert is blank. Other alerts look something like `#colors/pink`. To our browser, a # with nothing following it is the same as no hash at all, and it correctly identifies that there is no fragment identifier, and therefore `window.location.hash` returns an empty string. But this means our behavior is inconsistent - sometimes we are returned with a hash symbol, and sometimes we are not. Since we need to use these fragment identifiers to map to application state behavior, we should whip them into a consistent format. And since we're going to be doing more than one simple little event listener, let's start giving our code some structure:

```
// main.js

var router = {
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
  _init: function() {
    this._handleRoute();
    window.onhashchange = this._handleRoute.bind(this);
  }
}

router._init();

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

This syntax may look a little funny, mostly because the keys, or property names, within the `routes` object are strings. Turns out you can always make your objects like this, and it allows you to avoid name conflicts such as having an empty string as a key, or including the backslash symbol, things that would ordinarily be illegal but make matching hash names much easier. The only caveat is that now we must access these properties with the square bracket syntax, because `this.routes.colors/pink` will throw an error, while `this.routes['colors/pink']` will work just fine. And why are we mapping the hash strings to other strings? Great question! Read on:

### <a name="map-routes">Map routes to behaviors
How your router handles state change management will depend on the rest of your application architecture. A flux based app would probably send word to the dispatcher that a route change event has occurred. An Ember app has a `Route` class and module lookup which maps handles logic and template rendering for a given state based on file names. We are emulating the Backbone version of routing, where each route in our routes hash maps to a method on the router. Add the following methods to the router object:

```
home: function() {
  document.body.style.backgroundColor = 'snow';
},
red: function() {
  document.body.style.backgroundColor = 'red';
},
blue: function() {
  document.body.style.backgroundColor = 'blue';
},
pink: function() {
  document.body.style.backgroundColor = 'pink';
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

We've added a single function for each route we created in the previous step, and matched the names of the functions to their corresponding value in the routes hash. In our `_handleRoute` function we are looking up the navigated to route's function in the `routes` hash, then calling that function. Now, as you navigate through the links on the page, you should notice not only that the location in the browser location bar is updated, but that the page itself changes (well, the background color does) too. Obviously in a useful app, our route functions would do more than just change the color of the document body.

### <a name="add-dynamic-routes">Get Fancy (dynamic routes)
At this point we've created a super basic router. But we are lacking some really important functionality, namely the ability to create 'dynamic' routes.

Notice that we are repeating behavior with our color routes. All of these routes are namespaced after `colors/`, and all of the color route functions do the same thing, yet because of our simple hash map, we had to create a separate routes and route functions for each one. Let's refactor our code to simplify. Add the following route to the routes hash:

```
'colors/:color': 'color'

```

We are setting ourselves up to process the 'dynamic' part of our route by preceding it with a colon, and giving it a generic, parameter name. Using a colon here to signify the dynamic segment is standard accepted practice.

Add the following route function:

```
color: function(color) {
  document.body.style.backgroundColor = color;
}

```

We've made a generic color route function, that accepts a single argument, which we use in the color function to set the color of the page (hint: it's the paramter we set earlier!). Using this setup, we should be able to navigate to `colors/{any CSS color name}` and our page should turn that color! To enable dynamic routing, we need to match actual routes with the keys included in our routes hash, and pull out and pass along the dynamic segments used in the route functions. Get ready for some regular expressions! Let's start with the route matching. Add the following to the router object:

```
_registerRoutes: function() {
  this._routes = [];
  for (var key in this.routes) {
    var keyRegEx = key.replace(/:(\w+)/g, '(\\S*)');
  this._routes.push({keyRegEx: keyRegEx, key: key});
  }
}

```

Simply put, we're replacing the route hash itself with a regular expression. We use the `string.replace` method to extract any ':' and following 'word characters', and replace them with a regular expression that will return a match for any value other than whitespace. We store the original key in the 'key' property, and the newly created regular expression in the 'keyRegEx' property.

Then we update the `_init` function as follows:
```
_init: function() {
  this._registerRoutes();
  console.log(this._routes);
  this.handleRoute();
  window.onhashchange = this._handleRoute.bind(this);
}
```

If you open up your console and refresh the page, you should now see the `_routes` array, which contains an object for each route in our `routes` hash. We can now match our actual fragment identifiers with this regular expression to discover their associated key in our original `routes` hash. We'll do that with the following function:

```
_matchRoutes: function(hash) {
  if (hash) {
    for (var i = 0; i < this._routes.length; i++) {
      if (this._routes[i]['keyRegEx'] && hash.match(this._routes[i]['keyRegEx'])) {
        return {key: this._routes[i]['key'], args: hash.match(this._routes[i]['keyRegEx'])};
      }
    }
  } else {
    return {key: ''};
  }
}

```

First we check to make sure the current route has a fragment identifier. If we are at the root, and therefore our hash is falsey, we will just return the key as an empty string. In all other cases, we will loop through our available routes one by one until we find a match with the just created regEx. We return an object that includes the key for the matched route function (as it appears in our `routes` hash) and any arguments the route function will need (as returned from our match function). Now let's update our `_handleRoute` function to use these new functions:

```
_handleRoute: function() {
  var cleanHash = this._stripHash(window.location.hash);
  var hashMatch = this._matchRoutes(cleanHash);
  var fnIndex = this.routes[hashMatch['key']];
  var argsArray = [];
  if (hashMatch['args']) {
    argsArray = hashMatch['args'].slice(1);
  }
  this[fnIndex].apply(this, argsArray);
}

```

We've added the `hashMatch` object, which looks up the current fragment identifier against the registered routes regular expressions using the `_matchRoutes` function. Then we modified our `fnIndex` variable to utilize this new `hashMatch` object. We've also added an argsArray variable that includes the matches from our hashMatch object. And finally, we had to update our route function call with the `apply` method, so that we could pass any number of arguments without caring how many there are, allowing us to have multiple dynamic segments in our routes.

## What Next?
This router is extremely basic. It doesn't handle 'splats' or 'queries', nor does it allow for direct route manipulation. But hopefully walking through the process of building it has helped you understand what more robust routers are doing behind the scenes, and gives you the confidence to make cool apps that really take advantage of the internet!
