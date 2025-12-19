import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { QuiModule } from '../../bridges/qui-module';

@Component({
  selector: 'app-home',
  imports: [ QuiModule ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  /*
  constructor(
    @Inject(Router) public router:Router
  ) 
  {
  }
  */
  router = inject(Router);
}
