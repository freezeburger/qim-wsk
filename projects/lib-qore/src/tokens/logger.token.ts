import { InjectionToken } from "@angular/core";


export interface Logger {
    log(message: string): void;
}

export const APPLICATION_LOGGER = new InjectionToken<Logger>('Application Logger');