ayAccordion
===========

A mobile friendly, web component based jank free accordion

Features
--------

* Keyboard accessible and screen-reader friendly
* Support for single/multiple expanded regions
* Smooth animation on desktop and mobile
* Per-section open/close events
* Works with browsers supporting ES6 and web components


Installation
------------

```
npm install ay-accordion
```

Usage
-----

```html
<!-- As a script tag -->
<script src="node_modules/ay-accordion/dist/index.js"></script>

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

This web component wraps the entire accordion, as well as any content below the
accordion that needs to be pushed down when accordion sections open and close.

* `multiple`: This attribute allows multiple accordion sections to be open at
  the same time (default is only a single section expanded at a time).

### ay-accordion

TThis web component manages a single expanding/collapsing accordion section,
including the title content shown when it is collapsed.

* `open`: This attribute will make the section expanded by default.

* `disabled`: This attribute will disable the open/close ability of the
  accordion. The accordion will still maintain its original state open/close.

### ay-accordion-header

This web component wraps the title of the accordion section, and attaches the
event handlers to expand the section when clicked.


Contributing
------------

Contributions of bug reports, feature requests, and pull requests are greatly
appreciated!

Please note that this project is released with a [Contributor Code of
Conduct](https://github.com/AyogoHealth/ay-accordion/blob/master/CODE_OF_CONDUCT.md).
By participating in this project you agree to abide by its terms.


Licence
-------

Released under the MIT Licence.

Copyright © 2020 Ayogo Health Inc.


Acknowledgements & Thanks
-------------------------

This project would not have happened without the knowledge and support of
[Ada Rose Cannon](https://ada.is), in particular the
following posts:
* https://ada.is/blog/2015/04/26/animation-perf/
* https://ada.is/blog/2015/04/29/animation-perf-follow-up/
* https://medium.com/samsung-internet-dev/animating-dom-changes-33b031927e96
