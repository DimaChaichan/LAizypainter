import {storage} from "uxp";
import CryptoJS from "crypto-js";
import {action, core} from "photoshop";

/**
 * Open native File Dialog
 * @param options
 */
export async function openFileDialog(options?: {
    initialDomain?: storage.DomainSymbol
    types?: string[];
    initialLocation?: storage.File | storage.Folder;
    allowMultiple?: boolean;
    createPersistentToken?: boolean
}): Promise<storage.File | FileWithToken> {
    let res = await storage.localFileSystem.getFileForOpening(options) as storage.File;
    if (options?.createPersistentToken) {
        // @ts-ignore
        (res as FileWithToken).token = await storage.localFileSystem.createPersistentToken(res);
        return res;
    }
    return res as storage.File;
}

/**
 * Save native File Dialog
 * @param name
 * @param options
 */
export async function saveFileDialog(name: string, options?: {
    initialDomain?: storage.DomainSymbol;
    types?: string[];
}) {
    return await storage.localFileSystem.getFileForSaving(name, options);
}

/**
 * Place Image file as a Layer
 * @param file
 */
export async function placeFileAsLayer(file: storage.File) {
    //@ts-ignore
    const token = storage.localFileSystem.createSessionToken(file);
    await core.executeAsModal(async () => {
            await action.batchPlay([
                    {
                        _obj: "placeEvent",
                        ID: 5,
                        null: {
                            _path: token,
                            _kind: "local"
                        },
                        _options: {
                            dialogOptions: "silent"
                        }
                    }
                ],
                {
                    modalBehavior: "execute"
                })
        },
        {"commandName": `Place File`})
}


const maxInt = 2147483647;   // max 32-bit signed int
/**
 * Generate Random Seed to MaxInt Range (2147483647)
 */
export function randomSeed() {
    return Math.floor(Math.random() * maxInt) + 1;
}

/**
 * Create File in Plugin Data folder
 * Override this file everytime.
 * @param name
 */
export async function createFileInDataFolder(name: string) {
    const dataFolder = await storage.localFileSystem.getDataFolder();
    return await dataFolder.createFile(name, {overwrite: true});
}

/**
 * Find a value in an Object recursive and replace this.
 * @param object
 * @param value
 * @param replace
 */
export function findValAndReplace(object: any, value: any, replace: any) {
    let found = false;
    Object.keys(object).some(function (k) {
        if (object[k] === value) {
            found = true
            object[k] = replace;
            return true;
        }
        if (object[k] && typeof object[k] === 'object') {
            found = findValAndReplace(object[k], value, replace);
            return found;
        }
    });
    return found;
}

/**
 * Clamp number
 * @param input
 * @param min
 * @param max
 */
export function clamp(input: number, min: number, max: number): number {
    return input < min ? min : input > max ? max : input;
}

/**
 * Map number to range
 * @param current
 * @param in_min
 * @param in_max
 * @param out_min
 * @param out_max
 */
export function map(current: number, in_min: number, in_max: number, out_min: number, out_max: number): number {
    const mapped: number = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
    return clamp(mapped, out_min, out_max);
}

/**
 * Generate MD5 Hast from Array
 * @param data
 * @constructor
 */
export function MD5(data: Uint8Array | Uint16Array | Float32Array) {
    const wordArray = CryptoJS.lib.WordArray.create(Array.from(data));
    return CryptoJS.MD5(wordArray).toString()
}


// #######################################################
// Interface

export interface FileWithToken extends storage.File {
    token: string
}