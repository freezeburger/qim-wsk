import { Signal } from "@angular/core";


export interface Mutation {
    type: Uppercase<string>;
    payload: any;
}  

/**
 * Interface for a reactive service that manages state and handles mutations.
 * The service exposes a Signal for reactive data binding and a method to process mutations.
 * And accepts mutations to update its internal state.
 * @interface ReactiveService
 * 
 * The goal is to provide a standardized way to create services
 * that can reactively manage state changes
 * in an Angular application using Signals.
 */
export interface ReactiveService<DataType, MutationType extends Mutation> {

    data:Signal<DataType>;

    compute( mutation:MutationType ):void;
}