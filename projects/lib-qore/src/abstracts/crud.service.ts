import { CrudConsumer, CrudConsumerResponse } from "../patterns/crud-consumer.pattern";
import { Url, WithUniqueId } from "../types/generics";
import { inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { APPLICATION_LOGGER } from "../tokens/logger.token";


export abstract class CrudService<DTO extends WithUniqueId>  implements CrudConsumer<DTO> {
    
    abstract endpoint: Url;

    private http = inject(HttpClient);
    private logger = inject(APPLICATION_LOGGER, { optional: true });
    

    create(data: Omit<DTO, "id">): Promise<CrudConsumerResponse<DTO>> {
        throw new Error("Method not implemented.");
    }
    read(): Promise<CrudConsumerResponse<DTO[]>>;
    read(target: DTO["id"]): Promise<CrudConsumerResponse<DTO>>;
    read(target?: unknown): Promise<CrudConsumerResponse<DTO>> | Promise<CrudConsumerResponse<DTO[]>> {
        throw new Error("Method not implemented.");
    }
    update(target: DTO, data: Partial<Omit<DTO, "id">>): Promise<CrudConsumerResponse<DTO>> {
        throw new Error("Method not implemented.");
    }
    delete(target: DTO): Promise<CrudConsumerResponse<DTO>> {
        throw new Error("Method not implemented.");
    }

    private createReponse<P>( 
        status:'success' | 'error', 
        message:string, 
        payload:P | null ):CrudConsumerResponse<P> {
        this.logger?.log(`[CrudService] Response created with status: ${status}, message: ${message}`);
        return {
            status,
            message,
            payload
        };
    }
   
    

}