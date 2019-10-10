// Copyright 2019 Ayogo Health Inc
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
 *
 */

const accordionEventMap : WeakMap<HTMLElement, () => void> = new WeakMap();

export class AyAccordion extends HTMLElement {
  //Add event listeners for the dispatched events from the ay-acc-hed

  toggleOpen() {
    this.setAttribute('open', '');
    this.setAttribute('aria-expanded', 'true');
    Array.prototype.forEach.call(this.children, function (el) {
      if(!(el.tagName === 'AY-ACCORDION-HEADER')) {
        el.removeAttribute('hidden');
      }
    });
  }

  toggleClose() {
    this.removeAttribute('open');
    this.setAttribute('aria-expanded', 'false');
    Array.prototype.forEach.call(this.children, function(el) {
      if(!(el.tagName === 'AY-ACCORDION-HEADER')) {
        el.setAttribute('hidden', '');
      }
    });
  }

  childCallback(el) {
    if(el.tagName === 'AY-ACCORDION-HEADER') {
      return;
    }
    if (this.hasAttribute('open')) {
      el.removeAttribute('hidden');
    } else {
      el.setAttribute('hidden', '');
    }
  }

  connectedCallback() {
    const childObserver = new MutationObserver(() => {
      Array.prototype.forEach.call(this.children, (el) => this.childCallback(el));
    });

    if(this.hasAttribute('disabled')) {
      this.setAttribute('aria-disabled', 'true');
    }

    childObserver.observe(this, { childList: true })

    const handleToggle = () => {
      if(this.hasAttribute('disabled')) {
        return;
      }
      if (!this.open) {
        this.toggleOpen();
      } else {
        this.toggleClose();
      }
    }

    this.addEventListener('toggle', handleToggle);
  }



  disconnectedCallback() {
    if (accordionEventMap.has(this)){
      this.removeEventListener('toggle', accordionEventMap.get(this));
    }
  }

  //Do we need to pass 'this' to it ?
  get open(){
    return this.hasAttribute('open');
  }

}

if (window.customElements) {
  customElements.define('ay-accordion', AyAccordion);
}

