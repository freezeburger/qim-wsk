import { Observable } from "rxjs";
import { ShortText, Url, WithUniqueId } from "../types/generics";

/**
 * CRUD Consumer Pattern
 *
 * All  services that are responsible for CRUD operations should implement this pattern.
 *
 * CRUD operations:
 * - Create POST
 * - Read GET
 * - Update PUT
 * - Delete DELETE
 *
 * All services sould have a api endpoint that is used to make requests to the server.
 */
export interface CrudConsumer<Entity extends WithUniqueId> {

  /**
   * The api endpoint of the service
   */
  endpoint:Url;

  /**
   * Outgoing data should not contain the id field
   * @param data - The entity to be created
   */
  create( data:Omit<Entity,'id'> ):Promise<CrudConsumerResponse<Entity> >;

  /**
   * Read an entity
   * @param target - The entity to be read
   */
  read():Promise< CrudConsumerResponse<Entity[]> >;
  read(target:Entity['id']):Promise< CrudConsumerResponse<Entity> >;


  /**
   * Update an entity
   * @param target - The entity to be updated
   * @param data - The new data to be updated
   */
  update(target:Entity, data:Partial<Omit<Entity,'id'>> ):Promise< CrudConsumerResponse<Entity> >;

  /**
   * Delete an entity
   * @param target - The entity to be deleted
   */
  delete(target:Entity):Promise< CrudConsumerResponse<Entity> >;
}

export interface CrudConsumerResponse<P> {
  status: 'success' | 'error';
  message: ShortText;
  payload: P | null;
}