import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Host, HostListener, inject, Injectable, NgZone, output, signal, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-reactive',
  imports: [
    CommonModule
  ],
  templateUrl: './reactive.theory.html',
  styleUrl: './reactive.theory.scss',
  // encapsulation: ViewEncapsulation.None
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 
    /* '(window:click)': 'onClick()' , */
    ['class']: 'reactive-component'
  }
})
export class ReactiveTheory {

  timestamp = signal(Date.now());

  ngOnInit() {
    setInterval( this.tick.bind(this) , 1000);
  }

  tick() {
    this.timestamp.set(Date.now());
    //this.timestamp.update( t => t ); 
  }
  

}

@Injectable()
export class OldReactiveTheory {
  cdr = inject(ChangeDetectorRef);

  timestamp = Date.now();
  zone = inject(NgZone);

  tick() {
    this.timestamp = Date.now();
    console.log('tick', this.timestamp);
    this.cdr.markForCheck();
  }

  onClick() {
    console.log('Window Click');
  }

  ngOnInit() {
  
    this.zone.runOutsideAngular( () => {
      setInterval( this.tick.bind(this) , 1000);
    }); 
    

    setInterval( this.tick.bind(this) , 1000);
    
  }
}


/* export class ReactiveTheory {

  timestamp$ = new BehaviorSubject<number>(Date.now());

  ngOnInit() {
    setInterval( this.tick.bind(this) , 1000);
  }

  tick() {
    this.timestamp$.next(Date.now());
  }
  

} */