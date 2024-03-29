/*! Copyright 2019 - 2023 Ayogo Health Inc. */

import { run } from '../ay-accordion-root/index.js';

/**
 * ay-accordion is a web-component that enables hiding and showing of its child nodes by the use of click handlers
 * It must have an ay-accordion-header element as child and this acts as a button for toggling ay-accordion.
 *
 * ay-accordion can take on the following attributes
 * 1) open - If open exists then the children will not be hidden
 * 2) disable - If disable is present then the toggling functionality will not work however the existence of open attribute
 *    will still be acknowledged.
 *
 * For example:
 * ```
 * <ay-accordion>
 *  <ay-accordion-header>
 *    Button Name
 *  </ay-accordion-header>
 *  <p> Some content </p>
 * </ay-accordion>
 * ```
 *
 * @name ay-accordion
 */
export class AyAccordion extends HTMLElement {
  childCallback(el) {
    if (el.tagName === 'AY-ACCORDION-HEADER') {
      return;
    }
    if (this.hasAttribute('open')) {
      el.removeAttribute('hidden');
    } else {
      el.setAttribute('hidden', '');
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'disabled') {
      if (this.hasAttribute('disabled')) {
        this.querySelectorAll('ay-accordion-header').forEach( (el) => {
          el.setAttribute('aria-disabled', 'true');
        });
      } else {
        this.querySelectorAll('ay-accordion-header').forEach( (el) => {
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
      } else {
        this.setAttribute('aria-expanded', 'false');
        Array.prototype.forEach.call(this.children, function(el) {
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

    if (this.hasAttribute('open')){
      this.setAttribute('aria-expanded', 'true');
    } else {
      this.setAttribute('aria-expanded', 'false');
    }

    this.addEventListener('toggle', this);

    Array.prototype.forEach.call(this.children, (el) => this.childCallback(el));
    childObserver.observe(this, { childList: true });
  }

  handleEvent(event) {
    if (event.type === 'toggle') {
      if (this.hasAttribute('disabled')) {
        return;
      }

      const wasOpen = this.open;

      run(() => {
        this.open = !this.open;
      }, this);
    }
  }

  disconnectedCallback() {
    this.removeEventListener('toggle', this);
  }

  set open(value: boolean) {
    if (value) {
      this.setAttribute('open', '');
    } else {
      this.removeAttribute('open');
    }
  }

  get open(): boolean {
    return this.hasAttribute('open');
  }

  static get observedAttributes() {
    return ['open', 'disabled'];
  }
}

if (window.customElements) {
  customElements.define('ay-accordion', AyAccordion);
}

