import {render} from 'preact'

/**
 * UXP Panel Controller for React Components
 * @param Component
 * @param id
 * @param menuItems
 * @param sizeClasses
 * @constructor
 */
export const Controller = (Component: any,
                           {id, menuItems}: { id: string, menuItems?: any[] },
                           sizeClasses?: Array<{
                               type: 'width' | 'height',
                               from: number,
                               to: number,
                               class: string
                           }>) => {
    let root: HTMLElement

    const onResize = (event: any) => {
        if (!sizeClasses)
            return;

        for (const size of sizeClasses) {
            switch (size.type) {
                case "width":
                    if (event.target.offsetWidth <= size.to && event.target.offsetWidth >= size.from)
                        event.target.classList.add(size.class)
                    else
                        event.target.classList.remove(size.class)
                    break
                case "height":
                    if (event.target.offsetHeight <= size.to && event.target.offsetHeight >= size.from)
                        event.target.classList.add(size.class)
                    else
                        event.target.classList.remove(size.class)
                    break
            }
        }
    }

    const create = (rootNode: HTMLElement) => {
        return new Promise(function (this: HTMLElement, resolve: any) {
            root = document.createElement("div");
            root.setAttribute('panelContentID', id);
            root.style.width = "100%";
            root.style.height = "100%";
            render(Component, root);
            rootNode.appendChild(root)

            root.addEventListener('resize', onResize.bind(this));
            resolve();
        });
    }

    return {
        create,
        destroy: () => {
            root.removeEventListener('resize', onResize.bind(this));
        },
        menuItems,
        invokeMenu: (itemId: any) => {
            const menuItem = menuItems?.find(c => c.id === itemId);
            if (menuItem) {
                const handler = menuItem.onInvoke;
                if (handler) {
                    handler(itemId);
                }
            }
        }
    }
}