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
angular.module('ayAccordion', [])
    .directive('ayAccordionRoot', function () {
    return {
        restrict: 'A',
        controller: function ($scope, $element, $attrs) {
            "ngInject";
            // Helper Methods //////////////////////////////////////////////////////
            var filter = Array.prototype.filter;
            var forEach = Array.prototype.forEach;
            var map = Array.prototype.map;
            var style = function (el, prop, value) {
                var vendors = ['', '-webkit-', '-ms-'];
                if (angular.isDefined(value)) {
                    for (var i = vendors.length - 1; i >= 0; --i) {
                        el.style[vendors[i] + prop] = value;
                    }
                }
                else {
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
            this.run = function (fn, cb) {
                var self = this;
                self.blockClicks = true;
                var elementsToWatch = filter.call(self.root.childNodes, function (el) {
                    /* Disregard text nodes and comments */
                    return el.nodeType === 1;
                });
                var preRoot = self.root.getBoundingClientRect();
                /* Take initial measurements */
                var measurements = map.call(elementsToWatch, function (el) {
                    return {
                        el: el,
                        initialDimensions: el.getBoundingClientRect(),
                        initialTransform: style(el, 'transform') || ''
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
                forEach.call(measurements, function (m) {
                    m.newDimensions = m.el.getBoundingClientRect();
                    m.newScale = {
                        x: m.initialDimensions.width / m.newDimensions.width,
                        y: m.initialDimensions.height / m.newDimensions.height
                    };
                    m.newOffset = {
                        x: m.initialDimensions.left - m.newDimensions.left,
                        y: m.initialDimensions.top - m.newDimensions.top
                    };
                    requestAnimationFrame(function () {
                        style(m.el, 'transform-origin', '0 0');
                    });
                    m.children = [];
                    /* Set the grandchildren to the inverse transform */
                    if (m.initialDimensions.height !== m.newDimensions.height ||
                        m.initialDimensions.width !== m.newDimensions.width) {
                        m.children = filter.call(m.el.childNodes, function (el) {
                            return el.nodeType === 1;
                        });
                        forEach.call(m.children, function (el) {
                            var elDimensions = el.getBoundingClientRect();
                            var offsetFromParent = {
                                x: m.newDimensions.left - elDimensions.left,
                                y: m.newDimensions.top - elDimensions.top
                            };
                            var origin = offsetFromParent.x + 'px ';
                            origin += offsetFromParent.y + 'px';
                            requestAnimationFrame(function () {
                                style(el, 'transform-origin', origin);
                            });
                        });
                    }
                });
                var duration = 100; // In milliseconds
                var t = 1;
                function tween() {
                    forEach.call(measurements, function (m) {
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
                        style(m.el, 'transform', transform);
                        forEach.call(m.children, function (el) {
                            var scale = 'scale(' + (1 / tScaleX) + ',' + (1 / tScaleY) + ')';
                            style(el, 'transform', scale);
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
                requestAnimationFrame(function () {
                    tween();
                });
                function cleanup() {
                    forEach.call(measurements, function (m) {
                        style(m.el, 'transform-origin', '');
                        style(m.el, 'transform', m.initialTransform);
                        forEach.call(m.children, function (el) {
                            style(el, 'transform-origin', '');
                            style(el, 'transform', '');
                        });
                    });
                    self.blockClicks = false;
                    self.root.style.minHeight = null;
                    /* Invoke our callback function when done */
                    $scope.$applyAsync(function () {
                        cb();
                    });
                }
            };
        }
    };
})
    .directive('ayAccordion', function () {
    return {
        restrict: 'A',
        require: ['ayAccordion', '^ayAccordionRoot'],
        controllerAs: 'accordion',
        bindToController: {
            onToggle: '&'
        },
        controller: function ($scope, $element, $attrs) {
            "ngInject";
            var self = this;
            self.rootCtrl = null;
            self.isOpen = false;
            self.open = function () {
                $element.addClass('open');
                $element[0].setAttribute('open', 'open');
                if ($element[0] === $element[0].parentNode.lastElementChild) {
                    $element[0].scrollIntoView();
                }
                self.isOpen = true;
                $scope.$applyAsync();
                self['onToggle']({ state: true });
                if (!self.rootCtrl.multiple) {
                    self.rootCtrl.curPanel = self;
                }
            };
            self.close = function () {
                $element.removeClass('open');
                $element[0].removeAttribute('open');
                self.isOpen = false;
                $scope.$applyAsync();
                self['onToggle']({ state: false });
                if (self.rootCtrl.curPanel === self) {
                    self.rootCtrl.curPanel = null;
                }
            };
            self.toggle = function (cb) {
                if (self.rootCtrl.blockClicks) {
                    return;
                }
                var fn = function () {
                    if (self.isOpen) {
                        self.close();
                    }
                    else {
                        self.open();
                    }
                    Array.prototype.forEach.call($element.children(), function (el) {
                        if (el.hasAttribute('ay-accordion-header')) {
                            return;
                        }
                        if (self.isOpen) {
                            el.removeAttribute('hidden');
                        }
                        else {
                            el.setAttribute('hidden', 'hidden');
                        }
                    });
                };
                self.rootCtrl.run(fn, cb);
            };
        },
        link: function ($scope, $element, $attrs, $ctrls) {
            var selfCtrl = $ctrls[0];
            var rootCtrl = $ctrls[1];
            selfCtrl.rootCtrl = rootCtrl;
            var childCallback = function (el) {
                if (el.hasAttribute('ay-accordion-header')) {
                    return;
                }
                if ($element[0].hasAttribute('open')) {
                    el.removeAttribute('hidden');
                }
                else {
                    el.setAttribute('hidden', 'hidden');
                }
            };
            Array.prototype.forEach.call($element.children(), childCallback);
            if ('MutationObserver' in window) {
                var observer = new MutationObserver(function () {
                    Array.prototype.forEach.call($element.children(), childCallback);
                });
                observer.observe($element[0], { childList: true });
                $element.on('$destroy', function () {
                    observer.disconnect();
                });
            }
            $attrs.$observe('open', function (newval) {
                if (newval || newval === "") {
                    if (!$element.hasClass('open')) {
                        selfCtrl.open();
                    }
                }
                else if ($element.hasClass('open')) {
                    selfCtrl.close();
                }
            });
        }
    };
})
    .directive('ayAccordionHeader', function () {
    return {
        restrict: 'A',
        require: '^ayAccordion',
        scope: true,
        link: function ($scope, $element, $attrs, $ctrl) {
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
            $scope.$watch(function () { return $ctrl.isOpen; }, function () { return updateState(); });
            $element.on('click', function ($event) {
                return activate($event);
            });
            $element.on('keydown', function ($event) {
                if ($event.keyCode === 32 || $event.keyCode === 13) {
                    return activate($event);
                }
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FjY29yZGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CRztBQWlCSCxPQUFPLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUM7S0FDaEMsU0FBUyxDQUFDLGlCQUFpQixFQUFFO0lBQzVCLE1BQU0sQ0FBQztRQUNMLFFBQVEsRUFBRSxHQUFHO1FBQ2IsVUFBVSxFQUFFLFVBQVMsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNO1lBQzNDLFVBQVUsQ0FBQztZQUVYLHdFQUF3RTtZQUN4RSxJQUFJLE1BQU0sR0FBSSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztZQUNyQyxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQztZQUN0QyxJQUFJLEdBQUcsR0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQztZQUVsQyxJQUFJLEtBQUssR0FBSyxVQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBTTtnQkFDckMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUV2QyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDN0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO3dCQUM3QyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7b0JBQ3RDLENBQUM7Z0JBQ0gsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTixHQUFHLENBQUMsQ0FB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TUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDckUsQ0FBQztZQUVELGtCQUFrQixNQUFNO2dCQUN0QixLQUFLLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUUxQixNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3hCLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDZixDQUFDO1lBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFNLE9BQUEsS0FBSyxDQUFDLE1BQU0sRUFBWixDQUFZLEVBQUUsY0FBTSxPQUFBLFdBQVcsRUFBRSxFQUFiLENBQWEsQ0FBQyxDQUFDO1lBRXZELFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQVMsTUFBTTtnQkFDbEMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQztZQUVILFFBQVEsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQVMsTUFBTTtnQkFDcEMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sS0FBSyxFQUFFLElBQUksTUFBTSxDQUFDLE9BQU8sS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNuRCxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMxQixDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyohIENvcHlyaWdodCAoYykgMjAxNiBBeW9nbyBIZWFsdGggSW5jLlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvXG4gKiBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZVxuICogcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yXG4gKiBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HXG4gKiBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTXG4gKiBJTiBUSEUgU09GVFdBUkUuXG4gKi9cblxuLyogQGludGVybmFsICovXG5pbnRlcmZhY2UgSVBhbmVsQ29udHJvbGxlciB7XG4gIHJvb3RDdHJsIDogYW55O1xuICBpc09wZW4gOiBib29sZWFuO1xuICBvcGVuIDogKCkgPT4gdm9pZDtcbiAgY2xvc2UgOiAoKSA9PiB2b2lkO1xuICB0b2dnbGUgOiAoY2IgOiBhbnkpID0+IHZvaWQ7XG59XG5cbi8qIEBpbnRlcm5hbCAqL1xuaW50ZXJmYWNlIElUaXRsZVNjb3BlIGV4dGVuZHMgbmcuSVNjb3BlIHtcbiAgaXNPcGVuIDogYm9vbGVhbjtcbn1cblxuXG5hbmd1bGFyLm1vZHVsZSgnYXlBY2NvcmRpb24nLCBbXSlcbi5kaXJlY3RpdmUoJ2F5QWNjb3JkaW9uUm9vdCcsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQScsXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzKSB7XG4gICAgICBcIm5nSW5qZWN0XCI7XG5cbiAgICAgIC8vIEhlbHBlciBNZXRob2RzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgICAgdmFyIGZpbHRlciAgPSBBcnJheS5wcm90b3R5cGUuZmlsdGVyO1xuICAgICAgdmFyIGZvckVhY2ggPSBBcnJheS5wcm90b3R5cGUuZm9yRWFjaDtcbiAgICAgIHZhciBtYXAgICAgID0gQXJyYXkucHJvdG90eXBlLm1hcDtcblxuICAgICAgdmFyIHN0eWxlICAgPSBmdW5jdGlvbihlbCwgcHJvcCwgdmFsdWU/KSB7XG4gICAgICAgIHZhciB2ZW5kb3JzID0gWycnLCAnLXdlYmtpdC0nLCAnLW1zLSddO1xuXG4gICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgICAgICBmb3IgKHZhciBpID0gdmVuZG9ycy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICAgICAgZWwuc3R5bGVbdmVuZG9yc1tpXSArIHByb3BdID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAodmFyIGkgPSB2ZW5kb3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgICBpZiAoZWwuc3R5bGVbdmVuZG9yc1tpXSArIHByb3BdICE9PSAnJykge1xuICAgICAgICAgICAgICByZXR1cm4gZWwuc3R5bGVbdmVuZG9yc1tpXSArIHByb3BdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfTtcblxuXG4gICAgICAvLyBDb250cm9sbGVyLWxldmVsIFZhcmlhYmxlcyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAgIHRoaXMucm9vdCA9ICRlbGVtZW50WzBdO1xuICAgICAgdGhpcy5tdWx0aXBsZSA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRyc1snbXVsdGlwbGUnXSk7XG4gICAgICB0aGlzLmN1clBhbmVsID0gbnVsbDtcbiAgICAgIHRoaXMuYmxvY2tDbGlja3MgPSBmYWxzZTtcblxuXG4gICAgICAvLyBDb250cm9sbGVyIG1ldGhvZHMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAgIHRoaXMucnVuID0gZnVuY3Rpb24oZm4sIGNiKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICBzZWxmLmJsb2NrQ2xpY2tzID0gdHJ1ZTtcblxuICAgICAgICB2YXIgZWxlbWVudHNUb1dhdGNoID0gZmlsdGVyLmNhbGwoc2VsZi5yb290LmNoaWxkTm9kZXMsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgLyogRGlzcmVnYXJkIHRleHQgbm9kZXMgYW5kIGNvbW1lbnRzICovXG4gICAgICAgICAgcmV0dXJuIGVsLm5vZGVUeXBlID09PSAxO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgcHJlUm9vdCA9IHNlbGYucm9vdC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAvKiBUYWtlIGluaXRpYWwgbWVhc3VyZW1lbnRzICovXG4gICAgICAgIHZhciBtZWFzdXJlbWVudHMgPSBtYXAuY2FsbChlbGVtZW50c1RvV2F0Y2gsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVsOiBlbCxcbiAgICAgICAgICAgIGluaXRpYWxEaW1lbnNpb25zOiAgZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgICAgICBpbml0aWFsVHJhbnNmb3JtOiAgIHN0eWxlKGVsLCAndHJhbnNmb3JtJykgfHwgJydcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgICAgICBzZWxmLnJvb3Quc3R5bGUubWluSGVpZ2h0ID0gcHJlUm9vdC5oZWlnaHQgKyAncHgnO1xuXG4gICAgICAgIC8qIENsb3NlIGV4aXN0aW5nIHBhbmVscyBpZiBuZWVkZWQgKi9cbiAgICAgICAgaWYgKCF0aGlzLm11bHRpcGxlICYmIHRoaXMuY3VyUGFuZWwgJiYgZm4gIT09IHRoaXMuY3VyUGFuZWwuY2xvc2UpIHtcbiAgICAgICAgICB0aGlzLmN1clBhbmVsLmNsb3NlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBSdW4gdGhlIGZ1bmN0aW9uIHRvIGNoYW5nZSB0aGUgc3RhdGUgKi9cbiAgICAgICAgZm4oKTtcblxuICAgICAgICAvKiBTZXQgdGhlIGVsZW1lbnQgc3RhdGVzIHRvIGFwcGVhciBhcyBpbml0aWFsIGFmdGVyIHRoZSBjaGFuZ2UgKi9cbiAgICAgICAgZm9yRWFjaC5jYWxsKG1lYXN1cmVtZW50cywgZnVuY3Rpb24obSkge1xuICAgICAgICAgIG0ubmV3RGltZW5zaW9ucyA9IG0uZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgICBtLm5ld1NjYWxlID0ge1xuICAgICAgICAgICAgeDogbS5pbml0aWFsRGltZW5zaW9ucy53aWR0aCAvIG0ubmV3RGltZW5zaW9ucy53aWR0aCxcbiAgICAgICAgICAgIHk6IG0uaW5pdGlhbERpbWVuc2lvbnMuaGVpZ2h0IC8gbS5uZXdEaW1lbnNpb25zLmhlaWdodFxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBtLm5ld09mZnNldCA9IHtcbiAgICAgICAgICAgIHg6IG0uaW5pdGlhbERpbWVuc2lvbnMubGVmdCAtIG0ubmV3RGltZW5zaW9ucy5sZWZ0LFxuICAgICAgICAgICAgeTogbS5pbml0aWFsRGltZW5zaW9ucy50b3AgLSBtLm5ld0RpbWVuc2lvbnMudG9wXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICBzdHlsZShtLmVsLCAndHJhbnNmb3JtLW9yaWdpbicsICcwIDAnKTtcbiAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgbS5jaGlsZHJlbiA9IFtdO1xuXG4gICAgICAgICAgLyogU2V0IHRoZSBncmFuZGNoaWxkcmVuIHRvIHRoZSBpbnZlcnNlIHRyYW5zZm9ybSAqL1xuICAgICAgICAgIGlmIChtLmluaXRpYWxEaW1lbnNpb25zLmhlaWdodCAhPT0gbS5uZXdEaW1lbnNpb25zLmhlaWdodCB8fFxuICAgICAgICAgICAgICBtLmluaXRpYWxEaW1lbnNpb25zLndpZHRoICAhPT0gbS5uZXdEaW1lbnNpb25zLndpZHRoKSB7XG5cbiAgICAgICAgICAgIG0uY2hpbGRyZW4gPSBmaWx0ZXIuY2FsbChtLmVsLmNoaWxkTm9kZXMsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICAgIHJldHVybiBlbC5ub2RlVHlwZSA9PT0gMTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmb3JFYWNoLmNhbGwobS5jaGlsZHJlbiwgZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgICAgdmFyIGVsRGltZW5zaW9ucyA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICB2YXIgb2Zmc2V0RnJvbVBhcmVudCA9IHtcbiAgICAgICAgICAgICAgICB4OiBtLm5ld0RpbWVuc2lvbnMubGVmdCAtIGVsRGltZW5zaW9ucy5sZWZ0LFxuICAgICAgICAgICAgICAgIHk6IG0ubmV3RGltZW5zaW9ucy50b3AgIC0gZWxEaW1lbnNpb25zLnRvcFxuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIHZhciBvcmlnaW4gPSBvZmZzZXRGcm9tUGFyZW50LnggKyAncHggJztcbiAgICAgICAgICAgICAgb3JpZ2luICs9IG9mZnNldEZyb21QYXJlbnQueSArICdweCc7XG5cbiAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgICAgICBzdHlsZShlbCwgJ3RyYW5zZm9ybS1vcmlnaW4nLCBvcmlnaW4pO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGR1cmF0aW9uID0gMTAwOyAvLyBJbiBtaWxsaXNlY29uZHNcbiAgICAgICAgdmFyIHQgPSAxO1xuXG4gICAgICAgIGZ1bmN0aW9uIHR3ZWVuKCkge1xuICAgICAgICAgIGZvckVhY2guY2FsbChtZWFzdXJlbWVudHMsIGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgICAgIGlmIChtLmluaXRpYWxEaW1lbnNpb25zLmhlaWdodCA9PT0gbS5uZXdEaW1lbnNpb25zLmhlaWdodCAmJlxuICAgICAgICAgICAgICAgIG0uaW5pdGlhbERpbWVuc2lvbnMud2lkdGggID09PSBtLm5ld0RpbWVuc2lvbnMud2lkdGggICYmXG4gICAgICAgICAgICAgICAgbS5pbml0aWFsRGltZW5zaW9ucy5sZWZ0ICAgPT09IG0ubmV3RGltZW5zaW9ucy5sZWZ0ICAgJiZcbiAgICAgICAgICAgICAgICBtLmluaXRpYWxEaW1lbnNpb25zLnRvcCAgICA9PT0gbS5uZXdEaW1lbnNpb25zLnRvcCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHRTY2FsZVggICA9IDEgKyAobS5uZXdTY2FsZS54IC0gMSkgKiB0O1xuICAgICAgICAgICAgdmFyIHRTY2FsZVkgICA9IDEgKyAobS5uZXdTY2FsZS55IC0gMSkgKiB0O1xuICAgICAgICAgICAgdmFyIHRPZmZzZXRYICA9IG0ubmV3T2Zmc2V0LnggKiB0O1xuICAgICAgICAgICAgdmFyIHRPZmZzZXRZICA9IG0ubmV3T2Zmc2V0LnkgKiB0O1xuXG4gICAgICAgICAgICB2YXIgdHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnO1xuICAgICAgICAgICAgdHJhbnNmb3JtICs9IHRPZmZzZXRYICsgJ3B4LCAnO1xuICAgICAgICAgICAgdHJhbnNmb3JtICs9IHRPZmZzZXRZICsgJ3B4KSAnO1xuICAgICAgICAgICAgdHJhbnNmb3JtICs9ICdzY2FsZSgnICsgdFNjYWxlWCArICcsJyArIHRTY2FsZVkgKyAnKSAnO1xuICAgICAgICAgICAgdHJhbnNmb3JtICs9IG0uaW5pdGlhbFRyYW5zZm9ybTtcblxuICAgICAgICAgICAgc3R5bGUobS5lbCwgJ3RyYW5zZm9ybScsIHRyYW5zZm9ybSk7XG5cbiAgICAgICAgICAgIGZvckVhY2guY2FsbChtLmNoaWxkcmVuLCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgICB2YXIgc2NhbGUgPSAnc2NhbGUoJyArICgxL3RTY2FsZVgpICsgJywnICsgKDEvdFNjYWxlWSkgKyAnKSc7XG5cbiAgICAgICAgICAgICAgc3R5bGUoZWwsICd0cmFuc2Zvcm0nLCBzY2FsZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHQgLT0gKDE2IC8gZHVyYXRpb24pO1xuXG4gICAgICAgICAgaWYgKHQgPiAwKSB7XG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodHdlZW4pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICB0d2VlbigpO1xuICAgICAgICB9KTtcblxuICAgICAgICBmdW5jdGlvbiBjbGVhbnVwKCkge1xuICAgICAgICAgIGZvckVhY2guY2FsbChtZWFzdXJlbWVudHMsIGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgICAgIHN0eWxlKG0uZWwsICd0cmFuc2Zvcm0tb3JpZ2luJywgJycpO1xuICAgICAgICAgICAgc3R5bGUobS5lbCwgJ3RyYW5zZm9ybScsIG0uaW5pdGlhbFRyYW5zZm9ybSk7XG5cbiAgICAgICAgICAgIGZvckVhY2guY2FsbChtLmNoaWxkcmVuLCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgICBzdHlsZShlbCwgJ3RyYW5zZm9ybS1vcmlnaW4nLCAnJyk7XG4gICAgICAgICAgICAgIHN0eWxlKGVsLCAndHJhbnNmb3JtJywgJycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBzZWxmLmJsb2NrQ2xpY2tzID0gZmFsc2U7XG4gICAgICAgICAgc2VsZi5yb290LnN0eWxlLm1pbkhlaWdodCA9IG51bGw7XG5cbiAgICAgICAgICAvKiBJbnZva2Ugb3VyIGNhbGxiYWNrIGZ1bmN0aW9uIHdoZW4gZG9uZSAqL1xuICAgICAgICAgICRzY29wZS4kYXBwbHlBc3luYygoKSA9PiB7XG4gICAgICAgICAgICBjYigpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn0pXG5cbi5kaXJlY3RpdmUoJ2F5QWNjb3JkaW9uJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdBJyxcbiAgICByZXF1aXJlOiBbJ2F5QWNjb3JkaW9uJywgJ15heUFjY29yZGlvblJvb3QnXSxcbiAgICBjb250cm9sbGVyQXM6ICdhY2NvcmRpb24nLFxuICAgIGJpbmRUb0NvbnRyb2xsZXI6IHtcbiAgICAgIG9uVG9nZ2xlOiAnJidcbiAgICB9LFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycykge1xuICAgICAgXCJuZ0luamVjdFwiO1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHNlbGYucm9vdEN0cmwgPSBudWxsO1xuICAgICAgc2VsZi5pc09wZW4gPSBmYWxzZTtcblxuICAgICAgc2VsZi5vcGVuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICRlbGVtZW50LmFkZENsYXNzKCdvcGVuJyk7XG4gICAgICAgICRlbGVtZW50WzBdLnNldEF0dHJpYnV0ZSgnb3BlbicsICdvcGVuJyk7XG5cbiAgICAgICAgaWYgKCRlbGVtZW50WzBdID09PSAkZWxlbWVudFswXS5wYXJlbnROb2RlLmxhc3RFbGVtZW50Q2hpbGQpIHtcbiAgICAgICAgICAkZWxlbWVudFswXS5zY3JvbGxJbnRvVmlldygpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5pc09wZW4gPSB0cnVlO1xuICAgICAgICAkc2NvcGUuJGFwcGx5QXN5bmMoKTtcbiAgICAgICAgc2VsZlsnb25Ub2dnbGUnXSh7c3RhdGU6IHRydWV9KTtcblxuICAgICAgICBpZiAoIXNlbGYucm9vdEN0cmwubXVsdGlwbGUpIHtcbiAgICAgICAgICBzZWxmLnJvb3RDdHJsLmN1clBhbmVsID0gc2VsZjtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgc2VsZi5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkZWxlbWVudC5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgICAgICAkZWxlbWVudFswXS5yZW1vdmVBdHRyaWJ1dGUoJ29wZW4nKTtcblxuICAgICAgICBzZWxmLmlzT3BlbiA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUuJGFwcGx5QXN5bmMoKTtcbiAgICAgICAgc2VsZlsnb25Ub2dnbGUnXSh7c3RhdGU6IGZhbHNlfSk7XG5cblxuICAgICAgICBpZiAoc2VsZi5yb290Q3RybC5jdXJQYW5lbCA9PT0gc2VsZikge1xuICAgICAgICAgIHNlbGYucm9vdEN0cmwuY3VyUGFuZWwgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9O1xuXG5cbiAgICAgIHNlbGYudG9nZ2xlID0gZnVuY3Rpb24oY2IpIHtcbiAgICAgICAgaWYgKHNlbGYucm9vdEN0cmwuYmxvY2tDbGlja3MpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZm4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoc2VsZi5pc09wZW4pIHtcbiAgICAgICAgICAgIHNlbGYuY2xvc2UoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5vcGVuKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbCgkZWxlbWVudC5jaGlsZHJlbigpLCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgaWYgKGVsLmhhc0F0dHJpYnV0ZSgnYXktYWNjb3JkaW9uLWhlYWRlcicpKSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNlbGYuaXNPcGVuKSB7XG4gICAgICAgICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSgnaGlkZGVuJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICdoaWRkZW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBzZWxmLnJvb3RDdHJsLnJ1bihmbiwgY2IpO1xuICAgICAgfTtcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgJGN0cmxzKSB7XG4gICAgICB2YXIgc2VsZkN0cmwgPSAkY3RybHNbMF07XG4gICAgICB2YXIgcm9vdEN0cmwgPSAkY3RybHNbMV07XG5cbiAgICAgIHNlbGZDdHJsLnJvb3RDdHJsID0gcm9vdEN0cmw7XG5cbiAgICAgIHZhciBjaGlsZENhbGxiYWNrID0gZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgaWYgKGVsLmhhc0F0dHJpYnV0ZSgnYXktYWNjb3JkaW9uLWhlYWRlcicpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCRlbGVtZW50WzBdLmhhc0F0dHJpYnV0ZSgnb3BlbicpKSB7XG4gICAgICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICdoaWRkZW4nKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbCgkZWxlbWVudC5jaGlsZHJlbigpLCBjaGlsZENhbGxiYWNrKTtcblxuICAgICAgaWYgKCdNdXRhdGlvbk9ic2VydmVyJyBpbiB3aW5kb3cpIHtcbiAgICAgICAgdmFyIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbCgkZWxlbWVudC5jaGlsZHJlbigpLCBjaGlsZENhbGxiYWNrKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZSgkZWxlbWVudFswXSwgeyBjaGlsZExpc3Q6IHRydWUgfSk7XG5cbiAgICAgICAgJGVsZW1lbnQub24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgJGF0dHJzLiRvYnNlcnZlKCdvcGVuJywgZnVuY3Rpb24obmV3dmFsKSB7XG4gICAgICAgIGlmIChuZXd2YWwgfHwgbmV3dmFsID09PSBcIlwiKSB7XG4gICAgICAgICAgaWYgKCEkZWxlbWVudC5oYXNDbGFzcygnb3BlbicpKSB7XG4gICAgICAgICAgICBzZWxmQ3RybC5vcGVuKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCRlbGVtZW50Lmhhc0NsYXNzKCdvcGVuJykpIHtcbiAgICAgICAgICBzZWxmQ3RybC5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59KVxuXG4uZGlyZWN0aXZlKCdheUFjY29yZGlvbkhlYWRlcicsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQScsXG4gICAgcmVxdWlyZTogJ15heUFjY29yZGlvbicsXG4gICAgc2NvcGU6IHRydWUsIC8vIENoaWxkIHNjb3BlXG5cbiAgICBsaW5rOiBmdW5jdGlvbigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsICRjdHJsIDogSVBhbmVsQ29udHJvbGxlcikge1xuICAgICAgJGVsZW1lbnRbMF0uc2V0QXR0cmlidXRlKCdyb2xlJywgJ2J1dHRvbicpO1xuICAgICAgJGVsZW1lbnRbMF0uc2V0QXR0cmlidXRlKCd0YWJJbmRleCcsICcwJyk7XG5cbiAgICAgIGZ1bmN0aW9uIHVwZGF0ZVN0YXRlKCkge1xuICAgICAgICAkZWxlbWVudFswXS5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAkY3RybC5pc09wZW4udG9TdHJpbmcoKSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGFjdGl2YXRlKCRldmVudCkge1xuICAgICAgICAkY3RybC50b2dnbGUodXBkYXRlU3RhdGUpO1xuXG4gICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS4kd2F0Y2goKCkgPT4gJGN0cmwuaXNPcGVuLCAoKSA9PiB1cGRhdGVTdGF0ZSgpKTtcblxuICAgICAgJGVsZW1lbnQub24oJ2NsaWNrJywgZnVuY3Rpb24oJGV2ZW50KSB7XG4gICAgICAgIHJldHVybiBhY3RpdmF0ZSgkZXZlbnQpO1xuICAgICAgfSk7XG5cbiAgICAgICRlbGVtZW50Lm9uKCdrZXlkb3duJywgZnVuY3Rpb24oJGV2ZW50KSB7XG4gICAgICAgIGlmICgkZXZlbnQua2V5Q29kZSA9PT0gMzIgfHwgJGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XG4gICAgICAgICAgcmV0dXJuIGFjdGl2YXRlKCRldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0pO1xuIl19