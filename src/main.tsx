import {entrypoints} from 'uxp';
import {Controller} from "./panel.controller.tsx";
import {MainPanel} from "./panels/main.panel.tsx";
import {createContext} from "preact";
import {createAppState} from "./store/store.tsx";
import {signal} from "@preact/signals";

export const AppState = createContext(createAppState());
export const debug = signal(false);
const toggleDebugMode = function (itemID: string) {
    const panel: any = entrypoints.getPanel("main");
    const menuItems = panel.menuItems;
    const item = menuItems.getItem(itemID);
    debug.value = !item.checked;
    item.checked = debug.value;
}

const mainController = Controller(
    <AppState.Provider value={createAppState()}>
        <MainPanel/>
    </AppState.Provider>,
    {
        id: "main", menuItems: [
            {
                id: "reload_random",
                label: "Reload Plugin",
                enabled: true,
                checked: false,
                onInvoke: () => window.location.reload()
            },
            {
                id: "debug",
                label: "Debug mode",
                enabled: true,
                checked: false,
                onInvoke: (itemID: any) => {
                    toggleDebugMode(itemID);
                }
            }
        ]
    });


// Setup Entrypoints
entrypoints.setup({
    plugin: {
        create: () => {
            console.log('Plugin create')
        },
        destroy: () => {
            console.log('Plugin destroy')
        }
    },
    commands: {
        reload: () => window.location.reload()
    },
    panels: {
        main: mainController
    },
});
