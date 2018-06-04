import Filer from '../../node_modules/filer/dist/filer';
import v86 from '../../node_modules/v86/build/v86_all';

// XXX: expose Filer as a global until I get v86 properly built
window.Filer = Filer;

window.onload = () => {
    window.emulator = new v86.V86Starter({
        memory_size: 4 * 1024 * 1024,
        vga_memory_size: 2 * 1024 * 1024,
        screen_container: document.getElementById('screen_container'),
        bios: {
            url: '/terminal/seabios.bin',
        },
        /*
        vga_bios: {
            url: '../bios/vgabios.bin',
        },
        */
        cdrom: {
            url: '/terminal/linux3.iso',
        },
        autostart: true,
    });
};
