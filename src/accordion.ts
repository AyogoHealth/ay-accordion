/*! Copyright (c) 2016 Ayogo Health Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

/* @internal */
interface IPanelController {
  rootCtrl : any;
  isOpen : boolean;
  open : () => void;
  close : () => void;
  toggle : (cb : any) => void;
}

/* @internal */
interface ITitleScope extends ng.IScope {
  isOpen : boolean;
}


angular.module('ayAccordion', [])
.directive('ayAccordionRoot', function() {
  return {
    restrict: 'A',
    controller: function($scope, $element, $attrs) {
      "ngInject";

      // Helper Methods //////////////////////////////////////////////////////
      var filter  = Array.prototype.filter;
      var forEach = Array.prototype.forEach;
      var map     = Array.prototype.map;

      var style   = function(el, prop, value?) {
        var vendors = ['', '-webkit-', '-ms-'];

        if (angular.isDefined(value)) {
          for (var i = vendors.length - 1; i >= 0; --i) {
            el.style[vendors[i] + prop] = value;
          }
        } else {
          for (var i = vendors.length - 1; i >= 0; --i) {
            if (el.style[vendors[i] + prop] !== '') {
              return el.style[vendors[i] + prop];
            }
          }
          return null;
        }
      };


      // Controller-level Variables //////////////////////////////////////////
      this.root = $element[0];
      this.multiple = angular.isDefined($attrs['multiple']);
      this.curPanel = null;
      this.blockClicks = false;


      // Controller methods //////////////////////////////////////////////////
      this.run = function(fn, cb) {
        var self = this;

        self.blockClicks = true;

        var elementsToWatch = filter.call(self.root.childNodes, function(el) {
          /* Disregard text nodes and comments */
          return el.nodeType === 1;
        });

        var preRoot = self.root.getBoundingClientRect();

        /* Take initial measurements */
        var measurements = map.call(elementsToWatch, function(el) {
          return {
            el: el,
            initialDimensions:  el.getBoundingClientRect(),
            initialTransform:   style(el, 'transform') || ''
          };
        });

        self.root.style.minHeight = preRoot.height + 'px';

        /* Close existing panels if needed */
        if (!this.multiple && this.curPanel && fn !== this.curPanel.close) {
          this.curPanel.close();
        }

        /* Run the function to change the state */
        fn();

        /* Set the element states to appear as initial after the change */
        forEach.call(measurements, function(m) {
          m.newDimensions = m.el.getBoundingClientRect();

          m.newScale = {
            x: m.initialDimensions.width / m.newDimensions.width,
            y: m.initialDimensions.height / m.newDimensions.height
          };

          m.newOffset = {
            x: m.initialDimensions.left - m.newDimensions.left,
            y: m.initialDimensions.top - m.newDimensions.top
          };

          requestAnimationFrame(() => {
            style(m.el, 'transform-origin', '0 0');
          });


          m.children = [];

          /* Set the grandchildren to the inverse transform */
          if (m.initialDimensions.height !== m.newDimensions.height ||
              m.initialDimensions.width  !== m.newDimensions.width) {

            m.children = filter.call(m.el.childNodes, function(el) {
              return el.nodeType === 1;
            });

            forEach.call(m.children, function(el) {
              var elDimensions = el.getBoundingClientRect();
              var offsetFromParent = {
                x: m.newDimensions.left - elDimensions.left,
                y: m.newDimensions.top  - elDimensions.top
              };

              var origin = offsetFromParent.x + 'px ';
              origin += offsetFromParent.y + 'px';

              requestAnimationFrame(() => {
                style(el, 'transform-origin', origin);
              });
            });
          }
        });

        var duration = 100; // In milliseconds
        var t = 1;

        function tween() {
          forEach.call(measurements, function(m) {
            if (m.initialDimensions.height === m.newDimensions.height &&
                m.initialDimensions.width  === m.newDimensions.width  &&
                m.initialDimensions.left   === m.newDimensions.left   &&
                m.initialDimensions.top    === m.newDimensions.top) {
                return;
            }

            var tScaleX   = 1 + (m.newScale.x - 1) * t;
            var tScaleY   = 1 + (m.newScale.y - 1) * t;
            var tOffsetX  = m.newOffset.x * t;
            var tOffsetY  = m.newOffset.y * t;

            var transform = 'translate(';
            transform += tOffsetX + 'px, ';
            transform += tOffsetY + 'px) ';
            transform += 'scale(' + tScaleX + ',' + tScaleY + ') ';
            transform += m.initialTransform;

            style(m.el, 'transform', transform);

            forEach.call(m.children, function(el) {
              var scale = 'scale(' + (1/tScaleX) + ',' + (1/tScaleY) + ')';

              style(el, 'transform', scale);
            });
          });

          t -= (16 / duration);

          if (t > 0) {
            requestAnimationFrame(tween);
          } else {
            cleanup();
          }
        }

        requestAnimationFrame(() => {
          tween();
        });

        function cleanup() {
          forEach.call(measurements, function(m) {
            style(m.el, 'transform-origin', '');
            style(m.el, 'transform', m.initialTransform);

            forEach.call(m.children, function(el) {
              style(el, 'transform-origin', '');
              style(el, 'transform', '');
            });
          });

          self.blockClicks = false;
          self.root.style.minHeight = null;

          /* Invoke our callback function when done */
          $scope.$applyAsync(() => {
            cb();
          });
        }
      };
    }
  };
})

.directive('ayAccordion', function() {
  return {
    restrict: 'A',
    require: ['ayAccordion', '^ayAccordionRoot'],
    controllerAs: 'accordion',
    bindToController: {
      onToggle: '&'
    },
    controller: function($scope, $element, $attrs) {
      "ngInject";

      var self = this;

      self.rootCtrl = null;
      self.isOpen = false;

      self.open = function() {
        $element.addClass('open');
        $element[0].setAttribute('open', 'open');

        if ($element[0] === $element[0].parentNode.lastElementChild) {
          $element[0].scrollIntoView();
        }

        self.isOpen = true;
        $scope.$applyAsync();
        self['onToggle']({state: true});

        if (!self.rootCtrl.multiple) {
          self.rootCtrl.curPanel = self;
        }
      };

      self.close = function() {
        $element.removeClass('open');
        $element[0].removeAttribute('open');

        self.isOpen = false;
        $scope.$applyAsync();
        self['onToggle']({state: false});


        if (self.rootCtrl.curPanel === self) {
          self.rootCtrl.curPanel = null;
        }
      };


      self.toggle = function(cb) {
        if (self.rootCtrl.blockClicks) {
          return;
        }

        var fn = function() {
          if (self.isOpen) {
            self.close();
          } else {
            self.open();
          }

          Array.prototype.forEach.call($element.children(), function(el) {
            if (el.hasAttribute('ay-accordion-header')) {
              return;
            }

            if (self.isOpen) {
              el.removeAttribute('hidden');
            } else {
              el.setAttribute('hidden', 'hidden');
            }
          });
        };

        self.rootCtrl.run(fn, cb);
      };
    },
    link: function($scope, $element, $attrs, $ctrls) {
      var selfCtrl = $ctrls[0];
      var rootCtrl = $ctrls[1];

      selfCtrl.rootCtrl = rootCtrl;

      var childCallback = function(el) {
        if (el.hasAttribute('ay-accordion-header')) {
          return;
        }

        if ($element[0].hasAttribute('open')) {
          el.removeAttribute('hidden');
        } else {
          el.setAttribute('hidden', 'hidden');
        }
      };

      Array.prototype.forEach.call($element.children(), childCallback);

      if ('MutationObserver' in window) {
        var observer = new MutationObserver(function() {
          Array.prototype.forEach.call($element.children(), childCallback);
        });

        observer.observe($element[0], { childList: true });

        $element.on('$destroy', function() {
          observer.disconnect();
        });
      }

      $attrs.$observe('open', function(newval) {
        if (newval || newval === "") {
          if (!$element.hasClass('open')) {
            selfCtrl.open();
          }
        } else if ($element.hasClass('open')) {
          selfCtrl.close();
        }
      });
    }
  };
})

.directive('ayAccordionHeader', function() {
  return {
    restrict: 'A',
    require: '^ayAccordion',
    scope: true, // Child scope

    link: function($scope, $element, $attrs, $ctrl : IPanelController) {
      $element[0].setAttribute('role', 'button');
      $element[0].setAttribute('tabIndex', '0');

      function updateState() {
        $element[0].setAttribute('aria-expanded', $ctrl.isOpen.toString());
      }

      function activate($event) {
        $ctrl.toggle(updateState);

        $event.preventDefault();
        return false;
      }

      $scope.$watch(() => $ctrl.isOpen, () => updateState());

      $element.on('click', function($event) {
        $element[0].blur();
        return activate($event);
      });

      $element.on('keydown', function($event) {
        if ($event.keyCode === 32 || $event.keyCode === 13) {
          return activate($event);
        }
      });
    }
  };
});
