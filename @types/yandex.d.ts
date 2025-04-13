declare global {
    declare namespace ymaps {
        interface IGeoObject {
            options: any;
            getBounds(): number[][];
        }

        interface IMap {
            geoObjects: any;
            setBounds(bounds: number[][], options?: any): void;
        }

        interface YMaps {
            Map: {
                new(element: string, options: any): IMap;
            };
            ready(callback: () => void): void;
            geoJson: {
                load(url: string): Promise<IGeoObject>;
            };
        }
    }

    interface Window {
        ymaps: YMaps;
    }
}


export { };