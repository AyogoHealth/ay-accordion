ayAccordion
===========

A mobile friendly, web component based jank free accordion

<small>Copyright © 2019 Ayogo Health Inc.</small>


Features
--------

* Keyboard accessible and screen-reader friendly
* Support for single/multiple expanded regions
* Smooth animation on desktop and mobile
* Per-section open/close events
* Works with browsers supporting ES6 and web components


Usage
-----

To get started, install the package from npm: `npm install ay-accordion`.

### Basic usage

Add a script tag to your page to reference the accordion.js file:

```html
<script src="node_modules/ay-accordion/dist/web-component/index.js"></script>
```

Web Components
----------

```html
<ay-accordion-root multiple>
  <ay-accordion open>
    <ay-accordion-header>Panel 1 (Click to open)</ay-accordion-header>
    <div>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
  </ay-accordion>
</ay-accordion-root>
```


### ay-accordion-root

This web component wraps the entire accordion, as well as any content below the accordion that needs to be pushed down when accordion sections open and close.

* `multiple`: This attribute allows multiple accordion sections to be open at
  the same time (default is only a single section expanded at a time).

### ay-accordion

TThis web component manages a single expanding/collapsing accordion section, including the title content shown when it is collapsed.

* `open`: This attribute will make the section expanded by default.

* `disabled`: This attribute will disable the open/close ability of the accordion. The accordion will still maintain its original state open/close.

### ay-accordion-header

This web component wraps the title of the accordion section, and attaches the event handlers to expand the section when clicked.


Notes
-----

Released under the terms of the [MIT License](LICENSE).

This project would not have happened without the knowledge and support of
[Ada Rose Edwards](https://github.com/AdaRoseEdwards), in particular the
following two posts:
* https://ada.is/blog/2015/04/26/animation-perf/
* https://ada.is/blog/2015/04/29/animation-perf-follow-up/
