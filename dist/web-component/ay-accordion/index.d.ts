/*! Copyright 2019 - 2022 Ayogo Health Inc. */
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
export declare class AyAccordion extends HTMLElement {
    childCallback(el: any): void;
    attributeChangedCallback(name: any, oldValue: any, newValue: any): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    set open(value: boolean);
    get open(): boolean;
    static get observedAttributes(): string[];
}
