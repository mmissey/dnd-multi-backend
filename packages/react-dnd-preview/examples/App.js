import React, { Component } from 'react';
import { DndProvider } from 'react-dnd-cjs';
import { FakeSource, FakeTarget } from './Fakes';
import TestBackend from 'react-dnd-test-backend-cjs';
import Preview from '../src/index.js';
import objectAssign from 'object-assign';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.intervalId = null;
    this.state = {isDragging: false};
  }

  componentWillUnmount() {
    this.StopDrag();
  }

  setup = (manager) => {
    this.manager = manager;
    this.backend = new TestBackend(manager);
    this.registry = manager.getRegistry();
    return this.backend;
  }

  startDrag = () => {
    if (this.state.isDragging) {
      return;
    }

    const type = 'fake';
    const src = new FakeSource(Math.random() * 255, Math.random() * 255, Math.random() * 255);
    const tgt = new FakeTarget(Math.random() * 255, Math.random() * 255, Math.random() * 255);
    this.sid = this.registry.addSource(type, src);
    this.tid = this.registry.addTarget(type, tgt);

    this.setState({isDragging: true});
    this.backend.simulateBeginDrag([this.sid], {
      clientOffset: {x: 500, y: 500},
      getSourceClientOffset: () => {
        return {x: 500, y: 500};
      },
    });
    this.startMovement(this.tid);
  }

  startMovement(id) {
    this.stopMovement();
    this.intervalId = setInterval(() => {
      this.backend.simulateHover([id], {
        clientOffset: {x: 500 * Math.random(), y: 500 * Math.random()},
      });
    }, 500);
  }

  stopMovement() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  stopDrag = () => {
    if (!this.state.isDragging) {
      return;
    }
    this.stopMovement();
    this.backend.simulateEndDrag();
    this.registry.removeSource(this.sid);
    this.registry.removeTarget(this.tid);
    this.setState({isDragging: false});
  }

  generatePreview(type, item, style) {
    objectAssign(style, {backgroundColor: item.color, width: '50px', height: '50px'});
    return <div style={style}>Generated {type}</div>;
  }

  render() {
    return (
      <div>
        <DndProvider backend={this.setup}>
          <button
            onMouseDown={this.startDrag} onMouseUp={this.stopDrag}
            onTouchStart={this.startDrag} onTouchEnd={this.stopDrag}>
            {this.state.isDragging ? 'Stop' : 'Start'} Drag
          </button>
          <Preview generator={this.generatePreview} />
        </DndProvider>
      </div>
    );
  }
}
