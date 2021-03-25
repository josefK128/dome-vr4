// Controls.interface.ts
// NOTE: defines an interface which all controls MUST implement,
// which is 'start' method to initiate mouse-listening

export interface Controls{
  start(controlTarget:THREE.Object3D,    // object to affect by key-actions
        domElement:HTMLElement,          // DOM element mouse area - 'canvas'
        speed?:number):void;             // default 0.1
}
