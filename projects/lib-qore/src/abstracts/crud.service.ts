import { inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom, Observable } from "rxjs";

import {
  CrudConsumer,
  CrudConsumerResponse,
  CrudResponseCode
} from "../patterns/crud-consumer.pattern";
import { Url, WithUniqueId } from "../types/generics";
import { APPLICATION_LOGGER } from "../tokens/logger.token";

/**
 * Context used to build CRUD messages.
 *
 * @remarks
 * - `entity` is a semantic label (e.g. "user", "role")
 * - `id` is optional to support both single-entity and collection operations
 */
type CrudMessageContext = {
  entity?: string;
  id?: string | number;
};

/**
 * Metadata describing a CRUD outcome.
 *
 * @remarks
 * - `code` is stable and machine-oriented
 * - `message` is human-oriented and may change (i18n, UX tone, etc.)
 */
type CrudMetaMessage = {
  code: CrudResponseCode;
  message: string;
};

/**
 * Pair of metadata describing both success and error outcomes
 * for a single CRUD operation.
 *
 * @remarks
 * This makes the intent explicit at the call site:
 * the service clearly declares what success and failure mean.
 */
type CrudMetaPair = {
  success: CrudMetaMessage;
  error: CrudMetaMessage;
};

/**
 * Centralized CRUD message factory.
 *
 * @remarks
 * - All human-readable messages are defined here
 * - All stable response codes are defined here
 * - This is the single point of evolution for wording, i18n or analytics
 */
const CrudMeta = {
  success: {
    create: ({ entity }: CrudMessageContext) => ({
      code: "CRUD.CREATE.SUCCESS" as const,
      message: `Successfully created ${entity ?? "entity"}`,
    }),
    read: ({ entity, id }: CrudMessageContext) => ({
      code: "CRUD.READ.SUCCESS" as const,
      message: `Successfully read ${entity ?? "entity"} with id: ${id}`,
    }),
    readAll: ({ entity }: CrudMessageContext) => ({
      code: "CRUD.READ_ALL.SUCCESS" as const,
      message: `Successfully read ${entity ?? "entities"}`,
    }),
    update: ({ entity, id }: CrudMessageContext) => ({
      code: "CRUD.UPDATE.SUCCESS" as const,
      message: `Successfully updated ${entity ?? "entity"} with id: ${id}`,
    }),
    delete: ({ entity, id }: CrudMessageContext) => ({
      code: "CRUD.DELETE.SUCCESS" as const,
      message: `Successfully deleted ${entity ?? "entity"} with id: ${id}`,
    }),
  },
  error: {
    create: ({ entity }: CrudMessageContext) => ({
      code: "CRUD.CREATE.ERROR" as const,
      message: `Error creating ${entity ?? "entity"}`,
    }),
    read: ({ entity, id }: CrudMessageContext) => ({
      code: "CRUD.READ.ERROR" as const,
      message: `Error reading ${entity ?? "entity"} with id: ${id}`,
    }),
    readAll: ({ entity }: CrudMessageContext) => ({
      code: "CRUD.READ_ALL.ERROR" as const,
      message: `Error reading ${entity ?? "entities"}`,
    }),
    update: ({ entity, id }: CrudMessageContext) => ({
      code: "CRUD.UPDATE.ERROR" as const,
      message: `Error updating ${entity ?? "entity"} with id: ${id}`,
    }),
    delete: ({ entity, id }: CrudMessageContext) => ({
      code: "CRUD.DELETE.ERROR" as const,
      message: `Error deleting ${entity ?? "entity"} with id: ${id}`,
    }),
  },
} as const;


/**
 * Abstract base class providing a generic CRUD service over HTTP.
 *
 * @remarks
 * Responsibilities:
 * - Centralize HTTP access logic
 * - Normalize responses (status, message, payload, code)
 * - Hide RxJS from consumers (Promise-based API)
 * - Provide stable response codes for UI, logging and analytics
 *
 * @typeParam DTO - Data Transfer Object shape, must expose a unique identifier
 */
export abstract class CrudService<DTO extends WithUniqueId>
  implements CrudConsumer<DTO> {

  /**
   * Base REST endpoint for the resource.
   *
   * @example `http(s)://endpoint/api/users`
   */
  abstract endpoint: Url;

  /**
   * Semantic name of the entity handled by this service.
   *
   * @remarks
   * Used exclusively for message construction.
   * Concrete services are encouraged to override it.
   */
  protected entityName = "entity";

  /** Angular HttpClient injected via standalone `inject()` API */
  private http = inject(HttpClient);

  /**
   * Optional application-wide logger.
   *
   * @remarks
   * The service remains fully functional without a logger.
   */
  private logger = inject(APPLICATION_LOGGER, { optional: true });

  // ---------------------------------------------------------------------------
  // CRUD OPERATIONS
  // ---------------------------------------------------------------------------

  /**
   * Creates a new entity on the backend.
   *
   * @param data - DTO payload without its identifier
   *
   * @returns A normalized CRUD response:
   * - `status: success` with payload on success
   * - `status: error` with null payload on failure
   */
  create(data: Omit<DTO, "id">): Promise<CrudConsumerResponse<DTO>> {
    this.logger?.log?.(`[CrudService] Creating ${this.entityName}`);

    return this.request<DTO>(
      this.http.post<DTO>(this.url(), data),
      {
        success: CrudMeta.success.create({ entity: this.entityName }),
        error: CrudMeta.error.create({ entity: this.entityName }),
      }
    );
  }

  /** Reads all entities from the backend. */
  read(): Promise<CrudConsumerResponse<DTO[]>>;

  /**
   * Reads a single entity by its identifier.
   *
   * @param target - Unique identifier of the entity
   */
  read(target: DTO["id"]): Promise<CrudConsumerResponse<DTO>>;

  /**
   * Reads one entity or all entities depending on the presence of `target`.
   *
   * @remarks
   * Explicit null/undefined check allows falsy identifiers (0, "").
   */
  read(target?: DTO["id"]): Promise<CrudConsumerResponse<DTO | DTO[]>> {
    
    if (target !== undefined && target !== null) {
      this.logger?.log?.(
        `[CrudService] Reading ${this.entityName} with id: ${target}`
      );

      return this.request<DTO>(
        this.http.get<DTO>(this.url(target)),
        {
          success: CrudMeta.success.read({ entity: this.entityName, id: target }),
          error: CrudMeta.error.read({ entity: this.entityName, id: target }),
        }
      );
    }

    this.logger?.log?.(`[CrudService] Reading all ${this.entityName}`);

    return this.request<DTO[]>(
      this.http.get<DTO[]>(this.url()),
      {
        success: CrudMeta.success.readAll({ entity: this.entityName }),
        error: CrudMeta.error.readAll({ entity: this.entityName }),
      }
    );
  }

  /**
   * Updates an existing entity.
   *
   * @param target - Entity being updated
   * @param data - Partial payload excluding the identifier
   *
   * @remarks
   * Uses HTTP PUT with a partial payload.
   * Can be switched to PATCH if required by the backend contract.
   */
  update(
    target: DTO,
    data: Partial<Omit<DTO, "id">>
  ): Promise<CrudConsumerResponse<DTO>> {
    this.logger?.log?.(
      `[CrudService] Updating ${this.entityName} with id: ${target.id}`
    );

    return this.request<DTO>(
      this.http.put<DTO>(this.url(target.id), data),
      {
        success: CrudMeta.success.update({
          entity: this.entityName,
          id: target.id,
        }),
        error: CrudMeta.error.update({
          entity: this.entityName,
          id: target.id,
        }),
      }
    );
  }

  /**
   * Deletes an entity from the backend.
   *
   * @param target - Entity to delete
   *
   * @remarks
   * Assumes the backend returns the deleted entity.
   * Adjust the generic type if the API returns 204 No Content.
   */
  delete(target: DTO): Promise<CrudConsumerResponse<DTO>> {
    this.logger?.log?.(
      `[CrudService] Deleting ${this.entityName} with id: ${target.id}`
    );

    return this.request<DTO>(
      this.http.delete<DTO>(this.url(target.id)),
      {
        success: CrudMeta.success.delete({
          entity: this.entityName,
          id: target.id,
        }),
        error: CrudMeta.error.delete({
          entity: this.entityName,
          id: target.id,
        }),
      }
    );
  }

  // ---------------------------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------------------------

  /**
   * Builds a REST URL from the base endpoint and an optional identifier.
   */
  protected url(id?: DTO["id"]) {
    return id === undefined || id === null
      ? this.endpoint
      : `${this.endpoint}/${id}`;
  }

  /**
   * Creates a normalized CRUD response object.
   *
   * @remarks
   * - `code` is stable and intended for machines
   * - `message` is intended for humans
   */
  private createResponse<P>(
    status: "success" | "error",
    code: CrudResponseCode,
    message: string,
    payload: P | null
  ): CrudConsumerResponse<P> {
    this.logger?.log?.(
      `[CrudService] Response created with status: ${status}, code: ${code}, message: ${message}`
    );

    return { status, code, message, payload };
  }

  /**
   * Executes an HTTP request and maps its result to a CRUD response.
   *
   * @remarks
   * - Uses `firstValueFrom` to bridge RxJS and async/await
   * - Never rejects the Promise for business-level errors
   * - Consumers are expected to branch on `response.status`
   */
  private async request<T>(
    obs$: Observable<T>,
    meta: CrudMetaPair
  ): Promise<CrudConsumerResponse<T>> {
    try {
      const result = await firstValueFrom(obs$);

      this.logger?.log?.(
        `[CrudService] ${meta.success.message} - Payload: ${JSON.stringify(result)} }`
      );

      return this.createResponse(
        "success",
        meta.success.code,
        meta.success.message,
        result
      );

    } catch (error) {

      this.logger?.log?.(
        `[CrudService] ${meta.error.message} - ${(error as Error).message}`
      );

      return this.createResponse(
        "error",
        meta.error.code,
        meta.error.message,
        null as any
      );
    }
  }
}
