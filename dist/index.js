/*! Copyright 2019 Ayogo Health Inc. */
(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}(function () { 'use strict';

    /*! Copyright 2019 Ayogo Health Inc. */
    function run(fn, accordion) {
        let root = accordion.closest('ay-accordion-root');
        let elementsToWatch = Array.prototype.filter.call(root.childNodes, function (el) {
            return el.nodeType === 1;
        });
        let preRoot = root.getBoundingClientRect();
        let measurements = Array.prototype.map.call(elementsToWatch, function (el) {
            return {
                el: el,
                initialDimensions: el.getBoundingClientRect(),
                initialTransform: el.style.transform || ''
            };
        });
        root.style.minHeight = preRoot.height + 'px';
        if (!root.hasAttribute('multiple')) {
            root.querySelectorAll('ay-accordion').forEach((acc) => {
                if (acc.hasAttribute('open') && acc != accordion) {
                    acc.removeAttribute('open');
                }
            });
        }
        fn();
        Array.prototype.forEach.call(measurements, function (m) {
            m.newDimensions = m.el.getBoundingClientRect();
            m.newScale = {
                x: m.initialDimensions.width / m.newDimensions.width,
                y: m.initialDimensions.height / m.newDimensions.height
            };
            m.newOffset = {
                x: m.initialDimensions.left - m.newDimensions.left,
                y: m.initialDimensions.top - m.newDimensions.top
            };
            m.el.style.transformOrigin = "0 0";
            m.el.style.willChange = 'transform';
            m.children = [];
            if (m.initialDimensions.height !== m.newDimensions.height ||
                m.initialDimensions.width !== m.newDimensions.width) {
                m.children = Array.prototype.filter.call(m.el.childNodes, function (el) {
                    return el.nodeType === 1;
                });
                Array.prototype.forEach.call(m.children, function (el) {
                    var elDimensions = el.getBoundingClientRect();
                    var offsetFromParent = {
                        x: m.newDimensions.left - elDimensions.left,
                        y: m.newDimensions.top - elDimensions.top
                    };
                    var origin = offsetFromParent.x + 'px ';
                    origin += offsetFromParent.y + 'px';
                    el.style.transformOrigin = origin;
                    el.style.willChange = 'transform';
                });
            }
        });
        var duration = 100;
        var t = 1;
        function tween() {
            Array.prototype.forEach.call(measurements, function (m) {
                if (m.initialDimensions.height === m.newDimensions.height &&
                    m.initialDimensions.width === m.newDimensions.width &&
                    m.initialDimensions.left === m.newDimensions.left &&
                    m.initialDimensions.top === m.newDimensions.top) {
                    return;
                }
                var tScaleX = 1 + (m.newScale.x - 1) * t;
                var tScaleY = 1 + (m.newScale.y - 1) * t;
                var tOffsetX = m.newOffset.x * t;
                var tOffsetY = m.newOffset.y * t;
                var transform = 'translate(';
                transform += tOffsetX + 'px, ';
                transform += tOffsetY + 'px) ';
                transform += 'scale(' + tScaleX + ',' + tScaleY + ') ';
                transform += m.initialTransform;
                m.el.style.transform = transform;
                Array.prototype.forEach.call(m.children, function (el) {
                    var scale = 'scale(' + (1 / tScaleX) + ',' + (1 / tScaleY) + ')';
                    el.style.transform = scale;
                });
            });
            t -= (16 / duration);
            if (t > 0) {
                requestAnimationFrame(tween);
            }
            else {
                cleanup();
            }
        }
        tween();
        function cleanup() {
            Array.prototype.forEach.call(measurements, function (m) {
                m.el.style.transformOrigin = '';
                m.el.style.transform = m.initialTransform;
                m.el.style.willChange = '';
                Array.prototype.forEach.call(m.children, function (el) {
                    el.style.transformOrigin = '';
                    el.style.transform = '';
                    el.style.willChange = '';
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
    class AyAccordionRoot extends HTMLElement {
    }
    if (window.customElements) {
        customElements.define('ay-accordion-root', AyAccordionRoot);
    }

    /*! Copyright 2019 Ayogo Health Inc. */
    const accordionEventMap = new WeakMap();
    class AyAccordion extends HTMLElement {
        childCallback(el) {
            if (el.tagName === 'AY-ACCORDION-HEADER') {
                return;
            }
            if (this.hasAttribute('open')) {
                el.removeAttribute('hidden');
            }
            else {
                el.setAttribute('hidden', '');
            }
        }
        attributeChangedCallback(name, oldValue, newValue) {
            if (name === 'disabled') {
                if (this.hasAttribute('disabled')) {
                    this.querySelectorAll('ay-accordion-header').forEach((el) => {
                        el.setAttribute('aria-disabled', 'true');
                    });
                }
                else {
                    this.querySelectorAll('ay-accordion-header').forEach((el) => {
                        el.setAttribute('aria-disabled', 'false');
                    });
                }
            }
            if (name === 'open') {
                if (this.open) {
                    this.setAttribute('aria-expanded', 'true');
                    Array.prototype.forEach.call(this.children, function (el) {
                        if (!(el.tagName === 'AY-ACCORDION-HEADER')) {
                            el.removeAttribute('hidden');
                        }
                    });
                }
                else {
                    this.setAttribute('aria-expanded', 'false');
                    Array.prototype.forEach.call(this.children, function (el) {
                        if (!(el.tagName === 'AY-ACCORDION-HEADER')) {
                            el.setAttribute('hidden', '');
                        }
                    });
                }
            }
        }
        connectedCallback() {
            const childObserver = new MutationObserver(() => {
                Array.prototype.forEach.call(this.children, (el) => this.childCallback(el));
            });
            childObserver.observe(this, { childList: true });
            if (this.hasAttribute('open')) {
                this.setAttribute('aria-expanded', 'true');
            }
            else {
                this.setAttribute('aria-expanded', 'false');
            }
            const handleToggle = () => {
                if (this.hasAttribute('disabled')) {
                    return;
                }
                run(() => {
                    this.open = !this.open;
                }, this);
            };
            this.addEventListener('toggle', handleToggle);
        }
        disconnectedCallback() {
            if (accordionEventMap.has(this)) {
                this.removeEventListener('toggle', accordionEventMap.get(this));
            }
            accordionEventMap.delete(this);
        }
        set open(value) {
            if (value) {
                this.setAttribute('open', '');
            }
            else {
                this.removeAttribute('open');
            }
        }
        get open() {
            return this.hasAttribute('open');
        }
        static get observedAttributes() {
            return ['open', 'disabled'];
        }
    }
    if (window.customElements) {
        customElements.define('ay-accordion', AyAccordion);
    }

    /*! Copyright 2019 Ayogo Health Inc. */
    const accordionHeaderClickMap = new WeakMap();
    const accordionHeaderPressMap = new WeakMap();
    class AyAccordionHeader extends HTMLElement {
        connectedCallback() {
            this.setAttribute('role', 'button');
            this.setAttribute('tabIndex', '0');
            const ayAccordionElem = this.closest('ay-accordion');
            if (ayAccordionElem.hasAttribute('disabled')) {
                this.setAttribute('aria-disabled', 'true');
            }
            else {
                this.setAttribute('aria-disabled', 'false');
            }
            const toggleOnClick = () => {
                const ayAccordionElem = this.closest('ay-accordion');
                ayAccordionElem.dispatchEvent(new Event('toggle'));
            };
            const toggleOnPress = (event) => {
                const ayAccordionElem = this.closest('ay-accordion');
                if (event.keyCode === 32 || event.keyCode === 13) {
                    ayAccordionElem.dispatchEvent(new Event('toggle'));
                }
            };
            this.addEventListener('click', toggleOnClick);
            this.addEventListener('keydown', toggleOnPress);
            accordionHeaderClickMap.set(this, toggleOnClick);
            accordionHeaderPressMap.set(this, toggleOnPress);
        }
        disconnectedCallback() {
            if (accordionHeaderPressMap.has(this)) {
                this.removeEventListener('keydown', accordionHeaderPressMap.get(this));
            }
            if (accordionHeaderClickMap.has(this)) {
                this.removeEventListener('click', accordionHeaderClickMap.get(this));
            }
            accordionHeaderClickMap.delete(this);
            accordionHeaderPressMap.delete(this);
        }
    }
    if (window.customElements) {
        customElements.define('ay-accordion-header', AyAccordionHeader);
    }

}));
