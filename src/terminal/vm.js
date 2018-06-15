'use strict';

// XXX: need to use built version, since Parcel throws at runtime otherwise
import Filer from '../../node_modules/filer/dist/filer';
// XXX: expose Filer as a global until I get v86 properly built
window.Filer = Filer;

// XXX: current v86 is exposed on global
import 'v86';

import { stateUrl, defaultEmulatorOptions } from './config';

// What our shell prompt looks like, so we can wait on it.
const prompt = '/ # ';

const getVMStateUrl = () => new URL(stateUrl, window.location);

export default class {
    constructor(term) {
        this.emulator = null;
        this.term = term;

        this.boot = async () => {
            if (this.emulator) {
                return;
            }

            const hasCachedVM = await checkState();
            if (hasCachedVM) {
                this.emulator = warmBoot(this.term);
            } else {
                this.emulator = await coldBoot(this.term);
            }
        };

        // Pause the running VM
        this.suspend = () => {
            if (!(this.emulator && this.emulator.is_running())) {
                return;
            }
            this.emulator.stop();
        };

        // Restart the paused VM
        this.resume = () => {
            if (!(this.emulator && !this.emulator.is_running())) {
                return;
            }
            this.emulator.run();
        };
    }
}

// Wire up event handlers, print shell prompt (which we've eaten), and focus term.
const startTerminal = (emulator, term) => {
    term.reset();

    term.writeln('Linux 4.15.7. Shared browser files are located in /mnt');
    term.write(prompt);
    term.focus();

    // Wire input events from xterm.js -> ttyS0
    term.on('key', key => emulator.serial0_send(key));
    // Wire output events from ttyS0 -> xterm.js
    emulator.add_listener('serial0-output-char', char => term.write(char));
};

// Power up VM, saving state when boot completes.
const coldBoot = async term => {
    term.write('Booting Linux');

    // Write .... to terminal to show we're doing something.
    const timer = setInterval(() => {
        term.write('.');
    }, 500);

    const emulator = new window.V86Starter(defaultEmulatorOptions);
    await storeInitialStateOnBoot(emulator, term, timer);

    return emulator;
};

// Restore VM from saved state
const warmBoot = term => {
    // Add saved state URL for vm
    const options = defaultEmulatorOptions;
    options.initial_state = {
        url: stateUrl,
    };

    const emulator = new window.V86Starter(options);
    startTerminal(emulator, term);

    return emulator;
};

// Wait until we get our shell prompt (other characters are noise on the serial port at startup)
const waitForPrompt = async emulator =>
    new Promise(resolve => {
        let buffer = '';

        const handler = char => {
            buffer += char;

            // Wait for initial root shell prompt, which indicates a completed boot
            if (buffer.endsWith(prompt)) {
                emulator.remove_listener('serial0-output-char', handler);
                resolve();
            }
        };

        emulator.add_listener('serial0-output-char', handler);
    });

const storeInitialStateOnBoot = async (emulator, term, timer) => {
    // Wait for the prompt to come up, then start term and save the VM state
    await waitForPrompt(emulator);

    clearTimeout(timer);

    startTerminal(emulator, term);
    emulator.save_state(saveVMState);
};

// See if we have a cached VM machine state to restart from a previous boot.
const checkState = () =>
    caches
        .open('vm-state')
        .then(cache =>
            cache.match(getVMStateUrl()).then(response => !!response)
        );

// Save the VM's booted state to improve startup next time.
const saveVMState = (err, state) => {
    const blob = new Blob([new Uint8Array(state)], {
        type: 'application/octet-stream',
    });
    const response = new Response(blob, {
        status: 200,
        statusText: 'OK, Linux VM machine state cached (safe to delete).',
    });

    const headers = new Headers();
    headers.append('Content-Type', 'application/octet-stream');
    // TODO: not sure why content-length is always 0 in Chrome?
    headers.append('Content-Length', blob.size);

    const url = getVMStateUrl();
    const request = new Request(url, {
        method: 'GET',
        headers,
    });

    caches
        .open('vm-state')
        .then(cache => cache.put(request, response))
        .catch(err => console.error(err));
};
