// keymap.interface.ts
// NOTE: defines an interface which all keymaps MUST implement,
// which is 'start' method to initiate key-listening

export interface Keymap {
  start(controlTarget:THREE.Object3D,    // object to affect by ARROWkey-actions
                                        // 'displayed_scene' (vrscene/sgscene)
        webxr:boolean,                 // default false
        rotateTarget?:THREE.Object3D, // object to pich/yaw via SHIFT-ARROWS
        speed?:number);              // default 0.01
}

