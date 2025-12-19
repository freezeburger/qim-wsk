import { Component, inject } from '@angular/core';
import { QuiModule } from '../../bridges/qui-module';
import { ToCardItemPipe } from './to-card-item-pipe';
import { JsonPipe, NgTemplateOutlet } from '@angular/common';
import { ProductFacade } from './product.facade';

@Component({
  selector: 'app-product',
  imports: [QuiModule, ToCardItemPipe, NgTemplateOutlet, JsonPipe],
  templateUrl: './product.page.html',
  styleUrl: './product.page.scss',
})
export class ProductPage {

  productFacade = inject(ProductFacade);

  ngOnInit(){
    this.productFacade.compute({ type: 'READ_ALL_PRODUCT', payload: null });
  }
 
}
