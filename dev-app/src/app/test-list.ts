import {
  Directive,
  ElementRef,
  inject,
  signal,
  computed,
  OnDestroy,
  Input,
  Component,
  ɵgetViewIndex,
} from '@angular/core';
import {ɵonViewMove} from '@angular/core';

@Directive({
  selector: '[appList]',
  standalone: true,
  exportAs: 'appList',
})
export class ListDirective {
  private readonly _items = signal(new Set<ListItemDirective>());
  private readonly _dirty = signal(0);

  readonly sortedItems = computed(() => {
    this._dirty(); // Track dependency
    const itemsArray = Array.from(this._items());

    if (typeof window === 'undefined') return itemsArray;

    return itemsArray.sort((a, b) => {
      const indexA = ɵgetViewIndex(a.element);
      const indexB = ɵgetViewIndex(b.element);
      return indexA - indexB;
    });
  });

  addItem(item: ListItemDirective) {
    this._items.update((set) => {
      set.add(item);
      return new Set(set);
    });
  }

  removeItem(item: ListItemDirective) {
    this._items.update((set) => {
      set.delete(item);
      return new Set(set);
    });
  }

  markDirty() {
    this._dirty.update((c) => c + 1);
  }
}

@Directive({
  selector: '[appListItem]',
  standalone: true,
})
export class ListItemDirective implements OnDestroy {
  @Input('appListItem') id: string = '';
  public element = inject(ElementRef).nativeElement;
  private list = inject(ListDirective, {optional: true});

  constructor() {
    if (this.list) {
      this.list.addItem(this);

      // 🚀 REPLACE MutationObserver with our framework hook!
      ɵonViewMove(() => {
        this.list!.markDirty();
      });
    }
  }

  ngOnDestroy() {
    if (this.list) {
      this.list.removeItem(this);
    }
  }
}

@Component({
  selector: 'app-list-test',
  standalone: true,
  imports: [ListDirective, ListItemDirective],
  template: `
    <div style="border: 2px solid purple; padding: 15px; margin-top: 20px;">
      <h3>List Example (Replacing MutationObserver with Move Hook)</h3>
      <button (click)="shuffle()">Shuffle Data</button>

      <div appList #list="appList" style="border: 1px solid blue; padding: 10px; margin-top: 10px;">
        <h4>DOM Order (Rendered by &#64;for):</h4>
        <div style="display: flex; gap: 10px;">
          @for (item of data(); track item) {
            <div
              [appListItem]="item"
              style="padding: 10px; border: 1px solid gray; background: #f0f0f0;"
            >
              Item {{ item }}
            </div>
          }
        </div>

        <h4>Logical Sorted Order (Maintained by Hook + ɵgetViewIndex):</h4>
        <div style="font-weight: bold; color: green; font-size: 1.2em; margin-top: 10px;">
          @for (item of list.sortedItems(); track item.id) {
            <span>{{ item.id }} </span>
          }
        </div>
      </div>
    </div>
  `,
})
export class ListTestComponent {
  data = signal(['A', 'B', 'C', 'D']);

  shuffle() {
    const arr = [...this.data()];
    // Random shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    this.data.set(arr);
  }
}
