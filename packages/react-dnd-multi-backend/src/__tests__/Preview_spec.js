import React from 'react';
import { mount } from 'enzyme';

import DnDPreview from 'react-dnd-preview';
import Preview from '../Preview';
import { PreviewManager } from 'dnd-multi-backend';
import TestBackend from 'react-dnd-test-backend-cjs';
import { DndProvider } from 'react-dnd-cjs';

jest.mock('dnd-multi-backend', () => {
  return {
    PreviewManager: {
      register: jest.fn(),
      unregister: jest.fn(),
    },
  };
});

describe('Preview component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const createComponent = ({generator = jest.fn()} = {}) => {
    return mount(
      <DndProvider backend={TestBackend}>
        <Preview generator={generator} />
      </DndProvider>
    );
  };

  test('is a PureComponent', () => {
    const component = createComponent().find(Preview);
    expect(component.name()).toBe('Preview');
    expect(component.instance()).toBeInstanceOf(React.PureComponent);
  });

  test('registers with the backend', () => {
    expect(PreviewManager.register).not.toBeCalled();
    const component = createComponent();
    const instance = component.find(Preview).instance();
    expect(PreviewManager.register).toBeCalledWith(instance);
    expect(PreviewManager.unregister).not.toBeCalled();
    component.unmount();
    expect(PreviewManager.unregister).toBeCalledWith(instance);
  });

  test('is empty (no preview)', () => {
    const component = createComponent().find(Preview);
    expect(component.html()).toBeNull();
  });

  test('is not empty (preview)', () => {
    const component = createComponent({
      generator: () => {
        return <div>abc</div>;
      },
    }).find(Preview);
    expect(component.find(DnDPreview)).not.toExist();
    console.log(component.find(DnDPreview));

    component.instance().backendChanged({
      previewEnabled: () => { return true; },
    });
    component.update();
    console.log(component.html());
    console.log(component.find(DnDPreview));
    expect(component.html()).not.toBeNull();

    component.instance().backendChanged({
      previewEnabled: () => { return false; },
    });
    component.update();
    expect(component.find(DnDPreview)).not.toExist();
  });
});
