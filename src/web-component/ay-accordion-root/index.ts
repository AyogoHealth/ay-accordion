/*! Copyright 2019 Ayogo Health Inc. */
/**
 * ay-accordion-root is a web-component which wraps the ay-accordion elements as its children.
 *
 * ay-accordion-root can take on the following attributes
 * multiple: This attribute allows multiple accordion sections to be open at the same time (default is only a single section expanded at a time).
 *
 * For example:
 * ```
 * <ay-accordion-root>
 *  <ay-accordion>
 *   <ay-accordion-header>
 *     Button Name
 *    </ay-accordion-header>
 *    <p> Some content </p>
 *  </ay-accordion>
 * </ay-accordion-root>
 * ```
 *
 * @name ay-accordion-root
 *
 */

const useClipPath = window.CSS && window.CSS.supports && window.CSS.supports('clip-path', 'inset(0px 0px 0px 0px)');

function run (fn, accordion : HTMLElement) {
  let root = accordion.closest('ay-accordion-root') as HTMLElement;
  let elementsToWatch = Array.prototype.filter.call(root.childNodes, function(el) {
    return el.nodeType === 1;
  });

  let preRoot = root.getBoundingClientRect();

  // Take initial measurements
  let measurements = Array.prototype.map.call(elementsToWatch, function(el) {
     return {
      el: el,
      initialDimensions:  el.getBoundingClientRect(),
      initialTransform:   el.style.transform || ''
     };
  });

  root.style.minHeight = preRoot.height + 'px';

  if(!root.hasAttribute('multiple')) {
    //Close existing panels if needed
    root.querySelectorAll('ay-accordion').forEach((acc) => {
      if(acc.hasAttribute('open') && acc != accordion) {
        acc.removeAttribute('open');
      }
    });
  }

  //Run the function to chaneg the state
  fn();

  Array.prototype.forEach.call(measurements, function(m) {
    m.newDimensions = m.el.getBoundingClientRect();

    m.newScale = {
      x: m.initialDimensions.width / m.newDimensions.width,
      y: m.initialDimensions.height / m.newDimensions.height
    };

    m.clipSize = {
      x: m.newDimensions.width - m.initialDimensions.width,
      y: m.newDimensions.height - m.initialDimensions.height
    };

    m.newOffset = {
      x: m.initialDimensions.left - m.newDimensions.left,
      y: m.initialDimensions.top - m.newDimensions.top
    };

    m.el.style.transformOrigin = "0 0";
    m.el.style.willChange = useClipPath ? 'transform, clip-path' : 'transform';
    m.children = [];

    // Set the grandchildren to the inverse transform
    if (m.initialDimensions.height !== m.newDimensions.height ||
      m.initialDimensions.width  !== m.newDimensions.width) {

      m.children = Array.prototype.filter.call(m.el.childNodes, function(el) {
        return el.nodeType === 1;
      });

      if (!useClipPath) {
        Array.prototype.forEach.call(m.children, function(el) {
          var elDimensions = el.getBoundingClientRect();
          var offsetFromParent = {
            x: m.newDimensions.left - elDimensions.left,
            y: m.newDimensions.top  - elDimensions.top
          };

          var origin = offsetFromParent.x + 'px ';
          origin += offsetFromParent.y + 'px';

          el.style.transformOrigin = origin;
          el.style.willChange = 'transform'

        });
      }
    }
  });


  var duration = 150; // In milliseconds
  var t = 1;

  function tween() {
    Array.prototype.forEach.call(measurements, function(m) {
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

      var tClipX = m.clipSize.x * t;
      var tClipY = m.clipSize.y * t;

      var transform = 'translate(';
      transform += tOffsetX + 'px, ';
      transform += tOffsetY + 'px) ';
      if (!useClipPath) {
        transform += 'scale(' + tScaleX + ',' + tScaleY + ') ';
      }
      transform += m.initialTransform;

      m.el.style.transform = transform;

      if (!useClipPath) {
        Array.prototype.forEach.call(m.children, function(el) {
          var scale = 'scale(' + (1/tScaleX) + ',' + (1/tScaleY) + ')';
          el.style.transform = scale;
        });
      } else {
        m.el.style.clipPath = `inset(0px ${tClipX}px ${tClipY}px 0px)`;
      }
    });

    t -= (16 / duration);

    if (t > 0) {
      requestAnimationFrame(tween);
    } else {
      cleanup();
    }
  }

  tween();

  function cleanup() {
    Array.prototype.forEach.call(measurements, function(m) {
      m.el.style.transformOrigin = '';
      m.el.style.transform = m.initialTransform;
      m.el.style.willChange = ''

      Array.prototype.forEach.call(m.children, function(el) {
        el.style.transformOrigin = '';
        el.style.transform = '';
        el.style.willChange = ''
      });
    });

    root.style.minHeight = null;

    var scrollingRoot = document['scrollingElement'] || document.body;
    var pageBottom = scrollingRoot.scrollTop + scrollingRoot.clientHeight;
    var lastChild = measurements.pop();
    if (lastChild.initialDimensions.height !== lastChild.newDimensions.height && (pageBottom - lastChild.initialDimensions.bottom < lastChild.initialDimensions.height)) {
      window.scrollBy(0, (lastChild.newDimensions.height - lastChild.initialDimensions.height));
    }
  }

}

export class AyAccordionRoot extends HTMLElement {

}

if (window.customElements) {
  customElements.define('ay-accordion-root', AyAccordionRoot);
}

export { run }
