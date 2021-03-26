// keymap.interface.ts
// NOTE: defines an interface which all keymaps MUST implement,
// which is 'start' method to initiate key-listening

export interface Keymap {
  start(controlTarget:THREE.Object3D,    // object to affect by ARROWkey-actions
                                        // 'displayed_scene' (vrscene/sgscene)
        rotateTarget?:THREE.Object3D, // object to counter-rotate/translate so
                                     // it remains stationary - exp vrcsphere
                                    // which contains modeling lights
        speed?:number);              // default 0.01
}

