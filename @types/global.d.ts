// global.d.ts
declare namespace ymaps {
    namespace geoJson {
      function load(url: string): Promise<any>;
    }
  
    class Map {
      constructor(element: string, options: any);
      geoObjects: any;
      setBounds(bounds: number[][], options?: any): void;
    }
  
    function ready(callback: () => void): void;
  }
  
  declare global {
    interface Window {
      ymaps: {
        ready: (callback: () => void) => void;
        Map: typeof Map;
        geoJson: {
          load: typeof geoJson.load;
        };
      };
    }
  }