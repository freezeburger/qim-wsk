/**
* @description Doit être un identifiant unique pour un item au sein d'une collection.
*/
export type UniqueId = number | string;
 
/**
* @description Chaîne de caractères de longueur variable.
*/
export type LongText = string;
 
/**
* @description Chaîne de caractères de longueur maximum de 15 caractères.
*/
export type ShortText = string;

/**
* @description Chaîne de caractères représentant une URL.
*/
export type Url = `${'https://' | 'http://'}${string}`;
 
 
/**
* @description Chaîne de caractères représentant une URL d'image.
*/
export type ImageUrl = `${'https://' | 'http://'}${string}/${string}.png`;
 
/**
* @description Liste des catégories de produits.
*/
export type Category = "beauty" | "fragrances" | "groceries" | "furniture";

/**
 * @description Doit identifier uniquement chaque item.
 */
export interface WithUniqueId {
    id: UniqueId
}
 