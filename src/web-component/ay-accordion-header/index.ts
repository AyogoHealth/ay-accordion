// Copyright 2019 Ayogo Health Inc

/**
 * ay-accordion-header acts as a button for its first parent ay-accordion element thereby enabling the toggle functionality
 *
 * For example:
 * ```
 * <ay-accordion-header>
 *  Button Name
 * </ay-accordion-header>
 * ```
 *
 * @name ay-accordion-header
 *
 */

const accordionHeaderClickMap : WeakMap<HTMLElement, () => void> = new WeakMap();
const accordionHeaderPressMap : WeakMap<HTMLElement, (event: KeyboardEvent) => void> = new WeakMap();

export class AyAccordionHeader extends HTMLElement {

  connectedCallback() {

    this.setAttribute('role', 'button');
    this.setAttribute('tabIndex', '0');


    const toggleOnClick = () => {
      const ayAccordionElem = this.closest('ay-accordion') as HTMLElement;
      ayAccordionElem.dispatchEvent(new Event('toggle'));
    };

    const toggleOnPress = (event: KeyboardEvent) => {
      const ayAccordionElem = this.closest('ay-accordion') as HTMLElement;
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

    if (accordionHeaderPressMap.has(this)){
      this.removeEventListener('keydown', accordionHeaderPressMap.get(this));
    }

    if (accordionHeaderClickMap.has(this)){
      this.removeEventListener('click', accordionHeaderClickMap.get(this));
    }
    accordionHeaderClickMap.delete(this);
    accordionHeaderPressMap.delete(this);
  }
}

if (window.customElements) {
  customElements.define('ay-accordion-header', AyAccordionHeader);
}

