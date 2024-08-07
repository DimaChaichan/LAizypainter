import {storage} from "uxp";
import CryptoJS from "crypto-js";
import {action, app, core, constants} from "photoshop";
import Mexp from "math-expression-evaluator";
import {EImageComfy} from "./store/store.tsx";
import {ITaskVariable} from "./components/taskvariables/taskVariable.comp.tsx";
import {LayerKind} from "photoshop/dom/Constants";
import {Layers} from "photoshop/dom/collections/Layers";
import {Layer} from "photoshop/dom/Layer";
import {Document} from "photoshop/dom/Document";

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
            const result = await action.batchPlay([
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
            const res = findLayer(result[0].ID);
            if (res)
                await translateToZero(res);
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
 * Find a value in a Object recursive
 * @param object
 * @param value
 */
export function findVal(object: any, value: any): any {
    const keys = Object.keys(object);
    let found = false;
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (object[k] && typeof object[k] === 'object') {
            const check = findVal(object[k], value);
            if (check) found = true;
        }
        if (typeof object[k] !== "string")
            continue
        if (object[k].includes(value)) {
            found = true
        }
    }

    return found;
}

/**
 * Find a value in an Object recursive and replace this.
 * @param object
 * @param value
 * @param replace
 */
export function findValAndReplace(object: any, value: any, replace: any): any {
    const keys = Object.keys(object);
    let found = false;
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (object[k] && typeof object[k] === 'object') {
            const check = findValAndReplace(object[k], value, replace);
            if (check) found = true;
        }
        if (typeof object[k] !== "string")
            continue
        if (object[k].includes(value)) {
            found = true
            if (replace !== undefined && replace !== null) {
                object[k] = object[k].replace(value, replace);
                if (typeof replace === "number") {
                    const mexp = new Mexp();
                    // @ts-ignore
                    object[k] = mexp.eval(object[k]);
                }
            }
        }
    }

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

/**
 * Serialize Image Comfy Data
 * @param image
 */
export function serializeImageComfyData(image: EImageComfy | undefined) {
    if (!image)
        return "";
    let str = [];
    for (let p in image)
        if (image.hasOwnProperty(p)) {
            // @ts-ignore
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(image[p]));
        }
    return str.join("&");
}

/**
 * Place Comfy Output image as new Layer
 * @param image
 * @param name
 * @param state
 */
export async function placeComfyImageAsLayer(image: EImageComfy | undefined, name: string, state: any) {
    if (!image)
        return
    const blob = await state.getHistoryImage(image)
    if (blob) {
        const doc = app.activeDocument;
        const arrayBuffer = new Uint8Array(await blob?.arrayBuffer());
        const tmpFile = await createFileInDataFolder(name + '.png')
        await tmpFile.write(arrayBuffer)
        const selection: any = await getSelection();

        if (selection) {
            await core.executeAsModal(async () => {
                    await doc.selection.save("lastSelection");
                },
                {"commandName": `Save Selection`})
        }
        await placeFileAsLayer(tmpFile);
        if (selection) {
            await core.executeAsModal(async () => {
                    for (let i = 0; i < doc.channels.length; i++) {
                        const channel = doc.channels[i];
                        if (channel.name === "lastSelection") {
                            await doc.selection.load(channel);
                            await channel.remove()
                        }
                    }
                },
                {"commandName": `Restore Selection`})
        }
    }
}

/**
 * Flat Task Config
 * @param name
 * @param variable
 * @param obj
 */
export function flatTaskConfig(name: string, variable: ITaskVariable | any, obj: any) {
    switch (variable.type) {
        case "row":
            Object.keys(variable).map(key => {
                if (key !== "type" && key !== "key")
                    flatTaskConfig(key, variable[key], obj)
            })
            break;
        case undefined:
            if (name === "advanced")
                Object.keys(variable).map(key => {
                    if (key !== "type" && key !== "key")
                        flatTaskConfig(key, variable[key], obj)
                })
            break;
        default:
            if (name === "image")
                throw new Error(`[ERROR] You cant use the Variable name image!`);
            if (obj[name])
                throw new Error(`[ERROR] Config with the name: ${name} exist multiple times!`);
            obj[name] = {
                value: variable.value, config: {
                    restore: variable.hasOwnProperty('restore') ? variable["restore"] : true
                }
            }
            break;
    }
}

/**
 * Check is Number Invalid
 * @param number
 */
export function isNumberInvalid(number: number) {
    if (number === undefined ||
        number === null)
        return true;

    const type = typeof number;
    if (type === "string")
        return isNaN(parseFloat(String(number)));
    return isNaN(number);

}

/**
 * Get all Layer from document, with layer in groups.
 * @param document
 * @param kind
 */
export async function getAllLayer(document?: Document, kind?: LayerKind) {
    let res: Array<Layer> = [];
    const layers = document ? document.layers : app.activeDocument.layers;
    return _flattLayers(layers, res, kind);
}

/**
 * Get Document by ID
 * @param id
 */
export function getDocumentByID(id: number) {
    return app.documents.find(document => document.id === id);
}

/**
 * Get Layer by ID
 * @param id
 * @param document
 */
export async function getLayerByID(id: number, document: Document) {
    const layers = await getAllLayer(document);
    return layers.find(layer => layer.id === id);
}

/**
 * Flatt a Layer recursive
 * @param layers
 * @param res
 * @param kind
 * @private
 */
function _flattLayers(layers: Layers, res: Array<Layer>, kind?: LayerKind): Array<Layer> {
    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        if (!kind || (kind && layer.kind === kind))
            res.push(layer);
        if (layer.layers)
            _flattLayers(layer.layers, res, kind);
    }
    return res;
}

/**
 * Translate Layer to Zero
 * @param layer
 */
export async function translateToZero(layer: Layer) {
    if (layer.kind === constants.LayerKind.SMARTOBJECT) {
        const info = await getSmartObjectTransformationInfos(layer)
        await core.executeAsModal(async () => {
            // info must be filled! I hope! :D
            await layer.translate(
                // @ts-ignore
                 info?.points?.lowerLeft.x * -1,
                // @ts-ignore
                info?.points?.upperLeft.y * -1)
        }, {
            commandName: `Translate Layer to Zero`
        })
    } else {
        await core.executeAsModal(async () => {
            await layer.translate(
                layer.bounds.left * -1,
                layer.bounds.top * -1)
        }, {
            commandName: `Translate Layer to Zero`
        })
    }
}

/**
 * Get Selection
 */
export async function getSelection() {
    let selection: any;
    await core.executeAsModal(async () => {
            const result = await action.batchPlay(
                [
                    {
                        "_obj": "get",
                        "_target": [
                            {
                                "_property": "selection"
                            },
                            {
                                "_ref": "document",
                                "_id": app.activeDocument.id
                            }
                        ],
                        "_options": {
                            "dialogOptions": "dontDisplay"
                        }
                    }
                ],
                {
                    modalBehavior: "execute"
                })
            selection = result.length ? result[0].selection : undefined;
        },
        {"commandName": `Get selection Infos`})
    if (selection) {
        selection.left = selection.left._value;
        selection.right = selection.right._value;
        selection.top = selection.top._value;
        selection.bottom = selection.bottom._value;
        selection.width = selection.right - selection.left;
        selection.height = selection.bottom - selection.top;
    }
    return selection;
}

/**
 * Find a Layer
 * @param query a Layer-name or LayerID
 * @param recursive
 * @param rootLayer search from this Layer
 * @param document set the document for the Layer, without use activeDocument
 */
export function findLayer(query: string | number, recursive: boolean = true, rootLayer?: Layer, document?: Document) {
    let layers = rootLayer?.layers;
    if (!layers)
        layers = document ? document.layers : app.activeDocument.layers;
    return _layerFind(layers, query, recursive);
}

/**
 * Find a Layer recursive
 * @param layers
 * @param query
 * @param recursive
 * @private
 */
function _layerFind(layers: Layers, query: string | number, recursive: boolean): Layer | undefined {
    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        if (typeof (query) === "string" && layer.name === query)
            return layer;
        if (typeof (query) === "number" && layer.id === query)
            return layer;
        if (recursive && layer.layers) {
            let childLayer = _layerFind(layer.layers, query, recursive);
            if (childLayer)
                return childLayer;
        }
    }
    return undefined;
}

/**
 * Get Smart Object Transformation infos.
 * @param layer
 */
export async function getSmartObjectTransformationInfos(layer: Layer): Promise<smartInfos | null> {
    let infos: smartInfos = {
        rotation: 0,
        flipX: false,
        flipY: false,
        bounds: null,
        points: null
    };
    if (layer.kind !== constants.LayerKind.SMARTOBJECT)
        return null;
    await core.executeAsModal(async () => {
            const result = await action.batchPlay(
                [
                    {
                        "_obj": "get",
                        "_target": [
                            {
                                "_ref": "layer",
                                "_id": layer.id
                            },
                            {
                                "_ref": "document",
                                "_id": app.activeDocument.id
                            }
                        ],
                        "_options": {
                            "dialogOptions": "silent"
                        }
                    }
                ], {
                    modalBehavior: "execute"
                });

            const layerInfo = result[0];

            const smartObjectTransform = layerInfo.smartObjectMore.transform;
            const smartObjectPoints = {
                upperLeft: {x: smartObjectTransform[0], y: smartObjectTransform[1]},
                upperRight: {x: smartObjectTransform[2], y: smartObjectTransform[3]},
                lowerRight: {x: smartObjectTransform[4], y: smartObjectTransform[5]},
                lowerLeft: {x: smartObjectTransform[6], y: smartObjectTransform[7]}
            };

            infos.rotation = Math.round(_smartObjectRotationFromCorners(smartObjectPoints));
            if (smartObjectPoints.upperLeft.x > smartObjectPoints.upperRight.x) {
                infos.flipX = smartObjectPoints.upperLeft.x > smartObjectPoints.upperRight.x;
                infos.rotation -= 180;
            }
            infos.flipY = smartObjectPoints.upperLeft.y > smartObjectPoints.lowerRight.y;
            infos.bounds = {
                top: layerInfo.bounds.top._value,
                bottom: layerInfo.bounds.bottom._value,
                left: layerInfo.bounds.left._value,
                right: layerInfo.bounds.right._value
            }
            infos.points = smartObjectPoints;
        },
        {"commandName": "Get Smart Object Information's"})
    return infos;
}

/**
 * Get Smart Object Rotations from Corners
 * @param points
 * @private
 */
function _smartObjectRotationFromCorners(points: {
    upperLeft: { y: number, x: number }
    upperRight: { y: number, x: number }
    lowerRight: { y: number, x: number }
    lowerLeft: { y: number, x: number }
}) {
    const A = points.upperLeft;
    const B = points.upperRight;
    const radians = Math.atan2(B.y - A.y, B.x - A.x);
    return radians * (180 / Math.PI);
}

// #######################################################
// Interface

export interface FileWithToken extends storage.File {
    token: string
}

export type smartInfos = {
    rotation: number,
    flipX: boolean,
    flipY: boolean,
    bounds: {
        top: number,
        bottom: number,
        left: number,
        right: number,
    } | null,
    points: {
        upperLeft: { y: number, x: number }
        upperRight: { y: number, x: number }
        lowerRight: { y: number, x: number }
        lowerLeft: { y: number, x: number }
    } | null
}
