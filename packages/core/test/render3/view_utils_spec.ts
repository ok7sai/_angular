/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isLContainer, isLView} from '../../src/render3/interfaces/type_checks';
import {CONTEXT} from '../../src/render3/interfaces/view';
import {ViewFixture} from './view_fixture';
import {createTNode} from '../../src/render3/tnode_manipulation';
import {
  createLContainer,
  addLViewToLContainer,
  ɵonViewMove,
} from '../../src/render3/view/container';
import {Component} from '../../src/core';
import {TestBed} from '../../testing';
import {enterView, leaveView} from '../../src/render3/state';

describe('view_utils', () => {
  it('should verify unwrap methods (isLView and isLContainer)', () => {
    const viewFixture = new ViewFixture();
    const tNode = createTNode(null!, null, 3, 0, 'div', []);
    const lContainer = createLContainer(
      viewFixture.lView,
      viewFixture.lView,
      viewFixture.host,
      tNode,
    );

    expect(isLView(viewFixture.lView)).toBe(true);
    expect(isLView(lContainer)).toBe(false);

    expect(isLContainer(viewFixture.lView)).toBe(false);
    expect(isLContainer(lContainer)).toBe(true);
  });

  it('should invoke registered view move callback when addLViewToLContainer is called', () => {
    const viewFixture = new ViewFixture();
    const tNode = createTNode(null!, null, 3, 0, 'div', []);
    const lContainer = createLContainer(
      viewFixture.lView,
      viewFixture.lView,
      viewFixture.host,
      tNode,
    );

    let called = false;
    const myComponentInstance = {};

    viewFixture.lView[CONTEXT] = myComponentInstance;

    enterView(viewFixture.lView);
    ɵonViewMove(() => {
      called = true;
    });
    leaveView();

    addLViewToLContainer(lContainer, viewFixture.lView, 0, false);

    expect(called).toBe(true);
  });

  it('should invoke callback on a REAL compiled Angular component', () => {
    let called = false;

    @Component({
      standalone: true,
      template: '<div>Real View</div>',
    })
    class MyRealComponent {
      constructor() {
        ɵonViewMove(() => {
          called = true;
        });
      }
    }

    const fixture = TestBed.createComponent(MyRealComponent);
    fixture.detectChanges();

    // Extract the host LView (active during constructor)
    const hostLView = (fixture.componentRef.hostView as any)._lView;

    const viewFixture = new ViewFixture();
    const tNode = createTNode(null!, null, 3, 0, 'div', []);
    const lContainer = createLContainer(
      viewFixture.lView,
      viewFixture.lView,
      viewFixture.host,
      tNode,
    );

    // Act: Simulate the framework re-attaching the real compiled component's host LView
    addLViewToLContainer(lContainer, hostLView, 0, false);

    // Assert: The internal framework fully recognized the real component instance and fired!
    expect(called).toBe(true);
  });
});
