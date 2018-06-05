// XXX: need to use built version, since Parcel throws at runtime otherwise
import Filer from '../../node_modules/filer/dist/filer';
// XXX: expose Filer as a global until I get v86 properly built
window.Filer = Filer;

// Exposed on global
import 'v86';

window.addEventListener('DOMContentLoaded', () => {
    const emulator = window.emulator = new window.V86Starter({
        memory_size: 32 * 1024 * 1024,
        vga_memory_size: 2 * 1024 * 1024,
        screen_container: document.getElementById('screen_container'),
        bios: {
            url: 'seabios.bin'
        },
        vga_bios: {
            url: 'vgabios.bin'
        },
        cdrom: {
            url: 'linux3.iso'
        },
        filesystem: {
            // XXXhack: need to force the Plan9 Filesystem to load
        },
        autostart: true,
    });

    emulator.add_listener('emulator-ready', () => console.log('Emulator Ready'));
});
