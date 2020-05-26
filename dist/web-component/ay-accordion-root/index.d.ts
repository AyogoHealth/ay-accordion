/*! Copyright 2020 Ayogo Health Inc. */
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
declare function run(fn: any, accordion: HTMLElement): void;
export declare class AyAccordionRoot extends HTMLElement {
}
export { run };
