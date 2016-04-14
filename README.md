ayAccordion
===========

A mobile-friendly, jank-free accordion directive for Angular 1.x.

<small>Copyright © 2016 Ayogo Health Inc.</small>


Features
--------

* Keyboard accessible and screen-reader friendly
* Support for single/multiple expanded regions
* Smooth animation on desktop and mobile
* Per-section open/close events
* Supports IE 10+, Safari 6+, Edge, Chrome, Firefox, iOS 6+, and Android 4.4+


Usage
-----

To get started, install the package from npm: `npm install ay-accordion`.

### Basic usage

Add a script tag to your page to reference the accordion.js file:

```html
<script src="node_modules/ay-accordion/dist/accordion.js"></script>
```

Reference the module in your Angular app's dependencies:

```javascript
angular.module(myApp, ['ayAccordion'])
```

### ES5 with Browserify

Install the browserify-ngannotate transform:
`npm install browserify-ngannotate`

Reference the module in your Angular app's dependencies:

```javascript
var ayAccordion = require('ay-accordion').default;

angular.module(myApp, [ayAccordion])
```

### ES6 / TypeScript
Reference the module in your Angular app's dependencies:

```javascript
import ayAccordion from 'ay-accordion';

angular.module(myApp, [ayAccordion])
```

A TypeScript module definition is included.


Directives
----------

```html
<div ay-accordion-root multiple>
  <div ay-accordion open on-toggle="ctrl.accordionToggle(state)">
    <b ay-accordion-header>Panel 1 (Click to open)</b>
    <div>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
  </div>
</div>
```


### ayAccordionRoot

This directive wraps the entire accordion, as well as any content below the
accordion that needs to be pushed down when accordion sections open and close.

* `multiple`: This attribute allows multiple accordion sections to be open at
  the same time (default is only a single section expanded at a time).

### ayAccordion

This directive manages a single expanding/collapsing accordion section,
including the title content shown when it is collapsed.

* `open`: This attribute will make the section expanded by default. You can
  also use `ng-open` to set this attribute dynamically.

* `on-toggle`: This attribute specifies a callback function to be run when the
  section is expanded or collapsed. The `state` argument is a boolean
  representing if the section is open.

### ayAccordionHeader

This directive wraps the title of the accordion section, and attaches the event
handlers to expand the section when clicked.


Styling
-------

For the accordion to expand/collapse as intended, you'll need to add something
like the following to your stylesheet:

```css
[ay-accordion] {
    overflow: hidden;
    height: 30px;
}

[ay-accordion][open] {
    height: auto;
}
```


Notes
-----

Released under the terms of the [MIT License](LICENSE).

This project would not have happened without the knowledge and support of
[Ada Rose Edwards](https://github.com/AdaRoseEdwards), in particular the
following two posts:
* https://ada.is/blog/2015/04/26/animation-perf/
* https://ada.is/blog/2015/04/29/animation-perf-follow-up/
