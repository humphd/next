import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import { molokaiTheme } from './config';
import VM from './vm';

window.addEventListener('DOMContentLoaded', () => {
    Terminal.applyAddon(fit);
    const term = (window.term = new Terminal({ theme: molokaiTheme }));
    term.open(document.getElementById('terminal'));
    term.fit();

    const vm = new VM(term);

    // Reduce CPU/battery use when not in focus
    // TODO: we might want to add UI to disable this later
    term.on('focus', vm.resume);
    term.on('blur', vm.suspend);

    vm.boot();
});
