import { inject, Injectable, signal } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { ProductDTO } from '../../core/dto/product.dto';
import { ReactiveService } from '@dev/qore';

export type ProductMutation = 
  | { type: 'READ_ALL_PRODUCT'; payload: null }
  | { type: 'ADD_PRODUCT'; payload: ProductDTO }
  | { type: 'REMOVE_PRODUCT'; payload: ProductDTO }
  | { type: 'UPDATE_PRODUCT'; payload: ProductDTO };

@Injectable({
  providedIn: 'root',
})
export class ProductFacade implements ReactiveService<ProductDTO[], ProductMutation> {

  // Facade Signal exposing products data

  data = signal<ProductDTO[]>([]);

  async compute(mutation: ProductMutation): Promise<void> {
    switch (mutation.type) {
      case 'READ_ALL_PRODUCT':
        const responseRead = await this.productService.read();
        this.data.set(responseRead.payload ?? []);
        break
      case "REMOVE_PRODUCT":
        const responseDelete = await this.productService.delete(mutation.payload);
        if( responseDelete.status === 'success' ) {
          this.data.update( previousValue => previousValue.filter( p => p.id !== mutation.payload.id  ));
        }
        break;
      default:
        console.warn(`Unknown mutation type: ${mutation.type}`);
    }
  }

  // Internals

  private productService = inject(ProductService);


}
