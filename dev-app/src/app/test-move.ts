import {Component, Input} from '@angular/core';
import {ɵonViewMove} from '@angular/core';

@Component({
  selector: 'test-move',
  standalone: true,
  template: `<div style="padding: 10px; border: 1px solid black; margin: 5px;">
    Item: {{ id }}
  </div>`,
})
export class TestMoveComponent {
  @Input() id!: string;

  constructor() {
    ɵonViewMove(() => {
      console.log(`🚀 [TestMove] Component ${this.id} was MOVED by the framework!`);
    });
  }
}
