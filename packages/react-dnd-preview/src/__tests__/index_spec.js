import React from 'react';
import { mount } from 'enzyme';
import TestBackend from 'react-dnd-test-backend-cjs';
import { DndProvider, useDrag } from 'react-dnd-cjs';

import Preview from '../index';

let FIXME_super_huge_hack_cant_understand_what_is_going_on = null; // eslint-disable-line id-length

describe('Preview subcomponent', () => {
  let _backend;

  const createComponent = ({generator = () => { return null; }, source = null} = {}) => {
    FIXME_super_huge_hack_cant_understand_what_is_going_on = generator;
    return mount(
      <div>
        <DndProvider backend={(manager) => {
          _backend = TestBackend(manager);
          return _backend;
        }}>
          {source}
          <Preview generator={(...args) => {
            return FIXME_super_huge_hack_cant_understand_what_is_going_on(...args);
          }} />
        </DndProvider>
      </div>
    );
  };

  test('is a DragLayer-decorated Preview', () => {
    const component = createComponent().find(Preview);
    expect(component.name()).toBe('Preview');
  });

  test('is null when DnD is not in progress', () => {
    const component = createComponent().find(Preview);
    expect(component.html()).toBeNull();
  });

  test('is valid when DnD is in progress', () => {
    const generator = (type, item, style) => {
      return <div style={style}>{item.coucou}: {type}</div>;
    };

    const Source = () => {
      const [_, drag] = useDrag({
        item: {type: 'toto', coucou: 'dauphin'},
      });
      return <div ref={drag} />;
    };

    const root = createComponent({generator, source: <Source />});

    _backend.simulateBeginDrag([instance.getHandlerId()], {
      clientOffset: {x: 1, y: 2},
      getSourceClientOffset: () => {
        return {x: 1000, y: 2000};
      },
    });
    root.update();

    const component = root.find(Preview);
    expect(component.html()).not.toBeNull();
    const div = component.find('div');
    expect(div).toExist();
    expect(div).toHaveText('dauphin: toto');
    expect(div).toHaveStyle('pointerEvents', 'none');
    expect(div).toHaveStyle('position', 'fixed');
    expect(div).toHaveStyle('top', 0);
    expect(div).toHaveStyle('left', 0);
    expect(div).toHaveStyle('transform', 'translate(1000px, 2000px)');
    expect(div).toHaveStyle('WebkitTransform', 'translate(1000px, 2000px)');
  });
});
