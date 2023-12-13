/*! Copyright 2019 - 2023 Ayogo Health Inc. */
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
 */
export class AyAccordionHeader extends HTMLElement {
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
        this.addEventListener('click', this);
        this.addEventListener('keydown', this);
    }
    handleEvent(event) {
        if (event.type === 'click') {
            const ayAccordionElem = this.closest('ay-accordion');
            ayAccordionElem.dispatchEvent(new Event('toggle'));
        }
        else if (event.type === 'keydown') {
            const ayAccordionElem = this.closest('ay-accordion');
            if (event.keyCode === 32 || event.keyCode === 13) {
                ayAccordionElem.dispatchEvent(new Event('toggle'));
            }
        }
    }
    disconnectedCallback() {
        this.removeEventListener('keydown', this);
        this.removeEventListener('click', this);
    }
}
if (window.customElements) {
    customElements.define('ay-accordion-header', AyAccordionHeader);
}
//# sourceMappingURL=index.js.map