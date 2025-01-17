/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

let React;
let Scheduler;
let ReactNoop;
let act;
let assertLog;

describe('ReactFiberRefs', () => {
  beforeEach(() => {
    jest.resetModules();
    React = require('react');
    Scheduler = require('scheduler');
    ReactNoop = require('react-noop-renderer');
    act = require('internal-test-utils').act;
    assertLog = require('internal-test-utils').assertLog;
  });

  test('ref is attached even if there are no other updates (class)', async () => {
    let component;
    class Component extends React.Component {
      shouldComponentUpdate() {
        // This component's output doesn't depend on any props or state
        return false;
      }
      render() {
        Scheduler.log('Render');
        component = this;
        return 'Hi';
      }
    }

    const ref1 = React.createRef();
    const ref2 = React.createRef();
    const root = ReactNoop.createRoot();

    // Mount with ref1 attached
    await act(() => root.render(<Component ref={ref1} />));
    assertLog(['Render']);
    expect(root).toMatchRenderedOutput('Hi');
    expect(ref1.current).toBe(component);
    // ref2 has no value
    expect(ref2.current).toBe(null);

    // Switch to ref2, but don't update anything else.
    await act(() => root.render(<Component ref={ref2} />));
    // The component did not re-render because no props changed.
    assertLog([]);
    expect(root).toMatchRenderedOutput('Hi');
    // But the refs still should have been swapped.
    expect(ref1.current).toBe(null);
    expect(ref2.current).toBe(component);
  });

  test('ref is attached even if there are no other updates (host component)', async () => {
    // This is kind of ailly test because host components never bail out if they
    // receive a new element, and there's no way to update a ref without also
    // updating the props, but adding it here anyway for symmetry with the
    // class case above.
    const ref1 = React.createRef();
    const ref2 = React.createRef();
    const root = ReactNoop.createRoot();

    // Mount with ref1 attached
    await act(() => root.render(<div ref={ref1}>Hi</div>));
    expect(root).toMatchRenderedOutput(<div>Hi</div>);
    expect(ref1.current).not.toBe(null);
    // ref2 has no value
    expect(ref2.current).toBe(null);

    // Switch to ref2, but don't update anything else.
    await act(() => root.render(<div ref={ref2}>Hi</div>));
    expect(root).toMatchRenderedOutput(<div>Hi</div>);
    // But the refs still should have been swapped.
    expect(ref1.current).toBe(null);
    expect(ref2.current).not.toBe(null);
  });
});
